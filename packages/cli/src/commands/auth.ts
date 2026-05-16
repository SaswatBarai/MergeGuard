import { Command } from 'commander';
import { password, input } from '@inquirer/prompts';
import * as config from '../config.js';
import { ui } from '../utils/ui.js';

export const registerAuthCommands = (program: Command) => {
  const auth = program.command('auth').description('Authentication commands');

  auth
    .command('login')
    .description('Configure your MergeGuard API Key')
    .action(async () => {
      ui.title('MergeGuard Authentication');
      
      const apiKey = await password({
        message: 'Enter your API Key (from the Web Dashboard)',
        mask: '*',
      });

      const apiUrl = await input({
        message: 'Enter the API Gateway URL',
        default: config.getApiUrl(),
      });

      config.setApiKey(apiKey);
      config.setApiUrl(apiUrl);

      ui.success('Successfully authenticated!');
    });
};
