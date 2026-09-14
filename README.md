# 🇨🇺 CubaCell Connect — Landing Page

[![GitHub Stars](https://img.shields.io/github/stars/albertolicea00/cubacell-connect?style=flat&logo=github&label=stars&color=000066)](https://github.com/albertolicea00/CubaCellConnect)
![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-8BC0D0?style=flat&logo=alpinedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

Landing page + web USSD dialer for the [CubaCell Connect](https://github.com/albertolicea00/CubaCellConnect) iOS app. No build step.

## Structure

```
├── index.html        landing page
├── dial.html         web USSD dialer (ETECSA/Cubacel, works standalone from iOS home screen)
├── style.css         component styles
├── app.js            Alpine.js components (landing page + shared notify form)
├── sw.js             service worker — full offline support, see Offline support below
├── api/subscribe.js  Vercel serverless — adds emails to Brevo
├── vercel.json       clean URLs + long-term caching for /assets
├── assets/           icons, OG image, feature mockups (currently placeholders — see below)
└── .env.example      required env vars
```

Unlike [Banca Remota](https://github.com/albertolicea00/BancaRemota) (multi-bank), this app serves a single carrier — ETECSA — so `dial.html` is a single searchable, category-grouped list instead of a bank-tabbed layout, and there's no `op-icons.json`: only 4 category-level icons exist, mapped inline in `dial.html`.

## Pages

**`index.html`** — landing page: hero, how-it-works (three steps), a catalog section (the `ussd_codes.json` download), a comparison table, FAQ, roadmap, and an **Apps similares** section (see below). Fetches `https://api.github.com/repos/albertolicea00/cubacell-connect` client-side to show live GitHub star count.

**`dial.html`** — web USSD dialer: search the full ETECSA catalog by title, code or description; tap a card to open `tel:<code>` and place the call. Codes that need a variable value (a card number for `*662*{input}#`, a phone number for `#31#{input}#`) open a small input step first — mirrors the iOS app's `CodeDetailView` (dial disabled until non-empty, `#` percent-encoded as `%23`). Same dark mode, notify form, and iOS install guide as the landing page. See **Offline support** below for how it gets its data and works with no connection.

Both pages share `app.js` (`notifyForm()` for the subscribe form, dark-mode handling) and the `.code-card` styling in `style.css`.

## Notify me / subscribe form

`notifyForm()` in `app.js` posts `{ email }` to `POST /api/subscribe` (`api/subscribe.js`, Vercel serverless), which adds the address to a Brevo list — used for "notify when the app hits the App Store". Requires `BREVO_API_KEY` and `BREVO_LIST_ID` (see `.env.example`) — **this project needs its own Brevo list**, separate from Banca Remota's.

## iOS "Add to Home Screen" guide

On iOS Safari (detected via UA / `MacIntel` + multi-touch, not standalone yet), both pages show a modal after ~1.5s guiding the user through Share → Add to Home Screen, so the site behaves like an installed app (own icon, no Safari chrome, `apple-mobile-web-app-capable`). Dismissal is remembered in `localStorage['installGuideSeenAt']` (re-shown after a week). The nav's "Instalar" button re-opens it on demand via an `open-install-guide` custom event. Irrelevant on Android/desktop — gated behind the iOS check.

## Offline support

`dial.html` does not ship its own copy of the catalog — it always pulls the latest `ussd_codes.json` straight from the iOS app's repo, the exact file the app bundles:

```
https://raw.githubusercontent.com/albertolicea00/cubacell-connect/refs/heads/main/CubacellConnect/codes.json
```

The actual offline capability lives in `sw.js`, a service worker registered from both `index.html` and `dial.html`. It caches everything needed to render the app into Cache Storage (which has no expiry):

- **Precached on install**: both pages, `style.css`, `app.js`, the icon SVGs, favicon, the remote catalog JSON, and the Tailwind/Alpine CDN scripts the pages depend on. Precached explicitly rather than left to first-use caching, because the page's own first fetch for the catalog fires from Alpine's `init()` _before_ the service worker finishes registering (registration only starts on the `load` event) — without precaching it, a brand-new install that goes offline before a second visit would show a working shell with no codes.
- **Runtime (stale-while-revalidate)**: anything else requested later is served from cache instantly if present, with a background refetch to keep it current for next time.

Net effect: after one successful online visit, the dialer (and the landing page) keep working with zero connection indefinitely, while still picking up USSD code fixes pushed to the app repo whenever a connection is available, without shipping a new deploy of this site.

Two things to know when touching `sw.js`: bump `CACHE_NAME` whenever the precache list changes, or returning users keep serving the old cached shell; and cross-origin CDN URLs with no `Access-Control-Allow-Origin` header (like `cdn.tailwindcss.com`) must be cached via a manual `fetch()` + `cache.put()` with `mode: 'no-cors'` — `cache.add()`/`addAll()` throw on opaque responses by spec.

## Local dev

```bash
npx serve .
```

`api/subscribe.js` is a Vercel serverless function — `npx serve` won't run it. Use `vercel dev` to exercise the notify form locally against a real Brevo list.

## Deploy

Push to `main` → Vercel auto-deploys. Add env vars from `.env.example` in the Vercel dashboard.

## Colors

| Token            | Hex       |                      |
| ---------------- | --------- | -------------------- |
| `--color-navy`   | `#000066` | Primary brand accent |
| `--color-accent` | `#0099cc` | Cyan highlights      |

Matches the iOS app's brand palette (`CLAUDE.md`: navy `rgb(0, 0, 102)`, cyan `#09C`).

Accents (section badges, primary buttons, the step-number circles, the hero's "desde tu iPhone") don't swap solid colors between light/dark — they all share a `gradientTravel` keyframe animation (`style.css`) that continuously shifts a navy→accent→navy gradient, same in both themes. Reuse it via the `.gradient-text` (text, `background-clip: text`) or `.gradient-bg` (backgrounds) utility classes rather than hardcoding another `linear-gradient(...); animation: gradientTravel ...` block.

## More Apps

Other USSD-code apps by the same author:

- [Banca Remota](https://bancaremota.vercel.app/) — landing page + web dialer for the Banca Remota the Unofficial iOS alternative to Cuba’s mobile Banking apps.

## Contributing

See the main project's [CONTRIBUTING.md](https://github.com/albertolicea00/CubaCellConnect/blob/main/CONTRIBUTING.md). Issues, PRs, and commit messages must be in English.

---

_Part of the [CubaCell Connect](https://github.com/albertolicea00/CubaCellConnect) project by [Alberto Licea](https://www.linkedin.com/in/albertolicea00)._
