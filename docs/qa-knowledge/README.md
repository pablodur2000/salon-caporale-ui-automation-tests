# QA knowledge base

The practices this framework follows, and **why**, with a good example and a bad one
for each. It's written for people and for Claude alike: [CLAUDE.md](../../CLAUDE.md)
and the skills in `.claude/skills/` point here.

| Doc | Covers |
|---|---|
| [page-object-model.md](page-object-model.md) | What goes in a page object, components, naming, what never goes in one |
| [locators.md](locators.md) | Locator priority, strictness, filtering, Spanish UI text |
| [waiting-and-assertions.md](waiting-and-assertions.md) | Web-first assertions, hard waits, flakiness, assertions that can actually fail |
| [fixtures-and-auth.md](fixtures-and-auth.md) | `test.extend`, fixtures vs `beforeEach`, `storageState` login, environment guards |
| [app-under-test.md](app-under-test.md) | Quirks of the Caporale site that affect tests |
| [sources.md](sources.md) | Where each rule comes from |

## How to grow it

- A bug in a test that a rule would have caught means **adding the rule here**, with the
  bad code that caused it.
- One rule per section: **Rule → Why → ✅ Good → ❌ Bad.**
- If a rule here conflicts with the code, fix one of them in the same PR.
