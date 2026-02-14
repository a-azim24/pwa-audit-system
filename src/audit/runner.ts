/**
 * Audit runner — orchestrates Lighthouse and Playwright test runs,
 * combines results, and saves output JSON.
 */

import * as path from 'path';
import * as fs from 'fs';
import { AuditConfig, AuditResult, AuditRunOutput } from '../config/types';
import { runLighthouse } from './lighthouse-runner';
import { runPlaywrightTests } from './playwright-runner';

/**
 * Run a complete audit: Lighthouse + Playwright for all configured URLs.
 * Saves combined results as a JSON file in the configured outputDir.
 *
 * @param config - The audit configuration.
 * @returns The full audit output object.
 */
export async function runAudit(config: AuditConfig): Promise<AuditRunOutput> {
  const timestamp = new Date().toISOString();
  const results: AuditResult[] = [];

  console.log('='.repeat(60));
  console.log('PWA Audit System — Starting audit run');
  console.log(`Timestamp: ${timestamp}`);
  console.log(`URLs: ${config.urls.length}`);
  console.log(`Custom tests: ${config.customTests.length}`);
  console.log('='.repeat(60));

  // Run Playwright tests once (they're not per-URL)
  const playwrightResults = await runPlaywrightTests(config);

  // Run Lighthouse for each URL
  for (const url of config.urls) {
    console.log(`\n--- Auditing: ${url} ---`);

    const lighthouseResult = await runLighthouse(url, config);

    results.push({
      url,
      lighthouse: lighthouseResult,
      playwrightTests: playwrightResults,
    });
  }

  // Build summary
  const lighthouseErrors = results.filter((r) => r.lighthouse.error).length;
  const testsRun = playwrightResults.length;
  const testsPassed = playwrightResults.filter((t) => t.passed).length;

  const output: AuditRunOutput = {
    timestamp,
    results,
    summary: {
      totalUrls: config.urls.length,
      lighthouseErrors,
      testsRun,
      testsPassed,
      testsFailed: testsRun - testsPassed,
    },
  };

  // Save results to outputDir
  await saveResults(config.outputDir, output);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Audit Complete');
  console.log(`  URLs audited:       ${output.summary.totalUrls}`);
  console.log(`  Lighthouse errors:  ${output.summary.lighthouseErrors}`);
  console.log(`  Tests run:          ${output.summary.testsRun}`);
  console.log(`  Tests passed:       ${output.summary.testsPassed}`);
  console.log(`  Tests failed:       ${output.summary.testsFailed}`);
  console.log('='.repeat(60));

  return output;
}

/**
 * Save audit results to a JSON file in the output directory.
 */
async function saveResults(
  outputDir: string,
  output: AuditRunOutput
): Promise<void> {
  const resolvedDir = path.resolve(outputDir);

  // Ensure output directory exists
  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
    console.log(`[output] Created directory: ${resolvedDir}`);
  }

  // Generate filename with timestamp
  const safeTimestamp = output.timestamp.replace(/[:.]/g, '-');
  const filename = `audit-result-${safeTimestamp}.json`;
  const filepath = path.join(resolvedDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`[output] Results saved to: ${filepath}`);
}
