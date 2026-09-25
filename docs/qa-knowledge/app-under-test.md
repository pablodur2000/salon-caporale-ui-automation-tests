# App under test: Salón Caporale

Quirks of the site that affect how tests are written. Checked against the app repo
(`pablodur2000/salon-caporale-v2`, `main`) on 2026-09-24. **Re-check when the app changes.**

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Loading screen, then the members popup |
| `/curse` | Course | Loading screen, image slider, testimony videos |
| `/members` | Memberships | Partner companies; the popup never shows here |
| `/reserve` | Booking | Third-party booking widget in an iframe |
| `/productos` | Product catalog | Some products have no price yet (so no buy button) |
| `/admin` | CMS | Supabase login. **The admin suite runs on dev only.** |

It's an SPA: an unknown path still returns **HTTP 200** and renders blank (Vercel rewrites
everything to `index.html`). A status check alone can't catch a broken route. Assert on
visible content.

## Loading screen (`/` and `/curse`)

The page shows a full-screen loader while data loads from Supabase:
`role="status"` with the text **"Cargando…"**, followed by a zoom-out exit animation.

✅ Wait for the real content, which also waits the loader out:
```ts
await homePage.goto();
await expect(homePage.servicesHeading).toBeVisible();
```
❌ `waitForTimeout(2000)` "for the loader".

If an element is visible but covered by the exiting overlay, assert the loader is gone:
`await expect(page.getByRole('status')).toBeHidden();`

## Members popup (home only)

- Slides in about **1.5 s** after the home page loads, then **closes itself after 5 s**,
  with a 1 s slide-out animation.
- Title: **"¡Caporale ahora tiene membresías!"**
- It sits at the bottom-left and **can cover elements**. A click that fails with
  "element intercepts pointer events" usually means this popup.
- **The close button is an `<i>` icon with no role and no accessible name**
  (`#member-modal-close-button`). No `getByRole` locator can reach it, so the CSS id is
  the justified exception, and it lives in the `MembersModal` component, never in a test.
  (This is also a real accessibility bug worth reporting in the app repo: it should be a
  `<button aria-label="Cerrar">`.)

How to handle it:
- Tests **about** the popup assert its behavior (it appears, it closes itself, the close
  button works).
- Tests **not** about the popup close it through the component, or interact with parts
  of the page it doesn't cover. **Never** use `force: true` to click through it.

## Other things to watch

- **Videos** on `/curse` autoplay muted and change volume as you scroll. Don't assert on
  playback timing.
- **Map (Leaflet)** on the home page: third-party map tiles load slowly and inconsistently.
  Assert that the map container exists, not on the tiles.
- **Booking** on `/reserve` is a third-party iframe. Test that our page embeds it, not
  their booking flow.
- **Content editable in the admin:** service names, course modules, prices and images
  change whenever Ignacio edits them. Public tests should check **structure** (a
  services section with at least one card), not specific content, unless the content is
  the point of the test.
- **Language:** Spanish, with Uruguayan *voseo*.
