import time

import cv2
import numpy as np


class Stabilizer:
    def __init__(self, margin: float, downsample: int, min_confidence: float,
                 width: int, height: int):
        self.margin = margin
        self.downsample = downsample
        self.min_confidence = min_confidence
        self.width = width
        self.height = height

        self.orb = cv2.ORB_create(nfeatures=500)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        self.prev_gray: np.ndarray | None = None
        # Accumulated transform: maps frame-0 coords → current frame coords
        self.H_cumulative: np.ndarray = np.eye(3)

    def process(self, frame: np.ndarray, frame_idx: int) -> tuple[np.ndarray, dict]:
        t0 = time.perf_counter()
        meta: dict = {
            "frame": frame_idx, "confidence": 1.0, "fallback": False,
            "fallback_reason": "", "kp": 0, "matches": 0, "inliers": 0,
            "process_ms": 0.0,
        }

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if self.prev_gray is None:
            self.prev_gray = gray
            meta["fallback"] = True
            meta["fallback_reason"] = "first_frame"
            meta["process_ms"] = (time.perf_counter() - t0) * 1000
            return frame.copy(), meta

        H_delta, stats = self.estimate_homography(self.prev_gray, gray)
        meta.update(stats)

        if H_delta is not None and meta["confidence"] >= self.min_confidence:
            # Chain: H_0n = H_{n-1,n} @ H_0,{n-1}
            self.H_cumulative = H_delta @ self.H_cumulative

        if H_delta is None or meta["confidence"] < self.min_confidence:
            meta["fallback"] = True
            if not meta["fallback_reason"]:
                meta["fallback_reason"] = f"low_confidence({meta['confidence']:.3f})"

        # Always apply cumulative H (best available estimate)
        out = self.warp_and_crop(frame, self.H_cumulative)

        self.prev_gray = gray
        meta["process_ms"] = (time.perf_counter() - t0) * 1000
        return out, meta

    def estimate_homography(self, prev_gray: np.ndarray,
                            curr_gray: np.ndarray) -> tuple:
        ds = self.downsample
        small_prev = cv2.resize(prev_gray,
                                (prev_gray.shape[1] // ds, prev_gray.shape[0] // ds))
        small_curr = cv2.resize(curr_gray,
                                (curr_gray.shape[1] // ds, curr_gray.shape[0] // ds))

        kp1, des1 = self.orb.detectAndCompute(small_prev, None)
        kp2, des2 = self.orb.detectAndCompute(small_curr, None)

        stats: dict = {
            "kp": len(kp1) if kp1 else 0,
            "matches": 0,
            "inliers": 0,
            "confidence": 0.0,
            "fallback_reason": "",
        }

        if des1 is None or des2 is None or len(kp1) < 4 or len(kp2) < 4:
            stats["fallback_reason"] = "no_descriptors"
            return None, stats

        matches = self.matcher.match(des1, des2)
        stats["matches"] = len(matches)

        if len(matches) < 4:
            stats["fallback_reason"] = "too_few_matches"
            return None, stats

        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

        H_small, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        if H_small is None or mask is None:
            stats["fallback_reason"] = "homography_failed"
            return None, stats

        inliers = int(mask.sum())
        stats["inliers"] = inliers
        stats["confidence"] = inliers / len(matches)

        # Scale H from downsampled space back to original resolution
        scale = np.diag([1 / ds, 1 / ds, 1.0])
        H_full = np.linalg.inv(scale) @ H_small @ scale

        return H_full, stats

    def warp_and_crop(self, frame: np.ndarray, H_cumulative: np.ndarray) -> np.ndarray:
        h, w = frame.shape[:2]
        # H_cumulative maps frame-0 coords → current frame coords.
        # warpPerspective(src, M): output(p') = src(M⁻¹·p')
        # Passing H_cumulative as M: output(p') = frame(H_cumulative·p') ✓
        # → frame-0 position p' samples the correct pixel in the current frame.
        warped = cv2.warpPerspective(
            frame, np.linalg.inv(H_cumulative), (w, h),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REFLECT_101,
        )
        cx = int(w * self.margin / 2)
        cy = int(h * self.margin / 2)
        cropped = warped[cy:h - cy, cx:w - cx]
        return cv2.resize(cropped, (w, h))
