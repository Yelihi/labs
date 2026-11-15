import path from 'node:path';
import { readLabConfig } from '../utils/lab-config';
import { labsDir, repoRoot } from '../utils/paths';
import { frameworkDev } from '../utils/frameworks';
import { execute, runLocal } from '../utils/local-runtime';

export async function runCommand(id: string): Promise<void> {
  const { framework } = await readLabConfig(id);
  if (framework === 'node' || framework === 'python-cli') return runLocal(id, framework, false);
  if (framework === 'c' || framework === 'cpp') {
    execute('make', ['run'], path.join(labsDir, id));
    return;
  }
  const info = frameworkDev[framework];
  if (!info?.port || framework === 'vue-vite') throw new Error(`Unsupported runtime: ${framework}`);
  console.log(`Open http://localhost:${info.port}/labs/${id}`);
  execute('pnpm', [info.script], repoRoot);
}
