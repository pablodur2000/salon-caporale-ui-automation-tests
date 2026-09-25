# Sources

Researched 2026-09-24. Where sources disagree, the choice we made is noted.

## Official Playwright docs
- [Best practices](https://playwright.dev/docs/best-practices): user-visible behavior, isolation, locators, web-first assertions, `no-floating-promises`
- [Page object models](https://playwright.dev/docs/pom): the class-with-readonly-locators shape
- [Fixtures](https://playwright.dev/docs/test-fixtures): `test.extend`, test vs worker scope, auto fixtures, why fixtures beat hooks
- [Authentication](https://playwright.dev/docs/auth): setup project plus `storageState`, and never committing `.auth`
- [Locators](https://playwright.dev/docs/locators): priority order, strictness, filtering, `testIdAttribute`

## Community guides
- [17 Playwright testing mistakes](https://elaichenkov.github.io/posts/17-playwright-testing-mistakes-you-should-avoid/) (Yevhen Laichenkov): most of the ❌ examples in `waiting-and-assertions.md`
- [Playwright POM: what good looks like](https://bugbug.io/blog/software-testing/playwright-page-object-model/) (BugBug): no assertions in page objects, components, fixtures owning setup
- [Playwright POM pattern guide](https://testdino.com/blog/playwright-page-object-model) (TestDino)
- [Playwright mistakes to avoid](https://testdino.com/blog/playwright-mistakes) (TestDino)
- [Flaky tests in Playwright](https://mergify.com/learn/flaky-tests/playwright) (Mergify)
- [eslint-plugin-playwright-pom](https://github.com/kinosuke01/eslint-plugin-playwright-pom): enforces "no `expect` in page objects" through lint

## Where we differ from the official docs
- **Assertions in page objects.** Playwright's own POM example puts an `expect` inside
  `getStarted()`. We follow the community consensus instead: **page objects never
  assert.** See [page-object-model.md](page-object-model.md) §2.
- **Returning page objects from actions.** Some guides chain `login(): DashboardPage`. We
  return `void` and let fixtures hand out page objects.

## Claude Code
- [Skills](https://code.claude.com/docs/en/skills): project skills live in `.claude/skills/<name>/SKILL.md`, are committed, and are shared with everyone who clones the repo.
