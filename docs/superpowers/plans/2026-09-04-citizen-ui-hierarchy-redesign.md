# Citizen UI Hierarchy Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:executing-plans to implement this plan task-by-task. Do not dispatch subagents for this project. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the visual hierarchy of Home, Help, and the citizen case journey while preserving every working search, AI, upload, PDF, translation, and official-service contract.

**Architecture:** Keep the existing state-driven vanilla JavaScript renderer. Make semantic markup changes in `prototype-v3-app.js`, place the new shared visual system in the final override layer of `citizen-shell.css`, and limit `prototype-v3.css` changes to existing journey/preparation primitives. Native `details` elements provide progressive disclosure without new state.

**Tech Stack:** HTML5, CSS custom properties and responsive media queries, vanilla JavaScript, Playwright, Node test runner.

---

## File map

- Modify `assets/citizen-shell.css`: final visual tokens, Home/Help/Case hierarchy, official links, responsive rules.
- Modify `assets/prototype-v3.css`: compact journey stepper and preparation/action disclosure primitives.
- Modify `assets/prototype-v3-app.js`: semantic disclosures, relocated assisted-use controls, shorter copy, stage-aware primary actions.
- Modify `assets/nyk-assistant.css`: launcher/prompt safe positioning.
- Modify `index.html`: asset cache versions.
- Modify `tests/citizen-workflows.spec.mjs`: Home, Help, Case, disclosure, mobile flow assertions.
- Modify `tests/nyk-assistant.spec.mjs`: launcher and prompt overlap assertions.

### Task 1: Establish the hierarchy tokens and action roles

**Files:**
- Modify: `assets/citizen-shell.css:1-20`
- Modify: `assets/citizen-shell.css:88-137`
- Test: `tests/citizen-workflows.spec.mjs`

- [ ] **Step 1: Add a failing visual-role test**

Add a test that opens Courts & Services and asserts that `.official-link` uses the blue official-service color while `.btn.primary` retains the green primary color. Assert the two computed colors differ.

```js
test("official destinations are visually distinct from primary actions", async ({ page }) => {
  await start(page);
  await go(page, "courts");
  const official = await page.locator(".official-link").first().evaluate((el) => getComputedStyle(el).color);
  await go(page, "finder");
  const primary = await page.locator(".btn.primary").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(official).toBe("rgb(29, 78, 216)");
  expect(primary).toBe("rgb(27, 67, 50)");
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx playwright test tests/citizen-workflows.spec.mjs --config=playwright.config.mjs --grep "official destinations"`

Expected: FAIL because the current official-link color is not `rgb(29, 78, 216)`.

- [ ] **Step 3: Add the four semantic color roles and type scale**

Add final-scope variables under `.citizen-ui` and use them for buttons, official links, warnings, headings, metadata, focus, and dividers.

```css
.citizen-ui {
  --action: #1b4332;
  --action-hover: #123629;
  --attention: #b45309;
  --official: #1d4ed8;
  --ink-strong: #171a18;
  --ink-muted: #606762;
  --divider: #e1e4e1;
}
.citizen-ui .btn.primary { background: var(--action); color: #fff; }
.citizen-ui .official-link { color: var(--official); text-decoration-thickness: 1px; }
```

- [ ] **Step 4: Run the focused test and commit**

Run the focused test and expect PASS. Commit only the token and test changes with `git commit -m "Define citizen interface hierarchy tokens"`.

### Task 2: Simplify Home and relocate assisted use

**Files:**
- Modify: `assets/prototype-v3-app.js:1839-1847`
- Modify: `assets/citizen-shell.css:188-234`
- Test: `tests/citizen-workflows.spec.mjs:41-77`

- [ ] **Step 1: Write failing Home hierarchy tests**

Assert that the search form precedes `.home-paths`, common actions render as a divided list, the short placeholder fits, and inner pages no longer render `.assisted-shortcut`.

```js
await expect(page.locator("#home-query")).toHaveAttribute("placeholder", /CNR.*case number.*party name/i);
expect(await page.locator("#home-search").evaluate((el) => el.compareDocumentPosition(document.querySelector(".home-paths")) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
await go(page, "help");
await expect(page.locator(".page-nav .assisted-shortcut")).toHaveCount(0);
```

