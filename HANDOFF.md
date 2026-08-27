# eCourts Citizen Case Companion: Final Sprint Handoff

## 1. Objective

Finish and publish one credible static web portal for first-time Indian citizens who need to find a case, understand a court record, prepare a document draft, or reach the correct official judicial service.

The product is an **independent hackathon prototype**. It must never imply that it is operated by eCourts, the Supreme Court, the e-Committee, a High Court, a District Court, NIC, or another government body.

Time is limited. Complete existing flows, remove contradictory files, add the missing official-service directory, verify, and deploy. Do not expand into PWA, Android packaging, live authentication, payment, filing, OCR, a database, or an LLM integration.

## 2. Read First

1. `C:\Users\madhu\Downloads\AGENTS.md`
2. `README.md`
3. `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`
4. `docs/superpowers/specs/2026-08-25-civic-case-companion-redesign.md`
5. `docs/superpowers/specs/2026-08-26-full-localization-civic-ui-refinement.md`

Use `apply_patch` for manual edits. Do not create subagents unless the user explicitly authorizes them again.

## 3. Canonical Build

The only submission entry is:

```text
index.html
```

Runtime assets:

```text
assets/prototype-v3.css
assets/prototype-v3-locales.js
assets/prototype-v3-app.js
assets/citizen-justice-hero.jpg
assets/ecourts-favicon.png
assets/LUCIDE-LICENSE.txt
```

Tests:

```text
tests/prototype-v3-static.test.mjs
tests/finder-check.spec.mjs
tests/citizen-workflows.spec.mjs
playwright.config.mjs
package.json
package-lock.json
```

`prototype-v3.html` is no longer canonical. Static tests must inspect `index.html`.

## 4. Product Boundaries

- Interface languages: English, Assamese, and Hindi only.
- Generated legal draft structure and downloaded PDFs: English only.
- All cases, litigants, lawyers, courts, hearings, phone numbers, OTPs, records, and case documents in the demo are synthetic.
- Draft answers remain in the current browser session and must not enter `localStorage`.
- Assisted use through **Someone I help** must not collect or persist the assisted person's identity or imply legal authorization.
- Official services open as clearly labelled external links. The prototype must not claim integration or transmit user-entered data to them.
- Keep the restrained civic design. Do not add tricolour branding, a chakra, seal, state emblem, government header, or ornamental motion.

## 5. Current Working Features

- Public Home without login or an assigned fictitious case.
- Find a case through sample CNR, case number, party name, or paper preview.
- Keyboard-operated Finder tabs with Arrow keys, Home, and End.
- Synthetic case workspace with record explanation, case history, lawyer information, and case documents.
- Help search, smart follow-up suggestions, and 15 FAQ records divided into portal and practical-court information.
- Seven template-led document workflows.
- English, Assamese, and Hindi interface packs.
- Simulated mobile/OTP profile creation.
- Browser tests use the canonical `index.html`.

## 6. Known Defects to Fix First

### 6.1 PDF locale corruption

The localized template title can reach the ASCII-only PDF generator. Assamese or Hindi characters become question marks.

Required fix:

- Resolve the selected template's canonical English definition separately from its localized UI definition.
- Pass only the canonical English title, English body lines, and stable English filename into `createPdfBlob()`.
- Test PDF generation while the interface is English, Assamese, and Hindi.
- Assert that the output contains the expected English title and no replacement question-mark title.

### 6.2 Case documents reuse one body

Interim Order, Property Paper Checklist, and Case Status Note currently risk producing substantially identical content.

Required fix:

- Give every case document a distinct English body and localized plain-language explanation.
- Include a local synthetic/non-official disclosure inside every modal and PDF.
- Keep filenames distinct and deterministic.

### 6.3 Remaining localization leaks

Remove hardcoded English from dynamic Help announcements and PDF-language notices. Use existing locale keys or add the same schema key to all three packs.

### 6.4 Draft loss

Switching templates must not silently discard a non-empty form.

Use the least complex solution:

- Detect whether any current field is non-empty.
- Show a localized native confirmation before switching.
- Do not persist drafts.

### 6.5 Test server collision

The Playwright configuration uses fixed port `4173` with `reuseExistingServer: false`.

