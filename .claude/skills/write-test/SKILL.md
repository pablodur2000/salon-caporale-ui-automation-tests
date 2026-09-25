---
name: write-test
description: Write a new Playwright UI test for the Salón Caporale site following this repo's POM conventions. Use when asked to add, create or automate a test case, or to add a page object or component.
---

# Write a test

Follow these steps in order. The rules come from `docs/qa-knowledge/`. Read the relevant
file when a step touches its topic.

## 1. Understand the case
- Which suite? **public** (read-only, `tests/public/`) or **admin** (writes data,
  `tests/admin/`, **dev only**).
- What's the single behavior under test? Name the test after it, as a sentence:
  `'members popup closes itself after a few seconds'`.
- Check `docs/qa-knowledge/app-under-test.md` for quirks on that route (loading screen,
  members popup, iframes, content editable from the admin).

## 2. Find the locators on the real page
- Open the page (`npx playwright codegen <BASE_URL>/<path>`, or inspect it) and pick
  locators by the priority in `docs/qa-knowledge/locators.md`: role + name first.
- The app has no `data-testid`s. If only CSS works, write a comment saying why, and
  keep the selector inside the page object or component.

## 3. Page object or component
- Reuse an existing class in `pages/` or `components/` if there is one.
- Add locators as `readonly` fields assigned in the constructor. Name methods after user
  intentions and have them return `void`.
- **No `expect` in page objects.** No navigation in constructors.
- A locator that's needed on a second page means a component (`components/`), not a copy.

## 4. Fixture
- Expose any new page object in `fixtures/index.ts` via `test.extend`.

## 5. Test
- Import `test` and `expect` from `fixtures/`, not from `@playwright/test`.
- Arrange (fixtures) → act (page object methods) → assert (`await expect(locator)…`).
- At least one web-first assertion. No `waitForTimeout`, `networkidle`, `force: true`
  or `describe.serial`.
- Use `test.step()` for readable multi-step flows. Use `expect.soft` for checklist-style tests.

## 6. Verify
- `npx playwright test <file>` passes.
- Run it **3 times** (`--repeat-each=3`) to catch flakiness before committing.
- Then run `/review-test` on the change.

## 7. Commit
- Branch and commit carry the Jira key: `CAPOQA-N-short-name`, `CAPOQA-N: …`.
- Open a PR and **stop**. The owner reviews and merges by hand.
