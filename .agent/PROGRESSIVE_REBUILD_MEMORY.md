# Progressive Rebuild Memory

Last updated: 2026-09-04

## Product decision

- Citizen assistance is primary; lawyers are secondary; court staff are tertiary.
- Progressive replacement is approved.
- Rebuild design and hierarchy before adding mechanics.
- A real OpenAI API integration is required after the UI states are purposefully designed.
- Do not use multiple agents for this project.
- Supported interface languages: English, Assamese, Hindi.
- Documents use India's official-language scope already agreed for the prototype.

## Visual decision

- Restrained civic utility: deep green, charcoal, warm off-white, limited saffron.
- Readable sans-serif typography, square containers, useful negative space.
- No official seals, chakra-like logo, tricolour mimicry, decorative gradients, or fashion hero.
- Active sections gain contrast; inactive sections must remain readable.

## Build order

1. Foundation and shell
2. Home
3. Help
4. Case journey
5. Documents, Courts, Workspace
6. Mechanics and AI-ready states
7. Cloudflare Worker + one real OpenAI document-intelligence vertical slice
8. Full verification and deployment

## OpenAI deployment decision

- Keep the static frontend on GitHub Pages.
- Use Cloudflare Workers Free for the protected API endpoint.
- Store `OPENAI_API_KEY` as a Worker secret; never expose it in frontend files.
- Keep `OPENAI_MODEL` server-configurable; initial cost-sensitive choice is `gpt-5.6-luna`.
- Use the Responses API with Structured Outputs, strict input/output limits, allowed-origin checks, rate limiting, and explicit failure/fallback labels.
- First live feature: upload/camera analysis for PDF, JPG, and PNG court papers, including poor images and best-effort handwriting recognition.
- Preprocess orientation, contrast, and image size locally; return editable extracted fields with confidence and page/region provenance.
- Cloudflare hosting can remain free within its allowance; OpenAI API usage is billed separately.

## Current repository cautions

- Do not modify or publish untracked `assets/openai-civic-layer.js` without a separate security decision.
- Preserve unrelated user changes in `.agent/reports/latest.md` and `docs/ECourt_Revamp_Discussion_2026-09-04.md`.
- Canonical entry point is `index.html`.
- GitHub Pages URL: https://madhurjya-nlp.github.io/ecourts-citizen-case-companion/

## Last verified baseline

- Existing test suite previously passed 25/25 before this rebuild specification.
- Latest deployed implementation commit before the uncommitted visual refinements: `de18969`.

## Next action

Rebuild the Case papers upload/analyse experience, then implement the protected Cloudflare/OpenAI vertical slice.

## Case and Help checkpoint

- Case Overview reference hierarchy committed in `4b579b6`.
- Help now starts with four guided flows: find case, understand status, understand order, and secondary lawyer bundle organisation.
- The 15 sourced Help records, search, smart suggestions, and official links remain available below the guided layer.

## Phase 1 checkpoint

- Implementation commit: `0e01a5d`.
- Added scoped `assets/citizen-shell.css`; legacy routes remain usable during migration.
- Desktop uses a fixed civic sidebar; mobile uses four persistent destinations plus the menu.
- Home now opens with “How can we help you today?” and exactly four citizen intents.
- Assisted use remains available as “Use for someone you know”.
- English, Assamese, and Hindi Home content is complete.
- Final verification: static checks pass and Playwright passes 26/26.
- Chrome checks: no horizontal overflow or console warnings at desktop/mobile; Lighthouse snapshot scored 100 in Accessibility, Best Practices, SEO, and Agentic Browsing.

## Revised Home reference

- The approved visual source is `C:\Users\madhu\Downloads\Codex Image Sep 4, 2026, 06_30_33 PM.png`.
- Home is search-first: two primary paths, one dominant case-search form, four smaller common needs, assisted use, and a restrained service boundary.
- Use top navigation, not the experimental fixed dark sidebar.
- “Case papers” remains a discoverable navigation section, but Home stays search-first so the product does not read as a document generator.

## Case papers intake checkpoint

- The document page now begins with an “Understand a court paper” workspace before the seven template tools.
- It offers ordinary file selection and mobile rear-camera capture for PDF, JPG, and PNG files up to 10 MB.
- Selection is validated locally; files are not persisted in browser storage.
- English, Assamese, and Hindi intake copy is complete.
- The result panel defines the future OpenAI response hierarchy: document type, case/court details, dates and parties, plain-language explanation, checks, confidence, and source references.
- Until the protected Cloudflare Worker is connected, the action clearly reports that secure analysis is unavailable and sends no file. It never displays a fabricated AI result.
- Fresh verification: locale integrity passed and Playwright passed 27/27 tests.

## Next action

Run one real court-document smoke test, inspect the result quality, then push the verified site.

## OpenAI vertical slice checkpoint

