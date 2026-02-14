/**
 * CLI `init` command — generates a template config file in the current directory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

/** Template config file content. */
const CONFIG_TEMPLATE = `module.exports = {
  // URLs to audit
  urls: ['https://example.com'],

  // Score thresholds (0-1). Audit warns if scores fall below these.
  thresholds: {
    pwa: 0.9,
    performance: 0.8,
    accessibility: 0.9,
  },

  // Custom Playwright test files to run
  customTests: [
    // { path: './tests/offline.spec.ts', type: 'offline' },
  ],

  // External service endpoints (populated from env vars if not set)
  services: {
    generator: process.env.TEST_GENERATOR_URL,
    recorder: process.env.RECORDER_URL,
    reporter: process.env.REPORTER_URL,
  },

  // Directory to save audit result JSON files
  outputDir: './audit-reports',
};
`;

/**
 * Register the `init` subcommand on the given Commander program.
 */
export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Generate a template pwa-audit.config.js in the current directory')
    .option('-f, --force', 'Overwrite existing config file', false)
    .action((options: { force: boolean }) => {
      const configPath = path.resolve('pwa-audit.config.js');

      if (fs.existsSync(configPath) && !options.force) {
        console.log(`[init] Config file already exists: ${configPath}`);
        console.log('[init] Use --force to overwrite.');
        return;
      }

      fs.writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8');
      console.log(`[init] Created config file: ${configPath}`);
      console.log('[init] Edit the file to configure your URLs, thresholds, and tests.');
    });
}
