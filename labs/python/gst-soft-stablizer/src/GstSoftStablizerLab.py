import asyncio
import os
import queue
import shutil
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from typing import Optional

import cv2
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stabilizer import Stabilizer

router = APIRouter()

_log_queue: queue.Queue = queue.Queue()
_job_running = False
_output_path: Optional[str] = None

_WORK_DIR = Path(tempfile.gettempdir()) / "gst_stab"
_WORK_DIR.mkdir(exist_ok=True)

_ROUTE = "/labs/python/gst-soft-stablizer"


def _run_stabilization(input_path: str, output_path: str) -> None:
    global _job_running, _output_path
    try:
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            _log_queue.put("ERROR: 영상 파일을 열 수 없습니다")
            return

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        _log_queue.put(f"INFO  {width}x{height} @ {fps:.1f}fps  총 {total}프레임")

        stab = Stabilizer(
            margin=0.15,
            downsample=4,
            min_confidence=0.3,
            width=width,
            height=height,
        )

        # ffmpeg으로 H.264 인코딩 (브라우저/QuickTime 호환)
        ffmpeg_bin = shutil.which("ffmpeg") or "ffmpeg"
        ffmpeg_cmd = [
            ffmpeg_bin, "-y",
            "-f", "rawvideo", "-vcodec", "rawvideo",
            "-s", f"{width}x{height}",
            "-pix_fmt", "bgr24",
            "-r", str(fps),
            "-i", "pipe:0",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-pix_fmt", "yuv420p",
            output_path,
        ]
        ffproc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            out_frame, meta = stab.process(frame, frame_idx)
            ffproc.stdin.write(out_frame.tobytes())
            frame_idx += 1

            line = (
                f"frame {meta['frame']:>5d}/{total}"
                f"  confidence={meta['confidence']:.3f}"
                f"  fallback={str(meta['fallback']).lower()}"
            )
            if meta["fallback_reason"]:
                line += f"  ({meta['fallback_reason']})"
            _log_queue.put(line)

        cap.release()
        ffproc.stdin.close()
        ffproc.wait()
        _output_path = output_path
        _log_queue.put(f"DONE  {frame_idx}프레임 처리 완료")
    except Exception as exc:
        _log_queue.put(f"ERROR  {exc}")
    finally:
        _job_running = False
        _log_queue.put("__DONE__")


@router.post("/stabilize")
async def stabilize(video: UploadFile = File(...)):
    global _job_running, _output_path

    if _job_running:
        return JSONResponse({"error": "이미 변환 중입니다. 잠시 후 다시 시도하세요."}, status_code=409)

    input_path = str(_WORK_DIR / "input.mp4")
    output_path = str(_WORK_DIR / "stabilized.mp4")

    with open(input_path, "wb") as f:
        f.write(await video.read())

    _job_running = True
    _output_path = None

    while not _log_queue.empty():
        _log_queue.get_nowait()

    thread = threading.Thread(
        target=_run_stabilization, args=(input_path, output_path), daemon=True
    )
    thread.start()

    return {"status": "started"}


@router.get("/events")
async def stream_events():
    async def gen():
        while True:
            try:
                msg = _log_queue.get_nowait()
                if msg == "__DONE__":
                    yield "event: done\ndata: complete\n\n"
                    break
                yield f"data: {msg}\n\n"
            except queue.Empty:
                await asyncio.sleep(0.05)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/result")
async def get_result():
    if not _output_path or not os.path.exists(_output_path):
        return JSONResponse({"error": "결과 파일이 없습니다"}, status_code=404)
    return FileResponse(_output_path, media_type="video/mp4", filename="stabilized.mp4")


