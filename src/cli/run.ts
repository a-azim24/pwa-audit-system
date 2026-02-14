/**
 * CLI `run` command — loads config and executes the full audit pipeline.
 */

import { Command } from 'commander';
import { loadConfig } from '../config/loader';
import { runAudit } from '../audit/runner';

/**
 * Register the `run` subcommand on the given Commander program.
 */
export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description('Run PWA audits (Lighthouse + Playwright) against configured URLs')
    .requiredOption('-c, --config <path>', 'Path to config file (.js or .json)')
    .action(async (options: { config: string }) => {
      try {
        console.log('[cli] Loading config from:', options.config);
        const config = loadConfig(options.config);

        console.log('[cli] Config loaded successfully.');
        console.log('[cli] URLs:', config.urls);
        console.log('[cli] Output dir:', config.outputDir);

        await runAudit(config);

        console.log('[cli] Audit run complete.');
        process.exit(0);
      } catch (error: any) {
        console.error('[cli] Error:', error.message);
        process.exit(1);
      }
    });
}
