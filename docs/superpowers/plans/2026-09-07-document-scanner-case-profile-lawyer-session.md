# Document Scanner, Case Matching, and Lawyer Demo Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:subagent-driven-development (recommended) or superjawn:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing scanner stateful and unambiguous, match successful analysis to a local synthetic case repository, let users explicitly apply derived details to the case screen, and add a clearly labeled prototype-only lawyer session.

**Architecture:** Keep the current static HTML shell and `assets/prototype-v3-app.js` as the application entry point. Add a focused local repository module for synthetic case lookup, keep scanner/request state in the existing app state, and keep derived scan context separate from the synthetic case record. The Worker upload and response contract remains unchanged; the browser owns matching, review, and session-only application.

**Tech Stack:** Vanilla JavaScript, existing HTML template rendering, existing CSS files, local synthetic data, Playwright browser tests, Node static tests. No new dependency.

---

## File map

- Create: `assets/synthetic-case-repository.js` — local synthetic case records plus exact/ambiguous/no-match lookup helpers. Exposes `window.ECOURTS_CASE_REPOSITORY`.
- Modify: `index.html:28-32` — load the repository before `prototype-v3-app.js`.
- Modify: `assets/prototype-v3-app.js:1-220` — add scanner/session/case-derived state and repository access.
- Modify: `assets/prototype-v3-app.js:1290-1360` — make existing scanner rendering and request handling state-machine driven.
- Modify: `assets/prototype-v3-app.js:439-444` and case enhancement helpers — render matched case context and applied scan details without overwriting synthetic record fields.
- Modify: `assets/prototype-v3-app.js:520-620` — add lawyer demo session modal/badge and session controls using existing overlay patterns.
- Modify: `assets/prototype-v3-app.js:2180-2440` and delegated handlers — wire scanner, case matching, review/apply, sign-in, and sign-out actions.
- Modify: `assets/citizen-shell.css:483-510` plus nearby shared rules — add visible pending/loading/error/match/session styles and reduced-motion behavior.
- Modify: `tests/citizen-workflows.spec.mjs:289-315` — extend scanner tests with pending, duplicate, success, match, and failure flows.
- Modify: `tests/prototype-v3-static.test.mjs` — validate repository loading, synthetic disclosures, state/action strings, and unchanged Worker endpoint contract.
- Modify: `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md` — record the session-only derived scan context and prototype lawyer-session boundary.
- Modify: `.agent/reports/latest.md` only if the repository’s current report format requires a meaningful task entry after verification.

## Task 1: Add the synthetic case repository and static contracts

**Files:**
- Create: `assets/synthetic-case-repository.js`
- Modify: `index.html:28-32`
- Test: `tests/prototype-v3-static.test.mjs`

- [ ] **Step 1: Write the failing static assertions**

Add assertions that `index.html` loads `assets/synthetic-case-repository.js` before `assets/prototype-v3-app.js`, and that the repository source contains the required public API and a synthetic disclosure string.

```js
const index = read("index.html");
const repository = read("assets/synthetic-case-repository.js");
assert(index.indexOf('src="assets/synthetic-case-repository.js') < index.indexOf('src="assets/prototype-v3-app.js'), "case repository must load before app");
assert.match(repository, /window\.ECOURTS_CASE_REPOSITORY/);
assert.match(repository, /SAMPLE DATA|sample case|demo case/i);
assert.match(repository, /findMatches/);
```

- [ ] **Step 2: Run the static test and verify it fails**

Run: `npm run test:static`

Expected: FAIL because the repository file and script tag do not exist.

- [ ] **Step 3: Create the repository module**

Create 100–500 deterministic records without realistic official-looking identifiers. Use a small set of hand-authored records plus deterministic generated variants whose IDs begin with `DEMO-`. Keep the first records useful for browser tests, including `DEMO010002026`, `DEMO-CIV-114-2026`, and a second candidate that shares a party alias but not the case number.

Expose this exact shape:

```js
window.ECOURTS_CASE_REPOSITORY = Object.freeze({
  records,
  findMatches({ caseNumber = "", court = "", parties = [] } = {}) {
    // Return { kind: "exact" | "ambiguous" | "none", records: [...] }.
  },
});
```

Each record must include `id`, `cnr`, `caseNo`, `title`, `court`, `type`, `status`, `parties`, `lawyers`, `dates`, `documents`, `timeline`, `aliases`, and `synthetic: true`.

`findMatches` must normalize case-number punctuation/case, prefer exact `cnr` or `caseNo`, use court only as a confidence aid, return `ambiguous` for multiple party/alias candidates, and return `none` when no reliable candidate exists. It must never invent a record at lookup time.

