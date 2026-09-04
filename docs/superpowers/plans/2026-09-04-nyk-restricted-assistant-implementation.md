# NYK Restricted Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superjawn:subagent-driven-development (recommended) or superjawn:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a low-cost multilingual NYK assistant that explains the current case and uploaded paper, routes citizens to official sources, and offers contextual help when they appear stuck.

**Architecture:** A standalone browser module owns the drawer, session-only conversation, and zero-cost stuck detection. The existing application exposes only a compact case/document context and friction events. The existing Cloudflare Worker gains a `/chat` route using moderation, `gpt-5.4-nano`, strict structured output, conditional allowlisted web search, and conservative quotas.

**Tech Stack:** Static HTML/CSS/JavaScript, Cloudflare Workers, OpenAI Responses and Moderations APIs, Node test runner, Playwright.

---

## File map

- Create `assets/nyk-assistant.js`: isolated assistant state, UI rendering, event handling, compact requests, session quota, and stuck prompts.
- Create `assets/nyk-assistant.css`: desktop drawer, mobile sheet, messages, citations, focus, and reduced-motion behavior.
- Modify `index.html`: load the assistant assets after the core application.
- Modify `assets/prototype-v3-app.js`: expose compact context and emit friction/document events without coupling application routes to NYK internals.
- Modify `assets/runtime-config.js`: expose the existing Worker URL and a twelve-question client limit.
- Modify `worker/src/index.mjs`: route `/chat`, validate input, moderate, classify retrieval need, call the small model, validate sources, and enforce quotas.
- Modify `worker/wrangler.toml`: add `OPENAI_CHAT_MODEL` and a KV-backed quota binding or safe Worker rate-limit binding.
- Modify `worker/test/worker.test.mjs`: test chat security, cost controls, routing, structured output, and failures.
- Create `tests/nyk-assistant.spec.mjs`: test accessible UI, three languages, context, stuck help, citations, and session clearing.
- Modify `.agent/PROGRESSIVE_REBUILD_MEMORY.md`: record the checkpoint and deployment details.

### Task 1: Context bridge and friction events

**Files:**
- Modify: `assets/prototype-v3-app.js`
- Test: `tests/nyk-assistant.spec.mjs`

- [ ] **Step 1: Write a failing browser test for the public context contract**

Assert that `window.ECOURTS_ASSISTANT_CONTEXT.get()` returns only `language`, `route`, compact synthetic case fields, and the latest structured paper analysis. Assert that it contains no raw `File`, phone, OTP, profile name, or browser-storage dump.

- [ ] **Step 2: Run the focused test and confirm the API is absent**

Run `npx playwright test --config=playwright.config.mjs tests/nyk-assistant.spec.mjs -g "compact context"` and expect a failure because `ECOURTS_ASSISTANT_CONTEXT` is undefined.

- [ ] **Step 3: Implement the bridge and events**

Add a memory-only `latestPaperAnalysis` variable. Set it only after validated Worker output. Expose a frozen interface:

```js
window.ECOURTS_ASSISTANT_CONTEXT = Object.freeze({
  get() {
    return {
      language: state.prefs.lang,
      route: state.page,
      case: state.selected ? {
        cnr: sample.cnr,
        title: sample.title,
        court: sample.court,
        status: sample.status,
        nextHearing: sample.next,
      } : null,
      paper: latestPaperAnalysis,
    };
  },
});
```

Dispatch `ecourts:friction` with only `{type, route}` after a failed case search, invalid upload, or repeated case-stage change. Dispatch `ecourts:paper-analysis` after a successful analysis. Never include form values in friction events.

- [ ] **Step 4: Rerun the focused test**

Expect the context and privacy assertions to pass.

- [ ] **Step 5: Commit**

Commit as `Expose privacy-safe NYK context events`.

### Task 2: NYK interface and session behavior

**Files:**
- Create: `assets/nyk-assistant.js`
- Create: `assets/nyk-assistant.css`
- Modify: `assets/runtime-config.js`
- Modify: `index.html`
- Test: `tests/nyk-assistant.spec.mjs`

- [ ] **Step 1: Add failing tests for the drawer and mobile sheet**

Cover the fixed NYK button, accessible dialog name, focus transfer and restoration, Escape close, four starter prompts, clear-conversation control, `aria-live` answers, mobile full-screen layout, and English/Assamese/Hindi labels.

- [ ] **Step 2: Run tests and confirm the assistant is absent**

Run the new Playwright file and expect failures on `[data-nyk-launcher]`.

- [ ] **Step 3: Build the isolated component**

Keep state in module memory:

```js
const state = {
  open: false,
  messages: [],
  questionsUsed: 0,
  pending: false,
  shownPrompts: new Set(),
};
```

Render escaped text only. Build external source anchors only after validating their host against the same official-host registry used by the Worker. Limit input to 600 characters, send at most two prior turns, and disable submission after 12 questions.

- [ ] **Step 4: Add restrained responsive styling**

Use a 400px right drawer on desktop and an inset full-screen sheet on mobile. Keep the launcher circular with text `NYK`, not a seal or government emblem. Use existing green, off-white, charcoal, and focus tokens. Respect `prefers-reduced-motion`.

- [ ] **Step 5: Rerun the complete NYK browser file**

Expect UI, keyboard, language, responsive, and session tests to pass.

