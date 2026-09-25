# Locators

Names in the examples (`'Enviar'`, `'Servicios'`, …) are illustrative. Copy the real ones
from the page.

## 1. Priority order

Use the first one that works:

1. `getByRole(role, { name })`: how users and screen readers see the page
2. `getByLabel`: form fields
3. `getByPlaceholder`, `getByAltText`, `getByTitle`
4. `getByText`: non-interactive content
5. `getByTestId`: only once the app has test ids. **Caporale has none today.**
6. CSS / XPath: last resort, with a comment explaining why

**Why:** user-facing locators survive refactors. A class renamed in a CSS cleanup breaks
`.services-card-left` but not `getByRole('heading', { name: 'Servicios' })`. As a bonus,
a role locator that can't find its element often reveals an accessibility bug.

✅ Good
```ts
page.getByRole('button', { name: 'Enviar' });
page.getByRole('link', { name: 'Curso' });
```

❌ Bad
```ts
page.locator('#root > div:nth-child(3) > section > button');
page.locator('button.buttonIcon.episode-actions-later');
page.locator('//div[@class="card"][2]/a');
```

## 2. Match text exactly when it could be a substring

**Why:** `getByText('Corte')` also matches "Corte + Barba", and it'll match more as the
content grows.

✅ `page.getByRole('heading', { name: 'Corte', exact: true })`
❌ `page.getByText('Corte')`

## 3. Narrow down by filtering, not by index

**Why:** `.nth(2)` breaks when the admin reorders the content. Filtering by visible
content doesn't.

✅ Good
```ts
page.getByRole('listitem')
  .filter({ hasText: 'Barba' })
  .getByRole('button', { name: 'Ver más' });
```

❌ Bad
```ts
page.getByRole('listitem').nth(2).locator('button');
```

Use `.first()` or `.nth()` only when order *is* the behavior under test, for example
"the first slide is X".

## 4. Strictness is a feature

Playwright throws if a locator matches more than one element when you act on it. Don't
silence that with `.first()`. It's telling you the locator is ambiguous, so make it more
specific.

## 5. Spanish UI text and content editable in the admin

- The UI is in Spanish (Uruguayan *voseo*: "Reservá", "Conocé"). Copy names exactly from the page.
- A lot of text is **editable from the admin**, so Ignacio can change it. For elements
  whose text is content (service names, course modules), prefer structure plus role
  (`getByRole('heading', { level: 2 })` inside a section) over hardcoding the text, unless
  the text is exactly what the test checks.
- Fixed UI labels (nav links, buttons) are safe to match by name.

## 6. Adding test ids to the app, later

If a stable, user-facing locator really isn't possible, add a `data-testid` in the app
repo (`salon-caporale-v2`) in its own PR. Don't reach for CSS as a workaround.
