import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/* Every test imports `test` and `expect` from here, not from @playwright/test, so page
 * objects and guards can be added in one place (see docs/qa-knowledge/fixtures-and-auth.md). */
type Fixtures = {
  homePage: HomePage;
  /** Console errors and uncaught page errors, collected from before the first navigation. */
  consoleErrors: string[];
};

export const test = base.extend<Fixtures>({
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
