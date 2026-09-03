# eCourts Citizen Case Companion

Final project book for Build What Moves India (Varun Mayya + OpenAI).

Solo build. Independent prototype. Synthetic data only. Not an official government service.

- Live site: https://madhurjya-nlp.github.io/ecourts-citizen-case-companion/
- Source: https://github.com/madhurjya-nlp/ecourts-citizen-case-companion
- Canonical entry: `index.html`
- Demo CNR: `DEMO010002026`
- Interface languages: English, Hindi, Assamese
- Draft PDFs: English only
- Deadline this book was prepared against: 28 August 2026, 8:00 PM IST

This file is for the submission pack. It is not the live product. Do not treat copy in this book as court advice.

---

## 0. Judge summary (under 250 words)

eCourts already digitises case information. Most first-time litigants still cannot turn a CNR, an order, or a hearing date into a next step. This project is a citizen layer over that public infrastructure: find a case, read what the paper means, prepare a draft, and open the correct official service.

The live build is a static web app. No login wall. No live court API, payment, OTP, or filing. One synthetic journey uses CNR DEMO010002026. The case view keeps the official wording, a plain-language reading, and what still needs checking as three separate layers. Courts & Services is a directory of verified official URLs that open in a new tab. The prototype never sends the citizen's input to those sites. Help is a searchable knowledge base with deterministic follow-up suggestions, not a chatbot pretending to be a lawyer. Documents produce a local English PDF from seven templates. Legal aid and Tele-Law sit in front of any private advocate path.

The interface is English, Hindi, and Assamese. Accessibility includes high contrast, larger text, reduced motion, keyboard tabs, and a phone dock with a real in-app Back and Home. Footer copy states that this is not an official government service.

The method was vibe coding inside Codex, then a critic pass, a written handoff, Playwright as the contract, and a last visual pass of compressed stills. Production AI is specified, not faked: retrieve the official record first, explain only what that record supports, show uncertainty, and hand the person to legal aid.

---

## 1. Product brief

### What it is

A public web companion for a person who already has some fragment of a court matter: a CNR, a case number, a party name, or a paper in hand. The product organises work around that person, not around the internal names of eCourts subsystems.

### Who it is for

- First-time litigants and family members helping them.
- People who can use a phone browser but do not speak court English.
- Older users who need large tap targets and a visible Home control.
- Assamese and Hindi speakers, with English as the language of generated legal drafts.

### What it is not

- Not eCourts, the Supreme Court, a High Court, a District Court, NIC, or the e-Committee.
- Not a live case-status system.
- Not legal advice.
- Not a lawyer marketplace.
- Not a filing or payment product.

### Job to be done

Start with what the citizen already has. Get them to a labelled sample record, an explanation they can repeat to a relative, a draft they can take to a legal services counter, or the official site that actually holds the live data.

### Design rules that survived the whole build

1. Official record, plain meaning, and uncertainty stay separate.
2. Legal aid and Tele-Law before any private advocate pattern.
3. Disclaimers live in the footer and next to synthetic records, not in every page title.
4. No Ashoka chakra, tricolour strip, seal, or government masthead.
5. No live credentials, uploads, or payments in the hackathon build.
6. Phone Back must stay inside the site. Home must be one tap away from every inner page.

---

## 2. Problem

The official stack is real and useful. District Court Services, High Court Services, NJDG, e-Committee, SCI, NALSA, and Tele-Law already exist. The gap is comprehension and continuity.

A typical first-time user meets identifiers (CNR, FIR, filing number), product names (ePay, eFiling, cause list), and PDFs that a screen reader cannot usefully read. They are asked to choose a database query before they have a mental model of their own case. When they do find a status, it often does not answer: was a decision made, must I attend, what do I bring, who can help me for free.

The scale is large. Over 5.1 crore (51 million) cases are pending across Indian courts. India has approximately 21 judges per million citizens, compared to 107 per million in the United States. A majority of litigants navigate the system for the first time without immediate access to counsel. Free legal aid through NALSA and Tele-Law exists but is not surfaced at the moment a citizen is reading a confusing order.

This prototype treats those as product problems, not as a missing coat of paint on the official apps.

---

## 3. What shipped

Public URL: https://madhurjya-nlp.github.io/ecourts-citizen-case-companion/

GitHub: https://github.com/madhurjya-nlp/ecourts-citizen-case-companion (`main`, GitHub Pages from `/`)

### Screens

