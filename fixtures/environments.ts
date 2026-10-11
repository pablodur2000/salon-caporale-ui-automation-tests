/* Which site the tests run against. Tests never read this: they only use baseURL.
 * The pipeline picks the environment with TEST_ENV (see docs/qa-knowledge/environments.md). */

export const ENVIRONMENTS = {
  /* The real site. Read-only tests only. */
  prod: 'https://salon-caporale-v2-zeta.vercel.app',
  /* Stable alias of the app's `develop` branch, on the dev Supabase project. Private:
   * Vercel Deployment Protection answers 302 without the bypass secret. */
  dev: 'https://salon-caporale-v2-git-develop-pablos-projects-553b98e7.vercel.app',
} as const;

export type TestEnv = keyof typeof ENVIRONMENTS;

function readTestEnv(): TestEnv {
  const value = process.env.TEST_ENV || 'prod';
  if (!(value in ENVIRONMENTS)) {
    throw new Error(`Unknown TEST_ENV "${value}". Use one of: ${Object.keys(ENVIRONMENTS).join(', ')}.`);
  }
  return value as TestEnv;
}

/* Read .env once, here, so every importer (config, fixtures) sees the same values.
 * In CI there's no file and the variables come from the environment. */
try {
  process.loadEnvFile();
} catch {
  // no .env: use the process environment and defaults
}

export const testEnv = readTestEnv();

/* BASE_URL overrides the URL (a specific preview, localhost) but not the environment:
 * TEST_ENV still decides which suites exist. */
export const baseURL = process.env.BASE_URL || ENVIRONMENTS[testEnv];
