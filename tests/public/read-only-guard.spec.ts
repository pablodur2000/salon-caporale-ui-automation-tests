import { test, expect } from '../../fixtures';

/* Proves the safety net, not the site: a write request from the public suite must never
 * leave the browser. The probe goes to a path that doesn't exist, so even if the guard
 * broke, nothing real could be written. */
test('public suite blocks write requests before they leave the browser', async ({
  page,
  blockedWrites,
}) => {
  await page.goto('/');

  const outcome = await page.evaluate(() =>
    fetch('/__read-only-guard-probe', { method: 'POST' }).then(
      () => 'sent',
      () => 'blocked',
    ),
  );

  expect(outcome).toBe('blocked');
  expect(blockedWrites).toEqual([expect.stringMatching(/^POST .*\/__read-only-guard-probe$/)]);

  // This write was the point of the test, so clear it; any other test that writes still
  // fails when the fixture tears down.
  blockedWrites.length = 0;
});
