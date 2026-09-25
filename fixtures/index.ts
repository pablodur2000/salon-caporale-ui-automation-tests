import { test as base, expect } from '@playwright/test';

/* Every test imports `test` and `expect` from here, not from @playwright/test, so page
 * objects and guards can be added in one place. Page-object fixtures are added as the
 * page objects are written (see docs/qa-knowledge/fixtures-and-auth.md). */
export const test = base.extend({});

export { expect };
