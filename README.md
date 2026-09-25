# FreshFind — Fresh All Along

_eGreen Basket · Web Innovation Unleashed_

FreshFind helps residents discover nearby farmers markets: search and filter a live directory, check weekly schedules and real-time open/closed status, browse a seasonal produce guide, get answers from a rule-based chatbot, bookmark favorites with session notes, and find markets near them with browser geolocation — all from a single static dataset, with no backend of any kind.

## Problem

Farmers market information is scattered across flyers, social media, and word of mouth, with no single reliable source for residents to plan a visit around a market's actual hours or know what's likely to be in season.

## Solution

A lightweight, frontend-only Single Page Application that consolidates market locations, schedules, and typical produce into one searchable, filterable directory — fast to load, easy to deploy as static files, and fully usable without an account or server.

## Features

- **Market Directory** — real search (name, area, produce, description), composable filters (area, day, produce, open-now), sorting (alphabetical, next open day, distance), active filter chips, result counts, and a genuine zero-results empty state
- **Market Detail** — weekly schedule table with today highlighted, live open/closed status that updates every 30 seconds, an embedded map (OpenStreetMap, no API key required), linked produce, and share
- **Produce Guide** — category/search filtering and a seasonal "in season now" indicator computed from each item's available months, with related-market links
- **Geolocation** — "Find markets near me" sorts by real distance (Haversine) once permission is granted, and fails gracefully with a friendly message when denied, unsupported, or unavailable
- **Chatbot** — a floating, site-wide assistant that matches intents against a static keyword/pattern dataset and answers with real dataset lookups (open-now markets, hours by day, produce availability, seasonal picks), never an external AI service
- **Bookmarks** — favorite markets and produce, attach a personal note (session-only, cleared when the tab closes), export as a formatted text file, and share via the Web Share API with a clipboard fallback
- **Home** — a "Quick Find" search that pre-fills the directory, an "Open Right Now" section with a soonest-opening fallback, and "In Season This Month" picks
- Real-time clock, a clearly-labeled simulated visitor counter, breadcrumb navigation, dummy non-functional login, and a custom 404

## Technology Stack

HTML5, CSS3, vanilla JavaScript (native ES modules — no bundler, no transpiler), jQuery, and Bootstrap 5. Bootstrap's CSS and JS and jQuery are vendored locally under `vendor/` rather than loaded from a CDN, so the site has no runtime third-party script dependency. No React, no build step, no server.

## Architecture

FreshFind is a client-side Single Page Application. A small hash-based router in `js/app.js` matches `#/path` patterns against registered page handlers, dispatches to the matching page module, and supports an in-place "query changed" fast path so filter/search updates don't tear down and rebuild the whole page (or lose input focus). Each route handler can return a `{ cleanup }` function, which the router calls before leaving that route — used by Market Detail and Home to stop their live-clock intervals, preventing leaked timers on navigation. A centralized `try/catch` around every route render means a data or rendering failure shows a real recovery UI instead of a blank page.

```
index.html
  → js/app.js            route table + dispatch, bootstraps header/footer/chatbot
    → js/pages/*.js       one render function per route, builds markup via template strings
      → js/components/*.js   reusable render functions (cards, breadcrumbs, status pills, map embed, chatbot widget)
      → js/utils/*.js         pure logic: search, filter, sort, market status, seasonal check, distance, geolocation, bookmarks
      → js/data.js            fetch + in-memory cache for the JSON data files
```

State is intentionally minimal and un-frameworked: page modules hold small module-scoped variables for their own data, DOM updates go through jQuery, and cross-cutting state (bookmarks, notes) lives in `localStorage`/`sessionStorage` and is synchronized to the UI via a custom DOM event (`freshfind:bookmarks-changed`) rather than a global store.

## Data Architecture

All content lives in `data/*.json` and is loaded read-only via `fetch`; nothing is ever written back to a file. There is no database and no API.

