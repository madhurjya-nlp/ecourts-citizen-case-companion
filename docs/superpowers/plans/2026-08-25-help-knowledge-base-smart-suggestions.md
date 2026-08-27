# Help Knowledge Base and Smart Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:subagent-driven-development (recommended) or superjawn:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the passive Help route with two accessible FAQ knowledge bases, working official-service links, cross-section search, and deterministic local next-question suggestions.

**Architecture:** Keep the feature inside the standalone `prototype-v3.html` application. Store FAQ records as structured JavaScript data, derive filtered records and suggestions with pure helper functions, render disclosures with native `<details>` elements, and attach interaction through the existing delegated event handlers. Help-session query and suggestion state remains in memory and is excluded from persistence.

**Tech Stack:** Static HTML, CSS, browser JavaScript, native `<details>/<summary>`, localStorage for existing preferences only, Playwright CLI for browser verification.

---

## File Structure

- Modify `prototype-v3.html`: FAQ data, suggestion scoring, Help rendering, scoped styles, delegated interactions, and transient Help state.
- Update `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`: document the Help query privacy boundary and official-link behavior after verification.
- Use `output/playwright/` only if screenshots are retained; no new test framework or production dependency is added.

This folder is not a Git repository. Each task ends with an explicit syntax or browser checkpoint instead of a commit command.

### Task 1: Add Structured FAQ Data and Pure Suggestion Logic

**Files:**
- Modify: `prototype-v3.html:11-13`

- [ ] **Step 1: Capture the current failing Help baseline**

Run:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=help-kb open http://127.0.0.1:53280/prototype-v3.html
npx --yes --package @playwright/cli playwright-cli -s=help-kb snapshot
```

Expected: Help contains three passive support articles and has no `Search Help`, `Suggested next`, or FAQ disclosures.

- [ ] **Step 2: Extend transient state without changing persisted state**

Add these fields to the initial `state` object:

```js
helpQuery: '',
helpLast: null,
helpSuggestions: ['portal-cnr', 'court-notice', 'legal-aid']
```

Keep `persist()` unchanged so these fields are not written to `localStorage`.

- [ ] **Step 3: Add the FAQ record collection**

Define `helpFaqs` beside the other static content. Use records with this exact shape:

```js
{
  id: 'portal-cnr',
  group: 'portal',
  question: 'What is a CNR and where can I find it?',
  answer: 'A CNR is the 16-character alphanumeric Case Number Record assigned to a case. Enter it without spaces or hyphens. It is commonly shown on case records and court papers.',
  tags: ['cnr', 'case number record', 'find case', 'search'],
  related: ['portal-no-cnr', 'portal-status', 'portal-orders'],
  source: {label: 'eCourts app guide', url: 'https://services.ecourts.gov.in/App/apphelp.html'}
}
```

Create six to eight `portal` records and six to eight `court` records covering the approved specification. Every external factual claim receives an official `source`; practical safety statements may omit one.

- [ ] **Step 4: Add normalization and scoring helpers**

Implement pure helpers using stable IDs:

```js
function normalizeHelp(value) {
  return String(value || '').toLocaleLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
}

function filteredHelpFaqs(query = state.helpQuery) {
  const tokens = normalizeHelp(query);
  if (!tokens.length) return helpFaqs;
  return helpFaqs.filter(item => {
    const haystack = normalizeHelp([item.question, item.answer, ...item.tags].join(' '));
    return tokens.every(token => haystack.some(word => word.includes(token)));
  });
}

