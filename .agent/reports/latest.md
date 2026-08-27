# eCourts Agent Report

## Scope

Final sprint from `HANDOFF.md`: canonical `index.html`, defect fixes, Courts & Services directory, cleanup.

## Completed

- Canonical entry is `index.html`. Obsolete HTML builds removed from the submission copy.
- Document PDFs use the English template title, English body, and stable English filename even when the interface is Assamese or Hindi.
- Case documents (interim order, property checklist, status note) have distinct English bodies, localized explanations, and distinct filenames.
- Help live region and PDF language notices use locale keys.
- Switching a non-empty document template asks for confirmation and does not persist drafts.
- Playwright reads `ECOURTS_TEST_PORT` (default `43917`).
- Courts & Services directory added with District Courts / High Courts tabs and verified official destinations.
- Someone I help remains session-only and is not stored.

## Verification Performed

- `node tests/prototype-v3-static.test.mjs` — pass
- `npx playwright test --config=playwright.config.mjs` — 21 passed

## Research / Sources

Official destinations taken from https://ecourts.gov.in/ on 2026-08-27. See `.agent/link-registry.json`.

## Synthetic Data

Demo case `DEMO010002026` / Demo Petitioner A remains labelled as sample/hackathon prototype on finder results, case view, document modals, and PDFs.

## Accessibility

Courts tabs reuse the Finder keyboard pattern (ArrowLeft/Right, Home, End), 44 px minimum tab height, and official links include new-tab names.

## Unresolved

- Hosted public URL is not created by this sprint.
- `innerHTML` renderers remain acceptable only for this trusted static prototype.
- Native-speaker and legal review of Assamese/Hindi copy is still pending.
