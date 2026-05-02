import fg from 'fast-glob';
import { repoRoot } from '../utils/paths';

export async function listCommand(): Promise<void> {
  const configs = await fg('labs/*/*/lab.config.ts', { cwd: repoRoot });
  if (configs.length === 0) {
    console.log('No labs found. Run: pnpm lab:create <category> <slug>');
    return;
  }
  console.log(`Found ${configs.length} lab(s):`);
  for (const c of configs) {
    const parts = c.split('/');
    console.log(`  ${parts[1]}/${parts[2]}`);
  }
}
