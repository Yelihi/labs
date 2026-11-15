import { spawnSync } from 'node:child_process';
import { readLabConfig } from '../utils/lab-config';
import { repoRoot } from '../utils/paths';
import { frameworkDev } from '../utils/frameworks';

export async function testCommand(
  id: string,
  options: { project?: string; core?: boolean; full?: boolean },
): Promise<void> {
  const config = await readLabConfig(id);
  const native = config.framework === 'c' || config.framework === 'cpp';
  const info = frameworkDev[config.framework];
  if (!native && (!info?.port || config.framework === 'vue-vite')) {
    throw new Error(`No test server configured for framework: ${config.framework}`);
  }

  const command = native ? 'make' : 'pnpm';
  const args = native
    ? ['-C', `labs/${id}`, 'build']
    : ['exec', 'playwright', 'test', `labs/${id}/tests`];
  if (!native) {
    if (options.project) args.push('--project', options.project);
    else if (options.core) args.push('--project=chromium', '--project=firefox', '--project=webkit');
    else if (!options.full) args.push('--project=chromium');
  }

  console.log(`${native ? 'Building' : 'Testing'} lab: ${id}`);
  console.log(`Command: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...(!native && {
        LAB_TEST_BASE_URL: `http://localhost:${info.port}`,
        LAB_TEST_SERVER_COMMAND: `pnpm ${info.script}`,
      }),
    },
  });
  if (result.error) throw result.error;
  if (result.signal) throw new Error(`Test process terminated by ${result.signal}`);
  process.exitCode = result.status ?? 1;
}
