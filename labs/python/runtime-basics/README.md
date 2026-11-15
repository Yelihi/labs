# Runtime Basics

## Lab ID

`python/runtime-basics`

## Framework

`python-cli`

## Experiment question

Confirm that the local runtime can execute source code and report test results without a browser.

## Environment

Create the isolated environment first:

    python3 -m venv labs/python/runtime-basics/.venv
    labs/python/runtime-basics/.venv/bin/python -m pip install -r labs/python/runtime-basics/requirements.txt

Check prerequisites with `pnpm lab:doctor python/runtime-basics`. See the repository's docs/local-environments.md for installation.

## How to run

```bash
pnpm lab:run python/runtime-basics
```

## How to test

```bash
pnpm lab:test python/runtime-basics
```

## Observations and conclusion

Verified on macOS arm64 on 2026-11-15. Environment diagnosis, execution, and tests passed.
See [validation details](../../../docs/local-environments-validation.md) for versions and limits.
