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

**Security:** `playwright/.auth/` holds live session cookies. It's in `.gitignore` and
must **never** be committed, least of all in this public repo.

## 4. The environment guard for the admin suite

The admin suite writes data, so it must refuse to run against prod. Put the check in the
admin setup project, so it runs before any admin test and no one can forget it:

```ts
// tests/admin/auth.setup.ts (top of file)
const PROD_HOSTS = ['salon-caporale-v2-zeta.vercel.app' /* + the custom domain */];

const host = new URL(process.env.BASE_URL!).host;
if (PROD_HOSTS.includes(host)) {
  throw new Error(`Admin suite refuses to run against prod (${host}).`);
}
```

Because every admin test depends on `admin-setup`, a failure here stops the whole
admin suite.

## 5. Secrets

- Credentials come from `.env` locally and from GitHub Secrets in CI. They're never in
  code, never in a report, and never in a commit.
- `.env.example` lists the variable **names** with empty values.

## 6. Test data

- The public suite is read-only, so it needs no test data.
- The admin suite starts from a **known state**: reset the dev DB before the run
  (`seed-all.js --only=<table>` in the app repo), and never rely on data another test created.
