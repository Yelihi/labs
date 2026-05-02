import path from 'node:path';
import fs from 'fs-extra';
import fg from 'fast-glob';
import type { LabConfig, LabFramework } from '@frontend-labs/lab-core';
import { repoRoot, appDirs } from '../utils/paths';
import { toTitle, toComponentName } from '../utils/slug';
import { readLabConfig } from '../utils/lab-config';

type LabEntry = {
  config: LabConfig;
  category: string;
  slug: string;
};

const REACT_FRAMEWORKS: LabFramework[] = ['react-vite', 'next-app'];
const VANILLA_FRAMEWORKS: LabFramework[] = ['javascript', 'typescript'];
const KNOWN_FRAMEWORKS: LabFramework[] = [...REACT_FRAMEWORKS, ...VANILLA_FRAMEWORKS];

function componentExt(framework: LabFramework): string {
  if (framework === 'javascript') return '.js';
  if (framework === 'vue-vite') return '.vue';
  return '.tsx';
}

function generateReactLabsTs(entries: LabEntry[], appDir: string): string {
  const lines: string[] = [
    `import type { ComponentType } from 'react';`,
    ``,
    `export type LabRoute = {`,
    `  id: string;`,
    `  title: string;`,
    `  route: string;`,
    `  component: ComponentType;`,
    `};`,
    ``,
  ];

  if (entries.length > 0) {
    for (const { config, category, slug } of entries) {
      const compName = toComponentName(slug);
      const importPath = path.relative(
        path.join(appDir, 'src'),
        path.join(repoRoot, 'labs', category, slug, 'src', compName),
      ).replace(/\\/g, '/');
      lines.push(`import ${compName} from '${importPath}';`);
    }
    lines.push(``);
  }

  const items = entries.map(({ config, slug }) => {
    const compName = toComponentName(slug);
    return `  {\n    id: '${config.id}',\n    title: '${config.title}',\n    route: '${config.route}',\n    component: ${compName},\n  }`;
  });

  const labsValue = items.length > 0 ? `[\n${items.join(',\n')},\n]` : `[]`;
  lines.push(`export const labs: readonly LabRoute[] = ${labsValue};`);
  lines.push(``);

  return lines.join('\n');
}

function generateVanillaLabsTs(entries: LabEntry[], appDir: string): string {
  const lines: string[] = [
    `export type LabRoute = {`,
    `  id: string;`,
    `  title: string;`,
    `  route: string;`,
    `  setup: (root: HTMLElement) => void;`,
    `};`,
    ``,
  ];

  if (entries.length > 0) {
    for (const { config, category, slug } of entries) {
      const compName = toComponentName(slug);
      const importPath = path.relative(
        path.join(appDir, 'src'),
        path.join(repoRoot, 'labs', category, slug, 'src', compName),
      ).replace(/\\/g, '/');
      lines.push(`import ${compName} from '${importPath}';`);
    }
    lines.push(``);
  }

  const items = entries.map(({ config, slug }) => {
    const compName = toComponentName(slug);
    return `  {\n    id: '${config.id}',\n    title: '${config.title}',\n    route: '${config.route}',\n    setup: ${compName},\n  }`;
  });

  const labsValue = items.length > 0 ? `[\n${items.join(',\n')},\n]` : `[]`;
  lines.push(`export const labs: readonly LabRoute[] = ${labsValue};`);
  lines.push(``);

  return lines.join('\n');
}

export async function routesCommand(): Promise<void> {
  const configPaths = await fg('labs/*/*/lab.config.ts', { cwd: repoRoot });

  const allEntries = await Promise.all(
    configPaths.map(async (configPath) => {
      const parts = configPath.split('/');
      const category = parts[1]!;
      const slug = parts[2]!;
      const labId = `${category}/${slug}`;
      const config = await readLabConfig(labId);
      return { config, category, slug } satisfies LabEntry;
    }),
  );

  const byFramework = new Map<LabFramework, LabEntry[]>();
  for (const entry of allEntries) {
    const fw = entry.config.framework;
    if (!byFramework.has(fw)) byFramework.set(fw, []);
    byFramework.get(fw)!.push(entry);
  }

  let totalSynced = 0;

  for (const fw of KNOWN_FRAMEWORKS) {
    const appDir = appDirs[fw];
    if (!appDir) continue;

    const generatedPath = path.join(appDir, 'src/labs.generated.ts');
    if (!(await fs.pathExists(appDir))) continue;

    const entries = byFramework.get(fw) ?? [];
    const content = REACT_FRAMEWORKS.includes(fw)
      ? generateReactLabsTs(entries, appDir)
      : generateVanillaLabsTs(entries, appDir);

    await fs.writeFile(generatedPath, content);
    totalSynced += entries.length;
    console.log(`  [${fw}] ${entries.length} lab(s) → ${path.relative(repoRoot, generatedPath)}`);
  }

  console.log(`Synced ${totalSynced} lab(s) total across ${KNOWN_FRAMEWORKS.length} framework(s).`);
}
