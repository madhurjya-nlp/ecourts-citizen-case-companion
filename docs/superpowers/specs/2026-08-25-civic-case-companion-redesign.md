# Civic Case Companion Redesign

## Goal

Replace the dashboard-first V2 prototype with a polished, task-first citizen experience that demonstrates one complete synthetic journey: discover a case, understand its court paper, save a workspace through an optional mocked OTP, and return to a useful case view.

## Product Position

This is an independent hackathon prototype, not an official eCourts product. It uses only synthetic cases, documents, names, mobile numbers, OTP values and statuses. It does not connect to government systems, request real credentials, or imply official endorsement.

## Research Notes

- The official eCourts mobile FAQ says registration is not required for access; it supports search by CNR, case number, filing number, party name, advocate details, FIR, case type and Act, alongside case history, cause lists, saved cases, documents, languages and themes: https://services.ecourts.gov.in/App/appfaq.html
- The official case-status service requires concrete identifiers and court context, with a search result followed by an explicit View action; it is a useful operational baseline but not the desired citizen-facing interaction model: https://services.ecourts.gov.in/ecourtindia_v6/casestatus/
- Local V2 contains a strong synthetic timeline and legal-aid framing but exposes a fictitious profile and dashboard before the citizen has selected a case.
- The comparison audit is stored at `C:\Users\madhu\.agent\diagrams\ecourts-comparison-audit.html`.
- UN EGDI 2024 places Denmark first, Estonia second, Singapore third and the Republic of Korea fourth among leading digital-government countries. The ranking is used only as a benchmark for where to inspect public-service patterns, not as a claim that court systems are directly comparable: https://desapublications.un.org/sites/default/files/publications/2024-09/(Chapter%202)%20E-Government%20Survey%202024%201392024.pdf
- Singapore Courts' public hearing list defaults to today and tomorrow, then lets people change the date and filter court context. Adopt a modest version: make the next hearing an explicit date-led panel after a case is selected: https://www.judiciary.gov.sg/hearing-list
- Denmark's minretssag guidance combines short task-specific instructions with a clearly documented alternative for people who cannot use the digital path. Adopt a small, visible human-support alternative rather than making every task a multi-step tutorial: https://www.domstol.dk/selvbetjening/blanketter-og-vejledninger/minretssagdk/
- Estonia's e-File tracks deadlines and proceeding progress from one gateway; the existing timeline already supports this pattern, so it should be refined rather than expanded: https://www.rik.ee/en/e-file/introduction-e-file

## Visual Direction

Use the approved editorial civic-service direction.

- Deep judicial blue is the structural color.
- A thin saffron-white-green rule signals Indian civic context without using a government emblem or appearing official.
- Warm paper surfaces and restrained textile/paper grain replace the current SaaS/notion-like card treatment.
- One original editorial visual anchors the desktop home; it should depict a citizen holding a court paper in a recognisable Indian civic setting, with no official insignia or embedded text.
- Desktop is calm and editorial. Mobile is purpose-built: a compact top bar, one primary task at a time, bottom-sheet menus, high-contrast action rows and a simplified hero crop.
- Motion is short and functional: entry reveal, transition between discovery steps, and OTP progress. It must respect reduced-motion preferences.

## Information Architecture

Public navigation contains Home, Find a case, Help and the language/accessibility controls. Dashboard, calculator and lawyer-category sections are removed from public navigation.

### 1. Home

The home screen contains four task routes:

- Find a case
- Read a court paper
- Check a hearing
- Get legal help

There is no anonymous-avatar treatment, no "start without login" copy and no named case in the initial view. A discreet prototype disclosure appears in the footer and at the point a synthetic record is shown.

### 2. Find a case

The case finder offers four tabs:

- CNR
- Case number
- Party name
- Court paper / QR

Each validates locally and returns a labelled synthetic result card. Empty or unmatched input gets recovery wording and a sample-case option. The paper/QR route uses an illustrative mock scan step; it does not upload or store a file.

### 3. Case view

Opening a result shows the next hearing, status, a chronological case history, a clear official-record / plain-language / uncertainty separation and document tiles. Document tiles open an in-page viewer with a visual synthetic order, a plain-language summary and a mock download action.

The next-hearing panel presents the immediate date first, followed by a compact "today / upcoming" agenda framing. Beside discovery and document actions, offer one plain human-support link for citizens who need help using an online service.

### 4. Save workspace

The save control opens a three-step local-only flow:

1. Enter mobile number.
2. Enter the displayed simulated OTP.
3. Select language and accessibility preferences.

The UI must state once that this is a simulation for the prototype. Successful completion saves a small local profile and saved case in localStorage. It never gates search, case viewing, legal aid or document understanding.

### 5. Help

Help provides public legal-aid-first guidance, then Tele-Law and category-level private-advocate guidance. It does not rank lawyers, create profiles, solicit legal facts or give outcome predictions.

## Functional Requirements

- All primary home routes must navigate to a working view.
- Search must validate synthetic inputs and produce success, no-result and recovery states.
- The case viewer must support documents, context switching and saving a case.
- Every visible button must change state, navigate or provide a clearly labelled result.
- Language support must work for English and Hindi in the primary public flow.
- High contrast, larger text and reduced motion must apply immediately and persist locally.
- The mobile menu must open a menu, not cycle routes.
- Local state must persist across reloads and must include a reset control.

## Out of Scope

- Live eCourts data, real OTP delivery, real document upload, camera access, actual QR decoding, payment, e-filing, authentication, personal-data collection and real legal advice.
- Global calculators and public dashboard archetype selection.

## Acceptance Criteria

- A first-time visitor lands on a task-first home with no profile shown.
- Core public tasks work before sign-up.
- A selected synthetic record is clearly labelled and can be understood, viewed and saved.
- OTP is visually polished but optional and explicitly simulated.
- Desktop and mobile share the same product identity but have layouts appropriate to each context.
- A static public deployment is produced after desktop/mobile browser checks pass.
