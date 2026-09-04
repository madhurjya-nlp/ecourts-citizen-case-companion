# Phase 1 Shell and Citizen Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:executing-plans to implement this plan task-by-task. Do not dispatch subagents for this project. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a coherent responsive application shell and a citizen-first Home screen while preserving all existing routes and tested mechanics.

**Architecture:** Keep `prototype-v3-app.js` as the existing renderer and event controller during progressive migration. Add a final, purpose-built stylesheet for the new shell and Home so legacy routes continue to render unchanged; migrate legacy CSS only when each route is rebuilt. Keep all visible strings in the existing locale data for English, Assamese, and Hindi. Reserve explicit loading, result, unavailable, and provenance presentation states for a later Cloudflare Worker integration, but do not connect the API during this visual-foundation phase.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, locale dictionaries, Node static assertions, Playwright browser tests.

---

## File map

- Create `assets/citizen-shell.css`: new design tokens, shell, sidebar, Home, and responsive rules only.
- Modify `index.html`: load the progressive stylesheet after the legacy stylesheet and update its cache key.
- Modify `assets/prototype-v3-app.js`: render the new application shell and Home structure using existing state and navigation events.
- Modify `assets/prototype-v3-locales.js`: add the citizen-intent labels required by the new Home.
- Modify `tests/prototype-v3-static.test.mjs`: assert the new asset and required structural hooks.
- Modify `tests/citizen-workflows.spec.mjs`: verify Home routes, assisted mode, shell state, accessibility names, and responsive behaviour.
- Modify `.agent/PROGRESSIVE_REBUILD_MEMORY.md`: record Phase 1 outcome and next migration target.

### Task 1: Lock the Phase 1 interface contract

**Files:**
- Modify: `tests/prototype-v3-static.test.mjs`
- Modify: `tests/citizen-workflows.spec.mjs`

- [ ] **Step 1: Add failing static assertions**

Assert that `index.html` loads `assets/citizen-shell.css`, and that the application renderer contains the structural hooks `.app-frame`, `.side-navigation`, `.citizen-intents`, and `.assisted-entry`.

```js
assert.match(indexSource, /assets\/citizen-shell\.css/u);
for (const hook of ["app-frame", "side-navigation", "citizen-intents", "assisted-entry"]) {
  assert.match(appSource, new RegExp(hook), `missing Phase 1 hook: ${hook}`);
}
```

- [ ] **Step 2: Add a failing Home journey test**

Open `#home`, confirm exactly four primary intent controls, click each control, and verify the resulting hash. Confirm that assisted use opens from Home and that desktop exposes one primary Home control.

```js
test("citizen Home exposes four distinct starting intents", async ({ page }) => {
  await page.goto("/index.html#home");
  const intents = page.locator(".citizen-intents [data-intent]");
  await expect(intents).toHaveCount(4);
  await intents.nth(0).click();
  await expect(page).toHaveURL(/#finder\/cnr$/);
});
```

- [ ] **Step 3: Run focused tests and confirm failure**

Run: `npm run test:static && npx playwright test tests/citizen-workflows.spec.mjs --grep "citizen Home"`

Expected: FAIL because the progressive stylesheet and new Home hooks do not exist.

- [ ] **Step 4: Commit the contract tests**

```powershell
git add tests/prototype-v3-static.test.mjs tests/citizen-workflows.spec.mjs
git commit -m "test: define citizen shell and home contract"
```

### Task 2: Add the progressive visual foundation

**Files:**
- Create: `assets/citizen-shell.css`
- Modify: `index.html`

- [ ] **Step 1: Create scoped foundation tokens**

Define a neutral civic palette and reusable dimensions under `.citizen-ui` so unfinished routes are not unintentionally restyled.

```css
.citizen-ui {
  --civic-green: #174f3f;
  --civic-green-dark: #10392f;
  --civic-ink: #202622;
  --civic-muted: #5d665f;
  --civic-paper: #fbfaf6;
  --civic-surface: #ffffff;
  --civic-line: #d6d3c9;
  --civic-accent: #c75b1b;
  --sidebar-width: 248px;
  --content-max: 1180px;
  color: var(--civic-ink);
  font-family: "Noto Sans", "Nirmala UI", "Segoe UI", sans-serif;
}
```

- [ ] **Step 2: Define component rules**

Add styles for `.app-frame`, `.side-navigation`, `.workspace-frame`, `.citizen-intents`, `.intent-button`, `.assisted-entry`, and `.service-stat`. Buttons must have 44px minimum targets, visible focus, no pill styling, and explicit primary/secondary contrast.

- [ ] **Step 3: Link the new stylesheet last**

```html
<link rel="stylesheet" href="assets/prototype-v3.css?v=20260904a" />
<link rel="stylesheet" href="assets/citizen-shell.css?v=20260904a" />
```

- [ ] **Step 4: Run the static test**

Run: `npm run test:static`

Expected: the asset assertion passes; renderer-hook assertions still fail.

- [ ] **Step 5: Commit the foundation**

```powershell
git add index.html assets/citizen-shell.css
git commit -m "style: add progressive citizen design foundation"
```

### Task 3: Replace the desktop and mobile shell

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3-locales.js`

- [ ] **Step 1: Add localized navigation labels**

Add strings for the journey summary, collapse/expand controls, official-services label, and assisted mode in all three language dictionaries. Do not add English fallback text directly in renderer markup.

- [ ] **Step 2: Render one semantic application frame**

Change `renderShell()` so the body receives `.citizen-ui`, the desktop shell includes one collapsible `.side-navigation`, and the content uses `.workspace-frame`. Reuse existing `data-go` and `data-action` handlers so navigation behaviour is unchanged.

```html
<div class="app-frame">
  <aside class="side-navigation" aria-label="Citizen journey">...</aside>
  <div class="workspace-frame">
    <header class="utility-header">...</header>
    <main id="app">...</main>
  </div>