- [ ] **Step 4: Load the repository before the app**

Add the repository script tag immediately before `prototype-v3-app.js` in `index.html`.

- [ ] **Step 5: Run the static test and verify it passes**

Run: `npm run test:static`

Expected: PASS, with the existing tests unchanged except for the new repository contract assertions.

- [ ] **Step 6: Commit the repository boundary**

```bash
git add assets/synthetic-case-repository.js index.html tests/prototype-v3-static.test.mjs
git commit -m "Add synthetic case repository boundary"
```

## Task 2: Introduce explicit scanner and demo-session state

**Files:**
- Modify: `assets/prototype-v3-app.js:160-220`
- Test: `tests/citizen-workflows.spec.mjs`

- [ ] **Step 1: Add state fields and reset behavior**

Extend the existing state with:

```js
paperScan: {
  status: "ready",
  requestId: 0,
  fileName: "",
  fileSize: 0,
  analysis: null,
  match: null,
  applied: false,
  error: "",
},
lawyerSession: null,
derivedCaseContext: null,
```

Keep `selectedPaperFile` temporary. Reset all three new state areas on the existing reset action and clear `lawyerSession` on sign-out. Do not add them to the existing persisted localStorage payload.

- [ ] **Step 2: Add scanner status helpers**

Implement small local helpers near `paperIntakeCopy()`:

```js
function paperScanBusy() {
  return ["queued", "processing", "checking"].includes(state.paperScan.status);
}

function paperScanStatusLabel() {
  const labels = { ready: "Ready for a paper", selected: "Paper selected", queued: "Waiting to start", processing: "Reading the paper", checking: "Checking extracted details", success: "Analysis ready", error: "Analysis could not be completed" };
  return labels[state.paperScan.status] || labels.ready;
}
```

Ensure these helpers do not change the current localized copy object or Worker contract.

- [ ] **Step 3: Add failing browser assertions for locked pending state**

In `tests/citizen-workflows.spec.mjs`, route the analysis endpoint to a pending response, select a valid file, click analyse, and assert:

```js
await expect(page.locator("#paper-upload")).toBeDisabled();
await expect(page.locator("#paper-camera")).toBeDisabled();
await expect(page.locator(".paper-analyse")).toBeDisabled();
await expect(page.locator("#paper-analysis-status")).toContainText(/Reading|Checking|Waiting/u);
await expect(page.locator("#paper-analysis-result")).toHaveAttribute("aria-busy", "true");
```

- [ ] **Step 4: Run the focused browser test and verify it fails**

Run: `npx playwright test tests/citizen-workflows.spec.mjs -g "scanner|paper|intake"`

Expected: FAIL because the current file controls are not locked and the status element does not exist.

- [ ] **Step 5: Commit the state scaffolding after implementation**

Do not commit until Task 3 wires the state into the scanner; this step only defines the state contract used by the next task.

## Task 3: Make the existing scanner request lifecycle reliable

**Files:**
- Modify: `assets/prototype-v3-app.js:1290-1360`
- Modify: `assets/prototype-v3-app.js:2525-2550`
- Modify: `assets/citizen-shell.css:487-510`
- Test: `tests/citizen-workflows.spec.mjs`

- [ ] **Step 1: Render a status region and keep selected file information**

Update `paperIntakeMarkup()` to include:

```html
<div id="paper-analysis-status" class="paper-analysis-status" role="status" aria-live="polite">
  <span class="paper-status-label">Ready for a paper</span>
</div>
```

Render the current `state.paperScan.fileName`, formatted size, and status. Keep the existing input IDs and accepted MIME types unchanged.

- [ ] **Step 2: Lock controls in one helper**

Add a helper that sets `disabled` on `#paper-upload`, `#paper-camera`, and `.paper-analyse` according to `paperScanBusy()` and file validity. Use a `<fieldset>` only if it preserves the current label/button styling; otherwise set the three controls directly so native disabled semantics remain clear.

- [ ] **Step 3: Guard submission with a request token**

At the start of `analyseSelectedPaper(control)`, return when a scan is already busy or no file is selected. Increment `state.paperScan.requestId`, capture the local request ID, set `queued`, then `processing`. Before applying a response or error, compare the captured ID with `state.paperScan.requestId`; ignore stale responses. Set `checking` before rendering the result. In `finally`, restore controls only if the request is still current.

The fetch call must remain:

```js
body.append("paper", selectedPaperFile);
body.append("language", state.prefs.lang);
fetch(endpoint, { method: "POST", body });
```

