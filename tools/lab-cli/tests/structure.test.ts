import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from 'vitest';
import { labsDir } from '../src/utils/paths';

test('every lab keeps code, tests, and supporting material in the standard locations', async () => {
  for (const category of await readdir(labsDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    for (const lab of await readdir(path.join(labsDir, category.name), { withFileTypes: true })) {
      if (!lab.isDirectory()) continue;
      const dir = path.join(labsDir, category.name, lab.name);
      for (const name of ['src', 'tests']) {
        expect((await stat(path.join(dir, name))).isDirectory(), `${dir}/${name}`).toBe(true);
      }
      for (const name of ['README.md', 'lab.config.ts']) {
        expect((await stat(path.join(dir, name))).isFile(), `${dir}/${name}`).toBe(true);
      }
      const entries = await readdir(dir, { withFileTypes: true });
      expect(
        entries
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
          .filter(
            (name) => !['src', 'tests', 'docs', 'node_modules', 'build', '.venv'].includes(name),
          ),
        dir,
      ).toEqual([]);
      expect(
        entries
          .filter((entry) => entry.isFile())
          .map((entry) => entry.name)
          .filter(
            (name) =>
              ![
                'README.md',
                'lab.config.ts',
                'package.json',
                'pyproject.toml',
                'requirements.txt',
                'Makefile',
              ].includes(name),
          ),
        dir,
      ).toEqual([]);
    }
  }
});
