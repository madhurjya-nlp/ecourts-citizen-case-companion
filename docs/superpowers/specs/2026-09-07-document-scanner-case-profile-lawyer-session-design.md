# Document Scanner Reliability, Case Context, and Lawyer Demo Session

## Goal

Fix the existing court-paper scanner workflow so users can always see whether a paper is ready, queued, being read, being checked, complete, or failed. Prevent uploads and duplicate submissions while a request is pending. After a successful analysis, let a user explicitly review and apply extracted details to a matching synthetic case from a local mock case repository. Add a small, clearly labeled lawyer demo session around that review action.

This is a Build What Moves India hackathon prototype change. It does not create a second scanner, a production account system, a live court integration, or a persistent case database.

## Scope and constraints

- Extend the existing scanner in `assets/prototype-v3-app.js` and its current CSS; do not replace the current document-analysis flow.
- Preserve the existing Cloudflare Worker upload contract and `analysisEndpoint` configuration.
- Add no dependency.
- Keep uploaded files and extracted analysis session-only; do not persist raw documents or personal data.
- Use a local synthetic case dataset to demonstrate discovery at useful scale, with every record labeled as sample/demo data.
- Keep synthetic/demo case data visibly disclosed as prototype content.
- Do not present extracted analysis as an official court record or verified advocate identity.
- Preserve English, Hindi, and Assamese UI boundaries. New safety/status copy may use the current English-first fallback where complete translation is not available, but existing localized routes must continue to render.

## User experience

### Scanner state model

The existing scanner will expose one state at a time:

`ready → selected → queued → processing → checking → success`

Invalid input and request failures return to a retryable `error` state. The selected file remains visible through the request lifecycle.

When the request is queued or active:

- both file inputs are disabled;
- the analyse button is disabled;
- the current filename and size remain visible;
- a visible progress/status panel appears with a lightweight CSS spinner;
- `aria-busy` and a polite live status communicate the state to assistive technology;
- a second submission cannot start another request;
- stale or duplicate responses cannot replace a newer result;
- error state provides a clear retry path without inventing an analysis.

The spinner is non-essential and must respect reduced-motion preferences.

### Analysis result and case matching

The existing structured Worker response remains the source for the displayed extraction. When the analysis returns, the result shows its current fields and confidence values. The result searches a local mock case repository. If `case_number` exactly matches a synthetic record, it shows `We found a matching sample case` with a concise case summary and an `Open case` action. The user can then open that case screen and review the scanned details in context.

The repository should begin with roughly 100–500 synthetic records rather than a fake-looking handful of repeated cards. Records should have stable demo identifiers, case number, court, title, type, status, parties, advocates, dates, documents, timeline, and search aliases. A small repository adapter should own lookup and matching so a future authenticated API can replace the local data without changing the scanner UI.

Matching rules are deliberately conservative:

- exact case-number match is the primary match;
- case-number plus court can strengthen confidence;
- party-name matching may suggest candidates but must not silently select a case;
- multiple candidates show a selection state;
- no match shows an honest no-match state and never invents a case.

The result should use `matching sample case` or `matching demo case`, not `your official case`, while the dataset is synthetic.

No case fields change automatically. An explicit `Review and add to case` action applies a sanitized, derived summary to in-memory case context. The applied block is labeled as being from a scanned paper and prototype analysis. Low-confidence values and verification items remain visible.

If the extracted case number is missing or does not match any repository record, the result remains standalone and explains that it was not attached to a case. The user can still inspect the analysis, but there is no automatic case mutation.

The case workspace will render an additional document-derived context section only after the user opens a matching result and explicitly applies it. It may include document type, extracted dates/parties, a short summary, confidence/verification notes, and a timeline/context marker. It must not rewrite the synthetic court record, official status, hearing date, or lawyer identity.

### Prototype-to-production boundary