| Screen | What a user can do |
| --- | --- |
| Home | Five tasks, assisted-search entry, editorial still, two boxed notes |
| Find a case | CNR, case number, party name, paper/QR preview. Sample CNR `DEMO010002026` |
| Case | Next hearing, official / plain / verify layers, three distinct documents, timeline |
| Courts & Services | District and High Court tabs plus shared official links |
| Documents | Seven templates, review, local English PDF, drafts stay in the tab |
| Help | 15 FAQs in two bases, search, three follow-up suggestions, NALSA and Tele-Law |

### Visual walkthrough (verified Playwright captures)

**Home**

![Home — Desktop](output/playwright/home-desktop.png)
![Home — Mobile](output/playwright/home-mobile.png)

**Find a Case**

![Finder — Desktop](output/playwright/finder-desktop.png)
![Finder — Assamese](output/playwright/finder-assamese-desktop.png)

**Case View**

![Case — Desktop](output/playwright/case-desktop.png)
![Case — Mobile](output/playwright/case-mobile.png)

**Courts & Services**

![Courts — Desktop](output/playwright/courts-desktop.png)
![Courts — Mobile](output/playwright/courts-mobile.png)

**Documents**

![Documents — Desktop](output/playwright/documents-desktop.png)

**Help & Legal Aid**

![Help — Desktop](output/playwright/help-desktop.png)

### Official destinations (open in a new tab, `noopener noreferrer`)

- District Court Services: https://services.ecourts.gov.in/
- District Court NJDG: https://njdg.ecourts.gov.in/njdg_v3/
- District Courts of India: https://ecourts.gov.in/ecourts2.0/?p=dist_court
- High Court Services: https://hcservices.ecourts.gov.in/
- High Court NJDG: https://njdg.ecourts.gov.in/hcnjdg_v2/
- High Courts: https://ecourts.gov.in/ecourts2.0/?p=about_us/highcourts
- eCourts gateway: https://ecourts.gov.in/
- NJDG: https://njdg.ecourts.gov.in/
- e-Committee: https://ecommitteesci.gov.in/
- Supreme Court of India: https://www.sci.gov.in/
- NALSA (DoJ): https://doj.gov.in/national-legal-services-authority/
- Tele-Law (DoJ): https://doj.gov.in/tele-law-mobile-app/

### Accessibility in this build

- Keyboard Finder and Courts tabs (Arrow, Home, End).
- Visible focus rings.
- High contrast, larger text, reduced motion, stored in `localStorage`.
- 44px-class tap targets on primary controls.
- Mobile dock plus masthead Home. In-app Back uses a screen stack, not `history.back()`, so overlays do not trap the user on the same hash.
- `body.reduce` and `prefers-reduced-motion` kill animation.

### What is synthetic

The case title, parties, lawyers, CNR, hearing date, orders, OTP flow, and downloaded case papers. Footer and case banners say so.

### Known unfinished work (do not hide this from judges)

- Hindi and Assamese copy has not had a native-speaker legal review.
- Generated PDFs are English-only by design. Devanagari and Assamese glyphs were corrupting in the tiny local PDF writer.
- Help suggestions are scored in the browser. They are not a large language model.
- No live eCourts, eFiling, ePay, camera, or OTP gateway.
- innerHTML rendering is acceptable for this trusted static prototype and is not a production XSS posture.

---

## 4. Tool stack

### Runtime (what the citizen loads)

| Piece | Choice | Why |
| --- | --- | --- |
| HTML | `index.html` only | One public entry. Older prototype HTML files were deleted so the demo cannot drift. |
| CSS | `assets/prototype-v3.css` | Civic tokens (judicial green, paper, ink). No framework. |
| JS | `assets/prototype-v3-app.js` | Hash routing, screen stack, search, drafts, PDF bytes, Help ranking. |
| Locales | `assets/prototype-v3-locales.js` | EN / HI / AS packs with one `pick()` helper so keys cannot silently go missing in one language. |
| Hosting | GitHub Pages, `main`, site root | Public URL, no server to babysit, cache-bust query strings on CSS/JS/images. |
| Icons (chrome) | Inline Lucide-style SVG | Tiny, sharp at 20px on the dock. |
| Icons (Home tasks) | Compressed still-life JPEGs, ~7KB each | Atmosphere at 56px without a font or icon pack download. |
| Photographs | Local JPEGs, 47–68KB | Replaced a 326KB face-wall. No third-party image CDN. |
| Fonts | System stack (`Nirmala UI`, `Segoe UI`, Georgia) | An earlier Google Fonts request was removed so a village phone does not call a US font host before the first paint. |

