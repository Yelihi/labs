# Frontend Labs

A Turborepo-based monorepo for browser and local Node.js, Python, C/C++ experiments.

## Setup

```bash
pnpm install
```

## Minimal workflow

```bash
pnpm lab:create css container-query   # scaffold a new lab
pnpm dev:react                        # start the Vite dev server
pnpm lab:test css/container-query     # run Chromium tests with the matching app server
pnpm lab:test css/container-query --core # run Chromium / Firefox / WebKit
```

Run the matching `pnpm dev:*` command from the repository root. React labs share
`http://localhost:5173`; select a lab from the index. Each new lab README includes
its direct start command and URL.

New web labs contain only `README.md`, `lab.config.ts`, source code, and a smoke test.
C/C++ labs use a Makefile and tests/smoke.sh. Add supporting material under docs/ only when needed.
Existing supporting material is preserved under each lab’s docs/ directory.

`lab:test` runs tests and returns their exit code; C/C++ labs build and run a smoke test.
Use `--project <browser>`, `--core`, or `--full` to select browsers.
The raw `e2e` / Playwright commands below still target the React server.

## playwright

```bash
pnpm exec playwright install
pnpm exec playwright test
pnpm exec playwright show-report
```

## Other commands

```bash
pnpm lab:list           # list all labs
pnpm lab:routes         # re-sync labs.generated.ts (auto-runs after create)
pnpm typecheck          # TypeScript check across all packages
pnpm lint               # ESLint across all packages
pnpm e2e:core           # Playwright on chromium / firefox / webkit
```

See [`docs/ai-agent-guide.md`](./docs/ai-agent-guide.md) for AI-agent usage policy.

See [`docs/usage-guide.md`](./docs/usage-guide.md) for setup, framework-specific testing, and optional note export.

For local runtimes, see [local environment setup](docs/local-environments.md).
Use `pnpm lab:doctor <id>`, `pnpm lab:run <id>`, and `pnpm lab:test <id>`.

[Local runtime CI](https://github.com/Yelihi/labs/actions/workflows/local-runtimes.yml) checks Node.js, Python, C and C++ on Ubuntu and macOS for pushes and pull requests.

[Browser CI](https://github.com/Yelihi/labs/actions/workflows/browser-labs.yml) runs all JavaScript, React/Vite (including CSS), and Next.js lab browser tests in Chromium. React autocomplete and Web Worker tests cover interactions and real worker execution.
Use `pnpm lab:test:browser javascript`, `pnpm lab:test:browser react-vite`, or `pnpm lab:test:browser next-app` locally.

로컬 HTTP 실습 서버는 `pnpm dev:server`로 실행합니다. React 실습은 별도 터미널에서 `pnpm dev:react`로 실행하고,
Network + Worker의 API 선택에서 모의 API와 로컬 HTTP API를 전환할 수 있습니다.
실행·API·검증 방법은 [실습 서버 가이드](apps/lab-server/README.md)를 참고하세요.
