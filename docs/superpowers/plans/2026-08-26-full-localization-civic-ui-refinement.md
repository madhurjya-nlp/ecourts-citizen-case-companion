# Full Localisation and Civic UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:subagent-driven-development (recommended) or superjawn:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a direct-open eCourts hackathon prototype whose complete interface works in English, Assamese and Hindi, with a stronger masthead, Finder, Help experience, and case workspace.

**Architecture:** Keep `prototype-v3.html` as the user-facing entry point, but replace its layered inline overrides with three focused local assets: one stylesheet, one validated localisation/content module, and one application module. Stable IDs remain language-neutral; the renderer resolves interface copy through a nested locale schema, Help uses replaceable in-memory repository/ranking interfaces, and synthetic record identity plus English legal-draft output remain explicitly outside translation.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test modules, localStorage for preferences only, Playwright CLI for browser verification.

---

## File Structure

- Modify `prototype-v3.html`: retain the document shell and load the extracted local assets in a deterministic order.
- Create `assets/prototype-v3.css`: all base, component, responsive, high-contrast, reduced-motion, multilingual, and RTL styles.
- Create `assets/prototype-v3-locales.js`: language metadata, nested locale packs, FAQ translations, glossary translations, document-form translations, and locale validation metadata.
- Create `assets/prototype-v3-app.js`: state, rendering, synthetic data, document draft/PDF logic, Help repository/ranker, delegated interactions, and accessibility behavior.
- Create `tests/prototype-v3-static.test.mjs`: dependency-free locale-schema, script-syntax, HTML-wiring, and legacy-hard-coded-copy checks.
- Update `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`: record the final localisation boundary, local Help behavior, RTL behavior, PDF boundary, and verified flows.
- Write retained screenshots to `output/playwright/`; do not add build output or runtime dependencies.

This folder is not a Git repository. Each task ends with a static or browser checkpoint instead of a commit command.

### Task 1: Add Failing Structural and Locale-Coverage Tests

**Files:**
- Create: `tests/prototype-v3-static.test.mjs`
- Inspect: `prototype-v3.html`

- [ ] **Step 1: Write the static test harness**

Create a Node test using only built-in modules. It must require the final asset wiring, parse both JavaScript files, evaluate the locale module in an isolated `window` context, compare every locale pack with English, and reject known route copy left in the application module.

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testsDir, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const html = read('prototype-v3.html');

for (const asset of ['assets/prototype-v3.css', 'assets/prototype-v3-locales.js', 'assets/prototype-v3-app.js']) {
  assert.match(html, new RegExp(asset.replaceAll('.', '\\.'), 'u'), `prototype-v3.html must load ${asset}`);
}

const localeSource = read('assets/prototype-v3-locales.js');
const appSource = read('assets/prototype-v3-app.js');
new Function(localeSource);
new Function(appSource);

const context = vm.createContext({window: {}});
vm.runInContext(localeSource, context);
const i18n = context.window.ECOURTS_I18N;
assert.ok(i18n, 'locale module must expose window.ECOURTS_I18N');

const expectedCodes = ['en', 'hi', 'as', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'ta', 'te', 'ur', 'ne', 'kok', 'mni', 'brx', 'ks'];
assert.deepEqual(Object.keys(i18n.languages), expectedCodes);
assert.deepEqual([...i18n.rtlLanguages].sort(), ['ks', 'ur']);

