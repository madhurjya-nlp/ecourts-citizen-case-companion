# Citizen UI Hierarchy Redesign

## Objective

Make the eCourts Citizen Case Companion feel like a calm, trustworthy public-assistance service rather than a generic dashboard. The redesign must help a stressed first-time citizen identify the primary task immediately while preserving the working case search, multilingual interface, paper analysis, PDFs, NYK assistant, WhatsApp preview, and official-service links.

## Approved scope

This pass includes Phases 1 and 2 of the supplied audit plus the structural redesign of the Case "Understand" stage. Broader icon replacement and restructuring of remaining screens are deferred.

## Design direction

The interface will use hierarchy through typography, whitespace, dividers, and selective containment. Interactive choices may remain boxed; static information should generally become unframed content separated by spacing or rules. Each screen or major stage will have one visually dominant action.

Color roles will be explicit:

- Deep green: primary action only.
- Near-black and neutral gray: content and structure.
- Amber: deadlines, verification, and action-needed states.
- Muted blue: links that leave the companion for an official government service.

Page titles will use a strong 28-32px mobile scale, section headings 20px, item headings 16px, body text 14-15px, and metadata 12-13px. Existing Indian-script font fallbacks will remain intact.

## Global changes

- Remove the persistent "Use for someone you know" shortcut from inner-page headers. Keep assisted use accessible from Home and navigation.
- Prevent the NYK launcher and contextual prompt from obscuring interactive content or the mobile dock.
- Standardize primary, secondary, text, warning, and official-external action treatments.
- Reduce decorative icons in static rows. Retain icons in navigation and high-frequency actions.
- Keep all controls keyboard accessible and preserve visible focus indicators.
- Replace the five large mobile journey cells with a compact stepper: completed and future steps use dots/numbers, while only the active step carries a full label.

## Home

- Preserve the two-path citizen entry, but make the universal case search the strongest visual object directly after the introduction.
- Use a shorter search placeholder that fits narrow screens.
- Convert "Things people commonly need" from four equal cards into a divided action list.
- Move assisted-use and WhatsApp preview controls into a quiet "More ways to use eCourts" disclosure.
- Keep one primary action: "Find my case."

## Help

- Preserve the four intent choices as primary navigation cards.
- Give the scoped NYK question entry a clear place above keyword FAQ search without suggesting unrestricted legal advice.
- Restyle FAQ groups as plain divided disclosure rows with plus/minus indicators and no card shadow.
- Keep source references collapsed beneath answers and identify official external links using the blue treatment.

## Case: Understand

The top viewport will contain case identity, status, the next hearing, the plain-language explanation, the verification warning, and one primary "Prepare" action.

The existing official/plain-language modes remain, but the explanation moves ahead of secondary history and document lists. "What this case needs next" remains the core of the Next Action stage rather than being duplicated in Understand.

Secondary content will use progressive disclosure:

- A single "Preparation checklist" disclosure contains both online verification and offline collection lists.
- Case papers remain available as a compact divided list.
- Case history becomes a disclosure or lower-priority timeline.

Amber will mark all priority and verification treatments consistently. Official record links use muted blue.

## Case: Prepare

- Keep the role selector and generated checklist in one intentionally tinted interactive region.
- Make "Continue to official services" the primary action.
- Render reminder, document studio, and legal help as secondary or text actions.

## Interaction and data boundaries

This is a presentation and disclosure refactor. Existing state keys, URL routes, API request shapes, upload validation, generated document data, and external destinations must not change. Native `details`/`summary` controls are preferred for new disclosures so keyboard and screen-reader behavior remain dependable.

## Responsive behavior

The design will be validated at 1440x900, 390x844, and 360x800. No page may create horizontal document overflow. Fixed controls must respect the mobile dock and safe-area inset. The active journey step and primary CTA must remain discoverable without horizontal scrolling.

## Verification

- Run all static, Worker, and browser tests.
- Add focused tests for disclosures, mobile stepper visibility, assisted-use relocation, and official-link styling.
- Complete the citizen demo path from Home search through official service at desktop and both mobile widths.
- Capture and inspect settled screenshots for Home, Help, Understand, and Prepare.

## Deferred work

- Commissioning or replacing the entire icon family.
- Framework migration or splitting the monolithic renderer.
- New AI capabilities, APIs, databases, or legal-advice behavior.
- Structural redesign of Court Services and Document Studio beyond shared visual tokens.

## Research notes

Skipped outside research because the user supplied a current UI audit and approved its implementation scope, and this project already contains recent comparative court-service research and validated visual references. Codebase inspection confirms the relevant UI is isolated to the existing renderer and layered CSS, so the redesign can preserve current contracts.
