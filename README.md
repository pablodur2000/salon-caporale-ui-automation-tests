# Salón Caporale — UI Automation Tests

End-to-end UI automation for [Salón Caporale](https://salon-caporale-v2-zeta.vercel.app),
a barbershop website in production, built with Playwright and TypeScript.

> Work in progress. Tracked in Jira project **CAPOQA**.

## Stack

- [Playwright Test](https://playwright.dev) · TypeScript
- Chromium (other engines out of scope for now)

## Getting started

```bash
npm install
npx playwright install chromium
cp .env.example .env   # optional: without it, tests run against prod
npm test
```

| Script | What it does |
|---|---|
| `npm test` | Runs the suite headless |
| `npm run test:headed` | Runs with a visible browser |
| `npm run test:ui` | Opens Playwright UI mode |
| `npm run report` | Opens the last HTML report |

## Environments and suites

A test's folder says **what it does**; `TEST_ENV` says **where it runs**.

| Suite | Folder | Writes data? | `TEST_ENV=dev` | `TEST_ENV=prod` (default) |
|---|---|---|---|---|
| `public` | `tests/public/` | No | ✅ | ✅ |
| `admin` | `tests/admin/` | Yes | ✅ (from CAPOQA-8) | ❌ never |

Choose the environment in `.env` (`TEST_ENV=dev`) or for a single run:

```bash
TEST_ENV=dev npm test                  # Git Bash, macOS, Linux
$env:TEST_ENV='dev'; npm test          # PowerShell
```

Dev is private on Vercel, so it needs `VERCEL_AUTOMATION_BYPASS_SECRET` (see `.env.example`).
Details: [docs/qa-knowledge/environments.md](docs/qa-knowledge/environments.md).

## Conventions

Every branch, commit and PR references its Jira key, e.g. `CAPOQA-2-repo-setup`,
`CAPOQA-2: scaffold Playwright`.
