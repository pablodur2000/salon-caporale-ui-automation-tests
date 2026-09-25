# Waiting and assertions

Playwright actions **auto-wait** until an element is actionable, and `expect(locator)`
assertions **retry** until they pass or time out. Almost every flaky test comes from
working against that instead of with it.

## 1. Always use web-first assertions

✅ `await expect(page.getByText('Bienvenido')).toBeVisible();`
❌ `expect(await page.getByText('Bienvenido').isVisible()).toBe(true);`

**Why:** the ❌ version checks once, at one instant. If the element appears 50 ms later,
the test fails. Sometimes. That's the definition of flaky.

## 2. No hard waits

❌ `await page.waitForTimeout(3000);`
✅ `await expect(page.getByRole('heading', { name: 'Curso' })).toBeVisible();`

**Why:** a fixed delay is either too long (slow suite) or too short (fails in CI, which is
slower than your machine). Wait for the *condition*, not the clock.
`waitForTimeout` is allowed only while debugging locally, never in a commit.

## 3. Don't use `networkidle`

❌ `await page.goto('/', { waitUntil: 'networkidle' });`
✅ `await page.goto('/'); await expect(homePage.servicesHeading).toBeVisible();`

**Why:** analytics, polling and videos keep the network busy or quiet at unpredictable
times. Wait for what the user would see.

## 4. Don't wait before an action that already waits

❌ `await btn.waitFor(); await btn.click();`
✅ `await btn.click();`

## 5. Don't `force` clicks

❌ `await btn.click({ force: true });`

**Why:** `force` skips the checks that found the real problem: something is covering
the button (on this site, usually the **MembersModal**). Deal with the overlay instead.
See [app-under-test.md](app-under-test.md).

## 6. Set up response listeners before the trigger

✅ Good
```ts
const response = page.waitForResponse('**/rest/v1/services*'); // 1. listen (no await)
await page.getByRole('link', { name: 'Servicios' }).click();   // 2. trigger
await response;                                               // 3. await
```

❌ Bad: the response may already have arrived before you started listening
```ts
await page.getByRole('link', { name: 'Servicios' }).click();
await page.waitForResponse('**/rest/v1/services*');
```

## 7. Use `toPass` / `expect.poll`, not hand-written retry loops

✅ `await expect(async () => { … }).toPass({ timeout: 10_000 });`
❌ a `while` loop with a counter and `waitForTimeout`

Give inner assertions a short timeout inside `toPass` so retries are fast.
Use `expect.poll` only for things that aren't locators (API values). For the DOM, a
plain `expect(locator)` is better.

## 8. Prefer positive assertions

✅ `await expect(modal).toBeHidden();`
❌ `await expect(modal).not.toBeVisible();`

## 9. Every test asserts something

❌ A test that navigates and clicks and never calls `expect` is a script, not a test. It
passes as long as nothing throws.

## 10. Soft assertions for checklists

When one test checks several independent things (SEO tags on a page, for example), use
`expect.soft` so a single run reports every failure, not just the first one:

```ts
await expect.soft(page).toHaveTitle(/Curso/);
await expect.soft(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
```

## 11. Tests are independent

❌ `test.describe.serial` where test 2 relies on the state test 1 left behind.
✅ One test with `test.step()` blocks when the steps really are one flow.

**Why:** serial dependencies hide failures (test 2 fails because of test 1) and rule out
parallel runs.
