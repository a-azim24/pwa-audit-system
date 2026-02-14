/**
 * Config loader — reads .js or .json config files and merges with env overrides.
 */

import * as path from 'path';
import * as fs from 'fs';
import { AuditConfig } from './types';

/** Default configuration values. */
const DEFAULTS: AuditConfig = {
  urls: [],
  thresholds: { pwa: 0.9 },
  customTests: [],
  services: {},
  outputDir: './audit-reports',
  logLevel: 'info',
};

/**
 * Load and validate a config file, merging with environment variable overrides.
 * Supports .js (CommonJS module.exports) and .json files.
 *
 * @param configPath - Path to the config file (absolute or relative to CWD).
 * @returns Merged AuditConfig object.
 */
export function loadConfig(configPath: string): AuditConfig {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  let fileConfig: Partial<AuditConfig>;

  if (ext === '.js') {
    // Load CommonJS module
    fileConfig = require(resolvedPath);
  } else if (ext === '.json') {
    // Parse JSON file
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    fileConfig = JSON.parse(raw);
  } else {
    throw new Error(`Unsupported config file extension: ${ext}. Use .js or .json`);
  }

  // Merge: defaults < file config < env overrides
  const config: AuditConfig = {
    ...DEFAULTS,
    ...fileConfig,
    services: {
      ...DEFAULTS.services,
      ...fileConfig.services,
    },
  };

  // Apply environment variable overrides
  applyEnvOverrides(config);

  // Validate required fields
  validate(config);

  return config;
}

/**
 * Override config values with environment variables where set.
 */
function applyEnvOverrides(config: AuditConfig): void {
  if (process.env.EXTERNAL_SERVICE_URL) {
    config.services.generator =
      config.services.generator || `${process.env.EXTERNAL_SERVICE_URL}/generate`;
    config.services.recorder =
      config.services.recorder || `${process.env.EXTERNAL_SERVICE_URL}/record`;
    config.services.reporter =
      config.services.reporter || `${process.env.EXTERNAL_SERVICE_URL}/report`;
  } else {
    console.warn('[config] Warning: EXTERNAL_SERVICE_URL is not set. External features (test generation, recording, reporting) will be unavailable.');
  }

  if (process.env.TEST_GENERATOR_URL) {
    config.services.generator = process.env.TEST_GENERATOR_URL;
  }

  if (process.env.RECORDER_URL) {
    config.services.recorder = process.env.RECORDER_URL;
  }

  if (process.env.REPORTER_URL) {
    config.services.reporter = process.env.REPORTER_URL;
  }

  if (process.env.LOG_LEVEL) {
    config.logLevel = process.env.LOG_LEVEL;
  }
}

/**
 * Validate the config object and warn about potential issues.
 */
function validate(config: AuditConfig): void {
  if (!config.urls || config.urls.length === 0) {
    console.warn('[config] Warning: No URLs configured. The audit will have nothing to test.');
  }

  if (!config.outputDir) {
    config.outputDir = DEFAULTS.outputDir;
  }
}
