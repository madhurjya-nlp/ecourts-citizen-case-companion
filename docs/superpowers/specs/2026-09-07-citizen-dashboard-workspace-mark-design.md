# Citizen dashboard, workspace parity, and civic mark design

## Goal

Make the paper/case workflow easier to discover and safer to understand while introducing a session-only sample case dashboard and a clearly synthetic replacement for the national emblem.

## Approved behavior

- The Find Case experience has a compact homepage-style search bar in every mode, including paper scanning.
- After a matched scan review, the citizen can explicitly add the matched sample case to “My case dashboard.”
- The dashboard stores only the current browser session’s synthetic case references. It does not require an account, persist to localStorage, or imply a real citizen database.
- The dashboard links to the existing canonical case-information page rather than creating a second case-detail renderer.
- The documents/workspace route presents two equal paths:
  - My case dashboard: session-only saved sample cases.
  - Professional workspace: optional local demo lawyer session and drafting tools.
- Both paths receive balanced visual hierarchy, separate explanations, keyboard-accessible controls, and responsive stacking on small screens.
- The lawyer path remains explicitly a demo session and does not verify identity or grant production access.
- Replace `assets/emblem-india.png` in the header with a synthetic abstract civic mark. It must not resemble the Ashoka emblem, lion capital, chakra, seal, government crest, or official text. The consuming asset will be a simple vector SVG derived from the approved generated concept.

## Data and safety boundaries

- Saved dashboard entries are session memory only and are cleared by reset/reload according to the prototype’s transient-state policy.
- Existing synthetic case disclosures remain visible near dashboard and case content.
- No Worker contract, backend schema, real credentials, or official judicial source claims change.
- The generated mark is registered as a synthetic editorial/interface asset, not an official government identity.

## Visual direction

- Preserve the deep green, warm paper, charcoal, and restrained editorial system.
- Use the existing homepage search treatment for Find Case.
- Use balanced workspace panels, not a lawyer-only banner followed by citizen content.
- Keep the mark small, calm, and legible at header size; avoid seal-like geometry or official insignia.

## Error and empty states

- An empty dashboard explains that no sample case has been added in this browser session and offers Find a case / Scan a paper actions.
- A dashboard item that cannot be resolved uses an honest unavailable state and does not fabricate details.
- Search values remain visible after failed Find Case submissions.
- A scan that has not been explicitly added does not appear in the dashboard.

## Testing acceptance

- Paper and non-paper Find Case modes expose the quick search and route correctly for CNR, case number, party, and failed input.
- A matched scan can be added once, appears in the session-only dashboard, and opens the existing case-information screen.
- Reload/reset clears the dashboard; no dashboard case is persisted.
- Citizen and lawyer workspace paths are both reachable without one being hidden behind the other.
- Dashboard empty, success, and unavailable states are keyboard accessible and visibly disclosed as sample/prototype content.
- Header uses the synthetic SVG mark and no longer references the national emblem image.
- Desktop/mobile browser tests, static tests, syntax checks, and diff checks pass.

## Research notes

Skipped external research because this is a repository-local interaction and visual change with no new official terminology, external service, or factual claim. Existing repository specs, current route behavior, and the user-provided browser review are the governing references.
