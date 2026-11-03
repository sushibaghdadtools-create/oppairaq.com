# Oppa: Ideas Into Impact
## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run preview:build  # rebuilds preview/out/index.html, the framework-free preview
npm run preview:test   # Playwright audit of the preview (needs playwright installed)
```


Mobile-first Next.js site for Oppa (slogan: Ideas Into Impact / من الفكرة إلى الأثر), a growth partner: one dedicated team of business development specialists and marketeers that changes a client's growth trajectory in one quarter. Content follows the "Your Growth Partner" deck (90-day programme, the customer story in 15 moments, two teams / one plan, training). Pricing from the deck is intentionally left off the public site.

Mobile-first Next.js site with an interactive X-ray mode and a scroll-built "From a Line to an Experience" sequence.

Palette and type: warm off-white `#F7F7F4`, near-black `#171717`, one red `#D83228`;
Archivo (variable width) for Latin, IBM Plex Sans Arabic for Arabic; Swiss 12-column grid, 1px rules.
The site opens in Arabic (RTL) and switches to English in place; the choice is remembered per browser.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

The contact form posts to `src/app/api/contact/route.ts`. Wire that to your email
provider (a Resend example is in the file); until then it validates and returns 202,
and the client falls back to a pre-filled `mailto:` if the request fails.

## How the code is organised

```
src/
  lib/interactions/      framework-free TypeScript — the whole interaction layer
    xray.ts              two aligned layers, clip-path circle, hold-to-reveal (mouse/touch/keyboard "X")
    construction.ts      8-stage SVG composition driven by setProgress(0..1) + a default scroll driver
    services.ts          three custom visual objects (signal / route / rings) + reveal toggles
    story.ts             the 15-moment customer story strip
    i18n.ts              Arabic-first language switch (data-t swap, View Transitions circle)
    liquid-menu.ts       drag-to-open menu sheet with a liquid edge + desktop nav highlight
    cursor.ts            small circle-outline cursor for fine pointers
    wheel.ts             the partner wheel: idle turn, drag/flick with inertia, upright logos
    backdrop.ts          scroll parallax (a few px) for the decorative layer
    home.ts              wires everything to a DOM contract (used by Next and by the preview)
  lib/gsap-driver.ts     GSAP ScrollTrigger driver for the construction sequence
  components/            React presentation only; no interaction logic lives here
  content/               services + the 15 moments of the customer story
  styles/site.css        shared stylesheet (tokens, grid, every interaction surface)
  app/                   routes: / , /services, /services/[slug], /contact, /api/contact
preview/                 standalone homepage preview built from the same modules (no npm needed)
scripts/
  build-preview.mjs      tsc → tiny CommonJS bundle → preview/out/index.html and artifact.html
  test-preview.mjs       43 Playwright checks: X-ray in all 5 sections (touch, mouse, keyboard), liquid menu drag/tap/fling,
                         language switch + persistence, service objects + reveals, 8-stage construction + live CTA,
                         story strip + arrow keys, cursor, nav highlight, parallax, CTAs, touch targets, reduced motion
```

`SiteInteractions` (a client component in the layout) calls `initHome(document, { driveConstruction })`
on every route and tears it down on navigation. Every module tolerates missing elements, so the
same call works on secondary pages where only the nav, footer X-ray and language switch exist.

## Accessibility and motion

- Every pointer interaction has a touch and a keyboard route: hold **X** for X-ray.
- `prefers-reduced-motion`: the construction snaps between finished stages, the X-ray circle opens without easing, panels open without transitions.
- No scroll hijacking: the construction section is tall with a `position: sticky` stage; ScrollTrigger only
  reads progress.
- 44 px targets, visible focus, `inert` on closed panels and the not-yet-live CTA, skip link, landmarks.

## Preview without installing anything

```bash
node scripts/build-preview.mjs      # needs only the TypeScript compiler (tsc) on PATH
npx playwright install chromium && npm run preview:test
```

## Brand assets

`public/oppa-wordmark.png` is the Oppa wordmark (Latin + Arabic) recoloured to the site's ink and red;
the target mark is drawn as inline SVG (outer ring 1:3, inner disc 1:3) so it scales cleanly in the nav. Replace both with the master files when you have them.

## Language

All copy lives in `src/content/i18n.json` as `{ key: { ar, en } }`. Server components render the Arabic default
through `<T k="…" />` (which emits `data-t`), and `src/lib/interactions/i18n.ts` swaps every `data-t` node when
the visitor presses the toggle, flipping `lang`/`dir` on `<html>`. A tiny inline script in the layout applies a
saved English preference before first paint. Metadata is bilingual; add `hreflang` alternates if you later give
each language its own URL.

## Backdrop

White (#fff) with a static 4% SVG grain. One treatment per section, all behind content: thin SVG arcs and a liquid blob behind the services, a partial arc and a blob in the story; the hero and footer are plain. Motion: `data-parallax` (±28px) and `data-scroll` (a 0→1 section progress, `--sp`) are scroll-tied and rotate
the rings a few degrees / draw the arcs on; the rings breathe and two liquid blobs change shape on a 20–30s
CSS loop. All of it switches off under reduced motion. No separator rules; X-ray mode reveals the grid in every section (hold anywhere).

## Section folds

The hero is `position: sticky` and carries `data-fold`; the services section (`fold-in`) slides up over it on a
circular top edge while the hero scales down 5%, lifts 28px and fades out. The services section folds the same
way under the construction stage. `--fold` is computed in `backdrop.ts` from the next section's position.
Under reduced motion the folds are static: the curved edges stay, nothing scales or fades.

## Growth partnerships wheel

The wheel sits at the foot of the hero as a semicircle (its lower half is clipped), with a small
"Growth partnerships · Past and present" caption on the cut edge; `#partners` anchors there.

`src/content/partners.ts` lists partners with `status: "present" | "past"` and an optional `logo` path. Put each
logo in `public/partners/` (SVG or PNG, square-ish, transparent background, dark on light) and set `logo:
"/partners/<file>"`; until then the slot shows the partner's initials. The preview template carries the same
list by hand in `preview/template.html`. The wheel turns slowly on its own, spins with a drag or flick, clicks
past the red pointer at the top and names the partner under it. Arrow keys turn it one slot at a time.

## Client portal

`public/portal/` holds the Oppa Client Portal landing page (its own self-contained `index.html` plus `assets/`). The "Client portal" link in the nav and the menu (`PORTAL_URL` in `src/content/site.ts`) opens it at `/portal/`. To update the portal, replace the files in that folder.
