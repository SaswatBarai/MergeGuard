#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

// Path to the native Node.js implementation
const tsEntry = path.resolve(__dirname, '../src/index.ts');
const jsEntry = path.resolve(__dirname, '../dist/index.js');

const runCli = () => {
  if (fs.existsSync(jsEntry)) {
    // Run from built distribution
    spawn('node', [jsEntry, ...args], { stdio: 'inherit' });
  } else if (fs.existsSync(tsEntry)) {
    // Fallback to tsx for development if dist doesn't exist
    spawn('pnpm', ['exec', 'tsx', tsEntry, ...args], { stdio: 'inherit' });
  } else {
    console.error('MergeGuard CLI entry point not found.');
    console.error('If you are developing, ensure you have the source code in src/index.ts');
    console.error('If you are a user, ensure you have installed the package correctly.');
    process.exit(1);
  }
};

runCli();
