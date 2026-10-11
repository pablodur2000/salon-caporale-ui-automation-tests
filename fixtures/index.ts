import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { testEnv } from './environments';

/* Every test imports `test` and `expect` from here, not from @playwright/test, so page
 * objects and guards can be added in one place (see docs/qa-knowledge/fixtures-and-auth.md). */
type Fixtures = {
  homePage: HomePage;
  /** Console errors and uncaught page errors, collected from before the first navigation. */
  consoleErrors: string[];
  /** Automatic: lets requests to the dev site past Vercel's login. */
  vercelBypass: void;
  /** Automatic: in read-only suites, blocks every write request and fails the test.
   * The value is the list of blocked requests; only the guard's own test reads it. */
  blockedWrites: string[];
};

type Options = {
  /** True unless a project opts out (only the dev-only admin project will). */
  readOnly: boolean;
};

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const test = base.extend<Fixtures & Options>({
  readOnly: [true, { option: true }],

  blockedWrites: [
    async ({ context, readOnly }, use) => {
      const blocked: string[] = [];
      if (readOnly) {
        // Every host, not only Supabase: the booking iframe and any other third party
        // would also create real records. The public pages make no write requests on
        // their own (checked 2026-10-11), so nothing legitimate is caught.
        await context.route('**/*', (route) => {
          const request = route.request();
          if (READ_METHODS.has(request.method())) return route.fallback();
          blocked.push(`${request.method()} ${request.url()}`);
          return route.abort('blockedbyclient');
        });
      }
      await use(blocked);
      if (blocked.length > 0) {
        throw new Error(
          `This suite is read-only, but the test tried to write. Move it to tests/admin/ ` +
            `(dev only). Blocked requests:\n${blocked.join('\n')}`,
        );
      }
    },
    { auto: true },
  ],

  vercelBypass: [
    async ({ context, baseURL }, use) => {
      if (testEnv === 'dev' && baseURL) {
        const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
        if (!secret) {
          throw new Error('TEST_ENV=dev needs VERCEL_AUTOMATION_BYPASS_SECRET (see .env.example).');
        }
        // Only requests to the dev site carry the secret. extraHTTPHeaders would send it to
        // every host (Supabase, map tiles, the booking iframe), leaking it and adding a
        // custom header that can break their CORS. fallback() (not continue()) lets the
        // request still pass through blockedWrites, whichever route was registered first.
        // x-vercel-skip-toolbar keeps Vercel's preview toolbar out of the page: it isn't part
        // of the app, isn't on prod, and POSTs to vercel.live on load.
        await context.route(`${new URL(baseURL).origin}/**`, (route) =>
          route.fallback({
            headers: {
              ...route.request().headers(),
              'x-vercel-protection-bypass': secret,
              'x-vercel-skip-toolbar': '1',
            },
          }),
        );
      }
      await use();
    },
    { auto: true },
  ],

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await use(errors);
  },
});

export { expect };