function suggestedHelpFaqs(lastId = state.helpLast, query = state.helpQuery) {
  const current = helpFaqs.find(item => item.id === lastId);
  const tokens = normalizeHelp(query);
  const fallback = ['portal-cnr', 'portal-status', 'court-notice', 'court-hearing', 'legal-aid'];
  return helpFaqs
    .filter(item => item.id !== lastId)
    .map(item => {
      const words = normalizeHelp([item.question, ...item.tags].join(' '));
      const relatedScore = current && current.related.includes(item.id) ? 100 : 0;
      const tokenScore = tokens.reduce((score, token) => score + (words.some(word => word.includes(token)) ? 20 : 0), 0);
      const groupScore = current && current.group === item.group ? 5 : 0;
      const fallbackIndex = fallback.indexOf(item.id);
      const fallbackScore = fallbackIndex === -1 ? 0 : 5 - fallbackIndex;
      return {item, score: relatedScore + tokenScore + groupScore + fallbackScore};
    })
    .sort((a, b) => b.score - a.score || a.item.question.localeCompare(b.item.question))
    .slice(0, 3)
    .map(entry => entry.item);
}
```

- [ ] **Step 5: Verify JavaScript syntax**

Run:

```powershell
node -e 'const fs=require("fs");const h=fs.readFileSync("prototype-v3.html","utf8");h.split("<script>").slice(1).map(s=>s.split("</script>")[0]).forEach(s=>new Function(s));console.log("syntax pass")'
```

Expected: `syntax pass`.

### Task 2: Replace the Passive Help Page with the Dual Knowledge Base

**Files:**
- Modify: `prototype-v3.html:4-7`
- Modify: `prototype-v3.html:16`

- [ ] **Step 1: Add scoped Help layout styles**

Add `.help-page`, `.help-services`, `.help-search`, `.suggested-next`, `.suggestion-row`, `.knowledge-grid`, `.knowledge-base`, `.faq-item`, `.faq-answer`, `.source-link`, `.help-empty`, and `.help-count` styles. Desktop uses two equal columns; under 760px, `.knowledge-grid` becomes one column and `.suggestion-row` becomes horizontally scrollable. Keep radius at 5px or less and reuse existing color variables.

- [ ] **Step 2: Add an FAQ record renderer**

```js
function helpFaq(item) {
  return `<details class="faq-item" id="faq-${item.id}" data-faq="${item.id}"><summary>${item.question}</summary><div class="faq-answer"><p>${item.answer}</p>${item.source ? `<a class="source-link" href="${item.source.url}" target="_blank" rel="noopener noreferrer">${item.source.label} <span aria-hidden="true">&#8599;</span><span class="sr-only"> (opens official website in a new tab)</span></a>` : ''}</div></details>`;
}
```

If no `.sr-only` utility exists, add one using the standard visually-hidden clipping pattern.

- [ ] **Step 3: Replace `supportPage()`**

Render:

1. page header and general-information boundary;
2. three official external service links;
3. labelled `Search Help` input with current query;
4. live result count;
5. `Suggested next` buttons using `data-help-suggest`;
6. two knowledge-base sections populated from `filteredHelpFaqs()`;
7. a reset button using `data-action="clear-help-search"` when zero results match.

Use these official links:

```js
const helpServices = [
  ['Open eCourts Services', 'https://services.ecourts.gov.in/'],
  ['Find free legal aid', 'https://doj.gov.in/national-legal-services-authority/'],
  ['Open Tele-Law information', 'https://doj.gov.in/tele-law-mobile-app/']
];
```

- [ ] **Step 4: Confirm native no-script disclosure behavior**

Open the local page with JavaScript enabled, inspect the Help DOM, and confirm every FAQ is a native `<details>` containing a `<summary>`. The filtering layer may depend on JavaScript, but disclosure semantics must not use custom ARIA button emulation.

- [ ] **Step 5: Verify syntax and responsive CSS parsing**

Run the JavaScript syntax command from Task 1 and load the page at 1440x900 and 375x812. Expected: both knowledge bases render without overflow, and no visible text clips.

### Task 3: Implement Search, Disclosure Tracking, and Suggested Navigation

**Files:**
- Modify: `prototype-v3.html:20`
- Modify: `prototype-v3.html:47-52` if the later event extensions supersede the original delegated handler

- [ ] **Step 1: Add delegated Help search input handling**

```js
document.addEventListener('input', event => {
  if (event.target.id !== 'help-search') return;
  state.helpQuery = event.target.value;
  const position = event.target.selectionStart;
  render();
  const input = document.querySelector('#help-search');
  if (input) {
    input.focus();
    input.setSelectionRange(position, position);
  }
});
```

Recalculate suggestions from the query during render. Do not call `persist()`.

- [ ] **Step 2: Track native disclosure events**

Use delegated `toggle` handling in capture phase because `toggle` does not bubble consistently:

```js
document.addEventListener('toggle', event => {
  const detail = event.target.closest && event.target.closest('[data-faq]');
  if (!detail || !detail.open) return;
  state.helpLast = detail.dataset.faq;
  state.helpSuggestions = suggestedHelpFaqs();
  detail.parentElement.querySelectorAll('[data-faq][open]').forEach(other => {
    if (other !== detail) other.open = false;
  });
  updateHelpSuggestions();
}, true);
```

Implement `updateHelpSuggestions()` to replace only the suggestion-row content and update a polite live-region message. Do not rerender the full page while a disclosure is opening.

- [ ] **Step 3: Add suggestion-button navigation**

Extend the existing delegated click handler:

```js
if (b.dataset.helpSuggest) {
  const detail = document.querySelector(`#faq-${CSS.escape(b.dataset.helpSuggest)}`);
  if (!detail) return;
  detail.open = true;
  const summary = detail.querySelector('summary');
  summary.scrollIntoView({behavior: state.prefs.reduce ? 'auto' : 'smooth', block: 'center'});
  summary.focus({preventScroll: true});
}
```

- [ ] **Step 4: Add search reset behavior**

Handle `data-action="clear-help-search"` by clearing `state.helpQuery`, rerendering Help, and focusing `#help-search`. Do not clear the visitor's language or accessibility preferences.

