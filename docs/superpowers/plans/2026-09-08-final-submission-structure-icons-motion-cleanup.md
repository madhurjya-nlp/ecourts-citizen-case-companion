# Final Submission Structure, Icons, Motion, and Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:subagent-driven-development (recommended) or superjawn:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a submission-ready prototype where Find Case contains both search and document upload, Understand Court Paper is a distinct guidance page, icons and motion form one coherent civic system, and generated or superseded artifacts are removed safely.

**Architecture:** Extend the existing hash router with a top-level `understand` page while preserving `paper` as a compatibility alias into the Finder upload mode. Reuse the current scanner, help copy, inline SVG renderer, and CSS preference system instead of adding dependencies. Complete cleanup only after runtime references and tests prove each asset is unused.

**Tech Stack:** Vanilla JavaScript, semantic HTML templates, CSS animations, inline SVG, Node static tests, Playwright, Cloudflare Worker tests, GitHub Pages.

---

### Task 1: Separate Understand Court Paper from the Finder upload mode

**Files:**
- Modify: `tests/citizen-workflows.spec.mjs`
- Modify: `tests/finder-check.spec.mjs`
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3-locales.js`
- Modify: `assets/citizen-shell.css`

- [ ] **Step 1: Write failing route and content tests**

Add Playwright coverage that asserts:

```js
test("Find Case contains search and court-paper upload modes", async ({ page }) => {
  await page.goto(`${baseURL}/#finder/cnr`);
  await expect(page.getByRole("heading", { name: "Find a Case" })).toBeVisible();
  await expect(page.getByRole("tab", { name: /court paper/i })).toBeVisible();
  await page.getByRole("tab", { name: /court paper/i }).click();
  await expect(page.locator("#paper-upload")).toBeAttached();
  await expect(page).toHaveURL(/#finder\/paper$/u);
});

test("Understand Court Paper is a separate guidance page", async ({ page }) => {
  await page.goto(`${baseURL}/#understand`);
  await expect(page.getByRole("heading", { name: "Understand a Court Paper" })).toBeVisible();
  await expect(page.locator("#paper-upload")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /what to check/i })).toBeVisible();
});
```

Add a compatibility assertion that `#finder/paper` still displays the upload mode and does not redirect to `#understand`.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```powershell
npx playwright test tests/finder-check.spec.mjs tests/citizen-workflows.spec.mjs --grep "Find Case contains|Understand Court Paper|compatibility"
```

Expected: the new Understand route or Finder paper tab assertion fails before implementation.

- [ ] **Step 3: Make paper upload a real Finder tab**

In `finder()`, render all five modes in one page:

```js
const tabs = ["number", "party", "advocate", "cnr", "paper"];
```

Remove the early return that replaces the entire Finder page when `state.tab === "paper"`. In `finderPanelContent()`, render `paperIntakeMarkup()` for the paper branch and keep the existing search form for other modes. Ensure the intake heading is an `h2` when embedded below the Finder page `h1`.

- [ ] **Step 4: Add the top-level Understand page**

Add `understand` to the router's known pages and render map. Implement `understandPaper()` using semantic sections and the existing localized safety language. Its structure is:

```html
<section class="page understand-paper-page">
  <header class="head"><h1>Understand a Court Paper</h1></header>
  <nav aria-label="On this page">...</nav>
  <section><h2>Start with these details</h2>...</section>
  <section><h2>What to check</h2>...</section>
  <section><h2>When to get help</h2>...</section>
  <button type="button" data-go="paper">Upload a paper in Find Case</button>
