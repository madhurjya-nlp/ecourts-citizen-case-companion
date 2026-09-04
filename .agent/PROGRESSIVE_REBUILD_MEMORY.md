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

Rebuild Help as four guided citizen flows while retaining searchable FAQs, glossary content, and the secondary lawyer bundle path.

## Phase 1 checkpoint

- Implementation commit: `0e01a5d`.
- Added scoped `assets/citizen-shell.css`; legacy routes remain usable during migration.
- Desktop uses a fixed civic sidebar; mobile uses four persistent destinations plus the menu.
- Home now opens with “How can we help you today?” and exactly four citizen intents.
- Assisted use remains available as “Use for someone you know”.
- English, Assamese, and Hindi Home content is complete.
- Final verification: static checks pass and Playwright passes 26/26.
- Chrome checks: no horizontal overflow or console warnings at desktop/mobile; Lighthouse snapshot scored 100 in Accessibility, Best Practices, SEO, and Agentic Browsing.