- `markets.json` — id, slug, name, description, address, area, coordinates, weekly `hours`, `produceIds`, tags
- `produce.json` — id, slug, name, category, description, typical season, `availableMonths` (drives the seasonal indicator), `marketIds`
- `chatbot.json` — one entry per intent: keywords, regex patterns, a response template, suggested follow-up questions, and a category the response builder uses to decide which dataset lookup to run
- `seasonal.json` — short editorial blurbs per produce category (not raw availability — that's derived live from `produce.json`)
- `team.json` / `site-config.json` — static contact/about copy, nav structure, visitor-counter seed

Market open/closed status and "next opening" are computed entirely from each market's own `hours` array (`js/utils/marketStatus.js`) — there is no hardcoded per-market logic.

## Installation

No dependencies to install and no build step. Clone the repository and serve the project root with any static file server:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` (or whichever port your server prints).

## Development

Edit any file under `css/`, `js/`, or `data/` and refresh the browser — there is nothing to compile or bundle. Because this is a hash-routed SPA, every route lives under one `index.html`; a plain static file server that doesn't rewrite paths is sufficient since navigation never requests a new HTML document.

## Production Build

There is no build step — the repository _is_ the production artifact. Deploy the project root as-is to any static host.

## Deployment

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3). Because this is a client-side-routed SPA using the URL **hash** (`#/markets`, not `/markets`), no server-side rewrite rule is needed — `index.html` is the only page a host ever needs to serve, and the hash fragment is handled entirely in the browser.

Deployed on Vercel, connected to this repository's `master` branch.

**Live Demo:** https://freshfind-fz17.vercel.app — verified publicly accessible (no auth wall) and fully functional.

## Limitations

- Market schedules and produce availability reflect this static demo dataset, not live, real-world data
- This is a frontend-only educational/portfolio project — bookmarks and notes live only in your own browser (`localStorage`/`sessionStorage`) and are never sent anywhere
- The chatbot is rule-based (keyword/pattern matching against a static dataset), not a live AI service, by design
- The map embed uses OpenStreetMap rather than Google Maps, to avoid requiring a paid API key while still satisfying the "map showing market location" requirement

## Testing

Manually verified through real browser interaction (not just visual screenshots) at each build phase: all routes and dynamic detail pages, search/filter/sort composability and their zero-result states, geolocation's granted/denied/unsupported paths, the chatbot's dataset-driven responses and fallback, bookmark add/remove/note/export/share, keyboard-only navigation (tab order, the skip-link, focus visibility), a simulated missing-data failure (confirmed the router's error boundary recovers cleanly instead of showing a blank page), and no horizontal overflow at 375px on every page.

## Lighthouse Validation

Run with the Lighthouse CLI against a local static server (not Chrome DevTools' UI, but the same underlying audit):

| Category       | Score                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| Accessibility  | 100                                                                                     |
| Best Practices | 100                                                                                     |
| SEO            | 100                                                                                     |
| Performance    | not reliably measurable in the sandboxed environment this was built in — see note below |

Two real accessibility issues were found and fixed: `.btn-outline-secondary` links and `.produce-card__category` labels both fell just under the 4.5:1 contrast minimum against the cream background; both were darkened to WCAG-safe values (verified against the actual rendered elements, not just the design tokens — Bootstrap's compiled CSS hardcodes component-level color variables that a root-level token override does not reach). SEO's `robots.txt` had a relative `Sitemap:` URL, which is invalid per spec; fixed to an absolute URL.

Performance's timing metrics (First Contentful Paint, Largest Contentful Paint) varied wildly across repeated runs in the sandboxed build environment (from ~3.6s to ~14s for the same unchanged page), which reflects host CPU/virtualization contention rather than the app — a 14-second paint time for a page shipping ~584KB total is not credible. Rather than report a number I don't trust, this should be re-measured with Chrome DevTools on a normal machine, or after a real deployment. The two changes made to genuinely help real-world performance regardless — vendoring jQuery/Bootstrap locally instead of a CDN (fewer third-party origins, no dependency on CDN uptime) — are in place either way.

## Project Structure

```
freshfind/
├── css/
│   ├── tokens.css        design tokens (color, type, spacing, radius, shadow, motion)
│   └── styles.css        component styles + Bootstrap theme overrides
├── data/                 static JSON — the only data source, read-only
├── js/
│   ├── app.js            route table, dispatch, bootstrap
│   ├── data.js           fetch + cache for data/*.json
│   ├── chatbot/          intent-matching engine + response builder
│   ├── components/       reusable render functions
│   ├── pages/            one render function per route
│   └── utils/            pure logic (search, filter, sort, status, seasonal, distance, geolocation, bookmarks, clock)
├── vendor/               locally-hosted jQuery + Bootstrap (no CDN dependency)
├── favicon.svg, robots.txt, sitemap.xml
└── index.html            the only HTML document
```

## Credits & Licensing

See [LICENSE](LICENSE) (MIT). Built with [Bootstrap](https://getbootstrap.com) and [jQuery](https://jquery.com); map tiles via [OpenStreetMap](https://www.openstreetmap.org); typefaces via [Google Fonts](https://fonts.google.com) (Fraunces, Public Sans).
