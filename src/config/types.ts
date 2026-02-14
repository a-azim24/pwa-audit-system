/**
 * Configuration types for the PWA Audit System.
 */

/** A single custom test definition. */
export interface CustomTest {
  /** Path to the Playwright test file (relative to config file or absolute). */
  path: string;
  /** Test type label (e.g., 'offline', 'installability'). */
  type: string;
}

/** Service endpoint URLs. */
export interface ServiceEndpoints {
  generator?: string;
  recorder?: string;
  reporter?: string;
}

/** Score thresholds — keys are Lighthouse category IDs. */
export type Thresholds = Record<string, number>;

/** Main configuration object loaded from config file + env overrides. */
export interface AuditConfig {
  /** URLs to audit. */
  urls: string[];
  /** Score thresholds for pass/fail (e.g., { pwa: 0.9 }). */
  thresholds: Thresholds;
  /** Custom Playwright test files to execute. */
  customTests: CustomTest[];
  /** Private service endpoint URLs. */
  services: ServiceEndpoints;
  /** Directory to write audit result JSON files. */
  outputDir: string;
  /** Log level override. */
  logLevel?: string;
}

/** Result from a single Lighthouse audit run. */
export interface LighthouseResult {
  url: string;
  scores: Record<string, number>;
  error?: string;
}

/** Result from a single Playwright test file execution. */
export interface PlaywrightTestResult {
  file: string;
  type: string;
  passed: boolean;
  error?: string;
}

/** Combined audit result for one URL. */
export interface AuditResult {
  url: string;
  lighthouse: LighthouseResult;
  playwrightTests: PlaywrightTestResult[];
}

/** Full audit run output. */
export interface AuditRunOutput {
  timestamp: string;
  results: AuditResult[];
  summary: {
    totalUrls: number;
    lighthouseErrors: number;
    testsRun: number;
    testsPassed: number;
    testsFailed: number;
  };
}
