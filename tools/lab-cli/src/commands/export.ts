import path from 'node:path';
import fs from 'fs-extra';
import { repoRoot, labsDir } from '../utils/paths';
import { readLabConfig } from '../utils/lab-config';

const NOTE_FILES = ['lab-note.md', 'concept-note.md', 'source-note.md', 'interview-note.md'];
const OBSIDIAN_SUBDIR = '08_Labs';

async function loadEnvLocal(): Promise<Record<string, string>> {
  const envPath = path.join(repoRoot, '.env.local');
  if (!(await fs.pathExists(envPath))) return {};
  const content = await fs.readFile(envPath, 'utf-8');
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    result[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return result;
}

async function injectFrontmatter(content: string, config: Awaited<ReturnType<typeof readLabConfig>>): Promise<string> {
  if (content.startsWith('---')) return content;
  const fm = [
    '---',
    `type: lab`,
    `topic: ${config.category}`,
    `status: ${config.status}`,
    `lab_id: ${config.id}`,
    `framework: ${config.framework}`,
    `tags: [${config.tags.map((t) => `"${t}"`).join(', ')}]`,
    `created: ${config.createdAt}`,
    `exported: ${new Date().toISOString().slice(0, 10)}`,
    '---',
    '',
  ].join('\n');
  return fm + content;
}

export async function exportCommand(id: string, options: { write?: boolean }): Promise<void> {
  const parts = id.split('/');
  const category = parts[0];
  const slug = parts[1];

  if (!category || !slug) {
    console.error(`Invalid lab id: "${id}". Expected format: <category>/<slug>`);
    process.exit(1);
  }

  const config = await readLabConfig(id);
  const notesDir = path.join(labsDir, category, slug, 'notes');

  console.log(`\nLab:    ${config.title}`);
  console.log(`ID:     ${id}`);
  console.log(`Status: ${config.status}`);
  console.log(`\nFiles:`);

  for (const f of NOTE_FILES) {
    const exists = await fs.pathExists(path.join(notesDir, f));
    console.log(`  ${exists ? '✓' : '✗'} ${f}`);
  }

  if (!options.write) {
    console.log(`\nDry run — add --write to export to Obsidian.`);
    return;
  }

  const env = await loadEnvLocal();
  const vaultPath = env['OBSIDIAN_VAULT_PATH'] ?? process.env['OBSIDIAN_VAULT_PATH'];

  if (!vaultPath) {
    console.error('\nOBSIDIAN_VAULT_PATH is not set. Check .env.local');
    process.exit(1);
  }

  if (!(await fs.pathExists(vaultPath))) {
    console.error(`\nVault path does not exist: ${vaultPath}`);
    process.exit(1);
  }

  const targetDir = path.join(vaultPath, OBSIDIAN_SUBDIR, category, slug);
  await fs.ensureDir(targetDir);

  let copied = 0;

  for (const f of NOTE_FILES) {
    const src = path.join(notesDir, f);
    if (!(await fs.pathExists(src))) continue;

    let content = await fs.readFile(src, 'utf-8');

    if (f === 'lab-note.md') {
      content = await injectFrontmatter(content, config);
    }

    await fs.writeFile(path.join(targetDir, f), content);
    copied++;
    console.log(`  → ${OBSIDIAN_SUBDIR}/${category}/${slug}/${f}`);
  }

  console.log(`\nExported ${copied} file(s) to:`);
  console.log(`  ${targetDir}`);
}
