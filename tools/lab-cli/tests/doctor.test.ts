import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ config: vi.fn(), spawn: vi.fn(), exists: vi.fn() }));
vi.mock('../src/utils/lab-config', () => ({ readLabConfig: mocks.config }));
vi.mock('node:child_process', () => ({ spawnSync: mocks.spawn }));
vi.mock('fs-extra', () => ({ default: { pathExists: mocks.exists } }));
import { doctorCommand } from '../src/commands/doctor';

afterEach(() => {
  process.exitCode = 0;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it('fails with an actionable compiler diagnostic when CC is missing', async () => {
  mocks.config.mockResolvedValue({ framework: 'c' });
  mocks.exists.mockResolvedValue(true);
  vi.stubEnv('CC', 'missing-compiler');
  mocks.spawn.mockImplementation((command: string) =>
    command === 'missing-compiler'
      ? { status: null, error: new Error('ENOENT'), stdout: '', stderr: '' }
      : { status: 0, stdout: command === 'pnpm' ? '10.33.0\n' : 'available', stderr: '' },
  );
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  await doctorCommand('c/example');
  expect(process.exitCode).toBe(1);
  expect(log).toHaveBeenCalledWith(
    expect.stringContaining('FAIL Compiler: Install a C17/C++20 compiler'),
  );
});

it('reports the exact venv creation command for a missing Python environment', async () => {
  mocks.config.mockResolvedValue({ framework: 'python-cli' });
  mocks.exists.mockImplementation(async (name: string) => name.endsWith('node_modules/tsx'));
  mocks.spawn.mockImplementation((command: string) => ({
    status: 0,
    stdout: command === 'pnpm' ? '10.33.0\n' : '3.14.4',
    stderr: '',
  }));
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  await doctorCommand('python/example');
  expect(process.exitCode).toBe(1);
  expect(log).toHaveBeenCalledWith(
    'FAIL Virtual environment: Run: python3 -m venv labs/python/example/.venv',
  );
});
