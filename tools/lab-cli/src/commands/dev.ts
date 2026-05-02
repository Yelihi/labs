import type { LabFramework } from '@frontend-labs/lab-core';
import { readLabConfig } from '../utils/lab-config';

type DevInfo = { script: string; port: number };

const frameworkDev: Record<LabFramework, DevInfo> = {
  'react-vite': { script: 'dev:react', port: 5173 },
  'next-app': { script: 'dev:next', port: 5174 },
  'javascript': { script: 'dev:javascript', port: 5175 },
  'typescript': { script: 'dev:typescript', port: 5176 },
  'vue-vite': { script: 'dev:vue', port: 5177 },
};

export async function devCommand(id: string): Promise<void> {
  const config = await readLabConfig(id);
  const info = frameworkDev[config.framework];

  console.log(`Lab:       ${id}`);
  console.log(`Framework: ${config.framework}`);
  console.log(`Run:       pnpm ${info.script}`);
  console.log(`URL:       http://localhost:${info.port}/labs/${id}`);
}
