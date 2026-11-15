import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import fg from 'fast-glob';
import { labsDir } from './paths';

export function pythonPath(id: string): string {
  return path.join(labsDir, id, '.venv', 'bin', 'python');
}

export function execute(command: string, args: string[], cwd: string): void {
  console.log(`Command: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.error)
    throw new Error(
      `Cannot start ${command}: ${result.error.message}. See docs/local-environments.md.`,
    );
  if (result.signal) throw new Error(`Process terminated by ${result.signal}`);
  process.exitCode = result.status ?? 1;
}

export async function runLocal(
  id: string,
  framework: 'node' | 'python-cli',
  test: boolean,
): Promise<void> {
  const cwd = path.join(labsDir, id);
  if (framework === 'node') {
    const files = test ? await fg('tests/**/*.test.mjs', { cwd }) : ['src/main.mjs'];
    if (!files.length) throw new Error(`No tests found in ${id}/tests (*.test.mjs)`);
    execute(process.execPath, test ? ['--test', ...files] : files, cwd);
  } else {
    const python = pythonPath(id);
    if (!(await fs.pathExists(python))) {
      throw new Error(`Missing virtual environment. Run: python3 -m venv labs/${id}/.venv`);
    }
    if (test && !(await fg('tests/**/test_*.py', { cwd })).length) {
      throw new Error(`No tests found in ${id}/tests (test_*.py)`);
    }
    execute(
      python,
      test ? ['-m', 'unittest', 'discover', '-s', 'tests', '-v'] : ['src/main.py'],
      cwd,
    );
  }
}