Required fix:

- Read a test port from `ECOURTS_TEST_PORT`, with a safe default such as `43917`.
- Use that value for `baseURL`, `webServer.command`, and `webServer.url`.
- Document the override in the README.

## 7. Missing Courts and Official Services Route

Add one primary navigation item named **Courts & Services**. It is a directory and routing layer, not a dashboard and not a replacement for official portals.

### 7.1 Page introduction

Suggested English content:

```text
Kicker: OFFICIAL SERVICE DIRECTORY
Heading: Continue with the right court service.
Body: Choose the court level or official service you need. These links open government judicial portals in a new tab. Information entered in this prototype is not sent to them.
```

Provide reviewed Assamese and Hindi versions through locale data.

### 7.2 Court-level tabs

Create a semantic tablist with two primary tabs:

```text
District Courts
High Courts
```

Desktop:

- Tabs appear below the introduction.
- Selected tab has a strong underline and `aria-selected="true"`.
- Content uses an unframed two-column service list, not decorative cards.

Mobile:

- Tabs form a stable two-column segmented control.
- Each tab remains at least 44 px high.
- Content becomes one column.

Keyboard behavior:

- `ArrowLeft` and `ArrowRight` move and activate tabs.
- `Home` selects District Courts.
- `End` selects High Courts.
- Use the existing Finder tab helper/pattern instead of creating a second inconsistent implementation.

### 7.3 District Courts tab

Show these actions in this order:

1. **District Court Services**  
   Purpose: case status, cause lists, and orders/judgments for District and subordinate courts.  
   URL: `https://services.ecourts.gov.in/`

2. **District Court NJDG**  
   Purpose: aggregate judicial data and pendency monitoring, not an individual case-filing service.  
   Entry: use the verified District Court NJDG destination exposed by `https://ecourts.gov.in/` or a verified direct official URL.

3. **District Courts of India**  
   Purpose: reach State and district court websites.  
   Entry: use the verified official destination exposed by `https://ecourts.gov.in/`.

Add a short chooser:

```text
Looking for your own case? Start with District Court Services.
Looking for aggregate pendency data? Use NJDG.
```

### 7.4 High Courts tab

Show these actions in this order:

1. **High Court Services**  
   Purpose: case status, cause lists, caveats, and orders/judgments for High Courts.  
   URL: `https://hcservices.ecourts.gov.in/`

2. **High Court NJDG**  
   Purpose: aggregate High Court judicial data and pendency monitoring.  
   Entry: use the verified official destination exposed by `https://ecourts.gov.in/` or a verified direct official URL.

3. **High Courts of India**  
   Purpose: reach individual High Court websites.  
   Entry: use the verified official destination exposed by `https://ecourts.gov.in/`.

Add a short chooser:

```text
Looking for a High Court case or order? Start with High Court Services.
Looking for aggregate pendency data? Use NJDG.
```

### 7.5 Shared official services

Below the tabs, add a restrained full-width section titled **Judicial institutions and support**:

- **eCourts gateway** — `https://ecourts.gov.in/`
- **National Judicial Data Grid** — `https://njdg.ecourts.gov.in/`
- **e-Committee, Supreme Court of India** — `https://ecommitteesci.gov.in/`
- **Supreme Court of India** — `https://www.sci.gov.in/`
- Existing official legal-aid and Tele-Law destinations.

Every external link must:

- display an external-link icon;
- include an accessible new-tab label;
- use `target="_blank"` and `rel="noopener noreferrer"`;
- be identified as an official external destination;
- avoid forwarding query strings or user-entered case information.

Do not call this route a partnership, integration, gateway login, or single sign-on.

## 8. Repository Cleanup

Perform cleanup only after `index.html` passes all tests.

### 8.1 Delete obsolete HTML builds

Delete:

```text
prototype.html
v1.9.2.html
prototype-v2.html
prototype-v2.before-first-home.html
prototype-v3.html
```

Before deletion:

- Ensure no test, README entry, stylesheet, script, or deployment config references them.
- Change the static test to inspect `index.html`.
- Run `rg -n "prototype-v|prototype\.html|v1\.9\.2\.html" .` and resolve active references. Historical design documents may retain factual history, but no run instruction may point to an old build.

