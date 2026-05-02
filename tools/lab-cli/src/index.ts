#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';
import { devCommand } from './commands/dev';
import { testCommand } from './commands/test';
import { reportCommand } from './commands/report';
import { exportCommand } from './commands/export';
import { listCommand } from './commands/list';
import { routesCommand } from './commands/routes';

const program = new Command();

program.name('lab').description('Frontend Labs automation CLI');

program
  .command('create')
  .argument('<category>', 'Lab category, e.g. css')
  .argument('<slug>', 'Lab slug, e.g. container-query')
  .option(
    '--framework <framework>',
    'Lab framework: react-vite | next-app | javascript | typescript | vue-vite',
    'react-vite',
  )
  .action(createCommand);

program
  .command('dev')
  .argument('<id>', 'Lab id, e.g. css/container-query')
  .action(devCommand);

program
  .command('test')
  .argument('<id>', 'Lab id, e.g. css/container-query')
  .option('--project <project>', 'Playwright project')
  .option('--core', 'Run chromium/firefox/webkit only')
  .option('--full', 'Run full browser matrix')
  .action(testCommand);

program
  .command('report')
  .argument('<id>', 'Lab id, e.g. css/container-query')
  .action(reportCommand);

program
  .command('export')
  .argument('<id>', 'Lab id, e.g. css/container-query')
  .option('--write', 'Write exported notes to OBSIDIAN_VAULT_PATH')
  .action(exportCommand);

program.command('list').action(listCommand);

program.command('routes').action(routesCommand);

// pnpm arg-forwarding injects a '--' separator at argv[2]; remove it so
// commander can parse options (e.g. --framework) correctly.
const argv =
  process.argv[2] === '--'
    ? [process.argv[0]!, process.argv[1]!, ...process.argv.slice(3)]
    : process.argv;

program.parse(argv);