def setup() -> str:
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>GST Soft Stabilizer</title>
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: system-ui, sans-serif; padding: 32px; max-width: 860px; background: #f9fafb; }}
  h1 {{ font-size: 22px; margin-bottom: 6px; }}
  .subtitle {{ color: #6b7280; font-size: 14px; margin-bottom: 28px; }}

  .upload-zone {{
    border: 2px dashed #d1d5db; border-radius: 10px;
    padding: 40px 20px; text-align: center; cursor: pointer;
    background: #fff; transition: border-color .15s;
    margin-bottom: 16px;
  }}
  .upload-zone:hover, .upload-zone.drag-over {{ border-color: #3b82f6; }}
  .upload-zone .icon {{ font-size: 32px; margin-bottom: 8px; }}
  .upload-zone .hint {{ color: #6b7280; font-size: 14px; }}
  .upload-zone .file-name {{ margin-top: 10px; font-size: 14px; color: #111827; font-weight: 500; }}

  .btn {{
    padding: 9px 22px; border: none; border-radius: 7px;
    cursor: pointer; font-size: 14px; font-weight: 500;
  }}
  .btn-primary {{ background: #3b82f6; color: #fff; }}
  .btn-primary:disabled {{ background: #bfdbfe; cursor: not-allowed; }}
  .btn-secondary {{ background: #e5e7eb; color: #374151; margin-left: 8px; }}

  #log-area {{
    display: none; margin-top: 20px;
    background: #0f172a; color: #94a3b8;
    font-family: ui-monospace, monospace; font-size: 12px;
    padding: 16px; border-radius: 8px;
    height: 280px; overflow-y: auto; white-space: pre;
  }}
  #log-area .done  {{ color: #34d399; }}
  #log-area .error {{ color: #f87171; }}

  #result-area {{ display: none; margin-top: 28px; }}
  #result-area h2 {{ font-size: 15px; margin-bottom: 10px; color: #374151; }}
  #result-area video {{ width: 100%; border-radius: 8px; background: #000; }}
  #download-link {{
    display: inline-block; margin-top: 10px;
    font-size: 13px; color: #3b82f6; text-decoration: none;
  }}
  #download-link:hover {{ text-decoration: underline; }}
</style>
</head>
<body>
<h1>GST Soft Stabilizer</h1>
<p class="subtitle">흔들린 영상을 업로드하면 OpenCV 호모그래피 기반으로 보정합니다.</p>

<div class="upload-zone" id="drop-zone">
  <div class="icon">🎬</div>
  <div>클릭하거나 드래그해서 영상 파일 선택</div>
  <div class="hint">mp4, mov, avi 등 지원</div>
  <div class="file-name" id="file-name" style="display:none"></div>
  <input type="file" id="file-input" accept="video/*" style="display:none">
</div>

<div>
  <button class="btn btn-primary" id="convert-btn" disabled onclick="startConvert()">변환</button>
  <button class="btn btn-secondary" id="reset-btn" onclick="resetForm()" style="display:none">초기화</button>
</div>

<div id="log-area"></div>

<div id="result-area">
  <h2>결과 영상</h2>
  <video id="result-video" controls playsinline></video>
  <br>
  <a id="download-link" download="stabilized.mp4">⬇ 다운로드</a>
</div>

<script>
  const ROUTE = '{_ROUTE}';
  let selectedFile = null;
  let es = null;

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => pickFile(e.target.files[0]));

  dropZone.addEventListener('dragover', e => {{ e.preventDefault(); dropZone.classList.add('drag-over'); }});
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {{
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    pickFile(e.dataTransfer.files[0]);
  }});

  function pickFile(file) {{
    if (!file) return;
    selectedFile = file;
    const nameEl = document.getElementById('file-name');
    nameEl.textContent = file.name;
    nameEl.style.display = 'block';
    document.getElementById('convert-btn').disabled = false;
  }}

  async function startConvert() {{
    if (!selectedFile) return;

    const btn = document.getElementById('convert-btn');
    btn.disabled = true;
    btn.textContent = '변환 중...';
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('result-area').style.display = 'none';

    const logArea = document.getElementById('log-area');
    logArea.style.display = 'block';
    logArea.innerHTML = '';

    const form = new FormData();
    form.append('video', selectedFile);
    const res = await fetch(ROUTE + '/stabilize', {{ method: 'POST', body: form }});
    const data = await res.json();

    if (data.error) {{
      appendLog(data.error, 'error');
      btn.disabled = false;
      btn.textContent = '변환';
      return;
    }}

    if (es) es.close();
    es = new EventSource(ROUTE + '/events');

    es.onmessage = e => appendLog(e.data);
    es.addEventListener('done', () => {{
      es.close();
      btn.textContent = '완료';
      document.getElementById('reset-btn').style.display = 'inline-block';
      showResult();
    }});
    es.onerror = () => {{
      appendLog('SSE 연결 오류', 'error');
      es.close();
    }};
  }}

  function appendLog(msg, cls) {{
    const logArea = document.getElementById('log-area');
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = msg;
    logArea.appendChild(line);
    logArea.scrollTop = logArea.scrollHeight;
  }}

  function showResult() {{
    const url = ROUTE + '/result?t=' + Date.now();
    const area = document.getElementById('result-area');
    const video = document.getElementById('result-video');
    const link = document.getElementById('download-link');
    video.src = url;
    link.href = url;
    area.style.display = 'block';
  }}

  function resetForm() {{
    selectedFile = null;
    fileInput.value = '';
    document.getElementById('file-name').style.display = 'none';
    document.getElementById('convert-btn').disabled = true;
    document.getElementById('convert-btn').textContent = '변환';
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('log-area').style.display = 'none';
    document.getElementById('log-area').innerHTML = '';
    document.getElementById('result-area').style.display = 'none';
  }}
</script>
</body>
</html>"""