- Frontend upload analysis now calls the configurable URL in `assets/runtime-config.js`; an empty URL preserves the honest disconnected state.
- Selected files remain memory-only and are sent as multipart data only after the citizen presses Analyse.
- The new `worker/` project enforces allowed origins, POST-only access, PDF/JPG/PNG types, a 10 MB limit, no-store responses, and server-side API-key use.
- The Worker sends PDF or image input to the OpenAI Responses API using `gpt-5.6-luna` by default, `store: false`, and a strict court-paper JSON schema.
- The result contract includes document type, court, case number, dates, parties, a citizen-facing explanation, verification items, confidence labels, and page/region sources.
- Model instructions prohibit legal advice and unsupported inference; missing content must be reported as not found and uncertain handwriting must be low confidence.
- Cloudflare Worker deployed at `https://ecourts-paper-analysis.madhu-ecourts-citizen.workers.dev` with `OPENAI_API_KEY` stored as a Cloudflare secret.
- `assets/runtime-config.js` now points the site to the deployed endpoint.

## NYK AI checkpoint

- NYK AI is a restricted, session-only citizen assistant available from every route through the fixed `NYK` button.
- It accepts English, Assamese, and Hindi and receives only compact current-route, selected synthetic case, and validated paper-analysis context.
- Chat uses `gpt-5.4-nano`, `store: false`, moderation, a 600-character question limit, a 700-token response cap, 12 questions per browser session, and a Cloudflare limit of 12 requests per minute.
- Current-information web search is conditional and restricted to official eCourts, District Courts, India Code, Legislative Department, Gauhati High Court, Assam Government, and NALSA domains.
- Unsafe strategy, evidence manipulation, witness coaching, evasion, outcome prediction, and prompt extraction requests are refused before a paid model call.
- Suggested in-site actions are restricted to an explicit route allowlist; external citations are rendered only for official-domain links.
- Stuck assistance is offered after repeated failed searches, an invalid upload, repeated case-stage switching, or route inactivity. Showing or dismissing this prompt makes no API call.
- Deployed Worker version: `7ca03be9-ebcd-444d-9e80-e95e584308e8`.
- Live Assamese smoke test passed with HTTP 200 and no web-search call.
- Verification: static locale checks passed, Worker tests passed 8/8, and Playwright passed 33/33.

## NYK answer presentation checkpoint

- Raw model Markdown is now rendered through safe DOM construction as paragraphs, bold emphasis, and checklist-style lists; response HTML is never injected.
- Backend answer enums are presented as localized citizen-facing labels in English, Assamese, and Hindi.
- The response card separates explanation, official sources, safe next actions, and the verification boundary.
- The ellipsis loader is replaced by localized progress steps for understanding the question, checking case context, and reviewing official sources when required.
- Mobile uses a compact header and composer, full-width answer card, stacked quota/boundary text, and no horizontal overflow at 390x844.
- Visual inspection artifact: `output/playwright/nyk-mobile-formatted.png` (local, not committed).
- Verification: static locale checks passed, Worker tests passed 8/8, and Playwright passed 34/34.

## NYK mobile chat checkpoint

- Mobile NYK now uses a familiar chat layout: green right-aligned citizen bubbles, light left-aligned assistant bubbles, a neutral chat canvas, compact header, and circular send control.
- Every panel descendant can shrink within the viewport; long official URLs and legal references use emergency wrapping and cannot widen the sheet.
- At 390x844, a deliberately long India Code reference remained inside a 340px assistant bubble with document scroll width fixed at 390px.
- Visual inspection artifact: `output/playwright/nyk-mobile-whatsapp.png` (local, not committed).
- Verification: static locale checks passed, Worker tests passed 8/8, and Playwright passed 35/35.

## Multilingual PDF checkpoint

- Removed the blanket non-ASCII download rejection that blocked valid Indian-script names and addresses.
- ASCII drafts retain the compact searchable Helvetica PDF path.
- Drafts containing Hindi, Assamese, or other Unicode text use a local canvas-rendered image PDF so glyphs remain visible without uploading citizen data or adding a remote dependency.
- Visual rendering confirmed the Assamese applicant name `মাধুৰ্য শৰ্মা` is present and legible in the downloaded PDF.
- Verification: static locale checks passed, Worker tests passed 8/8, and Playwright passed 36/36.

## NYK cost-cache checkpoint

- Server-side Cloudflare rate limiting remains first in the chat request path: 12 requests per IP per 60 seconds, independent of reloads or frontend state.
- Added Cloudflare KV binding `NYK_CACHE` for repeated synthetic demo-case questions only.
- Cache keys are SHA-256 hashes of language, normalized question, and uppercase demo CNR; raw questions are not exposed in KV keys.
- Cache TTL is six hours. Uploaded-paper context, current-law web searches, and non-`DEMO` case identifiers never read or write the cache.
- KV failures are fail-open and do not interrupt assistance; responses expose `X-NYK-Cache: HIT|MISS` for operational verification.
- Deployed Worker version: `79f5ee9a-843e-482c-b6f0-6bb18ff39888`.
- Production smoke test: first identical demo request returned `MISS`; second returned `HIT` with HTTP 200.
- Verification: Worker tests passed 10/10 and the complete browser suite passed 36/36.
