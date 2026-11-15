---
name: local-labs
description: Set up, diagnose, create, run, and test Node.js, standalone Python, C/C++, and browser experiments in this labs repository. Use for local lab environment problems and new experiments; preserve existing experiment material.
---

# Local labs

Read the repository's [environment guide](../../../docs/local-environments.md) for installation and runtime choices.
Read [usage guide](../../../docs/usage-guide.md) for browser workflows. Resolve these paths from this skill's directory.

## Choose the runtime deliberately

- `node`: Node.js APIs, CLI scripts, internal logic. Entry `src/main.mjs`; tests `tests/**/*.test.mjs`.
- `python-cli`: standalone Python. Entry `src/main.py`; tests `tests/test_*.py`; per-lab `.venv`.
- `c` / `cpp`: Makefile `run` and `test` targets, C17 / C++20.
- Existing `javascript` / `typescript` are browser apps, not Node runtimes.
- Existing `python` is FastAPI/GStreamer, not standalone Python. Its legacy setup is not validated by the general Python setup. Never install its video-processing dependencies for a simple Python exercise.

## Workflow

Run from the repository root. Use the pnpm version in package.json (10.33.0); if the host's pnpm differs, invoke `npx --yes pnpm@10.33.0 ...` without changing global configuration.

1. Inspect the intended lab and its lab.config.ts. For new work use `pnpm lab:create <category> <slug> --framework <runtime>`; keep source in src/, tests in tests/, and supporting material in docs/.
2. Use `pnpm lab:doctor <id>`. A failure is actionable output, not permission to globally install or upgrade software. Follow the user's installation authorization. Make only the necessary environment change.
3. For python-cli create `python3 -m venv labs/<id>/.venv` and install its own requirements with `.venv/bin/python -m pip install -r requirements.txt` (use paths from the repository root). Do not copy venvs between computers or use system pip. Add pinned dependencies only when needed.
4. Run `pnpm lab:run <id>` and `pnpm lab:test <id>`. Browser labs may also use the existing direct `pnpm dev:*` commands. Node/Python/C/C++ do not need Playwright.
5. Replace the generated sample with the actual experiment and add assertions for its hypothesis. C/C++ smoke scripts only establish successful execution; they do not prove algorithm correctness.
6. After structural or CLI changes run `pnpm --filter @frontend-labs/lab-cli test`. Retain written material; update references when moving it.

Record OS, architecture, versions, commands, exit codes, and what was not tested in the lab README or docs/. Distinguish doctor success, code execution, test assertions, and manual observations. Do not claim macOS/Linux/WSL2 parity from a single machine's run. Windows support here means WSL2, not native PowerShell. Do not add Docker unless explicitly requested.

This skill does not authorize commits, pushes, publication, or external messages. Preserve unfinished work already present in the repository.
