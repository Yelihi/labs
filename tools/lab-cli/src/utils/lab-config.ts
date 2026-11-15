import { pathToFileURL } from 'node:url';
import path from 'node:path';
import type { LabConfig } from '@frontend-labs/lab-core';
import { labsDir } from './paths';

export async function readLabConfig(labId: string): Promise<LabConfig> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(labId)) {
    throw new Error('Expected lab id: <category>/<slug> (lowercase letters, digits, hyphens)');
  }
  const [category, slug] = labId.split('/');
  const configPath = path.join(labsDir, category!, slug!, 'lab.config.ts');
  const module = await import(pathToFileURL(configPath).href);
  return module.default as LabConfig;
}