### 8.2 Delete generated tooling and caches

Delete from the submission copy:

```text
.playwright-cli/
.superpowers/
tmp/
test-results/
node_modules/
```

`node_modules/` is recreated with `npm ci` and must not be deployed or submitted unless the hackathon explicitly requires vendored dependencies.

### 8.3 Curate output evidence

Keep only final screenshots that prove:

- Home desktop/mobile;
- Finder desktop/mobile plus one Assamese and one Hindi view;
- Courts & Services desktop/mobile;
- Case desktop/mobile;
- Documents desktop/mobile;
- Help desktop/mobile.

Delete superseded screenshots and downloaded test PDFs from `output/` and `.playwright-cli/`.

### 8.4 Curate documentation

Retain:

```text
README.md
HANDOFF.md
docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md
docs/eCourts_Citizen_Case_Companion_Project_Brief_v0.pdf
docs/eCourts_Citizen_Case_Companion_Project_Report_v0.pdf
docs/superpowers/specs/2026-08-25-civic-case-companion-redesign.md
docs/superpowers/specs/2026-08-26-full-localization-civic-ui-refinement.md
```

Archive or delete superseded plans/specs only after confirming they contain no unique judging evidence. Do not deploy `docs/` unless intended.

### 8.5 Retain project-control data

Keep `.agent/` registries when they contain current provenance, links, or audit state. Update rather than delete:

- `.agent/asset-registry.json`
- `.agent/link-registry.json` if created
- `.agent/audit.json`
- `.agent/reports/latest.md`

Copy the authoritative `C:\Users\madhu\Downloads\AGENTS.md` into the repository root before final handoff so future tools receive the rules automatically.

### 8.6 Add ignore rules

Create `.gitignore` containing at least:

```text
node_modules/
test-results/
playwright-report/
.playwright-cli/
tmp/
*.log
```

## 9. Required Test Matrix

### Static

- Canonical `index.html` loads all three local assets.
- Exactly three complete locale packs.
- Exactly 15 Help records and seven document templates per language.
- No old HTML entry is referenced by active instructions.
- No tricolour/chakra/conic selectors or deprecated color aliases.

### Browser

- Home and Someone I help.
- Finder tabs and Enter-key search behavior.
- Case search and synthetic disclosure.
- Three distinct case-document dialogs and PDFs.
- Help search, suggestions, and both FAQ bases.
- Seven document templates, required fields, literal hostile input, template-switch confirmation, and downloads.
- Courts & Services tabs, keyboard behavior, responsive stacking, and all outbound URLs.
- English, Assamese, and Hindi route checks.
- Desktop `1440x900` and mobile `375x812` overflow checks.

### PDF

- Valid `%PDF-` header.
- Non-empty and parseable.
- Correct English title and body.
- Expected user-entered English literal.
- Synthetic/draft disclosure.
- No corrupted localized heading.
- Distinct content for all three case documents.

### Privacy and security

- No draft answers, assisted-use data, mobile number, OTP, or profile name in `localStorage`.
- Stored state is allowlisted and validated.
- External links use safe new-tab attributes.
- Help records remain trusted bundled data. Before connecting database or AI content, replace direct `innerHTML` interpolation with safe DOM construction and validate source URLs.

## 10. Final Commands

```powershell
npm ci
npm test
npx playwright test --config=playwright.config.mjs --repeat-each=3
rg -n "prototype-v|prototype\.html|v1\.9\.2\.html|downloads/" README.md index.html assets tests package.json playwright.config.mjs
```

Then serve and inspect:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/` and inspect all routes before deployment.

## 11. Completion Definition

The project is complete only when:

- one canonical entry remains;
- obsolete and generated files are removed from the submission copy;
- District Court and High Court tabs lead citizens to the correct official service;
- NJDG and e-Committee passages are visible and accurately described;
- all three languages work across the complete interface;
- every advertised PDF action produces the correct file;
- tests pass from a clean `npm ci` environment;
- final desktop/mobile screenshots show no overlap or misleading authority cues;
- the hosted URL loads the canonical build and all external links/downloads work.
