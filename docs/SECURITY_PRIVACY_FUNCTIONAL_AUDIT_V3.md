# eCourts V3 Security, Privacy and Functional Audit

Date: 26 August 2026

## Executive summary

No critical or high-severity issue was found in the standalone prototype. It has no backend, database, analytics, upload API, payment integration or authentication service. Drafts and PDFs are produced locally. The audit fixed the external font request, broken mobile-menu routing, unsupported-language startup error, fake PDF action and missing multi-page draft labels. The Help route now provides two working knowledge bases, official-service links, search and transient suggested questions.

Two production-hardening items remain: the single-file renderer uses trusted `innerHTML` templates and inline scripts, and hosting security headers are not yet configured. These are acceptable for an offline hackathon prototype but should be resolved before handling real court or citizen data.

## Security findings

### SEC-01

- Rule ID: JS-XSS-001 / JS-CSP-002
- Severity: Medium
- Location: `prototype-v3.html`, renderers and overlay, lines 18-20 and 46-47
- Evidence: the application assembles trusted view constants with `innerHTML`; an inline `onclick` attribute is still present in the mobile-menu template.
- Impact: current search and template values do not reach these HTML strings, but a future API, URL parameter or stored court record could create DOM-XSS risk if inserted without escaping.
- Fix: before production, move scripts into same-origin files, build user/data-driven nodes with `createElement` and `textContent`, remove the inline event handler, and deploy a nonce/hash CSP.
- Mitigation: generated-document values already use `textContent` at line 40, and the hostile-input browser test produced literal text with no script execution.
- False-positive note: current values used in these template strings are controlled constants or allowlisted state, so no exploitable source-to-sink path was demonstrated.

### SEC-02

- Rule ID: JS-CSP-001
- Severity: Medium
- Location: deployment configuration; no hosting configuration is present in the repository
- Evidence: no `Content-Security-Policy` response-header configuration exists. The local development server provides only basic static-file responses.
- Impact: a future injection defect would have less defence in depth; framing and MIME-sniffing controls also depend on the eventual host.
- Fix: configure the production host with CSP, `frame-ancestors`, `X-Content-Type-Options: nosniff`, a conservative `Referrer-Policy`, and an appropriate `Permissions-Policy`.
- Mitigation: the current prototype loads no third-party script and the clean browser session made only same-origin requests.
- False-positive note: these headers may be configured later at the host or CDN, which is outside the current static files.

### SEC-03

- Rule ID: JS-STORAGE-001
- Severity: Low
- Location: `prototype-v3.html`, local state helpers, lines 13 and 20
- Evidence: localStorage contains the optional profile name, preferences and selected synthetic CNR.
- Impact: another person using the same browser profile can see the saved local workspace state.
- Fix: add expiry and a prominent shared-device option before a real deployment; consider storing an alias rather than a legal name.
- Mitigation: no token, password, OTP, mobile number, document answer or generated draft is persisted. Reset removes the single storage key.
- False-positive note: localStorage is being used for non-authentication state only.

## Privacy review

- Clean-load network requests: local HTML and local hero image only.
- Removed during audit: Google Fonts request, which unnecessarily disclosed a visitor network request to a third party.
- Draft form answers: memory only; verified absent from localStorage.
- Mock mobile number and OTP: used only during the active modal; phone number was verified absent from persisted data.
- Help search and suggestion state: memory only; query text, opened FAQ IDs and suggested-question IDs were verified absent from localStorage.
- Persisted data: profile name, language/accessibility preferences and selected synthetic CNR.
- Database: none. No `fetch`, XHR, WebSocket, IndexedDB, beacon or server endpoint exists.

## Help knowledge-base checks

- Two information bases render separately: eCourts/site support and practical court/constitutional information.
- Fifteen native `details` disclosures work without custom disclosure-role emulation.
- Search filters both information bases and provides a working zero-result reset.
- Suggested questions update from the active query or most recently opened topic. Suggestions use deterministic in-browser scoring and do not claim to be AI or personalised legal advice.
- Selecting a suggestion opens and focuses the corresponding disclosure. A suggestion hidden by the current filter clears that filter before opening the target.
- Three top-level service links and every answer source use HTTPS official domains, open separately, and include `noopener noreferrer`.
- Content is India-wide general information. The page does not determine legal-aid eligibility, calculate deadlines, recommend strategy or replace an official record.
- English is the authoritative FAQ copy in this prototype. Reviewed legal translations remain a production requirement.

## User-flow and bug matrix

| Area | Checks | Result |
| --- | --- | --- |
| Home | Public landing, five task routes, no forced profile | Pass |
| Find case | CNR, case number and party name | Pass |
| Invalid search | Wrong value displays a recovery result | Pass |
| Court paper | Mock paper route opens a synthetic match | Pass |
| Case view | Hearing agenda, timeline and documents | Pass |
| Term help | Hover/focus tooltip and tap/click explanation | Pass |
| Help | Two knowledge bases, 15 dropdowns, search, adaptive suggestions and official-service links | Pass |
| Languages | 18 choices open without route failure | Pass; translations remain partial |
| Accessibility | Contrast, larger text and reduced motion persist | Pass |
| OTP simulation | Three steps, displayed OTP and local save | Pass |
| Mobile menu | Home, Find, Documents, Help and workspace routes | Pass after event-propagation fix |
| Responsive layout | 375 px, 768 px and 1440 px; no page-level horizontal overflow | Pass |

## Document and PDF checks

- All eight templates produced downloadable PDFs.
- Required empty fields prevented download and focused the first invalid control.
- Hostile HTML-like input remained literal; no JavaScript executed.
- All eight PDFs parsed with `pypdf` and contained their draft/legal-safety labels.
- A stress-test service agreement produced three pages; every page repeated the document title, draft warning and page number.
- PDF pages rendered successfully to PNG with no blank page, clipping or overlap detected.
- The case-document View action produced a valid `interim-order-synthetic.pdf` download.
- Regional-script preview text is preserved. PDF download is blocked with an explicit message until Unicode font embedding is implemented.

## Residual product risks

1. Template wording needs review by Indian lawyers and relevant state specialists before any public launch.
2. Stamp duty, registration, notarisation and court forms vary by document and jurisdiction; the current warnings do not calculate these requirements.
3. Regional-language selection is broader than the translated content. Native-speaker review and Unicode PDF fonts remain required.
4. Search is a deterministic synthetic dataset, not a real eCourts integration or database test.
