# Page Object Model

A page object describes **what a user can see and do** on one page. The test decides
**what should be true**. Keeping those two apart is the whole point of the pattern.

Names in the examples (`'Reservá tu cita'`, `'Servicios'`, …) are illustrative. Copy the
real ones from the page.

## 1. Locators are `readonly` fields set in the constructor

**Why:** each element is defined once. When the UI changes, you fix one line.
The constructor only assigns fields, with no navigation or waiting.

✅ Good
```ts
import { type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly bookButton: Locator;
  readonly servicesHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bookButton = page.getByRole('link', { name: 'Reservá tu cita' });
    this.servicesHeading = page.getByRole('heading', { name: 'Servicios' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async startBooking() {
    await this.bookButton.click();
  }
}
```

❌ Bad: selectors rebuilt inside methods, and work done in the constructor
```ts
export class HomePage {
  constructor(private page: Page) {
    page.goto('/');                     // hidden side effect, and not even awaited
  }
  async startBooking() {
    await this.page.click('.btn-reserve-main > a'); // selector string duplicated per method
  }
}
```

## 2. No assertions in page objects

**Why:** an `expect` inside `login()` means `login()` can only be used for the *success*
case. The invalid-password test would need a second method. The failure also points at
the abstraction instead of the test whose name says what broke. Many guides (and even
Playwright's own POM example) do this; we don't.

✅ Good: the page object acts, the test asserts
```ts
// test
await coursePage.openPaymentDetails('Matrícula');
await expect(coursePage.paymentDetails('Matrícula')).toBeVisible();
```

❌ Bad
```ts
// page object
async openPaymentDetails(name: string) {
  await this.page.getByRole('heading', { name }).click();
  await expect(this.paymentDetails(name)).toBeVisible(); // ❌ assertion hidden in the PO
}
```

**The one exception:** a page object may **wait for itself to be ready** when that's part
of the action, as long as it expresses no pass/fail opinion. Use `locator.waitFor()`,
never `expect`:

```ts
async goto() {
  await this.page.goto('/');
  await this.loader.waitFor({ state: 'hidden' }); // "opened" means usable, not a check
}
```

Prefer a locator the test asserts on, and treat this as a last resort.

## 3. Methods are user intentions, not renamed clicks

**Why:** `clickButton()` adds a layer without adding meaning. `startBooking()` tells the
reader what the user is doing.

✅ `startBooking()`, `openPaymentDetails('Matrícula')`, `filterProducts('Barba')`
❌ `clickReserveLink()`, `clickH2()`, `fillInput1()`

## 4. Action methods return `void`, not the next page object

**Why:** returning `new CoursePage(...)` couples pages together and forces a navigation
map into every class. The fixture layer already hands the test every page object it needs.

✅ `async startBooking(): Promise<void>`
❌ `async startBooking(): Promise<ReservePage> { …; return new ReservePage(this.page); }`

## 5. Shared UI is a component, not copy-pasted

**Rule of the second appearance:** the second time you're about to paste a locator into
another page object, stop and make a component.

On this site that means the **Header**, **Footer** and **MembersModal**, which appear on
several routes. Pages *compose* components:

```ts
export class HomePage {
  readonly page: Page;
  readonly header: Header;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
  }
}
```

❌ A `BasePage` with 40 locators that every page inherits (a "god object"). Prefer
composition over inheritance. A thin `BasePage` holding only `page` and `goto(path)` is fine.

## 6. One page object per page, kept small

If a class grows past about 15 locators, it's probably modelling two things. Split out
the section, for example `CourseCurriculum` inside `CoursePage`.

## 7. Page objects reach tests through fixtures

Tests don't call `new HomePage(page)`; they ask for `homePage`. See
[fixtures-and-auth.md](fixtures-and-auth.md).

```ts
test('home shows the services section', async ({ homePage }) => {
  await homePage.goto();
  await expect(homePage.servicesHeading).toBeVisible();
});
```
