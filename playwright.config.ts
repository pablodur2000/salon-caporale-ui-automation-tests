import { defineConfig, devices, type Project } from '@playwright/test';
import { baseURL, testEnv } from './fixtures/environments';

/* Read-only suite: runs on every environment. */
const publicProject: Project = {
  name: 'public',
  testDir: './tests/public',
  use: { ...devices['Desktop Chrome'] },
};

/* Suites that write data exist only on dev, so with TEST_ENV=prod they can't even be
 * selected. CAPOQA-8 adds the admin setup and admin projects here. */
const devOnlyProjects: Project[] = [];

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
    /* Site under test, chosen by TEST_ENV (prod by default). See fixtures/environments.ts. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* One project per suite. Chromium only for now. */
  projects: testEnv === 'dev' ? [publicProject, ...devOnlyProjects] : [publicProject],
});
