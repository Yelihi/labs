import { spawnSync } from 'node:child_process';
import fg from 'fast-glob';
import { repoRoot } from '../utils/paths';
import { readLabConfig } from '../utils/lab-config';
import { frameworkDev } from '../utils/frameworks';

export async function testBrowserCommand(framework: string): Promise<void> {
  if (framework !== 'javascript' && framework !== 'react-vite' && framework !== 'next-app') {
    throw new Error('Expected browser framework: javascript | react-vite | next-app');
  }
  const configs = await fg('labs/*/*/lab.config.ts', { cwd: repoRoot });
  const testDirs: string[] = [];
  for (const configPath of configs.sort()) {
    const id = configPath.split('/').slice(1, 3).join('/');
    if ((await readLabConfig(id)).framework === framework) {
      const testDir = `labs/${id}/tests`;
      if (!(await fg(`${testDir}/**/*.spec.ts`, { cwd: repoRoot })).length) {
        throw new Error(`No browser tests found for ${id}`);
      }
      testDirs.push(testDir);
    }
  }
  if (!testDirs.length) throw new Error(`No labs found for ${framework}`);
  const info = frameworkDev[framework];
  console.log(`Testing ${framework}: ${testDirs.join(', ')}`);
  const result = spawnSync(
    'pnpm',
    ['exec', 'playwright', 'test', ...testDirs, '--project=chromium'],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        LAB_TEST_BASE_URL: `http://localhost:${info.port}`,
        LAB_TEST_SERVER_COMMAND: `pnpm ${info.script}`,
      },
    },
  );
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`Browser tests terminated by ${result.signal}`);
  process.exitCode = result.status ?? 1;
}