- [ ] **Step 6: Commit**

Commit as `Add multilingual NYK assistant interface`.

### Task 3: Zero-cost contextual help

**Files:**
- Modify: `assets/nyk-assistant.js`
- Test: `tests/nyk-assistant.spec.mjs`

- [ ] **Step 1: Add failing friction tests**

Test two failed searches, invalid upload plus inactivity, repeated Understand/Next-action switching, and 35 seconds of task-page inactivity. Verify one prompt per route, dismissal persistence for the session, and zero fetch calls before question submission.

- [ ] **Step 2: Implement deterministic prompting**

Use route-scoped counters and a resettable inactivity timer. Show a compact prompt such as “Need help finding the right detail?” with `Ask NYK` and close controls. Never describe the citizen as confused, anxious, or inexperienced.

- [ ] **Step 3: Verify with fake timers and request interception**

Expect each threshold to show once and the intercepted `/chat` count to remain zero.

- [ ] **Step 4: Commit**

Commit as `Offer zero-cost NYK help when users get stuck`.

### Task 4: Restricted Worker chat route

**Files:**
- Modify: `worker/src/index.mjs`
- Modify: `worker/wrangler.toml`
- Modify: `worker/test/worker.test.mjs`

- [ ] **Step 1: Add failing Worker tests**

Cover `/chat` POST only, approved origins, 600-character input, supported languages, maximum context shape, prompt-injection refusal, moderation flags, quota exhaustion, web-search classification, allowed domains, source stripping, malformed model JSON, OpenAI errors, and `Cache-Control: no-store`.

- [ ] **Step 2: Split routing without breaking paper analysis**

Keep `/` for paper analysis and add `/chat`. Validate the body against:

```js
{
  message: string,
  language: "en" | "as" | "hi",
  route: string,
  case: object | null,
  paper: object | null,
  history: Array<{role: "user" | "assistant", text: string}>
}
```

Reject unknown top-level fields and cap serialized context size.

- [ ] **Step 3: Add moderation and local refusal rules**

Call `omni-moderation-latest` before the paid response. Locally reject system-prompt extraction, evidence alteration, witness coaching, outcome prediction, and evasion requests. Return a structured refusal with the relevant official-help route.

- [ ] **Step 4: Add conditional official web search**

Use local routing patterns for requests containing current law, Act/section, Constitution, court directory, jurisdiction, legal aid, or local-court information. Only then attach `web_search` with low context and allowed domains from the spec. Case-status and uploaded-paper questions must not attach a search tool.

- [ ] **Step 5: Add a strict response schema**

Return exactly:

```js
{
  answer: string,
  answer_type: "case" | "paper" | "court_information" | "legal_reference" | "refusal" | "limitation",
  sources: [{title: string, url: string}],
  actions: [{label: string, route: string}],
  boundary: string,
  web_search_used: boolean
}
```

Use `gpt-5.4-nano`, `store: false`, low reasoning, at most 700 output tokens, no autonomous tool loop, and server instructions that require plain language and prohibit legal advice.

- [ ] **Step 6: Add quota enforcement**

Use a Cloudflare binding keyed by a salted IP hash with a conservative rolling cap. Return `429` and a clear reset message. Keep the browser’s 12-question limit as an additional control, not the security boundary.

- [ ] **Step 7: Run Worker tests**

Run `npm run test:worker` and expect all paper and chat tests to pass with mocked OpenAI calls.

- [ ] **Step 8: Commit**

Commit as `Add restricted low-cost NYK chat endpoint`.

### Task 5: End-to-end connection, deployment, and verification

**Files:**
- Modify: `assets/nyk-assistant.js`
- Modify: `.agent/PROGRESSIVE_REBUILD_MEMORY.md`
- Test: `tests/nyk-assistant.spec.mjs`

- [ ] **Step 1: Add mocked end-to-end browser tests**

Intercept the Worker URL and verify compact requests, paper context, safe rendered answers, source links, next-action navigation, `429`, network failure, and retry. Confirm hostile HTML in model fields renders as text.

- [ ] **Step 2: Run the full local suite**

Run `npm test`; expect static locale checks, Worker tests, 27 existing browser tests, and all NYK tests to pass without calling the paid endpoint.

- [ ] **Step 3: Deploy the Worker**

Run `npx wrangler@4 deploy` from `worker/`. Confirm the existing `OPENAI_API_KEY` secret remains registered and the deployment URL is unchanged.

- [ ] **Step 4: Run one paid synthetic smoke test**

Submit one short synthetic case question in Assamese. Confirm HTTP 200, Assamese output, `store: false` behavior from the request test, valid official sources when search is invoked, and concise token usage. Do not upload a real case document.

- [ ] **Step 5: Inspect desktop and mobile UI**

Use browser screenshots at 1365x768 and 390x844. Verify no overlap with navigation, no clipped text, visible focus, readable citations, and correct scroll containment.

- [ ] **Step 6: Update the memory ledger and commit**

Record deployment URL, test counts, cost controls, live-smoke result, and remaining limitations. Commit as `Deploy NYK citizen assistance`.

- [ ] **Step 7: Push and verify GitHub Pages**

Push `main`, wait for Pages publication, then verify the live launcher, one mocked-safe path locally, and the production Worker CORS response.
