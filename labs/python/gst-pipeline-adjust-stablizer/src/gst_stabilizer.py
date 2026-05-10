import platform
import shutil
import subprocess
import sys
import os
from typing import Callable, Optional

import cv2
import numpy as np


def _ensure_gst_python_path() -> None:
    """플랫폼별 GStreamer Python 바인딩 경로를 sys.path에 추가."""
    py_ver = f"python{sys.version_info.major}.{sys.version_info.minor}"
    candidates: list[str] = []

    if platform.system() == "Darwin":
        # macOS: 공식 GStreamer SDK 설치 경로
        candidates.append(
            f"/Library/Frameworks/GStreamer.framework/Versions/1.0/lib/{py_ver}/site-packages"
        )
    elif platform.system() == "Linux":
        # Linux: python3-gi (apt) 설치 위치 — 버전 포함/미포함 두 경로 모두 탐색
        gst_prefix = os.environ.get("GST_PREFIX", "/usr")
        candidates.append(f"{gst_prefix}/lib/python3/dist-packages")
        candidates.append(f"{gst_prefix}/lib/{py_ver}/dist-packages")
        candidates.append(f"{gst_prefix}/lib/{py_ver}/site-packages")

    for path in candidates:
        if os.path.isdir(os.path.join(path, "gi")) and path not in sys.path:
            sys.path.insert(0, path)
            return


_ensure_gst_python_path()

try:
    import gi
    gi.require_version('Gst', '1.0')
    from gi.repository import Gst
    Gst.init(None)
    _GST_AVAILABLE = True
except Exception:
    _GST_AVAILABLE = False