- [ ] **Step 5: Verify privacy boundary**

In the browser, open Help, search `hearing`, open two questions, and inspect:

```js
JSON.parse(localStorage.getItem('ecourts-citizen-v3') || '{}')
```

Expected: no `helpQuery`, `helpLast`, or `helpSuggestions` keys.

### Task 4: Browser Verification and Audit Update

**Files:**
- Modify: `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`

- [ ] **Step 1: Verify every Help entry route**

Using Playwright CLI, test Help navigation from primary navigation, the mobile menu, the finder support button, and the case support button. Expected: all paths show `Help and court information`.

- [ ] **Step 2: Verify both knowledge bases and all disclosures**

At 1440x900, open each disclosure once. Repeat one portal and one court disclosure with keyboard Enter/Space. Expected: the selected item opens, siblings in the same group close, and no modal appears.

- [ ] **Step 3: Verify filtering and recovery**

Search `CNR`, `hearing`, `Article 21`, and a guaranteed no-match string. Expected: accurate counts, matching questions from either group, a no-results state, and a working reset action.

- [ ] **Step 4: Verify adaptive suggestions**

Open `What is a CNR and where can I find it?`. Expected suggestions include related portal questions. Select one and confirm it opens and receives focus. Search `legal aid`; expected suggestions prioritise legal-aid questions.

- [ ] **Step 5: Verify external links safely**

Inspect all `.source-link` and service-action anchors. Expected: HTTPS official domains, `target="_blank"`, and `rel` containing both `noopener` and `noreferrer`. Do not automate navigation away from the local prototype.

- [ ] **Step 6: Verify responsive and accessibility modes**

Check 375x812, 768x1024, and 1440x900. Enable high contrast, larger text, and reduced motion one at a time. Expected: no overlap, no horizontal page overflow, visible focus, and suggestion scrolling only within its row on mobile.

- [ ] **Step 7: Verify console and syntax**

Run the syntax command, then Playwright `console`. Expected: `syntax pass`, zero console errors, and zero console warnings.

- [ ] **Step 8: Update the audit document**

Add a Help knowledge-base section stating:

- FAQ filtering and suggestions are local and transient;
- Help interactions are not persisted;
- external routes are official links opened separately;
- content is general information and not case-specific legal advice;
- production translations require legal review before being presented as authoritative.

- [ ] **Step 9: Keep the preview server running**

Confirm `http://127.0.0.1:53280/prototype-v3.html` returns HTTP 200 and provide this URL to the user after all checks pass.
