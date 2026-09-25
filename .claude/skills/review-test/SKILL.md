---
name: review-test
description: Review Playwright tests, page objects or fixtures in this repo against its QA rules (POM, locators, waiting, isolation, environment safety). Use when asked to review a test, a PR or a diff, or before committing test code.
---

# Review a test

Check the changed files (`git diff main...HEAD`, or the files you're given) against
this list. For each problem, report **file:line → broken rule → suggested fix**, citing
the doc in `docs/qa-knowledge/`. Rank safety issues first.

## 🔴 Safety (block the PR)
- [ ] Nothing in `tests/admin/` can run against prod. The dev-host allowlist in the admin
      setup and the prod-database block fixture are present and not bypassed.
- [ ] No credentials, tokens or `playwright/.auth/` files committed. Secrets come from
      env vars only.
- [ ] Public tests don't write data (no admin actions, no form submissions that create records).

## 🟠 Page Object Model (`page-object-model.md`)
- [ ] No `expect` anywhere under `pages/` or `components/`.
- [ ] Locators are `readonly` fields assigned in the constructor, and constructors do
      nothing else.
- [ ] Methods are user intentions (`startBooking`), not renamed clicks (`clickButton`).
- [ ] Action methods return `void`, not other page objects.
- [ ] No locator duplicated across page objects (it should be a component).
- [ ] Tests get page objects from fixtures, not `new XPage(page)`.

## 🟠 Flakiness (`waiting-and-assertions.md`)
- [ ] No `waitForTimeout`, `networkidle`, `force: true` or custom retry loops.
- [ ] Assertions are web-first: `await expect(locator)…`, never `expect(await …)`.
- [ ] `waitForResponse` is set up before the action that triggers it.
- [ ] No `describe.serial`, and no test relies on another test's state.
- [ ] Every test has at least one assertion.

## 🟡 Locators (`locators.md`)
- [ ] `getByRole`/label/text before CSS. Any CSS or XPath has a comment explaining why.
- [ ] `exact: true` where the text could be a substring.
- [ ] No `.nth()`/`.first()` used to silence a strictness error.
- [ ] Content editable from the admin isn't hardcoded unless it's the point of the test.

## 🟡 Conventions
- [ ] `test`/`expect` imported from `fixtures/` (setup files, `*.setup.ts`, import from
      `@playwright/test`).
- [ ] Test names describe behavior as a sentence.
- [ ] Branch, commit and PR carry the `CAPOQA-N` key.

## Output
List the findings, then give a verdict: **ready for human review** or
**fix these first**. Never merge the PR; the owner merges by hand.