There is no React, Vue, Vite, Tailwind, backend, database, analytics beacon, or env file in the citizen bundle.

### Authoring and agents

| Piece | Role |
| --- | --- |
| OpenAI Codex | Primary coding and review environment. Specs and plans live under `docs/superpowers/`. |
| `AGENTS.md` | Operating contract for any coding agent: truth before polish, no fake authority. |
| `HANDOFF.md` | Sprint contract that closed PDF corruption, duplicate case-doc bodies, draft-loss, test-port collisions, Courts directory, and canonical `index.html`. |
| Local asset workflow | Abstract stills and task icons were prepared as local compressed assets: objects and rooms, with no faces or emblems. |

### Verification

| Piece | Role |
| --- | --- |
| Node | Runs the static locale/schema test. |
| Playwright 1.62 | 23 browser tests against `index.html` on a local `python -m http.server`. |
| Default test port | `43917` via `ECOURTS_TEST_PORT` (4173 collided on this machine). |
| Static assertions | Every locale key, no tricolour/chakra CSS, favicon size, still-file size caps. |
| Manual screens | `output/playwright/*-desktop.png` and `*-mobile.png` at 1440 and ~390 widths. |
| `gh` CLI | Repo, Pages enablement, build polling. |

### Compression / local OS

Windows, PowerShell, Python 3 (stdlib HTTP server + Pillow for image compress), Git, GitHub.

Credits were spent on finishing flows, official URL checks, and a last visual pass. They were not spent on a lawyer marketplace, a PWA wrapper, or a fake live API.

---

## 5. Coding methods

The codebase is a small SPA with an explicit state object, not a framework store.

**Render is a function of state.** `render()` writes masthead, dock, footer, and `#app`. Each screen is a function (`home`, `finder`, `courtsPage`, `casePage`, `documentStudio`, `supportPage`). Overlays (menu, language, document viewer, OTP) do not get their own history entries.

**Navigation is a screen stack.** `navigate()` pushes the previous screen snapshot. `goBack()` pops and `replaceState`s. `goHome()` clears the stack. Phone Back is wired to that stack. This was rewritten after `history.back()` restored a duplicate hash and appeared to "animate but stay on the same page."

**Locales are data.** UI strings, FAQs, document templates, and court copy live in one module. Missing keys fail tests. Generated legal text used for PDFs is the English canonical template, even when the chrome is Hindi or Assamese.

**Search is local and labelled.** Four Finder tabs validate against the one synthetic record. Empty and unknown queries get recovery copy and a sample-case button. The paper/QR path is a preview, not a camera.

**Help ranking is deterministic.** Token overlap + related-id boost + group boost + a fallback list. Top three suggestions. Query text is not written to `localStorage`.

**PDFs are built in the browser.** A small PDF 1.4 writer emits ASCII English. That is why drafts stay English. It is a limitation, not a hidden translation bug.

**Persistence is narrow.** `localStorage` key `ecourts-citizen-v3` holds language, accessibility prefs, optional simulated profile, and selected synthetic CNR. Draft field values, Help queries, and OTP digits are memory-only. Reset clears the key.

**Official links are data tables.** `officialDistrict`, `officialHigh`, `officialShared`. Tests assert the exact URLs.

**Motion is CSS.** Page rise, task stagger, slow photo drift, hover lift. Disabled when the user asks.

The method that kept this from turning into sludge: one canonical file, tests that inspect that file, and a written rule that polish must not create the appearance of a live court system.

---

## 6. Vibe coding and analysis methods

This was a solo hackathon. The first large surface was vibe-coded in Codex. That is the honest origin. It also produced drift, which we treated as a defect class rather than a vibe.

### What went wrong when generation ran ahead of a brief

A critic pass on the Codex-built site found:

- Product name and visual system sliding (navy SaaS, face-wall hero) away from the civic paper spec.
- Page titles that read as disclaimers.
- Courts pages that were walls of text without structure.
- Phone Back leaving the site because there was no in-app history.
- Tests still pointing at `prototype-v3.html` after `index.html` became canonical.

Vibe coding without a contract will ship a plausible UI that is internally inconsistent. The fix was not "prompt better once." It was to put contracts on disk.

### Analysis loop that actually got used

