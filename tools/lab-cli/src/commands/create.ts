import path from 'node:path';
import fs from 'fs-extra';
import type { LabFramework } from '@frontend-labs/lab-core';
import { labsDir, appDirs } from '../utils/paths';
import { toTitle, toComponentName } from '../utils/slug';
import { routesCommand } from './routes';

function componentExt(framework: LabFramework): string {
  if (framework === 'javascript') return '.js';
  if (framework === 'typescript') return '.ts';
  if (framework === 'vue-vite') return '.vue';
  if (framework === 'python') return '.py';
  return '.tsx';
}

function componentBody(
  framework: LabFramework,
  componentName: string,
  title: string,
  labId: string,
): string {
  if (framework === 'javascript') {
    return `export default function ${componentName}(root) {
  root.innerHTML = \`
    <main style="padding:24px;font-family:system-ui,sans-serif">
      <h1>${title}</h1>
      <p>Lab ID: ${labId}</p>
      <section data-testid="lab-root">
        <p>Implement the experiment here.</p>
      </section>
    </main>
  \`;
}
`;
  }

  if (framework === 'typescript') {
    return `export default function ${componentName}(root: HTMLElement): void {
  root.innerHTML = \`
    <main style="padding:24px;font-family:system-ui,sans-serif">
      <h1>${title}</h1>
      <p>Lab ID: ${labId}</p>
      <section data-testid="lab-root">
        <p>Implement the experiment here.</p>
      </section>
    </main>
  \`;
}
`;
  }

  if (framework === 'python') {
    return `def setup() -> str:
    return """
    <main style="padding:24px;font-family:system-ui,sans-serif">
      <h1>${title}</h1>
      <p>Lab ID: ${labId}</p>
      <section data-testid="lab-root">
        <p>Implement the experiment here.</p>
      </section>
    </main>
    """
`;
  }

  return `export default function ${componentName}() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>${title}</h1>
      <p>Lab ID: ${labId}</p>
      <section data-testid="lab-root">
        <p>Implement the experiment here.</p>
      </section>
    </main>
  );
}
`;
}

export async function createCommand(
  category: string,
  slug: string,
  options: { framework?: string },
): Promise<void> {
  const framework = (options.framework ?? (category in appDirs ? category : 'react-vite')) as LabFramework;
  const labId = `${category}/${slug}`;
  const labDir = path.join(labsDir, category, slug);
  const title = toTitle(slug);
  const componentName = toComponentName(slug);
  const route = `/labs/${category}/${slug}`;
  const today = new Date().toISOString().slice(0, 10);
  const ext = componentExt(framework);

  if (await fs.pathExists(labDir)) {
    throw new Error(`Lab already exists: ${labId}`);
  }

  await fs.ensureDir(path.join(labDir, 'src', 'components'));
  await fs.ensureDir(path.join(labDir, 'src', 'styles'));
  await fs.ensureDir(path.join(labDir, 'tests'));
  await fs.ensureDir(path.join(labDir, 'results', 'screenshots'));
  await fs.ensureDir(path.join(labDir, 'notes'));

  await fs.writeFile(
    path.join(labDir, 'lab.config.ts'),
    `import { defineLab } from '@frontend-labs/lab-core';

export default defineLab({
  id: '${labId}',
  title: '${title}',
  category: '${category}',
  status: 'active',
  framework: '${framework}',
  route: '${route}',
  tags: ['${category}', '${slug}'],
  createdAt: '${today}',
  browsers: {
    automated: ['chromium', 'firefox', 'webkit'],
    manual: ['chrome', 'edge', 'safari'],
  },
  goals: [
    'Define the core experiment question.',
    'Build a minimal reproducible demo.',
    'Verify behavior across browsers.',
    'Export the result to Obsidian notes.',
  ],
  outputs: {
    sourceNote: 'notes/source-note.md',
    conceptNote: 'notes/concept-note.md',
    labNote: 'notes/lab-note.md',
    interviewNote: 'notes/interview-note.md',
  },
});
`,
  );

  await fs.writeFile(
    path.join(labDir, 'src', `${componentName}${ext}`),
    componentBody(framework, componentName, title, labId),
  );

  await fs.writeFile(
    path.join(labDir, 'README.md'),
    `# ${title}

## Lab ID

\`${labId}\`

## Framework

\`${framework}\`

## Goal

TODO

## How to run

\`\`\`bash
pnpm lab:dev ${labId}
\`\`\`

## How to test

\`\`\`bash
pnpm lab:test ${labId}
\`\`\`
`,
  );

  await fs.writeFile(
    path.join(labDir, 'plan.md'),
    `# PLAN - ${title}

## Experiment Question

TODO

## Hypothesis

TODO

## Implementation Plan

TODO

## Browser Matrix

- Chromium
- Firefox
- WebKit
- Chrome
- Edge
- Safari

## Manual Check

TODO
`,
  );

  await fs.writeFile(
    path.join(labDir, 'tests', `${slug}.spec.ts`),
    `import { test, expect } from '@playwright/test';

test.describe('${labId}', () => {
  test('renders lab page', async ({ page }) => {
    await page.goto('${route}');
    await expect(page.getByRole('heading', { name: '${title}' })).toBeVisible();
    await expect(page.getByTestId('lab-root')).toBeVisible();
  });
});
`,
  );

  await fs.writeFile(
    path.join(labDir, 'results', 'manual-check.md'),
    `# Manual Check - ${title}\n\nTODO\n`,
  );

  await fs.writeFile(
    path.join(labDir, 'notes', 'source-note.md'),
    `# SOURCE - ${title}\n\nTODO\n`,
  );
  await fs.writeFile(
    path.join(labDir, 'notes', 'concept-note.md'),
    `# CONCEPT - ${title}\n\nTODO\n`,
  );
  await fs.writeFile(
    path.join(labDir, 'notes', 'lab-note.md'),
    `# LAB - ${title}\n\nTODO\n`,
  );
  await fs.writeFile(
    path.join(labDir, 'notes', 'interview-note.md'),
    `# INTERVIEW - ${title}\n\nTODO\n`,
  );

  console.log(`Created lab: ${labId} [${framework}]`);
  await routesCommand();
}
