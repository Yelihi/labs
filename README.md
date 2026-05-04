# Frontend Labs

A Turborepo-based monorepo for frontend research and experiments.

## Setup

```bash
pnpm install
```

## Minimal workflow

```bash
pnpm lab:create css container-query   # scaffold a new lab
pnpm dev:react                        # start the Vite dev server
pnpm lab:test css/container-query     # run Playwright tests for the lab
pnpm lab:export css/container-query   # export notes to Obsidian
```

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
