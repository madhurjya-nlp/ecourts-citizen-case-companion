# Full Localisation and Civic UI Refinement

## Goal

Make language switching complete and predictable across the standalone eCourts hackathon prototype, then strengthen the visual hierarchy of the masthead, Finder, Help and case workspace. The build supports English, Assamese and Hindi without presenting a mixed-language interface.

## Product Boundary

This remains an independent static hackathon prototype. It does not connect to eCourts, a court database, an AI service, legal-services records or a live authentication system.

Translated legal explanations, FAQs and procedural guidance are prototype translations pending native-speaker and legal review. Proper names, CNR values, court names, source titles, Tele-Law, URLs and synthetic record identifiers remain unchanged. Generated legal-draft bodies and downloadable PDFs remain English until reviewed legal translations and Unicode PDF font embedding are available.

## Research Notes

- The official eCourts app guide describes language selection as updating the application interface, supporting the requirement that a selected language must not leave navigation, headings and body copy mixed: https://services.ecourts.gov.in/App/apphelp.html
- The Legislative Department publishes the Constitution of India in regional languages, including Assamese, and is the terminology reference for constitutional vocabulary: https://lddashboard.legislative.gov.in/constitution-of-india-in-regional-languages
- The local `prototype.html` already contains broad 18-language navigation and public-service vocabulary. Reuse those established translations where they match V3 concepts instead of inventing new variants.
- Current V3 translates only a small `text` dictionary. Most route headings, explanatory paragraphs, sample data, document labels, dialogs, Help records, validation messages and toasts are hard-coded English.
- Current Help suggestions are a deterministic local scorer over an in-memory FAQ array. The future AI/database model must be documented as an interface boundary, not presented as live functionality.

## Supported Languages

The complete interface covers:

1. English (`en`)
2. Assamese (`as`)
3. Hindi (`hi`)

All three interfaces use `ltr`. Generated legal-draft prose and PDFs remain English-only because reviewed legal translations and Unicode PDF font embedding are outside this hackathon scope. Assamese and Hindi users receive a localized notice before preview/download.

## Localisation Architecture

### Content Packs

Replace route-specific hard-coded strings with a `localePacks` object keyed by language code. Each pack has the same schema:

- shared navigation, accessibility, dialog and validation copy;
- Home route;
- Finder route and result metadata labels;
- Documents route, template navigation, form labels, descriptions and safety copy;
- Help route, services, search, suggestions, both knowledge-base headings and all FAQ records;
- case workspace headings, status values, documents, timeline and support action;
- glossary labels, meanings and contextual explanations;
- toast and error messages.

English is the schema source. Development validation must fail when a selected language lacks a required key. Runtime fallback to English remains a last-resort safety mechanism, but complete language packs should make fallback unnecessary for interface copy.

### Record Data Boundary

Keep record identity separate from interface language:

- Do not translate `Meera Iyer v. R. K. Builders`, `Bengaluru City Civil Court`, CNR, case number or dates stored as record values.
- Translate labels around those values, explanatory synthetic summaries, status descriptions and timeline descriptions.
- Add a short localised `record values shown as filed` cue where necessary rather than silently transliterating identifiers.

### Draft Boundary

Translate the Documents workspace interface and form prompts. Keep generated draft prose and PDF output English. When a non-English language is selected, show a localised notice before the preview that the legal draft text is generated in English for this prototype.

## Masthead Redesign

Replace the thin navigation row with a compact civic masthead:

- retain the tricolour rule at the top;
- use a dark navy masthead surface with white eCourts wordmark;
- add a small localised `Citizen services` descriptor beside or below the wordmark;
- present navigation as clear text commands with a restrained saffron active indicator;
- keep language and accessibility controls compact, high contrast and aligned to the end;
- mobile keeps the wordmark, language state, accessibility and a real menu button without text collisions.

The masthead must not use a government emblem or imply official endorsement.

## Finder Redesign

### Search Surface

Replace the current pale nested form box with a stronger search workspace:

- use a crisp white surface, dark navy top rule and a restrained shadow;
- increase the primary input to at least 56 pixels high on desktop and 52 pixels on mobile;
- use the multilingual light-body font stack (`Nirmala UI`, `Segoe UI Variable Text`, `Noto Sans`, system sans-serif) at normal weight;
- place the primary search command next to or directly below the input according to available width;
- reduce visual competition from the sample-case action;
- keep CNR explanation controls outside the form submission path and explicitly `type="button"`.

### Result Design

Replace the pale result band with an editorial case-result block containing:

- case title;
- court and CNR/case number context;
- case type;
- current status;
- lawyer information for both sides, explicitly synthetic;
- one clear `Open synthetic record` command.

Result metadata uses labelled rows or a compact definition list, not decorative chips. The block must remain readable with longer translated labels and RTL languages.

Synthetic result values:

- Case type: Civil suit - property documents
- Status: Documents and objections
- Petitioner lawyer: Adv. Asha Rao (synthetic)
- Respondent lawyer: Adv. Imran Khan (synthetic)

## Help Redesign

- Remove the `Open eCourts Services` top-level action for now.
- Retain free legal aid and Tele-Law official links.
- Replace the split search/tools grid with one large full-width natural-language search field.
- Move Smart Suggestions into a distinct horizontal rail below the search.
- Use higher-contrast white surfaces, navy borders, restrained shadows and larger section spacing instead of pale blue boxes.
- Use an asymmetric editorial knowledge-base grid with clearer heading hierarchy and more negative space.
- Translate search, suggestions, both knowledge bases and all 15 FAQ questions and answers in every language pack.
- Remove the current English-fallback warning once complete packs are present. Replace it with a concise localised prototype-translation disclosure near the Help footer.

## Future AI and Database Boundary

Introduce conceptual interfaces without adding a backend:

- `HelpRepository.search(query, locale)` returns source-linked FAQ records.
- `SuggestionEngine.rank({query, openedIds, locale, records})` returns ranked record IDs.
- The current implementation uses an in-memory repository and deterministic scorer.
- A future backend can replace these with AI intent classification, database retrieval/ranking and contextual next-question generation without changing the Help UI contract.

The current prototype must not claim that AI analysis or a database is live.

## Case Workspace Redesign

### Desktop

Use a wider left reading column and a structured right rail.

Left column:

1. Hearing agenda
2. Read the record

Right rail:

1. Documents
2. Case history
3. Full-width Open Help command

### Read the Record

- Increase available width and padding.
- Give the section a stronger white surface, navy top rule and subtle shadow.
- Present official record, plain-language explanation and verification as three high-contrast layers.
- Use navy, green and saffron identifiers with stronger foreground contrast, not washed-out pastel cards.
- Maintain the semantic distinction between authoritative record, explanation and uncertainty.

### Case History and Support

- Move Case history below Documents in the right rail.
- Use a compact timeline with visible dates/status points and translated descriptions.
- Remove the passive `Need support?` heading and paragraph block.
- Add one full-width primary `Open Help` button with a concise translated supporting label available to screen readers.

### Mobile

Stack in this order:

1. Case identity
2. Hearing agenda
3. Read the record
4. Documents
5. Case history
6. Open Help button

No fixed-height panels may create blank columns or push the footer unnecessarily.

## Typography and Visual System

- Serif display type remains for major English/Latin headings where it renders well.
- Regional scripts use the multilingual sans stack to avoid mismatched glyph weight or missing characters.
- Body copy uses a lighter normal weight with stronger foreground colour.
- White becomes the primary content surface; paper texture remains in the page background.
- Navy provides structure, saffron indicates active/action states and green marks verified/helpful context.
- Increase section spacing and reduce unnecessary borders so negative space is deliberate rather than empty.

## Accessibility

- Language changes update `lang` and `dir` on the document root.
- Longer translated words wrap without clipping buttons or navigation.
- Focus states remain visible against the dark masthead and white surfaces.
- High contrast, larger text and reduced motion continue to work in all languages.
- Suggestion rails and Finder tabs are keyboard-operable and horizontally scroll only within their own container on small screens.
- Native `details/summary` remains the Help disclosure mechanism.

## Verification

Automated and visual checks must cover:

1. English, Assamese and Hindi open every route without JavaScript errors.
2. No known interface key falls back to English in the Assamese or Hindi packs.
3. Proper names, CNRs, court names and English draft output remain unchanged by design.
4. Record identifiers retain their filed direction and content in every supported interface.
5. Home, Finder, Documents, Help, case workspace, language dialog, accessibility dialog, OTP flow, glossary modal, validation and toast states translate.
6. Finder search submits by button and Enter without opening the CNR explanation.
7. Finder result displays case type, status and both synthetic lawyer entries.
8. Help search, empty state, disclosures and suggestions work in each locale.
9. Case history is in the right rail on desktop and follows Documents on mobile.
10. Open Help is a full-width command and routes correctly.
11. No page-level overflow or text clipping at 375x812, 768x1024 and 1440x900.
12. Browser console reports zero errors and warnings.

## Out of Scope

- Live translation APIs, machine translation at runtime, speech translation, real AI classification, a production Help database, live eCourts data, real lawyer records and translated legal-draft generation.
- Claims that prototype translations are authoritative legal translations.

## Acceptance Criteria

- Switching among English, Assamese and Hindi produces a complete same-language interface across all public routes and dialogs.
- The revised header, Finder, Help and workspace show materially stronger contrast, hierarchy and negative-space control.
- Finder results expose case type, status and synthetic lawyer information.
- Help presents a large natural-language search and smart suggestions without a false live-AI claim.
- The case workspace gives record reading more space, moves history into the right rail and replaces passive support content with a clear Help command.
