# NYK AI Restricted Citizen Assistant

## Purpose

NYK AI is a multilingual public-assistance layer for citizens who need to understand a case, an uploaded court paper, a court process, or the official service they should use next. It explains and routes. It does not provide personalised legal advice, predict outcomes, recommend litigation strategy, or replace a lawyer or court record.

## Audience and language

- Primary: litigants, family members, and first-time citizens under stress.
- Secondary: lawyers and clerks using the same case and document context.
- Supported input and output: English, Assamese, and Hindi.
- NYK answers in the current site language unless the citizen explicitly asks for another supported language.

## User interface

- A fixed circular `NYK` button appears at the lower-right on every route without resembling an official government seal.
- Desktop opens a restrained right-side drawer. Mobile opens a full-screen sheet above the bottom navigation.
- The first view offers four short prompts: what happened, what happens next, explain this paper, and find the right court or legal-aid service.
- Answers use a stable hierarchy: direct answer, basis/source chips, uncertainty or safety boundary, next action, and official link.
- Conversations are session-only and have a visible clear control.
- A small “Powered by OpenAI” label is shown without implying OpenAI or government endorsement.

## Stuck assistance

The frontend detects only interaction friction, not personal attributes or emotional state. It offers a quiet NYK prompt after one of these conditions:

- two unsuccessful case searches;
- an invalid upload followed by inactivity;
- repeated switching between Understand and Next action;
- 35 seconds of inactivity on a task page without completing its main action.

The prompt is dismissible, appears at most once per route per session, and never sends activity data to OpenAI. Opening or dismissing it costs no API tokens.

## Knowledge and retrieval

NYK follows a two-level route:

1. Answer from the current synthetic case, temporary uploaded-paper analysis, existing Help records, glossary, and a concise curated source registry.
2. Use OpenAI web search only when the question asks for current or broader legal/court-reference information not present in that context.

Web search is limited to these official source families:

- `ecourts.gov.in` and `dcourts.gov.in` for case services, court directories, orders, and local district-court pages;
- `indiacode.nic.in` and `legislative.gov.in` for legislation and the Constitution;
- `ghconline.gov.in`, `assam.gov.in`, and `nalsa.gov.in` for Gauhati High Court, Assam legal services, and national legal aid.

No arbitrary-page scraping, social sources, blogs, or law-firm marketing pages are allowed. A broad question that cannot be supported by these sources receives a limitation message and official-service route.

## OpenAI architecture

- Extend the existing Cloudflare Worker with a `POST /chat` route.
- Keep `OPENAI_API_KEY` server-side and use `gpt-5.4-nano` by default for chat.
- Send only the latest user message, a compact rolling summary, the relevant case/document facts, and at most the last two turns.
- Cap user input at 600 characters and output at roughly 350 words.
- Set `store: false` and request a strict JSON response containing answer, answer type, sources, suggested actions, refusal reason, and whether web search was used.
- Run moderation before the response call. Reject prompt-injection attempts, requests for wrongdoing, and attempts to reveal system instructions.
- Never place the raw uploaded file in chat requests. Pass only the validated structured document analysis and discard it on refresh.

## Cost controls

- Local intent buttons, stuck detection, source routing, and refusal checks run without API calls.
- Use one model request per submitted message; no autonomous loops or agents.
- Web search is disabled by default and enabled only by the Worker’s narrow routing rule.
- Limit a browser session to 12 questions and an IP to a conservative rolling request quota.
- Keep model context below approximately 2,500 input tokens and output below 700 tokens.
- Return a visible daily-limit message rather than silently spending beyond the quota.
- Add Cloudflare-side counters and document how to set an OpenAI project budget alert; the application cannot guarantee the account balance by itself.

## Safety behavior

- Case answers distinguish official record, AI explanation, and matters to verify.
- Legal-reference answers identify the Act, provision, court page, or service source when available.
- NYK refuses outcome prediction, legal strategy, evasion, evidence alteration, witness coaching, and declarations that an action is mandatory without a cited official source.
- Urgent arrest, violence, self-harm, or imminent-deadline messages receive concise emergency/legal-aid routing rather than extended conversation.
- Every response carries: “AI assistance, not a court record or legal advice. Verify important steps with the court or a qualified lawyer.”

## Data flow

1. Browser composes a compact request from language, current route, selected synthetic case facts, temporary paper-analysis JSON, and user text.
2. Worker validates origin, length, session quota, schema, and moderation.
3. Worker chooses local-context-only or restricted web-search mode.
4. OpenAI returns strict structured JSON.
5. Worker validates and strips unknown fields, then returns no-store JSON.
6. Browser renders escaped text, source links from an allowlist, and next-action buttons.

## Testing

- Worker tests cover origin, length, quota, moderation refusal, source allowlist, search routing, malformed model output, and no-store behavior.
- Browser tests cover drawer/mobile sheet, keyboard focus, three languages, session clearing, stuck prompts, case context, paper context, safe refusal, citations, and network failure.
- A live smoke test uses synthetic content only and confirms that routine automated tests never call the paid endpoint.

## Research notes

- Official OpenAI documentation describes `gpt-5.4-nano` as its cheapest GPT-5.4-class model for simple high-volume work and confirms Responses API and Structured Outputs support: https://developers.openai.com/api/docs/models/gpt-5.4-nano
- OpenAI documentation confirms web search incurs a separate per-tool-call fee, so search must be conditional rather than attached to every turn: https://developers.openai.com/api/docs/models/gpt-4o-mini-search-preview
- eCourts provides case status, orders/judgments, High Court and District Court services, while Gauhati High Court’s eCourts portal exposes Assam-specific services. These are routing sources, not a complete legal corpus: https://ecourts.gov.in/ and https://ecourtsghc.assam.gov.in/
- India Code/Legislative Department, eCourts/district courts, and NALSA/Assam legal services cover different responsibilities. The design therefore uses three source families rather than claiming that two or three individual sites contain all Indian law.

## Explicit exclusions

- No autonomous agent framework, long-term memory, account profiling, unrestricted browsing, lawyer workspace automation, voice model, or WhatsApp integration in this phase.
- No guarantee that AI interpretation is accurate or that a cited page applies to the citizen’s specific facts.

## Structured answer presentation

- Render only a safe Markdown subset as created DOM nodes: paragraphs, bold emphasis, and lists. Never inject response HTML.
- Translate backend answer types into citizen-facing labels instead of exposing enum values such as `case`.
- Visually separate the answer, official sources, suggested next actions, and verification boundary.
- While waiting, show localized progress for understanding the question, checking available context, and reviewing official sources.
- On mobile, prioritize the reading area, keep the composer compact, and stack the remaining-question count above the verification boundary.

Skipped additional research because the supplied mobile screenshots directly document the current defects and this extends the approved NYK design in this file.
