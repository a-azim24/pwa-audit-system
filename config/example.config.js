/**
 * Example PWA Audit configuration file.
 *
 * Copy this file and adjust for your project:
 *   cp config/example.config.js pwa-audit.config.js
 */

module.exports = {
  // URLs to audit
  urls: ['https://example.com'],

  // Score thresholds (0–1). Audit warns if scores fall below these.
  thresholds: {
    pwa: 0.9,
    performance: 0.8,
    accessibility: 0.9,
  },

  // Custom Playwright test files to run
  customTests: [
    // { path: './tests/offline.spec.ts', type: 'offline' },
  ],

  // External service endpoints (populated from env vars if not set here)
  services: {
    generator: process.env.TEST_GENERATOR_URL,
    recorder: process.env.RECORDER_URL,
    reporter: process.env.REPORTER_URL,
  },

  // Directory to save audit result JSON files
  outputDir: './audit-reports',
};
