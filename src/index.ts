#!/usr/bin/env node

/**
 * PWA Audit System — CLI Entry Point
 *
 * Usage:
 *   pwa-audit run --config <path>   Run Lighthouse + Playwright audits
 *   pwa-audit init                  Generate a template config file
 */

import * as dotenv from 'dotenv';
import { Command } from 'commander';
import { registerRunCommand } from './cli/run';
import { registerInitCommand } from './cli/init';

// Load environment variables from .env file (if present)
dotenv.config();

const program = new Command();

program
  .name('pwa-audit')
  .description('PWA Audit System — Lighthouse + Playwright testing for Progressive Web Apps')
  .version('0.1.0');

// Register subcommands
registerRunCommand(program);
registerInitCommand(program);

// Parse CLI arguments
program.parse(process.argv);
