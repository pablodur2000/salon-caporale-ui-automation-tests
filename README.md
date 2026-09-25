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

## Environments and suites

| Suite | Folder | Writes data? | Runs against |
|---|---|---|---|
| `public` | `tests/public/` | No | any environment; prod by default |
| `admin` | `tests/admin/` | Yes | **dev only** (not wired up yet) |

Set `BASE_URL` in `.env` to choose the site under test. See `.env.example`.

| Script | What it does |
|---|---|
| `npm test` | Runs the suite headless |
| `npm run test:headed` | Runs with a visible browser |
| `npm run test:ui` | Opens Playwright UI mode |
| `npm run report` | Opens the last HTML report |

## Conventions

Every branch, commit and PR references its Jira key, e.g. `CAPOQA-2-repo-setup`,
`CAPOQA-2: scaffold Playwright`.
