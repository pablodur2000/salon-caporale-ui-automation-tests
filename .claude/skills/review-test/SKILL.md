---
name: review-test
description: Staged review of Playwright test code in this repo — a PR, a diff, or given files — against its QA rules (POM, locators, waiting, assertion strength, environment safety). Runs in stops: context, findings two at a time, a sabotage check that proves the test can fail, then apply and re-run. Use when asked to review a test or a PR, before asking a human to review, or before merging.
---

# Review a test

A staged review. **Stop at every STOP and wait** — don't run the whole thing and
dump a report. The point of the stops is that the author decides as you go.

**Never merge.** Pablo merges by hand, always.

## Target

- `/review-test 4` → PR 4. Get it with `gh pr view 4` and `gh pr diff 4`.
  The PR is the scope; local working-tree changes are not.
- `/review-test` with no argument → `git diff main...HEAD`.
- `/review-test <paths>` → just those files.

---

## STOP 1 — Context

No findings yet. Just show what this is and prove you've read it all.

1. **What the PR does**, one short paragraph in plain language. No jargon.
2. **The tests**, one line each: name → what it actually asserts. If a test's
   name and its assertions disagree, note it here; that's context, not a finding.
3. **File ledger.** A table of every file you have read, marked ✅:
   - every file in the diff, and
   - every file the diff *depends on* even though it didn't change:
     `playwright.config.ts`, `fixtures/index.ts`, every page object and component
     the test touches, `.env.example`, and the relevant `docs/qa-knowledge/` docs.

   `playwright.config.ts` is not optional. It owns retries, timeouts, trace and
   `baseURL` — it can weaken every test in the suite no matter how good the spec
   file is.
4. **Anything you could not read**, and why.

Only mark a file ✅ if you actually read it. The ledger is the thing that makes
"nothing left unread" checkable instead of a promise.

**Then stop.** Wait for the go-ahead.

---

## STOP 2 — Findings, two at a time

Work the checklist in severity order: 🔴 safety → 🟠 flakiness → 🟠 POM →
🟡 locators → 🟡 conventions. Rank findings by severity, **not** by file order —
a style nit must never be discussed before a prod-safety issue.

Present **two at a time**:

- `file:line`
- the rule broken, citing the doc in `docs/qa-knowledge/`
- **why it matters here** — the concrete way this test fails or lies, not the
  abstract rule
- the suggested fix, as a diff

Wait for a decision on both — accept / reject / change — before the next two.
If a severity band is clean, say so in one line and move on.

---

## STOP 3 — Sabotage: prove the test can fail

**A test that has only ever been seen green is not known to work — it's known to
not crash.** This stop is the one that catches assertions that can't fail, and no
checklist can replace it.

For each new or changed test, break one thing at a time and confirm it goes red
**for the expected reason**:

- change the expected text or role in an assertion to something that isn't there
- or point `BASE_URL` at a path that renders nothing

Run it, capture the failure message, then revert.

Report per test: what was broken → did it fail → was the message diagnostic
(would it tell you what went wrong at 3 a.m. in CI?).

A test that stays **green while sabotaged is a 🔴 finding**, whatever the rest of
the checklist said. So is one that fails with a message that explains nothing.

**Then stop.**

---

## STOP 4 — Apply and re-run

Apply only what was accepted. Then:

```bash
npx playwright test --repeat-each=3
```

Report pass/fail and the run time. A flake here is a finding, not noise — three
passes is the minimum bar for a test entering the suite.

---

## STOP 5 — Verdict

**ready for human review** or **fix these first**, with the remaining list.

Never `gh pr merge`.

---

# The checklist

## 🔴 Safety (block the PR)
- [ ] Nothing in `tests/admin/` can run against prod. The dev-host allowlist in the admin
      setup and the prod-database block fixture are present and not bypassed.
- [ ] No credentials, tokens or `playwright/.auth/` files committed. Secrets come from
      env vars only. `.env` is ignored.
- [ ] Public tests don't write data (no admin actions, no form submissions that create records).

## 🟠 Flakiness (`waiting-and-assertions.md`)
- [ ] No `waitForTimeout`, `networkidle`, `force: true` or custom retry loops.
- [ ] Assertions are web-first: `await expect(locator)…`, never `expect(await …)`.
- [ ] `waitForResponse` is set up before the action that triggers it.
- [ ] No `describe.serial`, and no test relies on another test's state.

## 🟠 Assertion strength (`waiting-and-assertions.md` §9, §12)
- [ ] Every test asserts something.
- [ ] **No assertion that cannot fail** — `expect(locator).toBeTruthy()` on a locator
      object is always true; so is any assertion on a value the test just computed.
- [ ] **No assertion that passes site-wide** when the test claims to check one page.
      `toBeVisible()` on the header passes on every route; it can't tell you the home
      page rendered.
- [ ] Every `expect` is awaited. Every `expect.soft` too — an unawaited soft assertion
      silently never runs.
- [ ] The assertions match the test's name. A test called "loads without console errors"
      must actually collect and assert on console errors.

## 🟠 Page Object Model (`page-object-model.md`)
- [ ] No `expect` anywhere under `pages/` or `components/`.
- [ ] Locators are `readonly` fields assigned in the constructor, and constructors do
      nothing else.
- [ ] Methods are user intentions (`startBooking`), not renamed clicks (`clickButton`).
- [ ] Action methods return `void`, not other page objects.
- [ ] No locator duplicated across page objects (it should be a component).
- [ ] Tests get page objects from fixtures, not `new XPage(page)`.

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
