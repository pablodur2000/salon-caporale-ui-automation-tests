# Salón Caporale UI Automation — Claude context

Playwright + TypeScript UI tests for https://salon-caporale-v2-zeta.vercel.app
(Spanish-language barbershop site: public pages plus an `/admin` CMS on Supabase).

## Non-negotiables

1. **Page Object Model.** Page objects hold locators and user actions. **Tests hold the
   assertions.** Never put `expect` in a page object.
2. **The admin suite never runs against prod.** It writes data and would edit the
   client's real content. Admin runs only against the dev environment.
3. **No hard waits.** `waitForTimeout`, `networkidle` and custom retry loops are banned.
   Use web-first assertions (`await expect(locator)…`), which retry on their own.
4. **User-facing locators.** Prefer `getByRole` with an accessible name, then label and
   text. The app has **no `data-testid`s**, and CSS or XPath is a last resort.
5. **Tests are independent.** No test may rely on another test having run
   (`describe.serial` is banned). Share setup through fixtures.
6. **Every branch, commit and PR carries its Jira key** (`CAPOQA-N`). The owner reviews
   and merges every PR by hand, so never merge.

## Layout

```
pages/        one class per page or route (HomePage, CoursePage, …)
components/   UI shared by several pages (Header, MembersModal, Footer)
fixtures/     test.extend: page objects, auth, environment guards
tests/public/ read-only, safe against any environment
tests/admin/  writes data, dev only
docs/qa-knowledge/  the practices behind the rules above, with good and bad examples
```

Tests import `test` and `expect` from `fixtures/`, **not** from `@playwright/test`.

## Knowledge base

Read the matching doc before writing or reviewing tests:

| Topic | File |
|---|---|
| Page Object Model rules | [docs/qa-knowledge/page-object-model.md](docs/qa-knowledge/page-object-model.md) |
| Locators | [docs/qa-knowledge/locators.md](docs/qa-knowledge/locators.md) |
| Waiting and assertions | [docs/qa-knowledge/waiting-and-assertions.md](docs/qa-knowledge/waiting-and-assertions.md) |
| Fixtures and auth | [docs/qa-knowledge/fixtures-and-auth.md](docs/qa-knowledge/fixtures-and-auth.md) |
| Quirks of the site under test | [docs/qa-knowledge/app-under-test.md](docs/qa-knowledge/app-under-test.md) |
| Sources | [docs/qa-knowledge/sources.md](docs/qa-knowledge/sources.md) |

Skills: `/write-test` (writing a new test) and `/review-test` (checking a test or PR against these rules).
