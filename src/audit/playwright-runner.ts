/**
 * Playwright custom test runner — discovers and executes user-provided
 * Playwright test files, collecting pass/fail results.
 */

import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { AuditConfig, PlaywrightTestResult } from '../config/types';

/**
 * Run all custom Playwright tests defined in the config.
 *
 * Each test file is executed as a separate subprocess using `npx playwright test`.
 * Results are collected as pass/fail per file.
 *
 * @param config - The audit configuration containing customTests array.
 * @returns Array of PlaywrightTestResult objects.
 */
export async function runPlaywrightTests(
  config: AuditConfig
): Promise<PlaywrightTestResult[]> {
  const results: PlaywrightTestResult[] = [];

  if (!config.customTests || config.customTests.length === 0) {
    console.log('[playwright] No custom tests configured. Skipping.');
    return results;
  }

  console.log(`[playwright] Running ${config.customTests.length} custom test(s)...`);

  for (const test of config.customTests) {
    const testPath = path.resolve(test.path);

    // Check if test file exists
    if (!fs.existsSync(testPath)) {
      console.warn(`[playwright] Test file not found: ${testPath}`);
      results.push({
        file: test.path,
        type: test.type,
        passed: false,
        error: `File not found: ${testPath}`,
      });
      continue;
    }

    console.log(`[playwright] Running: ${test.path} (type: ${test.type})`);

    try {
      // Execute the test file using npx playwright test
      execSync(`npx playwright test "${testPath}" --reporter=json`, {
        stdio: 'pipe',
        timeout: 60000, // 60 second timeout per test
        env: {
          ...process.env,
          // Pass audit URLs as env var so tests can access them
          PWA_AUDIT_URLS: JSON.stringify(config.urls),
        },
      });

      // If execSync doesn't throw, the test passed
      console.log(`[playwright] ✓ ${test.path} — PASSED`);
      results.push({
        file: test.path,
        type: test.type,
        passed: true,
      });
    } catch (error: any) {
      // execSync throws on non-zero exit code
      const stderr = error.stderr?.toString() || error.message || 'Unknown error';
      console.log(`[playwright] ✗ ${test.path} — FAILED`);
      results.push({
        file: test.path,
        type: test.type,
        passed: false,
        error: stderr.slice(0, 500), // Truncate long error output
      });
    }
  }

  const passed = results.filter((r) => r.passed).length;
  console.log(
    `[playwright] Done: ${passed}/${results.length} test(s) passed.`
  );

  return results;
}
