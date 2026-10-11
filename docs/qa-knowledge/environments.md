# Environments: which tests run where

Two separate questions. Keep them apart and the rest follows.

## 1. What does the test do? → decides the **folder**

| The test… | Folder | Examples |
|---|---|---|
| only **reads**: structure, content, navigation | `tests/public/` | home loads, menu links, product cards render |
| **writes**: creates, edits, deletes | `tests/admin/` | log in, edit a service, upload an image |

When you write a test, this is the only question you answer. Everything below is automatic.

## 2. Where does it run? → decided by **`TEST_ENV`**, never by the test

| Folder | `TEST_ENV=dev` | `TEST_ENV=prod` |
|---|---|---|
| `tests/public/` | ✅ | ✅ |
| `tests/admin/` | ✅ | ❌ the project doesn't exist |

**Each test is written once.** There's no "home on dev" and "home on prod": there's
`home.spec.ts`, and the pipeline runs it once per environment. Tests only use `baseURL`
and never check which environment they're in.

✅ `await page.goto('/')`
❌ `if (process.env.TEST_ENV === 'prod') test.skip()` or a hardcoded host in a test

## Why the same read-only test runs on both

They answer different questions:

| Run | Question it answers | When |
|---|---|---|
| **public @ dev** | Did the change I'm about to ship break something? | every `develop` deploy, **before** prod |
| **admin @ dev** | Does the admin still work? | every `develop` deploy |
| **public @ prod** | Is the real site OK right now? | after each prod deploy, and daily |

Dev catches bugs **before** customers see them. Prod confirms the real site stays healthy:
data, domain and hosting can break there without ever showing on dev.

```
change the app → push develop → Vercel deploys dev → CI: public@dev + admin@dev
                                                        ↓ green
                  merge develop → main → Vercel deploys prod → CI: public@prod
                                                        + daily: public@prod
```

## How it's wired

- **`fixtures/environments.ts`** maps each `TEST_ENV` to its URL and loads `.env`.
  Default: `prod`. An unknown value fails fast.
- **`playwright.config.ts`** defines the `public` project always, and the dev-only
  projects (admin, from CAPOQA-8) only when `TEST_ENV=dev`.
- **`BASE_URL`** overrides the URL (a specific preview, localhost) but not the
  environment. `TEST_ENV` still decides which suites exist.
- **Dev is private.** Vercel answers `302` to a login page without the bypass secret. The
  auto fixture `vercelBypass` adds `x-vercel-protection-bypass` **only to requests to the
  dev origin**, never to Supabase or third parties. Without
  `VERCEL_AUTOMATION_BYPASS_SECRET`, a dev run fails with a clear message instead of a
  confusing 302.
- Vercel injects its **preview toolbar** into dev (not prod), and it POSTs to
  `vercel.live` on load. The same fixture sends `x-vercel-skip-toolbar: 1`, so dev behaves
  like prod.

## Four safety layers

Each one catches a different mistake, so no single slip reaches real data:

| # | Layer | Where | Catches |
|---|---|---|---|
| 1 | The folder says what a test does | `tests/public/` vs `tests/admin/` | Organization: you only answer "read or write?" |
| 2 | `TEST_ENV=prod` doesn't define the admin project | `playwright.config.ts` | Running the admin suite on prod. `--project=admin` answers "not found" |
| 3 | Admin guards: dev-host allowlist and the prod database blocked | admin setup and fixtures ([fixtures-and-auth.md](fixtures-and-auth.md) §4) | A misconfigured dev deploy |
| 4 | **Read-only enforced**: the `blockedWrites` auto fixture | `fixtures/index.ts` | **A write test placed in `tests/public/`** |

**Layer 4 in detail.** Every suite is read-only unless its project sets
`use: { readOnly: false }`, which only the dev-only admin project will do. In a read-only
suite, any POST, PUT, PATCH or DELETE, to any host, is aborted before it leaves the browser,
and the test fails with *"This suite is read-only, but the test tried to write. Move it to
tests/admin/"*. It fails closed: a new suite that forgets to configure it is protected.

The public pages make no write requests on their own (checked 2026-10-11 on `/`, `/curse`,
`/members`, `/productos`, `/reserve`), so nothing legitimate is blocked. If the app ever
adds one (analytics, a contact form), the guard will flag it, and that's the moment to decide
consciously, not by accident.

`tests/public/read-only-guard.spec.ts` proves the guard works. With the guard switched off,
that test fails ("Expected: blocked, Received: sent").

✅ A public test that reads: `await expect(homePage.servicesHeading).toBeVisible()`
❌ A public test that submits the booking form or saves anything: it belongs in `tests/admin/`

## Running it

```bash
npm test                     # prod (default): public suite
TEST_ENV=dev npm test        # dev: public (+ admin, once it exists)
```

Environment URLs and the Supabase project behind each one:
[app-under-test.md](app-under-test.md#environments).
