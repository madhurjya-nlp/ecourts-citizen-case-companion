# Codex handover: check the final live site

Read this whole file before editing anything. Then read `AGENTS.md`. Then inspect the live site and the local `index.html` build. Produce a written report. Do not start a new feature branch unless the user later asks you to fix a defect you found.

You are checking a finished hackathon prototype, not extending it.

---

## 1. What this project is

Independent citizen companion for finding a synthetic case, reading it in plain language, drafting a local PDF, and opening official court URLs.

It is **not** an official eCourts product. It must not look like one.

- Live: https://madhurjya-nlp.github.io/ecourts-citizen-case-companion/
- Repo: https://github.com/madhurjya-nlp/ecourts-citizen-case-companion
- Local root: `C:\Users\madhu\Downloads\ecourts-v1.9.2-android-safe`
- Canonical file: `index.html` (loads `assets/prototype-v3.css`, `prototype-v3-locales.js`, `prototype-v3-app.js` with a `?v=` cache-bust)
- Demo CNR: `DEMO010002026`
- Languages: `en`, `hi`, `as`
- Hosting: GitHub Pages from `main` `/`

Related docs (read if a check is ambiguous):

- `AGENTS.md` (authority, synthetic vs official, complexity budget)
- `HANDOFF.md` (sprint defects that should already be closed)
- `docs/SECURITY_PRIVACY_FUNCTIONAL_AUDIT_V3.md`
- `docs/AI_AND_LEGAL_HELP.md`
- `docs/submission/PROJECT_BOOK.md` (submission narrative, local only)

---

## 2. Hard rules while you inspect or patch

MUST NOT:

- Add a live court API, scraper, payment, OTP gateway, camera, file upload, or LLM call.
- Add Ashoka chakra, tricolour strip, government emblem, "official portal" chrome, or a seal.
- Put hackathon disclaimers into every `<h1>`. Disclaimers belong in the footer and beside synthetic records.
- Rank lawyers, add reviews, win rates, or a marketplace.
- Translate generated PDF bodies into Hindi or Assamese (the PDF writer is ASCII English on purpose).
- Point tests at any file other than `index.html`.
- Invent official statistics, real party names, or live hearing dates.
- Commit `docs/submission/` unless the user explicitly asks. That folder is a local submission pack.

MUST:

- Keep official record / plain language / what-to-verify as three layers on the case screen.
- Keep legal-aid and Tele-Law links ahead of any private-advocate pattern.
- Keep official links as `target="_blank"` `rel="noopener noreferrer"`.
- Keep drafts out of `localStorage`.
- Keep reduced-motion respected (`body.reduce` and `prefers-reduced-motion`).
- Verify desktop (~1440) and a phone width (~375–390) for any visual claim.

---

## 3. What "done" already includes (do not regress)

Confirm these still work. They were the last sprints.

1. Public Home, no forced profile, five tasks plus "Someone I help".
2. Finder tabs: CNR, case number, party name, paper/QR. Keyboard Arrow/Home/End.
3. Sample search with `DEMO010002026` opens Demo Petitioner A v. Demo Respondent B.
4. Case documents (interim order, property checklist, status note) have **different** English bodies.
5. PDFs downloaded from Documents and from case papers are English even if the UI is Hindi or Assamese. No `???` titles.
6. Switching document templates with a non-empty form asks for confirm.
7. Courts & Services: District / High tabs, 9 official links visible per tab mix as in `tests/citizen-workflows.spec.mjs`.
8. Help: 15 FAQs, search, suggestions, NALSA + Tele-Law.
9. In-app Back uses `navStack` + `replaceState`, not `history.back()`, for screen changes. Overlays do not push history.
10. Home control on every page (masthead `.home-button` and `.page-nav`). Mobile `.dock`.
11. Hash routes: `#home`, `#finder/cnr`, `#courts/district`, `#documents`, `#help`, `#case`.
12. Abstract stills, not the old face-wall. Hero file may still be named `citizen-justice-hero.jpg`.
13. Cache-bust query currently `20260827q` (or newer if you are asked to bump it). Live HTML must match the committed `index.html`.

---

## 4. How to run checks

From the repo root:

```powershell
npm ci
npm test
```

Expect static locale/schema pass and **23** Playwright tests green.

Optional local serve:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Playwright's own server uses `ECOURTS_TEST_PORT` default `43917`. Do not hardcode 4173 in `playwright.config.mjs`.

Also open the **live** GitHub Pages URL in a fresh profile or after a hard refresh. Cached `prototype-v3-app.js` without `?v=` is a common false failure.

Write screenshots only if they prove a defect or a pass you cannot describe in text. Put them in `output/playwright/` if you must keep them.

---

## 5. Inspection script (do this in order)

Work as a hostile QA person, then as a first-time citizen in Guwahati, then as a judge who will punish government impersonation.