Do not add credentials, raw document chat context, or a new endpoint.

- [ ] **Step 4: Render honest failure and retry states**

On missing endpoint, invalid response, HTTP error, network failure, or malformed JSON, set `error`, clear analysis/match/application state, retain the selected filename, and show the current honest unavailable/failure copy plus a `Try again` action. Do not show a synthetic analysis.

- [ ] **Step 5: Add the loading animation and reduced-motion CSS**

Add a compact spinner using a border-based element or pseudo-element, a pending background, and visible state text. Add:

```css
@media (prefers-reduced-motion: reduce) {
  .citizen-ui .paper-analysis-status.is-busy::after {
    animation: none;
  }
}
```

The animation must not be the only indication of progress.

- [ ] **Step 6: Run the focused browser test**

Run: `npx playwright test tests/citizen-workflows.spec.mjs -g "scanner|paper|intake"`

Expected: PASS for selection, pending lock, duplicate-click prevention, missing endpoint, invalid type, and retry behavior.

- [ ] **Step 7: Commit the scanner reliability fix**

```bash
git add assets/prototype-v3-app.js assets/citizen-shell.css tests/citizen-workflows.spec.mjs
git commit -m "Fix document scanner pending states"
```

## Task 4: Add scan-to-case matching and explicit apply flow

**Files:**
- Modify: `assets/prototype-v3-app.js:1300-1360,439-444,1816-1846,2240-2440`
- Modify: `assets/citizen-shell.css:159-175` and case-context styles nearby
- Test: `tests/citizen-workflows.spec.mjs`

- [ ] **Step 1: Write the matching-result browser tests**

Mock the Worker response with an analysis whose `case_number` is `DEMO010002026`, then assert:

```js
await expect(page.locator("#paper-case-match")).toContainText("matching sample case");
await expect(page.locator("[data-action='open-matched-case']")).toBeVisible();
await expect(page.locator(".derived-case-context")).toHaveCount(0);
```

Click `open-matched-case`, assert the case route and synthetic disclosure, then assert that derived context still does not appear until the explicit review/apply action.

- [ ] **Step 2: Add exact/ambiguous/no-match rendering**

After a successful Worker response, call `window.ECOURTS_CASE_REPOSITORY.findMatches({ caseNumber: data.case_number, court: data.court, parties: data.parties })` and store the returned match in `state.paperScan.match`. Render:

- `exact`: one matching sample case and `Open case`;
- `ambiguous`: candidate list with `Select this sample case` actions;
- `none`: honest “No matching sample case found” message and no open-case action.

Escape all returned analysis and repository values using the existing helper path.

- [ ] **Step 3: Add open/review/apply actions**

Implement `open-matched-case` to set `state.selected` to the repository record CNR and navigate to the existing `case` route. Implement `review-paper-apply` to require the selected match and a lawyer session when the action is rendered inside the lawyer-only panel; otherwise allow the citizen review action if the existing prototype permits citizen use. Store only:

```js
state.derivedCaseContext = {
  source: "uploaded-paper-analysis",
  recordId: match.id,
  analysis: sanitizedAnalysis,
  appliedAt: new Date().toISOString(),
};
state.paperScan.applied = true;
```

Do not persist this state and do not mutate `sample.status`, `sample.next`, `sample.lawyers`, or the official record text.

- [ ] **Step 4: Render derived context on the case page**

Add a section after the primary case explanation or in the document rail:

```html
<section class="derived-case-context" aria-labelledby="derived-case-context-title">
  <p class="kicker">From scanned paper · prototype analysis</p>
  <h2 id="derived-case-context-title">Details found in this paper</h2>
  <!-- escaped document type, dates, parties, summary, confidence, verification items -->
</section>
```

Keep it visually distinct from the synthetic record and show the verification boundary.

- [ ] **Step 5: Test ambiguous and no-match outcomes**

Add browser cases for a non-matching case number and a party-alias response that produces multiple candidates. Assert no silent route or mutation occurs for either outcome.

- [ ] **Step 6: Run the focused case/document tests**

Run: `npx playwright test tests/citizen-workflows.spec.mjs tests/guided-redesign.spec.mjs -g "paper|document|case"`

Expected: PASS for existing document tests plus new scan-to-case behaviors.

- [ ] **Step 7: Commit the scan-to-case flow**

```bash
git add assets/prototype-v3-app.js assets/citizen-shell.css tests/citizen-workflows.spec.mjs
git commit -m "Match scanned papers to synthetic cases"
```

## Task 5: Add the local lawyer demo session