</div>
```

Because `#app` already exists in `index.html`, implement this shape by rendering sibling shell regions around the existing content rather than creating a second `main` element.

- [ ] **Step 3: Preserve compact mobile navigation**

At widths below 760px, hide the desktop sidebar, retain the existing accessible menu trigger, and expose no more than four persistent mobile destinations. Ensure there is only one visible Home control.

- [ ] **Step 4: Run navigation tests**

Run: `npx playwright test tests/citizen-workflows.spec.mjs --grep "navigation|Home"`

Expected: PASS for desktop and mobile navigation without duplicate Home controls.

- [ ] **Step 5: Commit the shell**

```powershell
git add assets/prototype-v3-app.js assets/prototype-v3-locales.js
git commit -m "feat: introduce citizen journey application shell"
```

### Task 4: Rebuild Home around four citizen intents

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3-locales.js`
- Modify: `assets/citizen-shell.css`

- [ ] **Step 1: Add complete localized Home copy**

For English, Assamese, and Hindi, add the heading “How can we help you today?”, a short public-service boundary, and labels/descriptions for exactly four intents. Keep “Use for someone you know” as a separate assisted-mode control.

- [ ] **Step 2: Implement intent routing**

Map the four Home intents to existing safe routes:

```js
const homeIntents = [
  { id: "find", icon: "search", route: "finder/cnr" },
  { id: "status", icon: "list-checks", route: state.selected ? "case/understand" : "finder/cnr" },
  { id: "order", icon: "file-text", route: "finder/paper" },
  { id: "next", icon: "route", route: state.selected ? "case/action" : "help" },
];
```

Use the current navigation parser rather than assigning `location.href` directly. Add missing icons to the existing icon map only when required.

- [ ] **Step 3: Replace the legacy hero and five-card task grid**

Render a compact first viewport with `.citizen-intents`, a clear primary search action, and one restrained image or contextual visual below the core actions. Do not display the current five-card task grid or decorative editorial composition.

- [ ] **Step 4: Add restrained service indicators**

Show at most three indicators. Use labels such as “Demonstration record” unless a live, sourced value exists; do not present invented counters as current court statistics.

- [ ] **Step 5: Run the Home contract tests**

Run: `npm run test:static && npx playwright test tests/citizen-workflows.spec.mjs --grep "citizen Home|first-time"`

Expected: PASS.

- [ ] **Step 6: Commit the Home rebuild**

```powershell
git add assets/prototype-v3-app.js assets/prototype-v3-locales.js assets/citizen-shell.css
git commit -m "feat: rebuild home around citizen intents"
```

### Task 5: Responsive and accessibility verification

**Files:**
- Modify: `tests/citizen-workflows.spec.mjs`
- Modify: `assets/citizen-shell.css`

- [ ] **Step 1: Add desktop and mobile layout assertions**

At 1440x900, assert that the sidebar is visible and the intent controls do not overlap. At 375x812, assert that the sidebar is hidden, all four intents fit the viewport width, and the page has no horizontal overflow.

- [ ] **Step 2: Add keyboard and accessible-name checks**

Tab through the Home controls, verify visible focus, and assert names for language, accessibility, menu, assisted mode, and all four intents.

- [ ] **Step 3: Correct only failures found by the checks**

Keep fixes inside `assets/citizen-shell.css` or the Phase 1 shell markup. Do not restyle Help, Case, Courts, Documents, or Workspace in this task.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`

Expected: all static and Playwright tests pass.

- [ ] **Step 5: Inspect with Chrome DevTools**

Check Home at 1440x900, 1024x768, and 375x812. Confirm no console errors, clipped text, duplicate navigation, inaccessible controls, or layout shift.

- [ ] **Step 6: Commit verification fixes**

```powershell
git add tests/citizen-workflows.spec.mjs assets/citizen-shell.css assets/prototype-v3-app.js
git commit -m "test: verify responsive citizen home shell"
```

### Task 6: Record the checkpoint

**Files:**
- Modify: `.agent/PROGRESSIVE_REBUILD_MEMORY.md`

- [ ] **Step 1: Record exact verification evidence**

Update the memory ledger with the final commit IDs, test count, viewport checks, modified files, and known limitations. Set the next action to the Help-page progressive replacement.

- [ ] **Step 2: Confirm repository scope**

Run: `git status --short`

Expected: only pre-existing unrelated user files remain modified or untracked. `assets/openai-civic-layer.js` remains untouched.

- [ ] **Step 3: Commit the checkpoint**

```powershell
git add .agent/PROGRESSIVE_REBUILD_MEMORY.md
git commit -m "docs: record Phase 1 rebuild checkpoint"
```

## Completion criteria

- Home communicates the citizen-first purpose in the first viewport.
- Four starting intents are distinct, localized, keyboard accessible, and correctly routed.
- “Use for someone you know” remains available without dominating the page.
- Desktop has a coherent collapsible navigation model; mobile has one clear navigation model.
- Existing non-Home routes and mechanics remain usable.
- No OpenAI key enters the frontend. Later mechanics will call an origin-restricted Cloudflare Worker using an encrypted `OPENAI_API_KEY` secret and a server-configured model.
- The full local test suite passes and Chrome inspection finds no blocking UI defect.
