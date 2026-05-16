import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerReviewCommands } from './commands/review.js';

const program = new Command();

program
  .name('mergeguard')
  .description('MergeGuard AI Code Review CLI')
  .version('1.0.0');

// Register modular commands
registerAuthCommands(program);
registerReviewCommands(program);

// Handle unknown commands
program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);

// Display help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
