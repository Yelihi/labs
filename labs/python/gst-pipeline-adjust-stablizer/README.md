# Gst Pipeline Adjust Stabilizer

GStreamer로 영상을 디코딩하고 양방향 Gaussian 스무딩을 실험합니다.

## 실행

프로젝트 루트에서 Python 서버의 환경을 준비한 뒤 실행합니다.

```bash
pnpm dev:python
```

접속: http://localhost:8000/labs/python/gst-pipeline-adjust-stablizer

## 테스트

```bash
pnpm lab:test python/gst-pipeline-adjust-stablizer
```

기본 테스트는 페이지 표시만 검증합니다. 영상 안정화 품질은 별도 확인이 필요합니다.
구현은 `src/`, 테스트는 `tests/`, 추가 기록은 `docs/`에 둡니다.
