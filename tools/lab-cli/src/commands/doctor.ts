import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { readLabConfig } from '../utils/lab-config';
import { pythonPath } from '../utils/local-runtime';
import { repoRoot } from '../utils/paths';

export async function doctorCommand(id: string): Promise<void> {
  const { framework } = await readLabConfig(id);
  let failures = 0;
  function check(label: string, ok: boolean, detail: string): void {
    console.log(`${ok ? 'OK' : 'FAIL'} ${label}: ${detail}`);
    if (!ok) failures++;
  }
  function probe(label: string, command: string, args: string[], hint: string): boolean {
    const result = spawnSync(command, args, { encoding: 'utf8', timeout: 30_000 });
    const ok = !result.error && result.status === 0;
    check(
      label,
      ok,
      ok ? (result.stdout || result.stderr).trim().split('\n')[0] || 'passed' : hint,
    );
    return ok;
  }

  console.log(`Environment: ${id} [${framework}] — ${process.platform}/${process.arch}`);
  const [major, minor] = process.versions.node.split('.').map(Number);
  check('Node.js >=22.12', major! > 22 || (major === 22 && minor! >= 12), process.version);
  const pnpm = spawnSync('pnpm', ['--version'], { encoding: 'utf8', timeout: 30_000 });
  check(
    'pnpm 10.33.0',
    pnpm.status === 0 && pnpm.stdout.trim() === '10.33.0',
    pnpm.stdout?.trim() || 'Install pnpm 10.33.0 (or invoke with npx --yes pnpm@10.33.0).',
  );
  check(
    'Dependencies',
    await fs.pathExists(path.join(repoRoot, 'node_modules/tsx')),
    'Run pnpm install --frozen-lockfile if dependencies are missing.',
  );
  check(
    'Platform',
    ['darwin', 'linux'].includes(process.platform),
    'macOS / Linux / Windows via WSL2; native Windows is not supported.',
  );

  if (framework === 'node') {
    probe(
      'Node built-ins',
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import assert from 'node:assert/strict'; import { test } from 'node:test'; assert.equal(typeof test, 'function'); console.log('node:test available');",
      ],
      'Use Node.js >=22.12.',
    );
  } else if (framework === 'python-cli') {
    const python = pythonPath(id);
    if (await fs.pathExists(python)) {
      probe(
        'Python >=3.11 and isolated venv',
        python,
        [
          '-c',
          'import sys, unittest; assert sys.version_info >= (3, 11); assert sys.prefix != sys.base_prefix; print(sys.version.split()[0])',
        ],
        `Recreate labs/${id}/.venv with Python >=3.11.`,
      );
      probe(
        'Python dependency consistency',
        python,
        ['-m', 'pip', 'check'],
        `Run labs/${id}/.venv/bin/python -m pip install -r labs/${id}/requirements.txt`,
      );
      console.log(
        'NOTE: pip check checks installed distributions; lab:test verifies your imports and behavior.',
      );
    } else {
      probe(
        'System Python >=3.11',
        'python3',
        [
          '-c',
          'import sys, venv; assert sys.version_info >= (3, 11); print(sys.version.split()[0])',
        ],
        'Install Python >=3.11 with venv support.',
      );
      check('Virtual environment', false, `Run: python3 -m venv labs/${id}/.venv`);
    }
  } else if (framework === 'c' || framework === 'cpp') {
    probe(
      'Make',
      'make',
      ['--version'],
      'Install Make (macOS: xcode-select --install; Ubuntu: build-essential).',
    );
    const compiler = framework === 'c' ? process.env.CC || 'cc' : process.env.CXX || 'c++';
    const dir = await mkdtemp(path.join(os.tmpdir(), 'labs-doctor-'));
    try {
      const src = path.join(dir, framework === 'c' ? 'check.c' : 'check.cpp');
      const out = path.join(dir, 'check');
      await writeFile(
        src,
        framework === 'c'
          ? '#include <stdio.h>\nint main(void) { puts("C17 works"); return 0; }\n'
          : '#include <iostream>\nint main() { std::cout << "C++20 works\\n"; }\n',
      );
      if (
        probe(
          'Compiler',
          compiler,
          [framework === 'c' ? '-std=c17' : '-std=c++20', src, '-o', out],
          `Install a C17/C++20 compiler. Selected executable: ${compiler}`,
        )
      ) {
        probe('Compiled executable', out, [], 'Compiled executable could not run.');
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  } else if (framework === 'python') {
    check(
      'Python web runtime',
      false,
      'Legacy FastAPI/GStreamer labs require separate setup; see docs/local-environments.md. Use python-cli for standalone Python.',
    );
  } else if (framework === 'vue-vite') {
    check('Vue runtime', false, 'No Vue app is configured.');
  } else {
    console.log('NOTE: browser installation is checked when lab:test launches Playwright.');
  }
  console.log(
    failures
      ? `${failures} check(s) failed. See docs/local-environments.md.`
      : 'Runtime checks passed. Run lab:test to verify the experiment.',
  );
  process.exitCode = failures ? 1 : 0;
}
