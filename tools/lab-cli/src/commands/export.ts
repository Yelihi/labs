export async function exportCommand(id: string, options: { write?: boolean }): Promise<void> {
  console.log(`Exporting lab notes for: ${id}`);
  if (options.write) {
    const vaultPath = process.env['OBSIDIAN_VAULT_PATH'];
    if (!vaultPath) {
      console.error('OBSIDIAN_VAULT_PATH is not set in .env.local');
      process.exit(1);
    }
    console.log(`Target vault: ${vaultPath}`);
  }
  console.log('TODO: copy notes/* to Obsidian vault');
}
