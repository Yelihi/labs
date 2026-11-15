import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ glob: vi.fn(), config: vi.fn(), spawn: vi.fn() }));
vi.mock('fast-glob', () => ({ default: mocks.glob }));
vi.mock('../src/utils/lab-config', () => ({ readLabConfig: mocks.config }));
vi.mock('node:child_process', () => ({ spawnSync: mocks.spawn }));
import { testBrowserCommand } from '../src/commands/test-browser';

afterEach(() => {
  process.exitCode = 0;
  vi.clearAllMocks();
});

it('selects by framework rather than category and passes failures through', async () => {
  mocks.glob.mockResolvedValue([
    'labs/css/grid/lab.config.ts',
    'labs/react/server/lab.config.ts',
    'labs/browser/events/lab.config.ts',
  ]);
  mocks.config.mockImplementation(async (id: string) => ({
    framework: {
      'css/grid': 'react-vite',
      'react/server': 'next-app',
      'browser/events': 'javascript',
    }[id],
  }));
  mocks.spawn.mockReturnValue({ status: 1 });
  await testBrowserCommand('react-vite');
  expect(mocks.spawn).toHaveBeenCalledWith(
    'pnpm',
    ['exec', 'playwright', 'test', 'labs/css/grid/tests', '--project=chromium'],
    expect.objectContaining({
      env: expect.objectContaining({
        LAB_TEST_SERVER_COMMAND: 'pnpm dev:react',
        LAB_TEST_BASE_URL: 'http://localhost:5173',
      }),
    }),
  );
  expect(process.exitCode).toBe(1);
});

it('fails instead of silently accepting an empty framework suite', async () => {
  mocks.glob.mockResolvedValue([]);
  await expect(testBrowserCommand('javascript')).rejects.toThrow('No labs found');
  expect(mocks.spawn).not.toHaveBeenCalled();
});

it('rejects non-browser frameworks', async () => {
  await expect(testBrowserCommand('python-cli')).rejects.toThrow('Expected browser framework');
});

it('fails when a selected lab has no browser tests', async () => {
  mocks.glob.mockResolvedValueOnce(['labs/css/grid/lab.config.ts']).mockResolvedValueOnce([]);
  mocks.config.mockResolvedValue({ framework: 'react-vite' });
  await expect(testBrowserCommand('react-vite')).rejects.toThrow(
    'No browser tests found for css/grid',
  );
  expect(mocks.spawn).not.toHaveBeenCalled();
});
