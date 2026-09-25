import { type Locator, type Page } from '@playwright/test';

export class Header {
  readonly page: Page;
  readonly root: Locator;
  readonly logoLink: Locator;
  readonly bookingLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // CSS is the only option here: the app renders <header> inside <main>, so it gets no
    // "banner" role, and the logo link has no accessible name (its images use alt="").
    this.root = page.locator('#header');
    this.logoLink = this.root.getByRole('link');
    // Fixed label from the app's Header.jsx, not editable from the admin. The <a> itself has
    // a 0×0 box (its only child is position: fixed), so Playwright reports it hidden; the
    // heading inside is what the user actually sees and clicks.
    this.bookingLink = page
      .getByRole('link', { name: '¡Reservá tu cita aquí!' })
      .getByRole('heading', { name: '¡Reservá tu cita aquí!' });
  }
}