</section>
```

Add complete English, Assamese, and Hindi copy leaves to `prototype-v3-locales.js` and keep the existing legal-information boundary.

- [ ] **Step 5: Wire navigation and active states**

Use `data-go="understand"` for the bottom-nav and mobile-menu Understand destination. Preserve `data-go="paper"` for scanner teaser/upload actions. The active-state rule must distinguish:

```js
state.page === "understand" // Understand active
state.page === "finder"     // Find Case active, including tab === "paper"
```

- [ ] **Step 6: Style and verify the two page roles**

Add restrained editorial layouts for `.understand-paper-page` and the fifth Finder tab. Verify one `h1`, no nested forms, keyboard tab switching, 360-pixel reflow, and no scanner control on Understand.

- [ ] **Step 7: Run focused tests and commit**

Run:

```powershell
npx playwright test tests/finder-check.spec.mjs tests/citizen-workflows.spec.mjs --grep "Find Case contains|Understand Court Paper|compatibility"
npm run test:static
node --check assets/prototype-v3-app.js
git diff --check
```

Expected: all focused checks pass.

Commit:

```powershell
git add assets/prototype-v3-app.js assets/prototype-v3-locales.js assets/citizen-shell.css tests/finder-check.spec.mjs tests/citizen-workflows.spec.mjs
git commit -m "Separate paper guidance from case finder"
```

### Task 2: Complete the unified SVG icon family

**Files:**
- Modify: `tests/prototype-v3-static.test.mjs`
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/citizen-shell.css`
- Modify: `.agent/asset-registry.json`
- Delete after verification: `assets/icon-calendar.jpg`
- Delete after verification: `assets/icon-file.jpg`
- Delete after verification: `assets/icon-help.jpg`
- Delete after verification: `assets/icon-scale.jpg`
- Delete after verification: `assets/icon-search.jpg`

- [ ] **Step 1: Add failing icon-system guards**

Add static assertions requiring every `icon("...")` call to have a matching `iconPaths` entry, forbidding runtime references to `icon-*.jpg`, and confirming the icon renderer uses `currentColor`, `viewBox="0 0 24 24"`, and `aria-hidden="true"`.

```js
const iconNames = [...appSource.matchAll(/icon\("([^"]+)"\)/gu)].map((match) => match[1]);
for (const name of new Set(iconNames)) {
  assert.match(appSource, new RegExp(`["']?${name}["']?\\s*:`), `missing SVG icon: ${name}`);
}
assert.doesNotMatch(appSource, /icon-(search|file|help|scale|calendar)\.jpg/u);
```

- [ ] **Step 2: Run the static test and verify failure**

Run `npm run test:static`.

Expected: JPG icon references fail the new guard.

- [ ] **Step 3: Replace the remaining bitmap icon uses**

Delete `taskPhotos` and update task/tour markup to use the existing SVG renderer. Add any missing paths for document scan, dashboard, guidance, and status using the same 24-by-24, two-pixel, round-stroke grammar. Keep visible labels and avoid icon-only unfamiliar actions.

- [ ] **Step 4: Verify references before deleting assets**

Run:

```powershell
rg -n "icon-(calendar|file|help|scale|search)\.jpg" . --glob '!output/**'
```

Expected: no runtime, test, HTML, CSS, registry, or documentation dependency requiring the files. If documentation deliberately references a historical screenshot filename, update that reference before deletion.

- [ ] **Step 5: Delete the five superseded JPG icon tiles and update provenance**

Delete only the five exact files listed above. Update `.agent/asset-registry.json` to mark the inline SVG family as the active interface icon source. Retain `assets/LUCIDE-LICENSE.txt` while any path is Lucide-derived.

- [ ] **Step 6: Run checks and commit**

Run:

```powershell
npm run test:static
node --check assets/prototype-v3-app.js
git diff --check
```

Commit only the icon-system files and verified deletions:

```powershell
git add assets/prototype-v3-app.js assets/citizen-shell.css tests/prototype-v3-static.test.mjs .agent/asset-registry.json assets/LUCIDE-LICENSE.txt
git add -u assets/icon-calendar.jpg assets/icon-file.jpg assets/icon-help.jpg assets/icon-scale.jpg assets/icon-search.jpg
git commit -m "Unify the civic SVG icon system"
```

### Task 3: Add expressive civic page and scanner motion

**Files:**
- Modify: `tests/citizen-workflows.spec.mjs`
- Modify: `assets/citizen-shell.css`
- Modify: `assets/prototype-v3-app.js`

- [ ] **Step 1: Write reduced-motion and state tests**

Add Playwright checks confirming the page receives a motion-ready class after render, scanner status exposes stable text through processing, and reduced-motion removes non-essential animation:

```js
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(`${baseURL}/#finder/paper`);
const duration = await page.locator("main .page").evaluate((node) => getComputedStyle(node).animationDuration);
expect(["0s", "0.001s"]).toContain(duration);
```

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```powershell
npx playwright test tests/citizen-workflows.spec.mjs --grep "motion|reduced-motion|scanner status"
```

Expected: new motion-state assertions fail before implementation.

- [ ] **Step 3: Add page and component motion tokens**

Define duration/easing variables and animations in `citizen-shell.css`:

```css
.citizen-ui {
  --motion-fast: 140ms;
  --motion-page: 320ms;
  --motion-ease: cubic-bezier(.2,.8,.2,1);
}
.citizen-ui main .page { animation: civic-page-in var(--motion-page) var(--motion-ease) both; }
@keyframes civic-page-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Add small hover/press responses, section staggering, active-navigation movement, and scanner-stage document/pulse animation. Do not animate legal text, dates, status values, warnings, or result paragraphs.

