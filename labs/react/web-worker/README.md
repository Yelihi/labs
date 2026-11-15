# Web Worker

## Lab ID

`react/web-worker`

## Framework

`react-vite`

## Goal

TODO

## How to run

```bash
pnpm dev:react
```

## How to test

```bash
pnpm lab:test react/web-worker
```

## Supporting material

Existing plans, notes, and results are preserved in [docs/](./docs/).

## Chromium 동작 검증

브라우저 테스트는 화면에 연결된 `worker-cancel` 실습의 실제 Web Worker를 실행합니다.
Worker나 검색 결과를 모킹하지 않으며, 기본 200만 개 데이터와 CPU 부하 설정을 그대로 사용합니다.

- 초기화 완료, 필터링 및 10,000개 결과 상한
- 50개씩 페이지 이동, 새 결과 도착 시 첫 페이지 복귀
- 진행 중인 작업의 취소 확인과 다음 검색 완료
- 이전 작업을 새 검색으로 대체, 일치 항목이 없을 때 빈 목록 표시

마지막 yield 중 취소·새 요청이 들어오는 경계 조건과 결과 상한은 작은 데이터로 별도 검증합니다.

```bash
pnpm exec vitest run labs/react/web-worker/tests/progress-worker.test.ts
```

두 종류 모두 GitHub Actions의 Browser labs / react-vite 작업에서 실행합니다.
화면에 연결되지 않은 `worker-cancel-in-abort` 등 다른 실험 변형은 이 검증에 포함되지 않습니다.

2026-11-15 로컬 검증: macOS arm64, Node.js 26.0.0, pnpm 10.33.0.
`pnpm lab:test:browser react-vite` 12개 및 위 Vitest 테스트 3개가 종료 코드 0으로 통과했습니다.
