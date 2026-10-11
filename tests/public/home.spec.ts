import { test, expect } from '../../fixtures';

test('home page loads with its header and main heading, without console errors', async ({
  homePage,
  consoleErrors,
}) => {
  const response = await homePage.goto();
  expect(response?.status()).toBe(200);

  // An SPA answers 200 even when it renders nothing, so the real check is visible content.
  // The heading only appears once the loading screen is gone.
  await expect.soft(homePage.servicesHeading).toBeVisible();
  await expect.soft(homePage.header.logoLink).toBeVisible();
  await expect.soft(homePage.header.bookingLink).toBeVisible();

  // Check console errors only once loading is over, so "no errors" covers the whole load,
  // not whatever happened before the heading appeared.
  await expect(homePage.loadingScreen).toBeHidden();
  expect.soft(consoleErrors).toEqual([]);
});