- [ ] **Step 2: Run the Home tests and confirm failure**

Run: `npx playwright test tests/citizen-workflows.spec.mjs --config=playwright.config.mjs --grep "Home|assisted"`

Expected: FAIL on ordering and persistent assisted shortcut.

- [ ] **Step 3: Reorder Home markup and add a native More options disclosure**

In `home()`, render `.home-search` before `.home-paths`; shorten the placeholder in all three locale packs; render common actions as `.common-list`; and wrap assisted use plus WhatsApp in:

```html
<details class="home-more">
  <summary>More ways to use eCourts</summary>
  <div class="home-support-row">...</div>
</details>
```

Remove `.assisted-shortcut` from `pageNav()`. Keep the Home disclosure and primary navigation as the two assisted-use entry points.

- [ ] **Step 4: Replace common cards with divided rows**

Use a two-column desktop list and one-column mobile list. Remove shadows and card backgrounds; preserve a 44px minimum target and clear focus state.

- [ ] **Step 5: Run Home tests at 1440px, 390px, and 360px and commit**

Expected: search is dominant, no placeholder clipping, and no document overflow. Commit with `git commit -m "Simplify citizen home hierarchy"`.

### Task 3: Lighten Help and foreground scoped assistance

**Files:**
- Modify: `assets/prototype-v3-app.js:1215-1305`
- Modify: `assets/citizen-shell.css:120-155`
- Test: `tests/citizen-workflows.spec.mjs:121-159`

- [ ] **Step 1: Add failing Help structure assertions**

Assert that the four guide actions remain, an `Ask NYK` action appears before keyword search, FAQ rows have transparent backgrounds, and opening one row updates its indicator.

```js
await expect(page.locator(".help-guide-action")).toHaveCount(4);
await expect(page.locator('[data-nyk-question]')).toBeVisible();
await expect(page.locator(".faq-item").first()).toHaveCSS("box-shadow", "none");
```

- [ ] **Step 2: Run the Help test and confirm the NYK entry assertion fails**

Run the English Help test only. Expected: FAIL because the contextual NYK entry does not yet occupy the Help search region.

- [ ] **Step 3: Add the scoped assistant entry and simplify FAQ styling**

Add a button that opens NYK with a localized court-navigation prompt. Keep keyword search directly beneath it. Restyle FAQ `details` as divider rows with no outer card; use `summary::after` for `+` and the open state for a minus sign.

- [ ] **Step 4: Verify all three Help locales and commit**

Run all Help tests. Expected: 15 records still available per language, disclosures remain keyboard operable, and no English fallback appears. Commit with `git commit -m "Refine guided Help interface"`.

### Task 4: Restructure Case Understand around citizen questions

**Files:**
- Modify: `assets/prototype-v3-app.js:427-432`
- Modify: `assets/prototype-v3-app.js:1771-1825`
- Modify: `assets/prototype-v3.css:2562-2887`
- Modify: `assets/citizen-shell.css:88-119`
- Test: `tests/citizen-workflows.spec.mjs:78-120,160-214`

- [ ] **Step 1: Write failing hierarchy and disclosure tests**

Assert that the explanation and verification region precede secondary documents/history, that the Understand stage has exactly one primary `Prepare` action, and that Next Action contains one collapsed checklist disclosure.

```js
await expect(page.locator('.case-stage-understand [data-stage-panel="understand"] .understand-primary')).toBeVisible();
await expect(page.locator('.next-action-block details.action-checklist')).not.toHaveAttribute("open", "");
await page.locator('.next-action-block details.action-checklist summary').click();
await expect(page.locator(".action-checklists")).toBeVisible();
```

- [ ] **Step 2: Run the focused Case test and confirm failure**

Expected: FAIL because the two checklists are permanently expanded and the Understand primary action is not grouped with the explanation.

- [ ] **Step 3: Recompose Understand without changing case data**

