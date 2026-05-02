export async function testCommand(
  id: string,
  options: { project?: string; core?: boolean; full?: boolean },
): Promise<void> {
  console.log(`Running tests for: ${id}`);
  const args: string[] = ['pnpm', 'exec', 'playwright', 'test', `labs/${id}`];
  if (options.project) args.push('--project', options.project);
  else if (options.core) args.push('--project=chromium', '--project=firefox', '--project=webkit');
  console.log(`Command: ${args.join(' ')}`);
}
