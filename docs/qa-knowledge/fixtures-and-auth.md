# Fixtures and auth

**Fixtures own setup. Page objects own interaction. Tests own assertions.**

## 1. Page objects are exposed as fixtures

```ts
// fixtures/index.ts
import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CoursePage } from '../pages/CoursePage';

type Pages = { homePage: HomePage; coursePage: CoursePage };

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  coursePage: async ({ page }, use) => {
    await use(new CoursePage(page));
  },
});

export { expect };
```

```ts
// tests/public/home.spec.ts
import { test, expect } from '../../fixtures';

test('home loads', async ({ homePage }) => {
  await homePage.goto();
  await expect(homePage.servicesHeading).toBeVisible();
});
```

**Why fixtures beat `beforeEach`:** they're created only when a test asks for them, can
be reused across files and combined, and keep setup and teardown together (code before
`use()` is setup, code after it is teardown).

❌ Bad: every spec file rebuilds the same objects
```ts
let home: HomePage;
test.beforeEach(async ({ page }) => { home = new HomePage(page); await home.goto(); });
```

## 2. Setup must not hide inside constructors

❌ `new AdminDashboardPage(page)` that secretly logs in.
✅ A fixture or setup project logs in; the page object assumes it's already logged in.

## 3. Admin login: once per run with `storageState`

Log in once in a **setup project**, save the session, and have admin tests start already
logged in. This follows Playwright's recommended pattern:

```ts
// tests/admin/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/admin.json';

setup('log in as admin', async ({ page }) => {
  await page.goto('/admin');
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL!);
  await page.getByLabel('Contraseña').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: /panel/i })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
```

```ts
// playwright.config.ts (excerpt)
projects: [
  { name: 'admin-setup', testMatch: /admin\/.*\.setup\.ts/ },
  {
    name: 'admin',
    testDir: 'tests/admin',
    use: { storageState: 'playwright/.auth/admin.json' },
    dependencies: ['admin-setup'],
  },
],
```

(The labels above are placeholders. Copy the real ones from `/admin`.)

Setup files (`*.setup.ts`) are the one exception to "import from `fixtures/`": they run
before everything else, need none of the page-object fixtures, and import from
`@playwright/test` directly.

**Security:** `playwright/.auth/` holds live session cookies. It's in `.gitignore` and
must **never** be committed, least of all in this public repo.

## 4. The environment guard for the admin suite

The admin suite writes data, so it must refuse to run against prod. Two layers, because
either one alone has a hole.

**Layer 1: allow only known dev hosts (in the admin setup).** An allowlist, not a list of
prod hosts to block: a prod domain nobody added to a blocklist (say, the future custom
domain) would sail through. With an allowlist, forgetting to update it makes the suite
*refuse* to run, which is the safe failure. Check the `baseURL` the tests actually use,
not the raw env var, which may be unset while the config falls back to a default.

```ts
// tests/admin/auth.setup.ts
const DEV_HOSTS = ['salon-caporale-v2-git-develop-pablos-projects-553b98e7.vercel.app'];

setup('log in as admin', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('BASE_URL is not set: the admin suite needs an explicit dev URL.');
  const host = new URL(baseURL).host;
  if (!DEV_HOSTS.includes(host)) {
    throw new Error(`Admin suite only runs on dev hosts, got ${host}.`);
  }
  // … login as above
});
```

Because every admin test depends on `admin-setup`, a failure here stops the whole
admin suite.

**Layer 2: block the prod database at the network level (an auto fixture for admin tests).**
The host says nothing about which database the page writes to: a preview deployment can
be built with prod Supabase keys (this one was, until 2026-09-25). So every admin test
aborts any request to the prod Supabase project:

```ts
// fixtures/admin.ts
const PROD_SUPABASE = 'https://lztrsykidcqwsmeexwsf.supabase.co/**';

export const test = base.extend<{ blockProdDatabase: void }>({
  blockProdDatabase: [async ({ context }, use) => {
    await context.route(PROD_SUPABASE, (route) => route.abort());
    await use();
  }, { auto: true }],
});
```

A misconfigured deployment then makes the admin tests fail instead of editing real content.

## 5. Secrets

- Credentials come from `.env` locally and from GitHub Secrets in CI. They're never in
  code, never in a report, and never in a commit.
- This includes `VERCEL_AUTOMATION_BYPASS_SECRET`, which lets tests past Vercel's
  deployment protection on the dev URL (see [app-under-test.md](app-under-test.md)).
- `.env.example` lists the variable **names** with empty values.

## 6. Test data

- The public suite is read-only, so it needs no test data.
- The admin suite starts from a **known state**: reset the dev DB before the run
  (`seed-all.js --only=<table>` in the app repo), and never rely on data another test created.

> ⚠️ **`seed-all.js` has no prod guard yet.** Each step deletes and reseeds its tables with
> the Supabase **service-role** key. Run it only with **dev** credentials, and add a guard
> to the script before any CI job calls it.
