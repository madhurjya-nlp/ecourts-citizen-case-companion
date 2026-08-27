# Civic Case Companion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:subagent-driven-development (recommended) or superjawn:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished static citizen case companion that supports public synthetic case discovery, document understanding and optional local saved-workspace creation.

**Architecture:** Keep the prototype standalone in `prototype-v2.html`. Replace its dashboard-first markup, styling and script with a small state model, view renderer and localStorage-backed preference/profile helpers. Add one project-local image asset for the desktop editorial home composition.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, browser localStorage, generated PNG asset.

---

### Task 1: Create the editorial image asset

**Files:**
- Create: `assets/civic-court-paper-hero.png`

- [ ] **Step 1: Generate a wide editorial asset**

Create a non-official Indian civic scene: adult citizen holding an unbranded court paper outside a contemporary district-court setting; judicial blue, warm paper, saffron and green textile detail; room for text at left; no logo, insignia, flag, watermark or text.

- [ ] **Step 2: Verify the image**

Inspect the result for unwanted text, official insignia and an unusable crop. Keep the selected PNG in `assets/`.

### Task 2: Rebuild the application shell and public home

**Files:**
- Modify: `prototype-v2.html`

- [ ] **Step 1: Replace dashboard-first navigation**

Implement public header links only for Home, Find a case and Help. Hide case workspace navigation until a selected result exists. Add a true mobile menu dialog.

- [ ] **Step 2: Implement the responsive editorial visual system**

Use judicial blue, saffron, white and green as structural tokens, textured paper background, serif display type, the generated hero asset on desktop and a simplified content-led mobile hero. Define high-contrast, larger-text and reduced-motion preference classes.

- [ ] **Step 3: Add the four public tasks**

Render Find a case, Read a court paper, Check a hearing and Get legal help as task routes. Ensure each has a visible working destination and no persona appears before a result is opened.

### Task 3: Implement synthetic case discovery and recovery

**Files:**
- Modify: `prototype-v2.html`

- [ ] **Step 1: Add synthetic case fixtures**

Define records keyed by CNR, case number and party name. Include court, case status, next hearing, official event, explanation, uncertainty, timeline and documents.

- [ ] **Step 2: Add finder tabs and validation**

Provide CNR, case number, party name and court paper/QR routes. Empty input gets an inline error; unmatched input gets a recovery panel with a labelled sample-case action; a matching synthetic input produces a result card.

- [ ] **Step 3: Verify search transitions**

Test success, empty, unmatched and sample-case paths in a browser.

### Task 4: Implement the case viewer and documents

**Files:**
- Modify: `prototype-v2.html`

- [ ] **Step 1: Render the case workspace after selection**

Show a selected synthetic case badge, a Singapore-inspired date-led next-hearing panel with today/upcoming framing, official event, plain-language meaning, uncertainty, timeline and a context-specific help route. Add a concise human-support alternative beside the finder and document actions, following Denmark's task-specific guidance pattern.

- [ ] **Step 2: Implement the document dialog**

Opening a document shows an accessible modal with synthetic order detail, explanation and a mock-download status. Escape and the close action return focus to the triggering button.

- [ ] **Step 3: Verify no visible document button is inert**

Click every rendered document action and assert the dialog opens with the selected document title.

### Task 5: Implement optional local workspace saving

**Files:**
- Modify: `prototype-v2.html`

- [ ] **Step 1: Add the simulated OTP modal**

Collect a plausible mobile number locally, display a fixed simulated OTP, validate it and make the disclosure explicit but brief.

- [ ] **Step 2: Apply and persist preferences**

Save profile name, saved case, language, high contrast, larger text and reduced-motion options in localStorage. Render English/Hindi strings for primary home, finder and case-view controls.

- [ ] **Step 3: Add reset**

Provide a user-visible reset action that clears only this prototype’s localStorage key and returns to public home.

### Task 6: Validate and package the static build

**Files:**
- Modify: `README.md`
- Create: `docs/prototype-v2-redesign-desktop.png`
- Create: `docs/prototype-v2-redesign-mobile.png`

- [ ] **Step 1: Run static checks**

Check duplicate IDs, required route/action IDs, and that no outdated public Dashboard or demo-space navigation remains.

- [ ] **Step 2: Run desktop and mobile browser journeys**

Verify public home, each finder path, case viewer, document dialog, optional OTP, persisted settings and reset. Confirm no horizontal overflow at 390px and desktop width.

- [ ] **Step 3: Update handoff documentation**

Update `README.md` to call `prototype-v2.html` the current standalone prototype and explain the synthetic, local-only OTP behavior.

- [ ] **Step 4: Prepare deployment**

Inspect available static-hosting tooling and publish only through a user-authorized service. Report the final public URL and deployment mechanism.

## Plan Self-Review

- Spec coverage: Tasks 1-6 cover visual direction, public routing, discovery, documents, optional OTP, preferences, mobile behaviour, verification and static deployment.
- Placeholder scan: no TODO/TBD items remain.
- Type consistency: the single-file prototype uses a unified synthetic case fixture, view state and localStorage namespace throughout.