Create an `.understand-primary` region containing the current mode selector, plain-language result, verification warning, latest-order link, and one primary Prepare button. Keep existing document modal triggers and source text unchanged. Move papers and history into lower-priority native disclosures.

- [ ] **Step 4: Collapse the Next Action checklist**

Wrap the existing `.action-checklists` in a localized `details.action-checklist` with a single `summary`. Keep both online and offline lists and their icons inside; do not alter priority-template routing.

- [ ] **Step 5: Apply amber consistently to all priority cards**

Use the same amber top rule and label family for all three cards, varying only label intensity. Keep buttons secondary because WhatsApp remains the stage primary action.

- [ ] **Step 6: Run Case, PDF, and document-modal tests and commit**

Expected: all current PDF filenames, modal titles, and routing assertions remain unchanged. Commit with `git commit -m "Restructure citizen case understanding"`.

### Task 5: Refine Prepare, mobile stepper, and NYK safe areas

**Files:**
- Modify: `assets/prototype-v3-app.js:1757-1762,1789-1794`
- Modify: `assets/prototype-v3.css:601-737`
- Modify: `assets/nyk-assistant.css:1-55,392-470`
- Test: `tests/citizen-workflows.spec.mjs:78-120`
- Test: `tests/nyk-assistant.spec.mjs:141-175`

- [ ] **Step 1: Add failing mobile geometry tests**

At 390x844 and 360x800, assert that the current step has text, non-current steps hide their labels, the stepper has no horizontal scrollbar, and the NYK launcher does not intersect the primary action or bottom dock.

```js
const overlap = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
expect(overlap(launcherBox, dockBox)).toBe(false);
expect(await page.locator(".journey-strip").evaluate((el) => el.scrollWidth === el.clientWidth)).toBe(true);
```

- [ ] **Step 2: Run focused mobile tests and confirm failure**

Expected: FAIL because the current journey strip is horizontally scrollable.

- [ ] **Step 3: Implement the compact mobile stepper**

Keep five equal tracks on desktop. On mobile, use five compact tracks; visually hide inactive `<b>` labels while preserving accessible names, and allocate the active item more width using CSS grid. Remove horizontal scrolling.

- [ ] **Step 4: Emphasize the Prepare tool and one primary action**

Give the role selector and generated lists a light neutral-green interactive background. Keep `Continue to official services` primary; render reminder, document studio, and legal help as secondary/text actions.

- [ ] **Step 5: Move NYK controls above all safe areas**

Use shared offsets based on the dock height and `env(safe-area-inset-bottom)`. Ensure `.nyk-prompt` and `.nyk-launcher` never cover `.official-service-action`, form submits, or the dock.

- [ ] **Step 6: Run mobile tests and commit**

Expected: no overlap and no horizontal overflow at both required widths. Commit with `git commit -m "Polish mobile journey and assistant placement"`.

### Task 6: Visual QA, regression, and deployment

**Files:**
- Modify: `index.html:25-31`
- Test: all test files

- [ ] **Step 1: Bump CSS and JavaScript asset versions**

Change the query versions for every modified asset in `index.html` so GitHub Pages clients receive the redesign.

- [ ] **Step 2: Run the complete suite**

Run: `npm test`

Expected: static locale validation passes, all 10 Worker tests pass, and all browser tests pass.

- [ ] **Step 3: Capture settled screenshots**

Capture Home, Help, Case Understand, Case Next Action expanded/collapsed, and Prepare at 1440x900, 390x844, and 360x800 in `output/playwright/`. Wait for scrolling and transitions to settle before each capture.

- [ ] **Step 4: Inspect visual and geometry criteria**

Confirm one primary CTA per stage, readable 3-tier typography, blue official links, amber attention states, no card nesting, no text clipping, no content overlap, and no horizontal document overflow.

- [ ] **Step 5: Commit and push only intended files**

Do not stage `.agent/reports/latest.md`, `assets/openai-civic-layer.js`, `docs/ECourt_Revamp_Discussion_2026-09-04.md`, or local `output/playwright/` artifacts. Commit with `git commit -m "Complete citizen interface redesign"`, push `main`, and verify the new asset versions appear on the public GitHub Pages URL.