The local mock repository demonstrates the practical interaction model, not a claim that the prototype has access to citizen records. A real implementation would replace it with an authenticated, authorization-aware service that retrieves only records the user is permitted to see, validates the scanned identifier against the responsible official source, records provenance and audit events, encrypts sensitive data in transit and at rest, and applies retention/deletion rules. The scanner should send only the minimum document and context required by that service. None of those production controls are implied by the hackathon mock database.

### Lawyer demo session

Add a small local demo session, reachable from the existing professional/document context:

- a clearly labeled `Lawyer demo session` sign-in action;
- a modal with synthetic demo access, preferably a one-click entry or explicitly synthetic credentials;
- a visible `Demo lawyer session` badge and sign-out action;
- permission only to review and apply matching scan details to the open synthetic case;
- session-only state, cleared on sign-out/reset and never sent to the Worker.

Copy must state that this is a Build What Moves India prototype session. It does not verify advocate identity, create a lawyer-client relationship, or provide production access.

## Data flow

1. User chooses a PDF/JPG/PNG through the existing scanner.
2. The browser validates type and size, stores the file in the existing temporary variable, and enters `selected`.
3. Submission assigns a request token, enters `queued`/`processing`, locks intake controls, and sends the unchanged `FormData` contract to the configured Worker.
4. The response is accepted only if it belongs to the current request token and contains the existing `analysis` object.
5. The result renders escaped structured values.
6. The browser queries the local synthetic case repository. Exact, ambiguous, and no-match outcomes are rendered without fabricating a record.
7. User opens a matching sample case and explicitly reviews/applies the analysis. The browser stores only derived session state for case rendering.
8. The case workspace displays the derived context as provisional uploaded-paper analysis, separate from official/synthetic record fields.

## Error handling and safety

- Missing analysis endpoint keeps the current honest unavailable message and does not enable a fake result.
- Invalid file type/size remains a local validation error.
- Network, HTTP, malformed JSON, or missing-analysis failures show a retryable error state and leave the case unchanged.
- Navigating away while a request is pending must not allow a late response to mutate a new route.
- The Worker contract and raw upload handling remain unchanged.
- All newly rendered analysis values use the existing escaping path.

## Testing

Add targeted browser coverage for:

- selected-file state and visible pending status;
- disabled upload controls and analyse button during an in-flight request;
- duplicate-click prevention;
- successful result rendering and matching-case review/apply flow;
- unmatched case analysis remaining unattached;
- request failure returning to a retryable state;
- lawyer demo sign-in, visible session state, sign-out, and session boundary;
- case workspace rendering only after explicit apply;
- mobile overflow, keyboard access, focusable controls, and reduced-motion-safe loading behavior.

Run the existing static tests and the affected browser workflow tests, then broaden to the full test command if the shared app state or global CSS changes affect other routes.

## Research notes

- Codebase inspection confirms the existing scanner is `paperIntakeMarkup()` plus `analyseSelectedPaper()` in `assets/prototype-v3-app.js`; the current implementation disables only the analyse button and leaves file inputs available during the request.
- The existing Worker accepts the current `FormData` fields `paper` and `language` and returns `{ analysis }` with document type, court, case number, dates, parties, summary, verification items, and sources. This change preserves that contract.
- Existing product and audit documents state that the prototype has no backend, database, upload storage, authentication service, or real lawyer records. The demo session therefore stays local/session-only and must be visibly synthetic.
- Existing NYK design guidance says raw uploads are temporary and only validated structured analysis may be used as context; the case-update flow follows the same boundary.
- No new external research is required for this UI/state fix because the relevant behavior and safety constraints are already recorded in the repository’s approved design and audit documents.

## Explicit exclusions

- No real lawyer authentication, advocate enrollment lookup, OTP, password storage, user account creation, or role authorization.
- No automatic overwrite of official case data.
- No claim that the local mock dataset represents a citizen database or live court service.
- No document persistence, document sharing, or background processing queue.
- No change to the Worker schema, model instructions, or external court links.