**Files:**
- Modify: `assets/prototype-v3-app.js:520-620,1889-1905,2240-2440`
- Modify: `assets/citizen-shell.css` near modal/session styles
- Test: `tests/citizen-workflows.spec.mjs`

- [ ] **Step 1: Write the failing session-flow test**

Assert that the documents/professional context exposes `Lawyer demo session`, opens a modal, enters a clearly labeled demo session, shows a session badge and sign-out action, and clears the badge after sign-out.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx playwright test tests/citizen-workflows.spec.mjs -g "lawyer|professional|session"`

Expected: FAIL because the current advocate modal only routes to Documents and does not create a session.

- [ ] **Step 3: Implement the modal using existing overlay behavior**

Add a `lawyer-login` modal branch with a one-click `Enter demo session` action and copy that explicitly says:

`Build What Moves India prototype session. This does not verify advocate identity or provide production access.`

Set:

```js
state.lawyerSession = {
  role: "lawyer",
  label: "Demo lawyer session",
  startedAt: new Date().toISOString(),
};
```

Do not collect or store a real email, password, mobile number, OTP, or advocate enrollment number.

- [ ] **Step 4: Add badge/sign-out rendering**

Render the session badge in the existing navigation or documents workspace, add `data-action="lawyer-signout"`, and ensure sign-out clears only `lawyerSession` and does not delete the selected synthetic case or unrelated preferences.

- [ ] **Step 5: Gate lawyer-specific apply controls**

If the scan review panel is presented as professional-only, show the apply control only when `state.lawyerSession` is present; otherwise show a calm prompt to enter the demo session. Do not claim this is authorization.

- [ ] **Step 6: Run the session tests**

Run: `npx playwright test tests/citizen-workflows.spec.mjs -g "lawyer|professional|session"`

Expected: PASS, including sign-out and page refresh behavior showing that the session is not persisted.

- [ ] **Step 7: Commit the demo session**

```bash
git add assets/prototype-v3-app.js assets/citizen-shell.css tests/citizen-workflows.spec.mjs
git commit -m "Add prototype lawyer demo session"
```

## Task 6: Update audit notes and run the full verification set

**Files:**
- Modify: `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`
- Modify: `.agent/reports/latest.md` only when the existing report has an appropriate current-work section
- Test: `tests/prototype-v3-static.test.mjs`, `tests/citizen-workflows.spec.mjs`, `tests/guided-redesign.spec.mjs`, full npm scripts

- [ ] **Step 1: Record the new privacy and prototype boundary**

Document that raw uploads remain temporary, derived analysis remains in memory, the local case repository is synthetic, and lawyer access is a demo session rather than authentication or authorization.

- [ ] **Step 2: Run static and Worker tests**

Run: `npm run test:static`

Expected: PASS.

Run: `npm run test:worker`

Expected: PASS, with no Worker contract changes.

- [ ] **Step 3: Run the affected browser tests**

Run: `npx playwright test tests/citizen-workflows.spec.mjs tests/guided-redesign.spec.mjs`

Expected: PASS with no console/runtime errors and no horizontal overflow at the existing mobile/desktop viewports.

- [ ] **Step 4: Run the full test command**

Run: `npm test`

Expected: PASS for static, Worker, and browser suites. If a check cannot run because the external analysis Worker is unavailable, use route interception in tests and record the limitation; do not call a paid endpoint from automated tests.

- [ ] **Step 5: Perform manual accessibility checks**

Using the browser test or a manual local run, verify keyboard access to file selection, analyse, status, match/open, review/apply, lawyer sign-in, and sign-out. Confirm visible focus, `aria-live` status changes, reduced-motion behavior, and no horizontal overflow at 360px and 1440px widths.

- [ ] **Step 6: Commit verification documentation**

```bash
git add docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md .agent/reports/latest.md
git commit -m "Document scanner and demo session boundaries"
```

## Self-review checklist

- [ ] Scanner state model covers ready, selected, queued, processing, checking, success, and error.
- [ ] File inputs and analyse action are locked while a request is active.
- [ ] Request tokens prevent late responses from mutating current UI.
- [ ] Existing Worker `FormData` and `{ analysis }` contract is unchanged.
- [ ] Local repository has synthetic disclosure and exact/ambiguous/no-match behavior.
- [ ] Matching case can be opened before any derived details are applied.
- [ ] Derived details require explicit apply and remain visually provisional.
- [ ] Lawyer session is local/demo-only and not persisted or sent to the Worker.
- [ ] Tests cover desktop/mobile, keyboard, error, duplicate, match, no-match, and session boundaries.
- [ ] Existing untracked user files are not staged accidentally.