### A. Live vs local identity

- [ ] Live HTML title is `eCourts | Citizen case companion`.
- [ ] Live HTML references the same cache-bust token as local `index.html`.
- [ ] Footer states it is not an official government service and mentions CNR `DEMO010002026`.
- [ ] No tricolour bar, chakra, or "Government of India" masthead.

### B. Home, desktop 1440 and phone 375

- [ ] Primary heading is a service sentence ("Find your case"), not a prototype apology.
- [ ] Find a case and Create a document both navigate.
- [ ] Five task tiles work, including Read a court paper → Finder paper tab, Check a hearing → case.
- [ ] Someone I help enters assisted Finder copy and does not save another person's identity.
- [ ] Phone: tasks appear before the editorial photo. Dock does not cover the last reachable control after scroll (page has extra bottom padding).
- [ ] Reduced motion: enable it, confirm the photo is not drifting.

### C. Finder and case

- [ ] Wrong CNR shows recovery + sample button.
- [ ] Sample CNR opens the case. Record layers are distinct.
- [ ] Open all three documents. Bodies must not be copy-paste of each other.
- [ ] Back from a document overlay closes the overlay, does not leave the site.
- [ ] Back from Help opened inside the case returns to the case. Home from there returns to Home and clears the stack.

### D. Courts

- [ ] District default. ArrowRight selects High Courts. Home/End keys match tests.
- [ ] Each official URL matches the list in `assets/prototype-v3-app.js` (`officialDistrict`, `officialHigh`, `officialShared`).
- [ ] Clicking a link does not POST or append query from this prototype.

### E. Documents

- [ ] All seven templates selectable.
- [ ] Hostile text in a field renders as text in the preview (no script execution). Existing Playwright test covers this. Re-run it.
- [ ] Download PDF. Filename stable. Contains the English title. Contains a not-filed / review notice.

### F. Help

- [ ] Search filters both groups. Empty search restores 15 items.
- [ ] A suggestion opens and focuses the matching `<details>`.
- [ ] Help query is absent from `localStorage` after use.

### G. Language and storage

- [ ] Switch `hi` and `as`. Headings follow. PDF remains English.
- [ ] Refresh keeps language. Reset clears the workspace key.
- [ ] `localStorage` must not contain draft answers, OTP, or Help queries.

### H. Phone chrome

- [ ] From Home, dock Help → Back returns Home.
- [ ] Hardware-style browser back after a real in-app navigation should not immediately close the tab on a fresh `#home` entry. If it still does on the first tick, report it as a remaining risk with steps, do not "fix" it by injecting `history.pushState` in a loop.

---

## 6. Defects that are already supposed to be closed

If any of these are still true, they are regressions. Say so clearly.

- PDF title becomes `?` in Hindi/Assamese UI.
- All three case documents share one body.
- Template switch wipes a filled form with no confirm.
- Playwright port 4173 with `reuseExistingServer: false` and no env override.
- Tests read `prototype-v3.html`.
- In-app Back stays on the same screen.
- No Home control on inner pages.
- Face-wall hero still in CSS (`filter: grayscale` montage of citizens). Current editorial still is stacked papers.

---

## 7. Known accepted limitations (not defects)

Do not file these as bugs. You may list them as residual risk.

- Hindi/Assamese need native legal review.
- PDFs are English-only.
- Help "smart suggestions" are deterministic scoring, not a model.
- One synthetic case.
- Paper/QR is a mock, no camera.
- OTP is a labelled simulation.
- GitHub Pages has no CSP headers (called out in the security audit).
- `innerHTML` for trusted templates (same audit).
- Decorative stills are compressed JPEGs; slight softness on Courts photo is accepted.

---

## 8. Report format

When you finish, write `docs/submission/CODEX_FINAL_CHECK_REPORT.md` locally (do not push unless asked) with:

```text
# Codex final site check
Date:
Live commit / cache-bust token:
npm test: pass/fail (paste the summary line)
Live vs local: match/mismatch

## Blockers
## Serious but shippable
## Nits
## Regressions vs section 3
## Checks from section 5 that you could not perform, and why

Verdict: ship as-is / ship after listed blockers / do not submit
```

Be specific. Cite `file:line` or a URL plus the control label. Do not invent failures you did not see.

If the live cache-bust token is older than local `index.html`, say "Pages stale" first. Hard refresh and `gh api repos/madhurjya-nlp/ecourts-citizen-case-companion/pages/builds/latest` before blaming the JS.

---

## 9. If the user later asks you to fix something

Smallest patch on `index.html` + the three `assets/prototype-v3-*` files + tests. Bump the `?v=` token in `index.html`, CSS background URLs, and `assetVersion` in `prototype-v3-app.js` together. Run `npm test`. Push `main` only when the user says to push.

Do not reopen PWA, Android packaging, live APIs, or an LLM wiring job during a site check.
