# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## What this is

A single-page Italian-language guide, **"Volare l'A320 Come un Pilota Reale"**
("Flying the A320 Like a Real Pilot") — operational procedures for flying the
FlyByWire A32NX add-on (MSFS) the way a real airline pilot would: CRM,
dark-cockpit philosophy, ECAM, MCDU/FMGC setup, SimBrief OFP usage, checklists,
and a full flight-phase walkthrough from cold-and-dark to landing.

There is no app framework, backend, or build step. The entire product is one
file: `a320-pilota-reale.html`. Everything else in the repo (tests, CI) exists
to protect that one file from breaking.

## Repository layout

- `a320-pilota-reale.html` — the entire site: inline `<style>`, all content
  markup, and one inline `<script>` at the bottom for scroll-spy nav
  highlighting. No external JS/CSS files except a Google Fonts `@import`.
- `tests/check-nav-ids.js` — plain Node script (no test framework) that
  regex-parses the HTML and verifies the top nav (`#navlinks`) and the
  `section.phase` elements are in 1:1 correspondence.
- `tests/nav-scrollspy.spec.js` — Playwright end-to-end test for the
  scroll-spy behavior (active nav link tracks the section in view).
- `playwright.config.js` — serves the repo root with `http-server` on
  `127.0.0.1:4173` and runs Chromium against `a320-pilota-reale.html`.
- `.github/workflows/tests.yml` — CI: runs the nav/id check, then Playwright,
  on every push and PR.
- `package.json` — dev tooling only (`@playwright/test`, `http-server`); the
  site itself has zero runtime dependencies.

## The HTML file's structure (important for edits)

The page is built from repeating `<section class="phase" id="...">` blocks,
each with:
- a `.phase-label` (e.g. `01 — APPROCCIO`) showing a sequence number and phase
  category (APPROCCIO, FILOSOFIA, SISTEMI, SETUP, PIANIFICAZIONE, MCDU,
  ESECUZIONE),
- an `<h2>` heading,
- content using a small set of reusable components: `.card` /
  `.card.warn` / `.card.good`, `.grid2` / `.grid3` layout grids, `.readout`
  (monospace MCDU/callout-style blocks), `.callout-row` (PF/PM radio callout
  pairs), `.pill`, `.law-track`/`.law-step` (FBW law diagram), `.formula`,
  and `.ecam-tier` (WARNING/CAUTION/ADVISORY/STATUS blocks).

Every `section.phase` has an `id`, and the nav bar (`#navlinks`, inside
`.phase-nav-inner`) has one `<a href="#id">` per section, **in the same
document order**. This mapping must stay 1:1 — `tests/check-nav-ids.js`
enforces it (fails on duplicates, orphan nav links, or sections missing a nav
link).

**When adding, removing, or renaming a section:**
1. Add/update the `<section class="phase" id="...">` block.
2. Add/update the matching `<a href="#...">` in `#navlinks`, at the matching
   position.
3. Renumber the `.phase-label` sequence numbers if you inserted/removed a
   section (they're plain text, not generated).
4. Run `npm run test:ids` to confirm the mapping still matches.

The scroll-spy script at the bottom of the file uses an `IntersectionObserver`
over every `section.phase` to toggle `.active` on the corresponding nav link;
it requires no changes when content changes, only when section IDs change.

## Development workflow

Install dependencies once:
```
npm install
```

Run everything CI runs:
```
npm test
```
This runs `test:ids` (fast, no browser) then `test:e2e` (Playwright,
downloads/needs Chromium).

Run just the fast structural check while editing content/nav:
```
npm run test:ids
```

Run just the Playwright suite (starts `http-server` automatically via
`webServer` in `playwright.config.js`):
```
npm run test:e2e
```

To preview the page manually:
```
npx http-server . -p 4173
```
then open `http://127.0.0.1:4173/a320-pilota-reale.html`.

There is no linter, formatter, bundler, or build step — edit the HTML file
directly and reload the browser.

## Conventions

- **Language**: all visible content is Italian. Keep new content in Italian
  and consistent with existing aviation terminology (e.g. keep English
  aviation/ATC terms like `V1`, `THRUST SET`, `POSITIVE RATE`, `GEAR UP`
  verbatim — these are real standardized callouts, not to be translated).
- **Style is inline**: all CSS lives in the single `<style>` block in
  `<head>`, using CSS custom properties defined on `:root` (`--bg`, `--cyan`,
  `--amber`, `--green`, `--red`, etc.). Reuse existing classes/utilities
  (`.card`, `.grid2`, `.grid3`, `.readout`, `.pill`, ...) instead of adding
  new one-off styles when an existing component fits.
- **No external JS/CSS dependencies** beyond the Google Fonts import — keep it
  that way; the page should stay a single self-contained file.
- **Content accuracy matters**: this is a procedural/reference guide for real
  A320/A32NX systems and airline-style CRM procedure. Keep numbers, callouts,
  and sequencing (e.g. "ENG 2 before ENG 1 on start", "ZFW before Block Fuel
  in MCDU INIT B", V-speed definitions) technically correct — inaccuracies
  here are the kind of bug that matters most in this repo.
- **Tests are structural, not content tests**: they check nav/section
  consistency and scroll-spy JS behavior, not the accuracy of the Italian
  procedural content. Always keep `#navlinks` and `section.phase` IDs in sync
  when touching sections, since that's what CI actually enforces.

## CI

`.github/workflows/tests.yml` runs on every push and PR: `npm ci` → nav/id
check → install Chromium → Playwright tests. On failure it uploads the
Playwright HTML report as a build artifact. Keep changes green against this
workflow before considering a change complete.