class GstStabilizer:
    """
    2-pass GStreamer 기반 안정화기.

    Pass 1: GStreamer appsink으로 전체 프레임 디코딩 + 누적 호모그래피 수집
    Pass 2: Gaussian 양방향 스무딩 → 보정 행렬 B_t = S_t · C_t⁻¹ 적용 → ffmpeg 인코딩
    """

    def __init__(
        self,
        downsample: int = 4,
        sigma: int = 15,
        margin: float = 0.15,
        min_confidence: float = 0.3,
    ):
        self.downsample = downsample
        self.sigma = sigma
        self.margin = margin
        self.min_confidence = min_confidence
        self.orb = cv2.ORB_create(nfeatures=500)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    def run(
        self,
        input_path: str,
        output_path: str,
        log_cb: Callable[[str], None],
    ) -> None:
        if not _GST_AVAILABLE:
            raise RuntimeError(
                "GStreamer Python 바인딩(PyGObject)이 없습니다. "
                "`pip install PyGObject` 또는 `conda install -c conda-forge pygobject`"
            )

        frames, H_cumulatives, fps, width, height = self._decode_and_analyze(
            input_path, log_cb
        )
        log_cb(f"INFO  총 {len(frames)}프레임 분석 완료, 스무딩 적용 중...")

        smooth_Hs = self._smooth_trajectory(H_cumulatives)
        self._encode_output(
            frames, H_cumulatives, smooth_Hs, fps, width, height, output_path, log_cb
        )

    # ------------------------------------------------------------------
    # Pass 1
    # ------------------------------------------------------------------

    def _decode_and_analyze(
        self,
        input_path: str,
        log_cb: Callable[[str], None],
    ):
        pipeline_desc = (
            f'filesrc location="{input_path}" ! '
            f'decodebin ! '
            f'videoconvert ! '
            f'video/x-raw,format=BGR ! '
            f'appsink name=sink sync=false'
        )
        pipeline = Gst.parse_launch(pipeline_desc)
        appsink = pipeline.get_by_name("sink")
        pipeline.set_state(Gst.State.PLAYING)

        frames: list = []
        H_cumulatives: list = [np.eye(3)]
        H_cum: np.ndarray = np.eye(3)
        prev_gray: Optional[np.ndarray] = None
        fps = 30.0
        width = height = 0

        while True:
            sample = appsink.emit("pull-sample")
            if sample is None:
                break

            caps_struct = sample.get_caps().get_structure(0)
            if width == 0:
                width = caps_struct.get_value("width")
                height = caps_struct.get_value("height")
                ok, fps_n, fps_d = caps_struct.get_fraction("framerate")
                fps = fps_n / fps_d if (ok and fps_d) else 30.0
                log_cb(f"INFO  {width}x{height} @ {fps:.1f}fps")

            buf = sample.get_buffer()
            _, map_info = buf.map(Gst.MapFlags.READ)
            frame = (
                np.frombuffer(map_info.data, dtype=np.uint8)
                .reshape((height, width, 3))
                .copy()
            )
            buf.unmap(map_info)
            frames.append(frame)

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            if prev_gray is not None:
                H_delta, conf = self._estimate_H(prev_gray, gray)
                if H_delta is not None and conf >= self.min_confidence:
                    H_cum = H_delta @ H_cum
                H_cumulatives.append(H_cum.copy())
                log_cb(f"[분석] frame {len(frames):>5d}  confidence={conf:.3f}")
            prev_gray = gray

        pipeline.set_state(Gst.State.NULL)
        pipeline.get_state(Gst.CLOCK_TIME_NONE)
        return frames, H_cumulatives, fps, width, height

    # ------------------------------------------------------------------
    # Gaussian 양방향 스무딩
    # ------------------------------------------------------------------

    def _smooth_trajectory(self, H_list: list) -> list:
        # 각 H 행렬의 원소 9개를 시계열로 쌓아 독립적으로 Gaussian 스무딩.
        # tx/ty/angle 분해 방식은 perspective 성분을 소실시켜 왜곡을 유발하므로
        # 원소별 스무딩으로 모든 자유도를 보존한다.
        elements = np.array([H.flatten() for H in H_list], dtype=float)  # (N, 9)

        k = 3 * self.sigma
        x = np.arange(-k, k + 1, dtype=float)
        kernel = np.exp(-x ** 2 / (2 * self.sigma ** 2))
        kernel /= kernel.sum()

        smooth_elements = np.column_stack([
            np.convolve(elements[:, i], kernel, mode='same')
            for i in range(9)
        ])  # (N, 9)

        return [smooth_elements[i].reshape(3, 3) for i in range(len(H_list))]

    # ------------------------------------------------------------------
    # Pass 2
    # ------------------------------------------------------------------

    def _encode_output(
        self,
        frames: list,
        H_cumulatives: list,
        smooth_Hs: list,
        fps: float,
        w: int,
        h: int,
        output_path: str,
        log_cb: Callable[[str], None],
    ) -> None:
        ffmpeg_bin = shutil.which("ffmpeg") or "ffmpeg"
        cmd = [
            ffmpeg_bin, "-y",
            "-f", "rawvideo", "-vcodec", "rawvideo",
            "-s", f"{w}x{h}",
            "-pix_fmt", "bgr24",
            "-r", str(fps),
            "-i", "pipe:0",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-pix_fmt", "yuv420p",
            output_path,
        ]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
        total = len(frames)

        for i, (frame, H_cum, H_smooth) in enumerate(
            zip(frames, H_cumulatives, smooth_Hs)
        ):
            # B_t = S_t · C_t⁻¹
            H_corr = H_smooth @ np.linalg.inv(H_cum)
            warped = self._warp_crop(frame, H_corr, w, h)
            proc.stdin.write(warped.tobytes())
            log_cb(f"[인코딩] frame {i + 1:>5d}/{total}")

        proc.stdin.close()
        proc.wait()
        log_cb(f"DONE  {total}프레임 처리 완료")

    # ------------------------------------------------------------------
    # 공통 유틸
    # ------------------------------------------------------------------

    def _estimate_H(
        self, prev_gray: np.ndarray, curr_gray: np.ndarray
    ):
        ds = self.downsample
        small_prev = cv2.resize(
            prev_gray, (prev_gray.shape[1] // ds, prev_gray.shape[0] // ds)
        )
        small_curr = cv2.resize(
            curr_gray, (curr_gray.shape[1] // ds, curr_gray.shape[0] // ds)
        )

        kp1, des1 = self.orb.detectAndCompute(small_prev, None)
        kp2, des2 = self.orb.detectAndCompute(small_curr, None)

        if des1 is None or des2 is None or len(kp1) < 4 or len(kp2) < 4:
            return None, 0.0

        matches = self.matcher.match(des1, des2)
        if len(matches) < 4:
            return None, 0.0

        src_pts = np.float32(
            [kp1[m.queryIdx].pt for m in matches]
        ).reshape(-1, 1, 2)
        dst_pts = np.float32(
            [kp2[m.trainIdx].pt for m in matches]
        ).reshape(-1, 1, 2)

        H_small, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
        if H_small is None or mask is None:
            return None, 0.0

        conf = float(mask.sum() / len(matches))
        scale = np.diag([1.0 / ds, 1.0 / ds, 1.0])
        H_full = np.linalg.inv(scale) @ H_small @ scale
        return H_full, conf

    def _warp_crop(
        self, frame: np.ndarray, H_corr: np.ndarray, w: int, h: int
    ) -> np.ndarray:
        warped = cv2.warpPerspective(
            frame, H_corr, (w, h),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REFLECT_101,
        )
        cx = int(w * self.margin / 2)
        cy = int(h * self.margin / 2)
        cropped = warped[cy: h - cy, cx: w - cx]
        return cv2.resize(cropped, (w, h))
