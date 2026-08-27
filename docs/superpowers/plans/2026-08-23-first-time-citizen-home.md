# First-Time Citizen Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:subagent-driven-development (recommended) or superjawn:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a no-login public home screen before the synthetic case dashboard in `prototype-v2.html`.

**Architecture:** Keep the standalone HTML/CSS/JS architecture. Add a `home` page section, make it the default active page, update navigation and topbar behavior so profile identity appears only after a case dashboard opens, and route task buttons into existing demo sections.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local Chrome screenshot verification.

---

### Task 1: Add Public Home Route And Layout

**Files:**
- Modify: `C:\Users\madhu\Downloads\ecourts-v1.9.2-android-safe\prototype-v2.html`

- [ ] **Step 1: Add CSS for the public home section**

Add styles for `.homeLayout`, `.homeHeroBlock`, `.taskStartGrid`, `.taskStart`, `.voiceStrip`, `.beforeStart`, `.homeActions`, and `.anonIdentity`. These styles must use existing variables, 8px radius, visible borders, high contrast text, and responsive single-column behavior under `980px`.

- [ ] **Step 2: Add `Home` to primary navigation**

Change the first nav item from dashboard-first to:

```html
<button class="active" data-page="home">Home</button>
<button data-page="dashboard">Dashboard</button>
```

- [ ] **Step 3: Change topbar identity to anonymous start state**

Replace the default avatar/name with:

```html
<div class="identity anonIdentity" id="topIdentity">
  <div class="avatar" id="topAvatar">?</div>
  <div><strong id="topName">Start without login</strong><span id="topSub">Choose a task first. No profile is needed.</span></div>
</div>
```

- [ ] **Step 4: Add the `home` section before `dashboard`**

Add:

```html
<section class="page active" id="home">
  ...
</section>
```

The page must include:

- "No profile needed" eyebrow.
- Heading: "What do you need to do about your case?"
- Four buttons: `Find my case`, `Read a court paper`, `Check next date`, `Get legal help`.
- Secondary buttons: `Try demo dashboard`, `Create demo space`.
- Voice strip.
- Before-you-start panel with CNR, court paper, party name, hearing date, case type/court name.
- Hackathon-safe disclaimer that no real court system, OTP, payment, upload, or account is used.

- [ ] **Step 5: Make `dashboard` inactive by default**

Change:

```html
<section class="page active" id="dashboard">
```

to:

```html
<section class="page" id="dashboard">
```

### Task 2: Wire Interactions

**Files:**
- Modify: `C:\Users\madhu\Downloads\ecourts-v1.9.2-android-safe\prototype-v2.html`

- [ ] **Step 1: Add dashboard-open state**

Add:

```js
let caseOpened = false;
```

- [ ] **Step 2: Update `nav(page)`**

Make `nav` update active pages, nav buttons, and topbar display. If `page === "home"` and `caseOpened === false`, show the anonymous identity. If dashboard or a selected case opens, show the current synthetic case identity.

- [ ] **Step 3: Update `selectCase(key)`**

Set `caseOpened = true` before rendering and navigating:

```js
caseOpened = true;
current = key;
render();
nav("dashboard");
```

- [ ] **Step 4: Wire public home buttons**

Add handlers:

```js
$("#homeFindCase").onclick = () => nav("cases");
$("#homeReadPaper").onclick = () => { nav("cases"); showToast("Use a court paper or CNR in this demo route"); };
$("#homeCheckDate").onclick = () => selectCase(current);
$("#homeLegalHelp").onclick = () => nav("lawyers");
$("#homeTryDemo").onclick = () => selectCase("property");
$("#homeCreateSpace").onclick = () => nav("signup");
$("#homeVoice").onclick = () => showToast("Voice intent is simulated in this hackathon prototype");
```

- [ ] **Step 5: Update mobile menu order**

Change the mobile cycling array to:

```js
["home","cases","learn","lawyers","calculators","signup","dashboard"]
```

### Task 3: Update Copy And Verify

**Files:**
- Modify: `C:\Users\madhu\Downloads\ecourts-v1.9.2-android-safe\prototype-v2.html`

- [ ] **Step 1: Update cases page copy**

Make the cases page clearly support no-login start:

```html
<h1>Find or open a synthetic case</h1>
<p>Use a demo case when available, or continue from a court paper route. No real CNR or court account is requested.</p>
```

- [ ] **Step 2: Verify static structure**

Run:

```powershell
rg -n "id=\"home\"|homeFindCase|homeTryDemo|Start without login|No profile needed|data-page=\"home\"" prototype-v2.html
```

Expected: matches for the new home section, nav item, and JS handlers.

- [ ] **Step 3: Capture desktop screenshot**

Run Chrome headless at `1365x900` against `file:///C:/Users/madhu/Downloads/ecourts-v1.9.2-android-safe/prototype-v2.html`.

Expected: first viewport shows public home and no Asha Sen identity.

- [ ] **Step 4: Capture mobile screenshot**

Run Chrome headless at `390x844` against the same file.

Expected: first viewport shows public home, task buttons fit, and text does not overlap.

- [ ] **Step 5: Verify task routing with JavaScript**

Use a local browser automation script or DOM-evaluation command to click `Try demo dashboard` and confirm the active page becomes `dashboard`, then reload and click `Get legal help` and confirm active page becomes `lawyers`.

Expected: both routes work without network or login.

## Self-Review

- Spec coverage: this plan covers default public home, optional signup, dashboard handoff, no-profile first state, task buttons, hackathon disclosure, mobile layout, and verification.
- Placeholder scan: no TBD/TODO placeholders are present.
- Type consistency: IDs and function names are defined in the same file and referenced consistently.
