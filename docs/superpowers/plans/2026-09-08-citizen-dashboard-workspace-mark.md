# Citizen Dashboard, Workspace Parity, and Civic Mark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task with spec and code-quality review checkpoints.

**Goal:** Add a session-only citizen case dashboard, equal citizen/lawyer workspace paths, Find Case quick search on the paper route, and a synthetic non-governmental header mark without changing the Worker contract.

**Architecture:** Extend the existing vanilla state/render model in `assets/prototype-v3-app.js`. Keep dashboard records transient in memory, reuse `casePage()` for details, and use existing CSS patterns. Generate a visual mark concept, then commit a deterministic project-local SVG with provenance.

**Tech Stack:** Vanilla JavaScript, existing CSS, inline SVG, Playwright, Node static tests, built-in image generation.

---

### Task 1: Synthetic civic mark

**Files:** `assets/civic-mark.svg`, `assets/prototype-v3-app.js`, `.agent/asset-registry.json`, `tests/prototype-v3-static.test.mjs`

- [ ] Generate a concept with the built-in image generator: an abstract document/doorway/spark mark, vector-friendly, deep green/indigo/cream/charcoal, transparent background, no text, no Ashoka emblem, lion capital, chakra, seal, crest, flag, or official insignia.
- [ ] Inspect the concept and create `assets/civic-mark.svg` as a simple deterministic vector with a valid `viewBox`, no embedded raster, and no official-looking text.
- [ ] Replace the header’s `assets/emblem-india.png` reference with `assets/civic-mark.svg` and register the new asset as `SYNTHETIC_HACKATHON`, explicitly not an official government emblem.
- [ ] Add static assertions that the header references the synthetic SVG and not the national emblem.
- [ ] Verify with `node tests/prototype-v3-static.test.mjs`, `node --check assets/prototype-v3-app.js`, and `git diff --check`; commit only these task files as `Replace national emblem with synthetic civic mark`.

### Task 2: Find Case quick search

**Files:** `assets/prototype-v3-app.js`, `assets/citizen-shell.css`, `tests/citizen-workflows.spec.mjs`

- [ ] Add a failing browser test for `#finder/paper`: a compact homepage-style search bar is visible, exact sample CNR routes to `#finder/cnr`, and failed text remains visible after submission.
- [ ] Run the focused test and confirm it fails because the paper route has no quick search.
- [ ] Add a small shared quick-search renderer before finder panels. It accepts CNR, case number, or party name and reuses one exact-match helper for homepage and finder forms.
- [ ] Preserve `state.finderQuery` on failed submissions and keep existing tabs/results intact.
- [ ] Reuse `.home-search` styling with a compact margin, 44px target, and mobile no-overflow behavior.
- [ ] Run `npx playwright test tests/citizen-workflows.spec.mjs --grep "paper route quick search|failed case searches"`, `node --check assets/prototype-v3-app.js`, and `git diff --check`; commit as `Add quick case search to paper finder`.

### Task 3: Session-only citizen dashboard and equal workspaces

**Files:** `assets/prototype-v3-app.js`, `assets/citizen-shell.css`, `tests/citizen-workflows.spec.mjs`, `tests/finder-check.spec.mjs`

- [ ] Add failing browser tests for an empty dashboard, scan-review “Add to My case dashboard”, add-once behavior, opening the existing case page, reload/reset clearing, no localStorage persistence, and unmatched scans not appearing.
- [ ] Run the focused tests and confirm failure.
- [ ] Add in-memory `dashboardCases` containing only synthetic record IDs; do not add it to persisted state. Clear it on reset and naturally on reload.
- [ ] Render a balanced `My case dashboard` section in the documents route with the visible label `Sample dashboard · saved for this browser session only`, empty actions for Find a case and Scan a paper, saved cards, and an honest unavailable fallback.
- [ ] Add the explicit scan-review action `Add to My case dashboard`; require a matched record, add once, disclose sample status, and never auto-add or overwrite case data.
- [ ] Present citizen dashboard and professional lawyer workspace as equal desktop columns that stack on mobile. Keep lawyer demo boundaries and drafting tools intact.
- [ ] Add menu/home/scan entry points while preserving deep links and route dashboard items to the existing `casePage()`.
- [ ] Run focused dashboard/lawyer tests, syntax, and diff checks; commit as `Add session-only citizen case dashboard`.

### Task 4: Browser review, audit, and full verification

**Files:** `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`, `.agent/reports/latest.md`

- [ ] Use the browser companion at desktop and 390px widths to inspect `#home`, `#finder/paper`, `#documents`, `#finder/cnr`, and `#case/understand` for mark clarity, equal workspace hierarchy, focus, spacing, dock clearance, and horizontal overflow.
- [ ] Run `npm run test:static`, `npm run test:worker`, `npx playwright test --config=playwright.config.mjs --reporter=line`, `node --check assets/prototype-v3-app.js`, and `git diff --check`.
- [ ] Review `git status --short` and ensure unrelated user files remain unstaged; confirm no national-emblem reference, real credentials, Worker-contract change, or dashboard localStorage persistence.
- [ ] Add the transient dashboard boundary to the security/privacy audit, record the verification summary in `.agent/reports/latest.md`, commit documentation, and push `origin main`.
