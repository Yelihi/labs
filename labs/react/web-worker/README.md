# Web Worker

## Lab ID

`react/web-worker`

## Framework

`react-vite`

## Goal

Worker 단독 취소와 모의 네트워크 요청 + Worker 취소를 비교합니다.

## How to run

```bash
pnpm dev:react
```

`http://localhost:5173/labs/react/web-worker`에서 다음 버튼으로 실습을 선택합니다.

- **Worker only**: 기존 200만 항목의 Worker 검색·취소 실습
- **Network + Worker**: 검색어 입력 → 200ms debounce → 300~1,000ms 모의 API 응답 → 실제 Worker 처리

Network + Worker는 외부 서버를 호출하지 않습니다. 검색어를 포함하는 20만 항목을 생성하므로 모든 항목이 검색 결과에 포함됩니다.
`Cancel current request`는 대기 중인 debounce, 모의 API 요청 또는 실행 중인 Worker 작업을 취소합니다.
실습을 전환하면 이전 요청과 Worker를 정리하며, 돌아오면 초기 상태로 시작합니다.

## How to test

```bash
pnpm lab:test react/web-worker
```

## Supporting material

Existing plans, notes, and results are preserved in [docs/](./docs/).

## Chromium 동작 검증

브라우저 테스트는 두 실습의 실제 Web Worker를 실행합니다.
Worker나 검색 결과를 모킹하지 않으며, 기본 200만 개 데이터와 CPU 부하 설정을 그대로 사용합니다.

- 초기화 완료, 필터링 및 10,000개 결과 상한
- 50개씩 페이지 이동, 새 결과 도착 시 첫 페이지 복귀
- 진행 중인 작업의 취소 확인과 다음 검색 완료
- 이전 작업을 새 검색으로 대체, 일치 항목이 없을 때 빈 목록 표시

Network + Worker 테스트는 debounce 취소, 모의 API 취소, 최신 검색 결과 적용, 실제 Worker 처리 중 취소와 재검색,
20만 결과의 페이지 이동, 실습 전환 중 요청 정리를 확인합니다.
빠른 Worker의 취소 검증은 첫 progress가 화면에 표시되는 순간 브라우저에서 취소 버튼을 누릅니다.

마지막 yield 중 취소·새 요청이 들어오는 경계 조건과 결과 상한은 작은 데이터로 별도 검증합니다.

```bash
pnpm exec eslint labs/react/web-worker --max-warnings=0
pnpm exec vitest run labs/react/web-worker/tests/*.test.ts
```

메시지 인자 전달, 중복 리스너 등록, 해제와 Worker 종료도 단위 테스트로 확인합니다.
Lint와 두 종류 테스트 모두 GitHub Actions의 Browser labs / react-vite 작업에서 실행합니다.

2026-11-15 로컬 검증: macOS arm64, Node.js 26.0.0, pnpm 10.33.0.
`pnpm lab:test:browser react-vite` 16개 및 위 Vitest 테스트 7개가 종료 코드 0으로 통과했습니다.
