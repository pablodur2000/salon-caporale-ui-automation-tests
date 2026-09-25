import { defineConfig, devices } from '@playwright/test';

/* Load .env when it exists (Node's built-in loader). In CI the variables come from the
 * environment instead, so a missing file is fine. */
try {
  process.loadEnvFile();
} catch {
  // no .env: fall back to the defaults below
}

/* The public suite is read-only, so prod is a safe default. The admin suite never uses
 * this default: its setup refuses any host that isn't on the dev allowlist. */
const PROD_URL = 'https://salon-caporale-v2-zeta.vercel.app';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Site under test: BASE_URL from .env or the environment, prod by default. */
    baseURL: process.env.BASE_URL || PROD_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* One project per suite. Chromium only for now. The admin project (tests/admin, dev
   * only) is added with its login setup in CAPOQA-8. */
  projects: [
    {
      name: 'public',
      testDir: './tests/public',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