- [ ] **Step 4: Preserve user control and immediate interaction**

Ensure animation never delays event binding or focus. Add a complete reduced-motion block covering page, scanner, navigation, icons, and decorative pseudo-elements:

```css
@media (prefers-reduced-motion: reduce) {
  .citizen-ui *, .citizen-ui *::before, .citizen-ui *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}
```

The existing in-app reduced-motion preference must apply the same behavior through its body class.

- [ ] **Step 5: Run focused tests and commit**

Run:

```powershell
npx playwright test tests/citizen-workflows.spec.mjs --grep "motion|reduced-motion|scanner status"
git diff --check
```

Commit:

```powershell
git add assets/citizen-shell.css assets/prototype-v3-app.js tests/citizen-workflows.spec.mjs
git commit -m "Add expressive civic page motion"
```

### Task 4: Make Nayak feel responsive and alive

**Files:**
- Modify: `tests/nyk-assistant.spec.mjs`
- Modify: `assets/nyk-assistant.js`
- Modify: `assets/nyk-assistant.css`

- [ ] **Step 1: Add failing Nayak state tests**

Cover closed/idle, open, listening, thinking, answering, error, and reduced-motion states. Assert state is conveyed by text or ARIA status as well as motion:

```js
await page.getByRole("button", { name: /nayak/i }).click();
await expect(page.locator(".nyk-panel")).toHaveAttribute("data-nayak-state", "idle");
await page.locator(".nyk-form textarea").fill("What should I verify?");
await page.locator(".nyk-form").evaluate((form) => form.requestSubmit());
await expect(page.locator(".nyk-panel")).toHaveAttribute("data-nayak-state", "thinking");
```

- [ ] **Step 2: Run focused tests and verify failure**

Run `npx playwright test tests/nyk-assistant.spec.mjs --grep "state|motion|reduced"`.

Expected: `data-nayak-state` is absent before implementation.

- [ ] **Step 3: Centralize Nayak visual state**

Add a small state setter in `nyk-assistant.js`:

```js
function setNayakState(next) {
  panel.dataset.nayakState = next;
  status.textContent = stateCopy[next] || "";
}
```

Call it at idle, listening, thinking, answer completion, cancellation, and error boundaries. Do not add network calls, audio autoplay, or timers that delay the actual answer.

- [ ] **Step 4: Add expressive but civic animations**

In `nyk-assistant.css`, add a breathing central mark, quiet halo, thinking orbit, listening response, typing dots, and staggered answer-block reveal. Use existing indigo/cream/saffron colors; avoid neon, glitch, surveillance, or constant high-amplitude movement. Apply the same reduced-motion override used by the main shell.

- [ ] **Step 5: Run Nayak and recovery tests and commit**

Run:

```powershell
npx playwright test tests/nyk-assistant.spec.mjs tests/nayak-recovery.spec.mjs
node --check assets/nyk-assistant.js
git diff --check
```

Commit:

```powershell
git add assets/nyk-assistant.js assets/nyk-assistant.css tests/nyk-assistant.spec.mjs
git commit -m "Animate Nayak interaction states"
```

### Task 5: Remove only verified generated and superseded artifacts

