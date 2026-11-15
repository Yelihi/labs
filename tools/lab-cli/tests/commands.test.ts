import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  spawn: vi.fn(),
  readConfig: vi.fn(),
  routes: vi.fn(),
  paths: { repoRoot: '/repo', labsDir: '', appDirs: {} },
}));
vi.mock('node:child_process', () => ({ spawnSync: mocks.spawn }));
vi.mock('../src/utils/lab-config', () => ({ readLabConfig: mocks.readConfig }));
vi.mock('../src/utils/paths', () => mocks.paths);
vi.mock('../src/commands/routes', () => ({ routesCommand: mocks.routes }));

import { testCommand } from '../src/commands/test';
import { createCommand } from '../src/commands/create';
import { exportCommand } from '../src/commands/export';

let tempDir: string | undefined;
afterEach(async () => {
  process.exitCode = 0;
  vi.clearAllMocks();
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

describe('test command', () => {
  it.each([
    ['react-vite', 'dev:react', 5173],
    ['next-app', 'dev:next', 5174],
    ['javascript', 'dev:javascript', 5175],
    ['typescript', 'dev:typescript', 5176],
    ['python', 'dev:python', 8000],
  ])(
    'runs %s tests against the matching server and propagates failure',
    async (framework, script, port) => {
      mocks.readConfig.mockResolvedValue({ framework });
      mocks.spawn.mockReturnValue({ status: 7 });
      await testCommand('browser/example', {});
      expect(mocks.spawn).toHaveBeenCalledWith(
        'pnpm',
        ['exec', 'playwright', 'test', 'labs/browser/example/tests', '--project=chromium'],
        expect.objectContaining({
          cwd: '/repo',
          stdio: 'inherit',
          env: expect.objectContaining({
            LAB_TEST_BASE_URL: `http://localhost:${port}`,
            LAB_TEST_SERVER_COMMAND: `pnpm ${script}`,
          }),
        }),
      );
      expect(process.exitCode).toBe(7);
    },
  );

  it.each([
    [{ core: true }, ['--project=chromium', '--project=firefox', '--project=webkit']],
    [{ full: true }, []],
    [{ project: 'webkit' }, ['--project', 'webkit']],
  ])('honors browser options %j', async (options, suffix) => {
    mocks.readConfig.mockResolvedValue({ framework: 'react-vite' });
    mocks.spawn.mockReturnValue({ status: 0 });
    await testCommand('css/example', options);
    expect(mocks.spawn.mock.calls[0]![1].slice(4)).toEqual(suffix);
  });

  it('executes the C++ test target', async () => {
    mocks.readConfig.mockResolvedValue({ framework: 'cpp' });
    mocks.spawn.mockReturnValue({ status: 2 });
    await testCommand('cpp/example', {});
    expect(mocks.spawn).toHaveBeenCalledWith(
      'make',
      ['-C', 'labs/cpp/example', 'test'],
      expect.anything(),
    );
    expect(process.exitCode).toBe(2);
  });

  it('reports process startup errors', async () => {
    mocks.readConfig.mockResolvedValue({ framework: 'react-vite' });
    mocks.spawn.mockReturnValue({ error: new Error('spawn failed') });
    await expect(testCommand('css/example', {})).rejects.toThrow('spawn failed');
  });
});

describe('minimal scaffold', () => {
  it.each(['react-vite', 'cpp'])(
    'creates only useful files for %s and preserves existing labs',
    async (framework) => {
      tempDir = await mkdtemp(path.join(os.tmpdir(), 'lab-cli-test-'));
      mocks.paths.labsDir = tempDir;
      await createCommand('react', 'example', { framework });
      const labDir = path.join(tempDir, 'react/example');
      expect((await readdir(labDir)).sort()).toEqual(
        framework === 'cpp'
          ? ['Makefile', 'README.md', 'lab.config.ts', 'src', 'tests']
          : ['README.md', 'lab.config.ts', 'src', 'tests'],
      );
      expect(await readdir(path.join(labDir, 'src'))).toEqual([
        framework === 'cpp' ? 'ExampleLab.cpp' : 'ExampleLab.tsx',
      ]);
      if (framework === 'cpp') expect(mocks.routes).not.toHaveBeenCalled();
      else expect(mocks.routes).toHaveBeenCalledOnce();
      await expect(createCommand('react', 'example', { framework })).rejects.toThrow(
        'already exists',
      );
    },
  );
});

describe('generated run instructions', () => {
  it.each([
    ['react-vite', 'pnpm dev:react', 5173],
    ['next-app', 'pnpm dev:next', 5174],
    ['javascript', 'pnpm dev:javascript', 5175],
    ['typescript', 'pnpm dev:typescript', 5176],
    ['python', 'pnpm dev:python', 8000],
    ['c', 'pnpm lab:run browser/example', undefined],
    ['cpp', 'pnpm lab:run browser/example', undefined],
  ])('documents the direct command for %s', async (framework, command, port) => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'lab-cli-test-'));
    mocks.paths.labsDir = tempDir;
    await createCommand('browser', 'example', { framework });
    const readme = await readFile(path.join(tempDir, 'browser/example/README.md'), 'utf-8');
    expect(readme).toContain(command);
    if (port) expect(readme).toContain(`http://localhost:${port}/labs/browser/example`);
    else expect(readme).not.toContain('http://localhost:');
  });
});

it('exports existing notes from docs/notes', async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'lab-cli-test-'));
  mocks.paths.labsDir = tempDir;
  const notes = path.join(tempDir, 'react/example/docs/notes');
  await mkdir(notes, { recursive: true });
  await writeFile(path.join(notes, 'concept-note.md'), '# Preserved concept');
  mocks.readConfig.mockResolvedValue({ title: 'Example', status: 'active' });
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  try {
    await exportCommand('react/example', {});
    expect(log).toHaveBeenCalledWith('  ✓ concept-note.md');
  } finally {
    log.mockRestore();
  }
});
