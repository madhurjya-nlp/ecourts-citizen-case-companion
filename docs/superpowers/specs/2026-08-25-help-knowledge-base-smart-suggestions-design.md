# Help Knowledge Base and Smart Suggestions

## Goal

Replace the passive Help page in `prototype-v3.html` with a working, citizen-facing information centre. The page must separate product support from general court and constitutional information, expose practical official-service routes, and make relevant follow-up questions easier to discover without collecting or transmitting a visitor's query history.

## Scope

The feature is India-wide and procedure-focused. It provides general information, not case-specific legal advice, state-specific procedure, outcome predictions, or an interpretation of a visitor's rights in a particular dispute.

The page contains two knowledge bases:

1. **eCourts and portal help**: CNR and alternative search, case status, cause lists, orders and PDFs, saved cases, registration, QR search, language, and accessibility.
2. **Courts, cases, and constitutional help**: court structure, civil and criminal matters, notices and summons, hearings, orders and judgments, attendance, appeals, legal representation, free legal aid, Tele-Law, and practical summaries of Articles 14, 21, 22, 32, and 39A.

## Research Notes

- The official eCourts app FAQ says registration is not required and identifies CNR, case number, filing number, FIR number, party name, advocate details, case type, and Act as supported search routes. It also documents cause lists, saved cases, orders, PDF downloads, QR access, and regional-language support: https://services.ecourts.gov.in/App/appfaq.html
- The official eCourts app guide describes the CNR as a 16-character alphanumeric identifier entered without spaces or hyphens, and directs people without a CNR to alternative search methods: https://services.ecourts.gov.in/App/apphelp.html
- The Supreme Court's constitutional overview describes the broad court hierarchy as Supreme Court, High Courts, and subordinate District Courts, while noting local lower-court variations: https://www.sci.gov.in/constitution/
- The Supreme Court's jurisdiction page distinguishes original, appellate, and advisory jurisdiction and identifies Article 32 as a route for enforcement of Fundamental Rights: https://www.sci.gov.in/jurisdiction/
- Department of Justice information states that eligible people may receive free legal services through national, state, district, High Court, Supreme Court, and taluk legal-services institutions. Legal assistance may include lawyers, court fees, document preparation, and certified copies: https://doj.gov.in/national-legal-services-authority/
- The Legislative Department's official Constitution text supports the limited constitutional summaries, particularly Articles 14, 21, 22, 32, and 39A: https://legislative.gov.in/constitution-of-india/
- Agent Reach's Exa route returned the official eCourts, Department of Justice, Supreme Court, and Legislative Department sources. One parallel NALSA query reached the free-tier rate limit; the design therefore relies on the official Department of Justice NALSA page rather than an inferred secondary source.

## Information Architecture

### Page Header

Use the existing judicial-editorial visual system. The page title is `Help and court information`. Supporting copy states that the material is general information and that official records or qualified legal help should be used for decisions affecting rights or deadlines.

Under the header, provide three compact official-service actions:

- Open eCourts Services
- Find free legal aid
- Open Tele-Law information

These are real external links, visually secondary to the knowledge bases, and must announce that they open an official website in a new tab.

### Smart Suggestions

Show three compact suggested-question tabs above the knowledge bases. Initial suggestions cover common first-time tasks. Suggestions update after either of these events:

- the visitor enters words in the FAQ search field;
- the visitor opens a FAQ item.

Selecting a suggestion must:

1. identify the referenced FAQ item;
2. open its native disclosure control;
3. close other disclosures in the same knowledge base to maintain scanning clarity;
4. scroll the question into view without motion when reduced motion is enabled;
5. place keyboard focus on its question control;
6. recalculate the next three suggestions.

Use the visible label `Suggested next`. Do not call the system AI, predictive, personalised, or intelligent. A small privacy line states `Suggestions use only this Help session and are not saved.`

### Knowledge Bases

Desktop uses two equal columns with independent headings. Mobile stacks the portal knowledge base first and the court-information knowledge base second. Each answer is a native `<details>` and `<summary>` disclosure, styled to match the existing civic visual language rather than as nested cards.