1. **Write the job.** Specs under `docs/superpowers/specs/` and the civic redesign note: task-first home, official vs plain vs uncertain, legal-aid-first.
2. **Generate.** Codex implemented against those files.
3. **Critic the result as a judge would.** Not "does it look modern," but "would a first-time user in Guwahati know what to tap, and would a lawyer think we impersonated the court."
4. **Handoff.** `HANDOFF.md` listed exact defects with required fixes (English PDF path, distinct case documents, template switch confirm, Playwright port).
5. **Prove with tests.** `npm test` is 23 Playwright flows plus a locale/schema file. If a screen exists, a test opens it in EN/HI/AS or desktop/mobile.
6. **Look at both viewports.** Desktop editorial layout and a 375–390px phone with a dock. A screenshot of one width is not a pass.
7. **Ship, then cache-bust.** GitHub Pages will serve yesterday's JS if the filename is unchanged. Query strings (`?v=20260827q`) are part of the product.

### Prompting habits that mattered

- Tell the agent what the product is not (no chakra, no live OTP, no lawyer ads).
- Prefer patching the canonical files over creating `v4.html`.
- When Back is wrong, describe the user-visible failure ("animates but leads to the current page") instead of naming a web history API.
- When copy is wrong, ask for finished-service titles and footer-only disclaimers, and keep the demo CNR and tips.
- When images are requested, specify abstract photographed objects so the model does not emit a court seal or a wall of faces.

### What we refused to vibe into existence

A live API with invented case data would have looked more "complete" and been a worse civic product. Simulated OTP is labelled. Help does not say it is ChatGPT. Courts tiles say they open an external official site.

---

## 7. How AI can make the site work at full scope

The hackathon UI is the citizen shell. Full scope means authorised data, grounded explanation, and a human handoff. It does not mean a model that plays judge.

### Principle

AI sits under the official record, never above it.

Every model output in production should show:

- the official source it used,
- what is stated in that source,
- what is not stated,
- whether a person (legal aid, Tele-Law, advocate) should take over.

Forbidden, including in demos that look live:

- predicting the judgment,
- inventing a deadline or attendance duty,
- ranking lawyers,
- silently rewriting legal terms,
- answering from training data when the case record was not retrieved.

### Recommended production shape

```
Citizen app (this UI, hardened)
        |
        v
BFF / API  -- auth, session, audit log, rate limits
        |
        +--> authorised case-status / orders (eCourts or court APIs, only if documented and permitted)
        +--> retrieval index of that user's orders + applicable public procedure texts
        +--> LLM with a tool-using loop: extract facts, then explain facts
        +--> NALSA / SLSA / Tele-Law routing tables
        +--> optional advocate registry (factual fields only)
```

The current Home, Case, Help, and Documents screens can stay. They already have slots for official text, meaning, and verify. A production AI fill those slots from retrieval, instead of from the synthetic sample object.

### Implementation stages (do these in order)

**Stage A. Harden the shell (no model yet).**

- Replace `innerHTML` string templates with `textContent` / `createElement` for any string that came from a user or an API.
- Add CSP, `nosniff`, `frame-ancestors`, Referrer-Policy on the host.
- Stop using `localStorage` for anything that looks like a legal name on a shared phone. Use an alias plus expiry.
- Keep the three-layer record UI.

**Stage B. Authorised read of one case.**

- Citizen proves control of a CNR or an official login the courts already issue. Do not invent a parallel identity system if eCourts already has one.
- Pull case metadata and the latest order through a documented interface. If no interface is offered, do not scrape a session that the user is not allowed to share.
- Store the least you can. Purpose limitation: explain this case, not train a model.

**Stage C. Structured extraction, then language.**

Do not prompt "summarise this PDF." Prompt two steps:

1. Extract a JSON object: listing date, whether the order is interim or final, named parties, any explicit direction ("file X by date Y"), and spans pointing back into the source.
2. Write the plain-language layer only from that JSON. If a field is null, the UI already has a "What to verify" block. Leave it empty or say "the order does not say."

That split is how you stop hallucinations without a 40-page system prompt.

**Stage D. Grounded chat.**

A "What happened?" control on the case page. Retrieval over that case's orders plus a small corpus of public procedure explainers (what a CNR is, what a cause list is). Every answer cites a document id. If retrieval returns nothing, the model must refuse.

The current Help suggestion row can become the "people also open" list, still deterministic, while the free-text box becomes retrieval-augmented.

