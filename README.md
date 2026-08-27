# eCourts Citizen Case Companion

An independent hackathon prototype for first-time citizens who need to find a case, understand a court record, prepare a document draft, or locate practical help.

This project is **not an official eCourts or government service**. Every case, person, court event, phone number, OTP, and downloadable case document shown in the demo is synthetic.

## Run the prototype

The single canonical entry is [`index.html`](index.html).

Serve the folder locally so browser downloads and routing behave consistently:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

## Suggested demo

1. Start on Home and choose **Find a case** or **Someone I help**.
2. Use the sample CNR `DEMO010002026` and open the synthetic record.
3. Open **Courts & Services** to reach official District Court, High Court, NJDG, and e-Committee destinations.
4. Switch between English, Assamese, and Hindi.
5. Open **Documents**, complete a template, review it, and download its locally generated English PDF.
6. Open **Help** to search the portal and practical court-information collections.

## What works

- Citizen-first public landing page without a required profile.
- Search by sample CNR, case number, party name, or court-paper preview.
- Explicitly synthetic case workspace with plain-language context.
- **Courts & Services** directory for official District Court, High Court, NJDG, and e-Committee links.
- English, Assamese, and Hindi interface packs.
- Seven template-led document workflows with local PDF generation.
- Searchable Help information and glossary explanations.
- Simulated mobile-number/OTP sign-up, clearly labelled as a simulation.
- Responsive keyboard-accessible interface with local-only prototype state.

## Technical shape

The submission is a lightweight static web application with no framework or backend:

- `index.html` — canonical submission entry.
- `assets/prototype-v3.css` — visual system and responsive styles.
- `assets/prototype-v3-locales.js` — localized interface and information records.
- `assets/prototype-v3-app.js` — rendering, state, search, Help ranking, draft, and PDF logic.
- `tests/` — static schema and browser-flow checks.
- `docs/` — design, research, and security/privacy notes.

Draft answers remain in the current browser tab. The prototype does not connect to court databases, file cases, make payments, or provide legal advice. Official records, deadlines, filing rules, and rights-sensitive decisions must be confirmed with the relevant court or qualified legal help.

## Verification

Run the checks from this folder:

```powershell
npm ci
npm test
```

Browser tests start a local static server. By default they use port `43917`. Override the port if that value is already in use:

```powershell
$env:ECOURTS_TEST_PORT = "45000"
npm test
```

## Scope

This is a web portal. PWA and Android packaging are intentionally outside the hackathon submission scope.