Each knowledge base contains six to eight concise questions. Answers should lead with the practical point, use plain language, and include an official source link where the answer depends on external facts. Constitutional answers identify the Article number but avoid giving a case-specific remedy.

### Search

Provide one search field labelled `Search Help`. Search filters both knowledge bases by question, answer, and tags. Results update after input without requiring submission. The page must show a direct empty state with a reset action when nothing matches.

## Suggestion Model

The standalone prototype uses deterministic local scoring, not a model or backend.

Each FAQ record contains:

- stable `id`;
- knowledge-base `group`;
- `question` and `answer`;
- topic `tags`;
- `related` FAQ IDs;
- optional official source label and URL.

The scorer assigns priority using:

1. exact related-question IDs from the most recently opened item;
2. overlap between search tokens and FAQ tags/question text;
3. same-topic relationships;
4. a fixed fallback order of common citizen tasks.

The currently open item and duplicate suggestions are excluded. The engine keeps only transient in-memory state and does not add FAQ activity to `localStorage`.

## Accessibility and Responsive Behaviour

- Use semantic `<details>` and `<summary>` controls so disclosure behavior works with keyboard and assistive technology without custom role emulation.
- The suggestion row uses buttons with stable dimensions and visible focus states.
- Announce suggestion updates through a polite live region without moving focus automatically.
- Search has a persistent text label and an accessible result count.
- External links include meaningful names and a visible external-link cue.
- Reduced-motion, larger-text, and high-contrast preferences continue to apply.
- At widths below 760px, suggestions scroll horizontally, knowledge bases stack, answers wrap without clipping, and targets remain at least 44 pixels high.

## Language Behaviour

The Help feature uses the existing language preference and data-driven content boundary. English is the authoritative prototype copy. Existing translated navigation remains active; untranslated FAQ content falls back to English rather than displaying an inaccurate legal translation. The FAQ record structure must permit reviewed translations to be added per language without changing the rendering or scoring logic.

## Error and Safety Boundaries

- If JavaScript filtering fails, all native disclosure items remain visible and operable.
- If an official external link cannot be reached, the current page remains intact because it opens separately.
- Do not collect names, mobile numbers, case facts, or free-form descriptions on Help.
- Do not state that a person is eligible for legal aid; direct them to the official eligibility information.
- Do not calculate deadlines, recommend legal strategy, or describe an order as authoritative unless it comes from the official record.

## Implementation Boundary

Keep the feature in the standalone `prototype-v3.html` architecture:

- add a structured FAQ data collection;
- replace `supportPage()` with the new render;
- add scoped Help styles;
- extend the delegated `click` and `input` handlers for disclosure and search behavior;
- keep suggestions in transient state only;
- preserve the existing navigation, document workspace, finder, glossary, accessibility preferences, and optional OTP flow.

No backend, analytics, new dependency, or remote data fetch is introduced.

## Verification

Browser checks must cover desktop and mobile viewports:

1. Help opens from primary navigation, mobile menu, finder support link, and case support link.
2. Both knowledge bases render and every disclosure opens through mouse, keyboard, and touch-equivalent input.
3. Search filters across both groups, reports the count, and resets from the empty state.
4. Opening a question changes the three suggestions predictably.
5. Selecting a suggestion opens and focuses the correct question.
6. Suggestion activity is absent from `localStorage` after reload.
7. Official links have safe `target="_blank"` behavior with `rel="noopener noreferrer"`.
8. High contrast, larger text, and reduced motion remain functional.
9. No controls overlap or clip at 375x812, 768x1024, and 1440x900.
10. Browser console has no errors or warnings.

## Acceptance Criteria

- The Help route is no longer a passive set of three informational cards.
- Portal support and general court/constitutional information are visibly distinct.
- A first-time citizen can reach an answer in one search or one disclosure interaction.
- Suggested questions adapt locally and lead to working FAQ entries.
- The page routes to real official support resources without implying government affiliation.
- The feature remains usable without login and does not persist Help activity.
