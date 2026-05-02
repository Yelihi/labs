import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(__dirname, '../../../..');
export const labsDir = path.join(repoRoot, 'labs');

export const appReactViteDir = path.join(repoRoot, 'apps/react-vite');

export const appDirs: Record<string, string> = {
  'react-vite': path.join(repoRoot, 'apps/react-vite'),
  'next-app': path.join(repoRoot, 'apps/next-app'),
  'javascript': path.join(repoRoot, 'apps/javascript'),
  'typescript': path.join(repoRoot, 'apps/typescript'),
  'vue-vite': path.join(repoRoot, 'apps/vue-vite'),
};
