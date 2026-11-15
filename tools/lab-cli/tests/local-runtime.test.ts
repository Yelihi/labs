import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const paths = vi.hoisted(() => ({ labsDir: '' }));
vi.mock('../src/utils/paths', () => paths);
import { runLocal } from '../src/utils/local-runtime';
import { writeLocalScaffold } from '../src/utils/local-scaffold';
import { readLabConfig } from '../src/utils/lab-config';

beforeEach(async () => {
  paths.labsDir = await mkdtemp(path.join(os.tmpdir(), 'local-runtime-'));
  await mkdir(path.join(paths.labsDir, 'node/example/src'), { recursive: true });
  await mkdir(path.join(paths.labsDir, 'node/example/tests'), { recursive: true });
});
afterEach(async () => {
  process.exitCode = 0;
  await rm(paths.labsDir, { recursive: true, force: true });
});

it('runs generated Node code and real tests, and propagates failed assertions', async () => {
  const dir = path.join(paths.labsDir, 'node/example');
  await writeLocalScaffold(dir, 'node');
  await runLocal('node/example', 'node', false);
  expect(process.exitCode).toBe(0);
  await runLocal('node/example', 'node', true);
  expect(process.exitCode).toBe(0);
  await writeFile(
    path.join(dir, 'tests/failing.test.mjs'),
    "import assert from 'node:assert/strict'; assert.equal(1, 2);\n",
  );
  await runLocal('node/example', 'node', true);
  expect(process.exitCode).toBe(1);
});

it('does not report an empty Node test directory as passing', async () => {
  await expect(runLocal('node/example', 'node', true)).rejects.toThrow('No tests found');
});

it('requires the per-lab Python virtual environment', async () => {
  await expect(runLocal('python/example', 'python-cli', false)).rejects.toThrow('python3 -m venv');
});

it.each(['../outside', 'node/example/extra', '/tmp/example', 'node/../../outside'])(
  'rejects invalid lab ids before loading any config: %s',
  async (id) => {
    await expect(readLabConfig(id)).rejects.toThrow('Expected lab id');
  },
);
