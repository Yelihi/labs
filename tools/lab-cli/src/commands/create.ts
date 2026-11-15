import path from 'node:path';
import fs from 'fs-extra';
import type { LabFramework } from '@frontend-labs/lab-core';
import { labsDir, appDirs } from '../utils/paths';
import { toTitle, toComponentName } from '../utils/slug';
import { routesCommand } from './routes';
import { frameworkDev } from '../utils/frameworks';

function componentExt(framework: LabFramework): string {
  if (framework === 'c') return '.c';
  if (framework === 'cpp') return '.cpp';
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
  if (framework === 'c') {
    return `#include <stdio.h>

int main(void) {
    puts("${title}");
    puts("Lab ID: ${labId}");
    return 0;
}
`;
  }

  if (framework === 'cpp') {
    return `#include <iostream>

int main() {
    std::cout << "${title}\\n";
    std::cout << "Lab ID: ${labId}\\n";
    return 0;
}
`;
  }

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
  const framework = (options.framework ??
    (category === 'c' || category === 'cpp'
      ? category
      : category in appDirs
        ? category
        : 'react-vite')) as LabFramework;
  const labId = `${category}/${slug}`;
  const labDir = path.join(labsDir, category, slug);
  const title = toTitle(slug);
  const componentName = toComponentName(slug);
  const route = `/labs/${category}/${slug}`;
  const today = new Date().toISOString().slice(0, 10);
  const ext = componentExt(framework);
  const dev = frameworkDev[framework];

  if (await fs.pathExists(labDir)) {
    throw new Error(`Lab already exists: ${labId}`);
  }

  await fs.ensureDir(path.join(labDir, 'src'));

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
});
`,
  );

  await fs.writeFile(
    path.join(labDir, 'src', `${componentName}${ext}`),
    componentBody(framework, componentName, title, labId),
  );

  if (framework === 'c' || framework === 'cpp') {
    const compiler = framework === 'c' ? 'cc' : 'c++';
    const standard = framework === 'c' ? '-std=c17' : '-std=c++20';
    await fs.writeFile(
      path.join(labDir, 'Makefile'),
      `SRC := src/${componentName}${ext}
OUT := build/${slug}

.PHONY: run build clean

run: build
\t./$(OUT)

build:
\tmkdir -p build
\t${compiler} ${standard} -Wall -Wextra -pedantic $(SRC) -o $(OUT)

clean:
\trm -rf build
`,
    );
  }

  await fs.writeFile(
    path.join(labDir, 'README.md'),
    `# ${title}

## Lab ID

\`${labId}\`

## Framework

\`${framework}\`

## Experiment question

TODO

## How to run

\`\`\`bash
${framework === 'c' || framework === 'cpp' ? `make -C labs/${labId} run` : `pnpm ${dev.script}`}
\`\`\`

${dev.port ? `Open http://localhost:${dev.port}${route}\n\n` : ''}## How to test

\`\`\`bash
pnpm lab:test ${labId}
\`\`\`

## Observations and conclusion

Record findings here. Add notes/ or results/ only when needed.
`,
  );

  if (framework !== 'c' && framework !== 'cpp') {
    await fs.ensureDir(path.join(labDir, 'tests'));
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
  }

  console.log(`Created lab: ${labId} [${framework}]`);
  await routesCommand();
}
