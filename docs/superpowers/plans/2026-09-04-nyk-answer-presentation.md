# NYK Answer Presentation Implementation Plan

> **For agentic workers:** Execute inline; the user has prohibited subagents for this project. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw, dense NYK responses and the ellipsis loader with a safe, readable, responsive citizen-assistance presentation.

**Architecture:** Keep the Worker response contract. Parse only a constrained Markdown subset into DOM nodes with `textContent`, localize answer labels and loading states, and style those semantic nodes for desktop and mobile.

**Tech Stack:** Vanilla JavaScript, CSS, Playwright.

---

### Task 1: Lock presentation behavior with browser tests

**Files:**
- Modify: `tests/nyk-assistant.spec.mjs`

- [ ] Add a delayed mocked response and assert that a named three-step loading state replaces the raw ellipsis.
- [ ] Return bold text and list syntax, then assert that `<strong>` and `<li>` elements appear and literal `**` does not.
- [ ] Verify the response label is citizen-facing and suggested actions remain route-safe.

### Task 2: Implement safe structured rendering

**Files:**
- Modify: `assets/nyk-assistant.js`

- [ ] Add localized answer labels and loading copy for English, Assamese, and Hindi.
- [ ] Build constrained inline and block renderers using created DOM nodes only.
- [ ] Add a semantic loading component while preserving source and action allowlists.

### Task 3: Rebalance the responsive interface

**Files:**
- Modify: `assets/nyk-assistant.css`

- [ ] Style semantic answer regions and loading indicators.
- [ ] Add reduced-motion-compatible animation.
- [ ] Reduce mobile chrome, enlarge the reading region, and stack composer metadata cleanly.

### Task 4: Verify and publish

**Files:**
- Modify: `.agent/PROGRESSIVE_REBUILD_MEMORY.md`

- [ ] Run focused and complete tests.
- [ ] Inspect desktop and 390x844 mobile screenshots.
- [ ] Commit intended files, push `main`, and verify GitHub Pages.
