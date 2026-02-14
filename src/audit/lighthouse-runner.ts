/**
 * Lighthouse runner — launches Chrome and runs Lighthouse PWA audits.
 * Graceful fallback: if Chrome or Lighthouse is unavailable, logs a warning
 * and returns empty scores instead of crashing.
 */

import { AuditConfig, LighthouseResult } from '../config/types';

/**
 * Run a Lighthouse audit for a single URL.
 *
 * @param url - The URL to audit.
 * @param config - The audit configuration.
 * @returns LighthouseResult with scores or error info.
 */
export async function runLighthouse(
  url: string,
  config: AuditConfig
): Promise<LighthouseResult> {
  try {
    // Dynamic imports — these may fail if packages aren't installed
    const chromeLauncher = await import('chrome-launcher');
    const lighthouse = await import('lighthouse');

    console.log(`[lighthouse] Launching Chrome for: ${url}`);

    // Launch Chrome in headless mode
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });

    console.log(`[lighthouse] Chrome launched on port ${chrome.port}`);

    // Determine which categories to audit based on configured thresholds
    const categories = Object.keys(config.thresholds);
    // Always include 'pwa' if not already present
    if (!categories.includes('pwa')) {
      categories.push('pwa');
    }

    // Run Lighthouse
    const result = await lighthouse.default(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: categories,
    });

    // Kill Chrome
    await chrome.kill();

    if (!result || !result.lhr) {
      return {
        url,
        scores: {},
        error: 'Lighthouse returned no results',
      };
    }

    // Extract category scores
    const scores: Record<string, number> = {};
    const lhrCategories = result.lhr.categories;

    for (const [key, category] of Object.entries(lhrCategories)) {
      scores[key] = (category as any).score ?? 0;
    }

    console.log(`[lighthouse] Scores for ${url}:`, scores);

    return { url, scores };
  } catch (error: any) {
    const message = error.message || String(error);
    console.warn(`[lighthouse] Warning: Could not run Lighthouse for ${url}`);
    console.warn(`[lighthouse] Reason: ${message}`);
    console.warn('[lighthouse] Skipping Lighthouse audit — returning empty scores.');

    return {
      url,
      scores: {},
      error: message,
    };
  }
}
