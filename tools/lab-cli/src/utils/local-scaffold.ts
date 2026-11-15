import path from 'node:path';
import fs from 'fs-extra';

export async function writeLocalScaffold(
  dir: string,
  framework: 'node' | 'python-cli',
): Promise<void> {
  const files =
    framework === 'node'
      ? {
          'src/main.mjs': `import { pathToFileURL } from 'node:url';

export function add(a, b) {
  return a + b;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(add(2, 3));
}
`,
          'tests/main.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { add } from '../src/main.mjs';

test('adds positive and negative numbers', () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(-2, 2), 0);
});
`,
        }
      : {
          'src/main.py': `def add(a, b):
    return a + b


if __name__ == "__main__":
    print(add(2, 3))
`,
          'tests/test_main.py': `import unittest
from src.main import add


class AddTest(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)
        self.assertEqual(add(-2, 2), 0)
`,
          'requirements.txt':
            '# Standard library only. Pin third-party dependencies here when needed.\n',
        };
  for (const [name, content] of Object.entries(files)) {
    await fs.writeFile(path.join(dir, name), content);
  }
}