**Stage E. Language.**

Translate the explanation layer, not the official order. Keep the official text in the language the court issued. Hindi and Assamese need translator + lawyer review. The prototype's three-locale file is a start, not a production TM.

**Stage F. Documents as assisted forms, not ghost-written pleadings.**

The seven templates can pre-fill facts the extractor already found (names, CNR, next date) and still force the citizen to review. Do not auto-generate novel legal grounds. Route the PDF to a Legal Services counter or Tele-Law, which is what the chrome already implies.

**Stage G. Voice later.**

Read-aloud of the plain-language layer helps older users. Speech-to-search helps low-literacy users. Both come after the text path is grounded. The current build does not include read-aloud. Do not advertise it until it exists.

### Model and ops notes for a post-hackathon build

- Prefer a small extractor model plus a larger writer, or one model with two tool calls, over a single unconstrained chat.
- Log prompts, retrieved chunk ids, and outputs for audit. A citizen facing a court should be able to ask "why did the site say that."
- India residency and government procurement rules will constrain where case PDFs may be sent. Design the BFF so the model host never becomes the system of record.
- Evaluation set: 50 real anonymised orders (if a court or legal-aid partner can share them) graded on "invented a duty" as a hard fail.
- The OpenAI hackathon is a fine place to prototype Stage C and D against synthetic orders. It is not permission to point the same prompt at live eCourts.

### What stays non-AI even at full scope

- The official PDF.
- The link to District Court Services / HC Services.
- Legal-aid eligibility, which is a statutory determination, not a softmax.
- Advocate identity, which belongs to Bar Council data, not to generated blurbs.

### Working proof-of-concept: `scripts/demo_order_extractor.py`

A standalone Python script demonstrates Stage C against the synthetic order from `DEMO010002026`:

1. **Step 1 (Extraction):** Feeds the order to `gpt-4o-mini` with Structured Outputs (JSON Schema). The model returns only explicitly stated facts: CNR, dates, parties, directions, deadlines, and hearing details. Fields not mentioned in the order are `null`.

2. **Step 2 (Explanation):** Passes the extracted JSON — not the original order — to a second prompt. The model explains what each fact means in plain language. Null fields produce *"the order does not state this."*

This 2-step split is how you stop hallucinations without a 40-page system prompt. The extraction constrains output; the explanation constrains input. Pre-generated output is saved in `scripts/demo_output.json` for review without an API key.

---

## 8. Demo path (about two minutes)

1. Open the live URL on a phone and on a laptop.
2. Home: Find a case. Mention the sample CNR on the Finder help line.
3. Search `DEMO010002026`. Open the record. Point at Official / In plain language / What to verify.
4. Open one case document. Show that the three papers are different.
5. Courts & Services. Switch District / High. Click one official link and show it leaves this site.
6. Documents. Fill two fields. Download PDF. Open it and show English legal draft plus the "not filed" notice.
7. Help. Search "CNR". Open a suggestion. Show NALSA / Tele-Law.
8. Switch Hindi or Assamese. Show chrome follows, PDF remains English.
9. Phone: use dock, Back, Home. Confirm the browser does not exit the site.
10. Footer: not an official government service.

Do not present the OTP modal as a real login.

---

## 9. How to verify

```bash
git clone https://github.com/madhurjya-nlp/ecourts-citizen-case-companion.git
cd ecourts-citizen-case-companion
npm ci
npm test
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

Playwright uses port 43917 unless `ECOURTS_TEST_PORT` is set.

---

## 10. File map

```
index.html
assets/prototype-v3.css
assets/prototype-v3-app.js
assets/prototype-v3-locales.js
assets/citizen-justice-hero.jpg
assets/visual-courts.jpg
assets/visual-documents.jpg
assets/visual-help.jpg
assets/icon-*.jpg
assets/ecourts-favicon.png
scripts/demo_order_extractor.py
scripts/demo_output.json
scripts/README.md
tests/*.mjs
playwright.config.mjs
AGENTS.md
HANDOFF.md
docs/AI_AND_LEGAL_HELP.md
docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md
docs/superpowers/specs/
```

---

## 11. Credits and method statement for the form

Built solo. Interface and flows were developed in Codex against written specs, then corrected through a critic pass, `HANDOFF.md`, Playwright, and a final navigation, Courts-layout, copy, and visual review. Official URLs were checked against the live government hosts listed in section 3. No government body commissioned or endorsed this prototype.