**Files:**
- Delete: tracked files under `output/playwright/`
- Delete: untracked files under `output/playwright/`
- Delete: `assets/emblem-india.png`
- Delete if still untracked and unused: `assets/openai-civic-layer.js`
- Delete if still untracked and unused: `assets/demo-papers/`
- Modify: `.agent/asset-registry.json`
- Modify: `.gitignore`
- Test: `tests/prototype-v3-static.test.mjs`

- [ ] **Step 1: Resolve and record exact deletion targets**

Confirm the absolute targets are inside the repository and list them before deletion:

```powershell
Resolve-Path -LiteralPath output/playwright
Resolve-Path -LiteralPath assets/emblem-india.png
rg -n "emblem-india|openai-civic-layer|demo-papers|output/playwright" . --glob '!output/playwright/**'
```

Do not delete a target with a remaining runtime or submission dependency.

- [ ] **Step 2: Add guards against superseded assets and generated output**

Extend the static test to reject runtime `emblem-india.png` references and ensure `assets/civic-mark.svg` exists. Add `output/playwright/` to `.gitignore` so browser artifacts do not return.

- [ ] **Step 3: Delete the approved exact targets**

Use explicit paths only. Remove tracked screenshot artifacts, the superseded emblem, and confirmed-unused untracked scanner/helper assets. Preserve all source, tests, plans, registries, audit history, and project/submission documents.

- [ ] **Step 4: Update the asset registry**

Record the civic mark as active and the national emblem as removed/superseded. Remove stale icon-tile entries only after Task 2 proves they are unused.

- [ ] **Step 5: Verify cleanup and commit**

Run:

```powershell
npm run test:static
git status --short
git diff --check
```

Review every deletion in `git diff --stat` and `git diff --name-status` before committing.

Commit:

```powershell
git add .gitignore .agent/asset-registry.json tests/prototype-v3-static.test.mjs
git add -u assets output/playwright
git commit -m "Remove superseded submission artifacts"
```

### Task 6: Audit sitemap, information, images, and final browser behavior

**Files:**
- Create: `.agent/site-manifest.json`
- Create: `.agent/audit.json`
- Modify: `.agent/reports/latest.md`
- Modify: `docs/submission/PROJECT_BOOK.md` only if its sitemap or screenshots are now inaccurate

- [ ] **Step 1: Build the final route inventory**

Verify Home, Finder search modes, Finder upload mode, Understand, Services/Courts, Documents/dashboard, Case, and Help. Record route owner, principal component/function, data source, and external-link classification.

- [ ] **Step 2: Run the production-equivalent automated suite**

Run:

```powershell
npm run test:static
npm run test:worker
npx playwright test
npm test
node --check assets/prototype-v3-app.js
node --check assets/nyk-assistant.js
git diff --check
```

Expected: all commands pass. If the combined `npm test` browser server fails after the standalone Playwright run, record the exact infrastructure failure without claiming it passed.

- [ ] **Step 3: Perform the browser visual audit**

At 1440, 768, 390, and 360 pixels inspect:

- correct active navigation and route hashes;
- one visible `h1` per page;
- no missing icons/images or console errors;
- no horizontal overflow;
- keyboard focus and bottom safe-area clearance;
- scanner loading, success, no-match, invalid, and unavailable states;
- Nayak idle, thinking, answering, error, and close/focus restoration;
- reduced-motion behavior;
- citizen dashboard and lawyer workspace parity;
- local synthetic-data disclosures.

Use route interception for scanner and Nayak tests; never call the paid Worker endpoint.

- [ ] **Step 4: Update the audit and report**

Record completed checks, synthetic-data boundaries, deleted assets, remaining production blockers, and exact test counts. Do not call the prototype production-ready or connected to live citizen data.

- [ ] **Step 5: Review the final commit boundary**

Run:

```powershell
git status --short
git diff --name-status origin/main...HEAD
git log --oneline origin/main..HEAD
```

Confirm no unrelated user-authored documentation or workspace artifact is staged.

- [ ] **Step 6: Commit and push the submission state**

```powershell
git add .agent docs/submission
git commit -m "Record final submission verification"
git push origin main
```

After push, open the GitHub Pages URL and verify Home, Find Case search/upload, Understand Court Paper, Documents, and Nayak on the deployed commit.
