# Progressive Citizen UI Rebuild

## Objective

Rebuild the eCourts prototype as a citizen-first public assistance layer. The interface must help a stressed or unfamiliar user find a case, understand its latest state, identify the next action, prepare required material, and continue to an official service. Lawyer tools remain a secondary extension.

## Approved approach

Use progressive replacement. Introduce the new visual foundation and application shell first, then migrate one route at a time while all unfinished routes remain usable. Preserve verified content, synthetic records, translations, and tests unless a screen's new hierarchy requires a targeted change.

## Visual direction

- Restrained civic utility rather than a fashion-led or official-looking government site.
- Use a highly readable sans-serif family for interface and display text.
- Use deep green, charcoal, warm off-white, and limited saffron accents.
- Avoid seals, chakra-like marks, tricolour mimicry, gradients, decorative hero art, and ornamental card walls.
- Prefer square, clearly structured containers with strong hierarchy and useful negative space.
- Use icons only where they improve recognition or distinguish actions.
- Use photography selectively when it depicts the citizen task or court context.
- Highlight the active stage without making inactive content unreadable.

## Information architecture

### Application shell

Desktop receives a collapsible left navigation that summarizes the citizen journey and provides direct route access. The header contains only context, language, accessibility, and account/workspace controls. Mobile uses a compact top bar and an ergonomic navigation drawer or bottom action area, depending on the screen.

### Home

Lead with “How can we help you today?” and four primary paths:

1. Find my case
2. Understand my case status
3. Find an order or hearing date
4. I don't know what to do next

Keep “Use for someone you know” available as an assisted-use mode. Any statistics must be clearly sourced or labelled as demonstration data. The first viewport must prioritise action over explanation.

### Help

Replace the FAQ-first layout with four guided flows: find a case, understand a status, understand an order, and organise a case bundle for lawyers. Searchable FAQs, court-process explanations, “Why can't I find my case?”, and the glossary remain secondary resources. The assistant explains navigation, terminology, and available records; it does not provide legal advice.

### Case journey

Use five distinct stages: Find, Understand, Next action, Prepare, and Official service. Latest status and next action appear before history or document collections. Contextual “What does this mean?” controls connect status terms to plain-language explanations.

### Supporting routes

Documents, District Courts, High Courts, eCommittee/NJDG links, and workspace use the same shell and content hierarchy. Official destinations must be visibly distinguished from prototype actions.

## AI-ready boundaries

Design stable interface states for document classification, extracted fields, confidence, citations, missing-information prompts, timeline generation, and grounded explanations. GitHub Pages must not contain an OpenAI API secret. A real integration requires a protected server-side endpoint; until then, AI demonstrations use synthetic records and explicit provenance.

## Migration sequence

1. Consolidate design tokens and foundational components.
2. Replace the desktop and mobile application shell.
3. Rebuild Home.
4. Rebuild Help.
5. Rebuild the five-stage case journey.
6. Rebuild Documents, Courts, and Workspace.
7. Reconnect and verify mechanics screen by screen.
8. Perform responsive, accessibility, keyboard, download, route, and content checks.

## Error and safety states

- Preserve user-entered search values when a query fails.
- Explain why no case was found and offer useful alternative search fields.
- Mark synthetic case data, demo WhatsApp behaviour, and simulated AI output at the point of use without dominating the interface.
- Never imply that preparation guidance is a court direction or legal advice.
- Every external official-service action names its destination and opens safely.

## Verification

Each migrated screen is checked at desktop and mobile widths for hierarchy, overflow, keyboard operation, focus visibility, language switching, and route restoration. Existing Playwright coverage is updated as routes change. The live GitHub Pages build is checked only after local tests pass.

## Research notes

Skipped new external research because the current-session citizen-use analysis, mentor feedback, official-site comparison, and approved project discussion already cover this same design decision. Relevant project context is recorded in `docs/ECourt_Revamp_Discussion_2026-09-04.md` and the current task history.

## Excluded from this rebuild

Live court-system integration, real advocate verification, outcome prediction, appeal recommendations, complete e-filing, a production WhatsApp bot, and client-side OpenAI credentials are outside this UI-first phase.
