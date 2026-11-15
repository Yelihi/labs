import type { LabFramework } from '@frontend-labs/lab-core';

type DevInfo = { script: string; port?: number };

export const frameworkDev: Record<LabFramework, DevInfo> = {
  node: { script: 'lab:run' },
  'python-cli': { script: 'lab:run' },
  'react-vite': { script: 'dev:react', port: 5173 },
  'next-app': { script: 'dev:next', port: 5174 },
  javascript: { script: 'dev:javascript', port: 5175 },
  typescript: { script: 'dev:typescript', port: 5176 },
  'vue-vite': { script: 'dev:vue', port: 5177 },
  python: { script: 'dev:python', port: 8000 },
  c: { script: 'make -C labs/{id} run' },
  cpp: { script: 'make -C labs/{id} run' },
};
