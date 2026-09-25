import { type Locator, type Page, type Response } from '@playwright/test';
import { Header } from '../components/Header';

export class HomePage {
  readonly page: Page;
  readonly header: Header;
  readonly servicesHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    // The home page has no <h1>. "Servicios" is the first section heading, and it's
    // hardcoded in the app (not editable from the admin), so it stands in as the main one.
    this.servicesHeading = page.getByRole('heading', { name: 'Servicios', exact: true, level: 2 });
  }

  /** Returns the navigation response so a test can assert the HTTP status. */
  async goto(): Promise<Response | null> {
    return this.page.goto('/');
  }
}