function leafPaths(value, prefix = '') {
  if (Array.isArray(value)) return value.flatMap((entry, index) => leafPaths(entry, `${prefix}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.keys(value).flatMap(key => leafPaths(value[key], prefix ? `${prefix}.${key}` : key));
  }
  assert.equal(typeof value, 'string', `${prefix} must be a string leaf`);
  assert.ok(value.trim(), `${prefix} must not be blank`);
  return [prefix];
}

const englishPaths = leafPaths(i18n.packs.en).sort();
for (const code of expectedCodes) {
  assert.deepEqual(leafPaths(i18n.packs[code]).sort(), englishPaths, `${code} must match the English locale schema`);
}

for (const route of ['home', 'finder', 'documents', 'help', 'case']) {
  assert.ok(englishPaths.some(key => key.startsWith(`${route}.`)), `missing ${route} locale section`);
}

for (const forbidden of [
  'Find a case with what you have.',
  'Help and court information.',
  'Search synthetic record',
  'Need support?',
  'Open eCourts Services'
]) {
  assert.ok(!appSource.includes(forbidden), `move interface copy to locale packs: ${forbidden}`);
}

console.log(`static pass: ${expectedCodes.length} complete locale packs, ${englishPaths.length} translated leaves`);
```

- [ ] **Step 2: Run the test and confirm the structural baseline fails**

Run from the project root:

```powershell
node tests/prototype-v3-static.test.mjs
```

Expected: failure because the extracted assets do not exist yet. This confirms the test detects the current single-file architecture.

- [ ] **Step 3: Record the pre-change visual baseline**

Open `prototype-v3.html` at 1440x900 and 375x812 and retain screenshots only when they clarify a before/after regression. Confirm the current known problems: partial language switching, pale Finder/result surfaces, Help split tools grid, and Case history below the reading column.

### Task 2: Extract the Prototype into Stable Local Assets

**Files:**
- Modify: `prototype-v3.html:1-102`
- Create: `assets/prototype-v3.css`
- Create: `assets/prototype-v3-locales.js`
- Create: `assets/prototype-v3-app.js`

- [ ] **Step 1: Reduce the HTML file to the semantic shell**

Keep the existing favicon and hero bitmap. Replace inline CSS and both inline scripts with ordered local assets. Use this body structure so footer and masthead strings can be rendered by the application rather than remaining hard-coded:

```html
<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>eCourts | Citizen case companion</title>
  <link rel="icon" href="assets/civic-court-paper-hero.png">
  <link rel="stylesheet" href="assets/prototype-v3.css">
  <script defer src="assets/prototype-v3-locales.js"></script>
  <script defer src="assets/prototype-v3-app.js"></script>
</head>
<body>
  <div class="tri" aria-hidden="true"></div>
  <header id="masthead"></header>
  <main class="shell" id="app"></main>
  <footer class="shell footer" id="footer"></footer>
  <div id="overlay"></div>
  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
</body>
</html>
```

- [ ] **Step 2: Move existing styles without redesigning yet**

Copy the current style rules into `assets/prototype-v3.css`, preserving behavior before visual changes. Consolidate repeated media queries, but do not alter class names until the related route task. Add this multilingual base immediately:

```css
:root {
  --body-font: "Nirmala UI", "Segoe UI Variable Text", "Noto Sans", system-ui, sans-serif;
  --display-font: "DM Serif Display", Georgia, serif;
}

html { text-size-adjust: 100%; }
body { font-family: var(--body-font); font-weight: 400; }
html:not([lang="en"]) .display,
html:not([lang="en"]) h1,
html:not([lang="en"]) h2 { font-family: var(--body-font); font-weight: 500; }
[dir="rtl"] .record-value,
[dir="rtl"] [data-record-id] { direction: ltr; unicode-bidi: isolate; text-align: start; }
```

- [ ] **Step 3: Consolidate JavaScript into one application module**

Move current state, synthetic data, document templates, draft/PDF generation, Help data relationships, route renderers, and event delegation into `assets/prototype-v3-app.js`. Remove the old duplicated `home`, `nav`, `render`, and `supportPage` definitions instead of preserving overrides. Keep one `render()` and one delegated handler per event type.

- [ ] **Step 4: Add the locale module contract**

Start `assets/prototype-v3-locales.js` with an immutable global payload:

```js
(() => {
  const languages = {
    en: 'English', hi: 'हिन्दी', as: 'অসমীয়া', bn: 'বাংলা', gu: 'ગુજરાતી',
    kn: 'ಕನ್ನಡ', ml: 'മലയാളം', mr: 'मराठी', or: 'ଓଡ଼ିଆ', pa: 'ਪੰਜਾਬੀ',
    ta: 'தமிழ்', te: 'తెలుగు', ur: 'اردو', ne: 'नेपाली', kok: 'कोंकणी',
    mni: 'মৈতৈলোন্', brx: 'बड़ो', ks: 'کٲشُر'
  };
  const rtlLanguages = ['ur', 'ks'];
  const packs = {en: {}};
  window.ECOURTS_I18N = Object.freeze({languages, rtlLanguages, packs});
})();
```

- [ ] **Step 5: Run extraction checks**

Run:

```powershell
node -e "const fs=require('fs');for(const f of ['assets/prototype-v3-locales.js','assets/prototype-v3-app.js'])new Function(fs.readFileSync(f,'utf8'));console.log('syntax pass')"
node tests/prototype-v3-static.test.mjs
```

Expected: syntax passes; the static test now fails only because locale packs and hard-coded route copy are not complete.

### Task 3: Build and Validate the Complete Three-Language Content Schema

**Files:**
- Modify: `assets/prototype-v3-locales.js`
- Modify: `assets/prototype-v3-app.js`
- Modify: `tests/prototype-v3-static.test.mjs`

- [ ] **Step 1: Define English as the exact schema source**

Create these top-level sections in `packs.en`; every visible string must live under one of them:

```js
const en = {
  shared: {
    brandDescriptor: 'Citizen services',
    nav: {home: 'Home', finder: 'Find a case', documents: 'Documents', help: 'Help', workspace: 'My workspace'},
    actions: {close: 'Close', view: 'View', clear: 'Clear', continue: 'Continue', download: 'Download'},
    accessibility: {}, languageDialog: {}, menu: {}, footer: {}, prototype: {}, validation: {}, toasts: {}
  },
  home: {},
  finder: {tabs: {}, fields: {}, result: {}, errors: {}},
  documents: {templates: {}, form: {}, preview: {}, pdfBoundary: {}},
  help: {services: {}, search: {}, suggestions: {}, portal: {}, practical: {}, faqs: {}},
  case: {identity: {}, agenda: {}, record: {}, documents: {}, history: {}, support: {}},
  glossary: {}
};
```

Populate every object with the current approved copy. Keep stable field names and FAQ IDs in English even when their values are translated.

- [ ] **Step 2: Separate invariant record and source data from translatable content**

Keep these values in `prototype-v3-app.js`, outside the locale packs:

```js
const sample = {
  cnr: 'DEMO010002026',
  caseNo: 'CIV/114/2026',
  party: 'Meera Iyer',
  title: 'Meera Iyer v. R. K. Builders',
  court: 'Bengaluru City Civil Court',
  next: '14 September 2026',
  lawyers: {petitioner: 'Adv. Asha Rao', respondent: 'Adv. Imran Khan'}
};

const helpSources = {
  portalFaq: {label: 'eCourts app guide', url: 'https://services.ecourts.gov.in/App/apphelp.html'},
  legalAid: {label: 'Department of Justice: legal aid', url: 'https://doj.gov.in/national-legal-services-authority/'},
  teleLaw: {label: 'Department of Justice: Tele-Law', url: 'https://doj.gov.in/tele-law-mobile-app/'}
};
```

Source labels may remain official titles. Translate adjacent `opens in a new tab` accessibility text.

- [ ] **Step 3: Add a path-based translation resolver**

Use one resolver throughout the renderer. It supports interpolation, reports missing development keys, and preserves an English runtime fallback:

```js
function getPath(object, path) {
  return path.split('.').reduce((value, key) => value && value[key], object);
}

function tr(path, values = {}) {
  const pack = i18n.packs[state.prefs.lang] || i18n.packs.en;
  const localized = getPath(pack, path);
  const fallback = getPath(i18n.packs.en, path);
  const value = typeof localized === 'string' ? localized : fallback;
  if (typeof value !== 'string') throw new Error(`Missing locale key: ${path}`);
  return value.replace(/\{(\w+)\}/gu, (_, key) => String(values[key] ?? `{${key}}`));
}
```

- [ ] **Step 4: Populate the Assamese and Hindi packs**

Add complete packs for `as` and `hi`. Reuse matching translations from `prototype.html`; translate V3-only body copy, all 15 FAQ questions and answers, glossary meanings, form prompts, validation messages, OTP simulation copy, and toasts. Do not transliterate proper names, CNRs, case numbers, court names, URLs, Tele-Law, or English draft prose.

- [ ] **Step 5: Mark the review boundary in every locale**

Each pack must include localized versions of these two boundaries:

```js
prototype: {
  translationNotice: 'Prototype translation; review by native-language and legal experts is pending.',
  recordValues: 'Names and record values are shown as filed.'
},
documents: {
  pdfBoundary: {notice: 'The generated legal draft and downloaded PDF remain in English in this prototype.'}
}
```

- [ ] **Step 6: Extend locale tests for critical content counts**

Add assertions:

```js
for (const code of expectedCodes) {
  const pack = i18n.packs[code];
  assert.equal(Object.keys(pack.help.faqs).length, 15, `${code} must translate 15 FAQs`);
  assert.equal(Object.keys(pack.documents.templates).length, 7, `${code} must translate 7 document templates`);
  assert.equal(Object.keys(pack.glossary).length, 5, `${code} must translate 5 glossary terms`);
}
```

- [ ] **Step 7: Run locale coverage tests**

Run:

```powershell
node tests/prototype-v3-static.test.mjs
```

Expected: schema and count assertions pass. The forbidden-copy checks may still fail until Tasks 4-8 replace route strings.

### Task 4: Implement the Localised Civic Masthead and Shared Dialogs

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3.css`

- [ ] **Step 1: Apply language metadata before rendering**

Update preferences with both language and direction:

```js
function applyPreferences() {
  const code = i18n.languages[state.prefs.lang] ? state.prefs.lang : 'en';
  document.documentElement.lang = code;
  document.documentElement.dir = i18n.rtlLanguages.includes(code) ? 'rtl' : 'ltr';
  document.body.classList.toggle('high', state.prefs.contrast);
  document.body.classList.toggle('large', state.prefs.large);
  document.body.classList.toggle('reduce', state.prefs.reduce);
}
```

- [ ] **Step 2: Render one compact civic masthead**

Render a dark navy full-width header containing the original non-official geometric mark, `eCourts`, localized `Citizen services`, localized primary navigation, language state, accessibility icon control, and a real mobile menu control. Do not add an Indian emblem or official-government claim.

- [ ] **Step 3: Replace shared hard-coded strings**

Translate language dialog, accessibility settings, mobile menu, footer, reset action, signup name/mobile step, clearly labeled simulated OTP step, workspace preferences step, glossary modal, document modal, validation messages, and toast messages through `tr()`.

- [ ] **Step 4: Add direction-safe logical CSS**

Use `margin-inline`, `padding-inline`, `border-inline-start`, `inset-inline-end`, and `text-align:start` in directional components. Keep record identifiers isolated with `.record-value`. Ensure menu, focus outlines, controls, and labels wrap at 320px without overlap.

- [ ] **Step 5: Verify shared UI in LTR and RTL**

Open Home in English, Assamese and Hindi. Open language, accessibility, mobile menu, glossary, and OTP dialogs. Expected: every shared label changes language while CNR/mobile/OTP inputs remain LTR.

### Task 5: Redesign Finder and Enrich the Synthetic Result

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3.css`

- [ ] **Step 1: Render the approved Finder search workspace**

Use a white surface with a navy top rule, restrained shadow, increased internal spacing, and a primary input at least 56px high on desktop and 52px on mobile. Keep tab buttons keyboard-operable and scroll only the tab row on narrow screens.

- [ ] **Step 2: Keep glossary controls out of form submission**

Every term trigger inside Finder must use:

```html
<button type="button" class="term" data-term="cnr">CNR</button>
```

The primary Finder form owns Enter submission. No modal or term button may be the implicit submit target.

- [ ] **Step 3: Render a structured case result**

On a match, render a case-result article with invariant title/court/CNR and localized metadata labels and values:

```js
const resultRows = [
  [tr('finder.result.caseType'), tr('finder.result.caseTypeValue')],
  [tr('finder.result.status'), tr('finder.result.statusValue')],
  [tr('finder.result.petitionerLawyer'), `${sample.lawyers.petitioner} (${tr('shared.prototype.synthetic')})`],
  [tr('finder.result.respondentLawyer'), `${sample.lawyers.respondent} (${tr('shared.prototype.synthetic')})`]
];
```

Use a semantic `<dl>` and one high-contrast localized `Open synthetic record` command. Do not use chips.

- [ ] **Step 4: Preserve validation paths**

Translate empty and no-match states. Search by CNR, case number, and party name; keep paper matching synthetic and explicit. `Use sample case` stays visually secondary.

- [ ] **Step 5: Verify Finder behavior**

For English, Assamese and Hindi:

1. Search `DEMO010002026` by pressing Enter.
2. Confirm no CNR explanation modal opens.
3. Confirm title, court, CNR, case type, status, and both synthetic lawyer entries render.
4. Open the result and confirm Case route navigation.
5. Submit blank and wrong values and confirm translated errors.

### Task 6: Rebuild Help Around a Local Repository and Suggestion Engine

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3.css`

- [ ] **Step 1: Implement replaceable local interfaces**

Keep the prototype deterministic and honest:

```js
class InMemoryHelpRepository {
  records(locale) {
    const faqs = i18n.packs[locale]?.help.faqs || i18n.packs.en.help.faqs;
    return Object.entries(faqs).map(([id, content]) => ({id, ...content, ...helpGraph[id]}));
  }
  search(query, locale) {
    const tokens = normalizeHelp(query, locale);
    if (!tokens.length) return this.records(locale);
    return this.records(locale).filter(record => {
      const words = normalizeHelp([record.question, record.answer, ...record.tags].join(' '), locale);
      return tokens.every(token => words.some(word => word.includes(token)));
    });
  }
}

class DeterministicSuggestionEngine {
  rank({query, openedIds, locale, records}) {
    return rankHelpRecords({query, openedIds, locale, records}).slice(0, 3).map(record => record.id);
  }
}
```

- [ ] **Step 2: Remove the unwanted top action**

Do not render `Open eCourts Services`. Retain only official free-legal-aid and Tele-Law links with `target="_blank"` and `rel="noopener noreferrer"`.

- [ ] **Step 3: Redesign the search and suggestions**

Render one full-width natural-language search input at least 58px high. Place Smart Suggestions in a separate horizontal rail below it with a short localized session-only privacy note. Use white surfaces, navy structure, saffron/green section rules, and purposeful spacing; remove the pale split tools box.

- [ ] **Step 4: Redesign the two FAQ bases**

Use an asymmetric desktop grid, `minmax(0,1.08fr) minmax(0,.92fr)`, with separate section identities and native `<details>/<summary>`. Mobile stacks Portal first and Practical Information second. Translate all 15 FAQ questions, answers, empty states, source-link accessibility copy, count labels, disclosure, and general-information boundary.

- [ ] **Step 5: Preserve Help privacy and accessibility**

Keep query/opened/suggestion state in memory only. Do not call `persist()` for Help interactions. Allow one open FAQ per knowledge base, update suggestions without replacing focus, and honor reduced motion when scrolling to a suggested answer.

- [ ] **Step 6: Verify Help behavior in all languages**

For English, Assamese and Hindi, open Help, search a localized word from one FAQ tag list, open a result, activate a suggestion, clear search, and inspect localStorage. Expected: no Help query/history keys are persisted and no mixed-language Help interface remains outside declared proper/source names.

### Task 7: Recompose the Case Workspace

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3.css`

- [ ] **Step 1: Render explicit desktop columns**

Use this semantic order in the DOM so mobile remains logical:

```html
<div class="case-grid">
  <div class="case-main">
    <section class="agenda-block"></section>
    <section class="record-block"></section>
  </div>
  <aside class="case-rail">
    <section class="documents-block"></section>
    <section class="history-block"></section>
    <button class="btn primary case-help" data-go="help"></button>
  </aside>
</div>
```

- [ ] **Step 2: Strengthen the reading surface**

Give `record-block` a white surface, navy top rule, subtle shadow, and increased padding. Render official record, plain-language explanation, and verification as three clearly labeled layers with navy, green, and saffron identifiers and high-contrast text. Avoid nested card styling.

- [ ] **Step 3: Move Case history into the right rail**

Place history below Documents on desktop and mobile. Include localized timeline titles, descriptions, and status labels. Use compact visible points and dividers without fixed heights.

- [ ] **Step 4: Replace passive support content**

Remove `Need support?` and its explanatory paragraph. Add one full-width localized `Open Help` primary button after history, with a concise screen-reader label explaining that it opens general court and legal-support information.

- [ ] **Step 5: Verify responsive order and contrast**

At 1440x900, confirm reading is the wider left column and Documents/History/Help form the right rail. At 375x812, confirm order is identity, agenda, record, documents, history, Help; no empty fixed-height column remains.

### Task 8: Finish Documents, Home, Glossary, and State Translation

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Modify: `assets/prototype-v3.css`

- [ ] **Step 1: Translate Home without changing its approved product boundary**

Translate hero, primary actions, five task rows, lower information bands, hero alt text, and route labels. Keep the actual citizen-first service screen as the first route; do not add a marketing landing page or a `start without login` message.

- [ ] **Step 2: Translate the Documents interface**

Translate template names/groups/summaries, all form labels/placeholders, review/download/clear actions, privacy notice, safety note, draft status labels, preview empty state, and validation/toast copy. Keep composed legal draft prose, filenames, and PDF output English.

- [ ] **Step 3: Show the localized English-output boundary**

When `state.prefs.lang !== 'en'`, render the pack's `documents.pdfBoundary.notice` above the draft preview and before download. Keep regional-script form values visible on screen; the PDF generator must state that non-ASCII export is not supported rather than silently presenting question marks as valid legal text.

- [ ] **Step 4: Translate all glossary surfaces**

Translate term labels, concise meanings, `Why it matters here`, tooltips, accessible names, and contextual explanations for CNR, interim order, objections, attendance, and filing format. Preserve `CNR` as the official acronym where appropriate.

- [ ] **Step 5: Make persistence language-safe**

Persist only profile name, selected synthetic case, language, and accessibility preferences. Never persist OTP, mobile number, draft form values, Help query/history, or translated rendered HTML. Reset returns to English Home and announces the localized reset message before state replacement where necessary.

- [ ] **Step 6: Run the complete static suite**

Run:

```powershell
node tests/prototype-v3-static.test.mjs
rg -n "Find a case with what you have\.|Help and court information\.|Need support\?|Open eCourts Services" assets/prototype-v3-app.js prototype-v3.html
```

Expected: `static pass: 18 complete locale packs, ... translated leaves`; `rg` returns no matches.

### Task 9: Full Browser, Security, Privacy, and Visual Verification

**Files:**
- Update: `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`
- Create or replace: `output/playwright/home-desktop.png`
- Create or replace: `output/playwright/finder-desktop.png`
- Create or replace: `output/playwright/help-desktop.png`
- Create or replace: `output/playwright/case-desktop.png`
- Create or replace: `output/playwright/home-mobile.png`
- Create or replace: `output/playwright/finder-mobile.png`
- Create or replace: `output/playwright/help-mobile.png`
- Create or replace: `output/playwright/case-mobile.png`

- [ ] **Step 1: Start a local static server**

Run in a hidden window from the project root:

```powershell
Start-Process -FilePath python -ArgumentList '-m','http.server','53280','--bind','127.0.0.1' -WorkingDirectory 'C:\Users\madhu\Downloads\ecourts-v1.9.2-android-safe' -WindowStyle Hidden
```

Expected URL: `http://127.0.0.1:53280/prototype-v3.html`. If port 53280 is occupied, select another free localhost port and use it consistently.

- [ ] **Step 2: Run the three-language route matrix**

For English, Assamese and Hindi, visit Home, Finder, Documents, Help, and Case; open language, accessibility, glossary, document, signup, OTP, and workspace-preference dialogs. Capture console errors and page overflow. Expected: zero errors/warnings, `html[lang]` matches the locale, and no interface-key fallback is observed.

- [ ] **Step 3: Run Finder, Help, and PDF functional checks**

1. Search CNR by Enter and button.
2. Search case number and party name.
3. Test blank and no-match errors.
4. Open each synthetic document `View` action.
5. Download a synthetic record PDF and one generated English draft PDF.
6. Verify each downloaded file begins `%PDF-1.4` and has non-zero size.
7. Search Help, open FAQs, use suggestions, clear search, and verify no Help state in localStorage.

- [ ] **Step 4: Run signup, privacy, and state checks**

Complete the simulated mobile/OTP flow with `318204`, change language/accessibility preferences, reload, and inspect localStorage. Expected: profile and preferences persist; mobile number, OTP, draft answers, and Help activity do not. Reset clears the synthetic workspace and returns Home.

- [ ] **Step 5: Perform visual checks at three viewports**

Check 1440x900, 768x1024, and 375x812. Confirm:

- masthead has strong navy contrast and no text collisions;
- Finder input is prominent and result metadata wraps cleanly;
- Help uses deliberate negative space and distinct search/suggestion/knowledge layers;
- Case reading is wider than the right rail on desktop;
- Documents, history, and Help stack in approved mobile order;
- no horizontal page overflow, clipped controls, nested cards, or blank fixed-height panels.

- [ ] **Step 6: Check accessibility preferences and keyboard flow**

Tab through masthead, Finder tabs/form, Help search/suggestions/details, document forms, and dialogs. Confirm visible focus, Escape closing, modal focus return, high contrast, larger text, and reduced motion. Verify long Hindi and Assamese labels wrap without overlap.

- [ ] **Step 7: Update the audit with observed evidence**

Record the exact verification date, commands, tested URL, browser/viewports, locale matrix result, localStorage keys, PDF byte checks, external-link protections, known prototype translation review boundary, and any residual risks. Do not claim live AI, database, eCourts connectivity, real authentication, or authoritative legal translation.

- [ ] **Step 8: Run the final completion gate**

Run:

```powershell
node tests/prototype-v3-static.test.mjs
Get-ChildItem output/playwright/*-desktop.png,output/playwright/*-mobile.png | Select-Object Name,Length
```

Expected: static test passes; eight current screenshots exist with non-zero byte sizes; browser console and interaction checks from Steps 2-6 are clean.
