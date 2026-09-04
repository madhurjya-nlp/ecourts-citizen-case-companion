# Progressive Rebuild Memory

Last updated: 2026-09-04

## Product decision

- Citizen assistance is primary; lawyers are secondary; court staff are tertiary.
- Progressive replacement is approved.
- Rebuild design and hierarchy before adding mechanics.
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
7. Full verification and deployment

## Current repository cautions

- Do not modify or publish untracked `assets/openai-civic-layer.js` without a separate security decision.
- Preserve unrelated user changes in `.agent/reports/latest.md` and `docs/ECourt_Revamp_Discussion_2026-09-04.md`.
- Canonical entry point is `index.html`.
- GitHub Pages URL: https://madhurjya-nlp.github.io/ecourts-citizen-case-companion/

## Last verified baseline

- Existing test suite previously passed 25/25 before this rebuild specification.
- Latest deployed implementation commit before the uncommitted visual refinements: `de18969`.

## Next action

Create a focused implementation plan for Phase 1: consolidated design tokens, collapsible desktop sidebar, compact mobile shell, and rebuilt Home screen.
