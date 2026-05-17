import { Command } from 'commander';
import { password, input, confirm } from '@inquirer/prompts';
import * as config from '../config.js';
import * as api from '../api.js';
import { ui } from '../utils/ui.js';

export const registerAuthCommands = (program: Command) => {
  const auth = program.command('auth').description('Authentication commands');

  // ── login ────────────────────────────────────────────────────────────────
  auth
    .command('login')
    .description('Authenticate with your MergeGuard API key')
    .action(async () => {
      ui.title('MergeGuard — Authentication');
      console.log('  Generate an API key at: ' + 'http://localhost:3004/dashboard/settings\n');

      // 1. API key
      const apiKey = await password({
        message: 'Paste your API key',
        mask: '●',
        validate: (v) => v.trim().length > 10 || 'Key looks too short — check and try again',
      });

      // 2. API URL
      const apiUrl = await input({
        message: 'API gateway URL',
        default: config.getApiUrl(),
        validate: (v) => {
          try { new URL(v); return true; }
          catch { return 'Enter a valid URL (e.g. http://localhost:3000)'; }
        },
      });

      config.setApiKey(apiKey.trim());
      config.setApiUrl(apiUrl.trim());

      // 3. Verify key against the API
      process.stdout.write('\n  Verifying credentials…');
      try {
        const me = await api.getMe();
        console.log('\r' + ' '.repeat(30) + '\r');
        ui.success('Authenticated successfully!');
        ui.kv('Name',    me.name);
        ui.kv('Email',   me.email);
        ui.kv('User ID', String(me.id));
        console.log();
      } catch {
        console.log('\r' + ' '.repeat(30) + '\r');
        ui.warn('Key saved but verification failed — check the API URL and key.');
      }
    });

  // ── whoami ───────────────────────────────────────────────────────────────
  auth
    .command('whoami')
    .description('Show currently authenticated user')
    .action(async () => {
      const key = config.getApiKey();
      if (!key) {
        ui.error('Not authenticated. Run `mergeguard auth login` first.');
        process.exit(1);
      }
      try {
        const me = await api.getMe();
        ui.title('Authenticated as');
        ui.kv('Name',         me.name);
        ui.kv('Email',        me.email);
        ui.kv('User ID',      String(me.id));
        ui.kv('API URL',      config.getApiUrl());
        ui.kv('GitHub token', config.getGithubToken() ? '●●●● (saved)' : 'not set — will prompt on first review');
        console.log();
      } catch {
        ui.error('Could not reach the API. Check your connection and run `mergeguard auth login` again.');
        process.exit(1);
      }
    });

  // ── logout ───────────────────────────────────────────────────────────────
  auth
    .command('logout')
    .description('Remove stored credentials')
    .action(async () => {
      const yes = await confirm({ message: 'Remove stored API key and URL?', default: false });
      if (yes) {
        config.clearConfig();
        ui.success('Logged out. Run `mergeguard auth login` to re-authenticate.');
      } else {
        ui.dim('Cancelled.');
      }
    });
};
