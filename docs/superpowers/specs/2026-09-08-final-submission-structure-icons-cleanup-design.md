# Final Submission Structure, Icons, and Cleanup Design

## Goal

Prepare the Build What Moves India prototype for submission with an unambiguous citizen journey, a consistent lightweight icon system, and a repository free of generated or superseded artifacts.

## Final information architecture

### Home

The homepage keeps case search as the primary action and retains a scanner teaser. Both actions enter the Find Case journey.

### Find Case

Find Case owns both ways a citizen may begin:

1. Search by CNR, case number, party name, or advocate.
2. Upload or photograph a court paper for prototype analysis and case matching.

The upload workflow retains its loading states, duplicate-upload protection, extracted-detail review, sample-case matching, explicit case enrichment, and session-only dashboard action. `#finder/paper` remains a compatible deep link and opens the upload section within Find Case.

### Understand Court Paper

Understand Court Paper is a separate educational/help page. It does not contain the scanner. It explains:

- where to find the court name, CNR or case number, parties, dates, and directions;
- the difference between document text, prototype explanation, and items needing verification;
- common quality and handwriting limitations;
- when to check an official court source or seek qualified legal help.

The page reuses existing verified safety wording and help content. It must not introduce procedural promises or imply legal advice.

### Services and workspaces

Services, the session-only citizen dashboard, document preparation, and the optional lawyer demo workspace retain their current responsibilities. Citizen and lawyer workspace entry points remain visually equal.

## Navigation and routes

The principal destinations are:

```text
Home
├── Find Case
│   ├── Search details
│   └── Upload court paper
├── Understand Court Paper
├── Services / Find a Court
├── My Cases & Documents
└── Help / Learn
```

`Understand Court Paper` receives the top-level `#understand` route and its own active-navigation state. Existing `#finder/paper` links must continue to work and open the upload section inside Find Case.

## Icon system

Use one repo-native SVG icon family for navigation and interface controls. All icons share a 24-by-24 view box, two-pixel stroke language, round caps and joins, and `currentColor` styling.

Required coverage includes home, search, court paper, services, documents/dashboard, help, Nayak, menu, language, accessibility, upload, camera, microphone, calendar, court, case, external navigation, back, forward, status, privacy, and verification actions.

Icons remain decorative when adjacent text supplies the accessible name. Unfamiliar actions retain visible labels. Generated bitmap icons are not appropriate because the interface needs deterministic, scalable, themeable assets.

The existing Lucide attribution is retained if any path remains derived from Lucide. The final audit must not claim fully original icon authorship unless every path is independently redrawn.

## Images

Retain only images that are loaded by the final site or required by submission documentation. Editorial images remain clearly illustrative. The synthetic civic mark remains the header identity and must not resemble an official emblem, seal, crest, chakra, or government insignia.

## Cleanup boundary

The cleanup may remove:

- generated Playwright screenshots and PDFs under `output/playwright`;
- the superseded national-emblem image after confirming no runtime reference remains;
- unused demo-paper images and unused helper scripts;
- legacy JPG icon tiles after all runtime references are replaced;
- empty generated-output directories.

The cleanup must preserve:

- application source, Worker source, configuration, and tests;
- current project and submission documents;
- audit, provenance, registry, plan, and design records;
- assets that remain referenced by the final site;
- unrelated user-authored workspace changes.

Every destructive target must be resolved and verified before deletion. Tracked deletions are reviewed in the final diff; unrelated untracked documentation is neither deleted nor silently committed.

## Accessibility and responsive behavior

- Each page has one clear `h1` and meaningful landmarks.
- Find Case modes are keyboard operable and retain persistent labels.
- Active navigation is correct for search, upload, and education routes.
- Mobile navigation labels remain understandable without relying on icons.
- Icons do not create duplicate screen-reader announcements.
- Loading, success, no-match, invalid-input, and unavailable-service states remain distinct.
- The layout must not introduce horizontal overflow at 360, 390, 768, or 1440 pixels.

## Motion and Nayak presence

The portal uses expressive, energetic motion while retaining a calm civic-service character.

- Page changes use a short upward reveal and a restrained stagger between major sections.
- Navigation indicators glide between destinations; buttons and icons may use small lift, compression, or directional responses.
- Scanner stages visibly transition through upload, analysis, detail checking, and case matching without hiding status text.
- Nayak uses a gentle breathing presence, responsive halo, distinct listening and thinking states, a natural typing rhythm, and staggered answer reveal.
- Case dates, status, warnings, extracted legal text, and other information users must read remain visually stable.
- Motion avoids neon, glitch, surveillance, science-fiction, or game-like effects. It uses the existing cream, indigo/green, charcoal, and restrained saffron palette.
- `prefers-reduced-motion` and the prototype's reduced-motion preference disable non-essential animation and make required transitions effectively immediate.
- Motion must not delay input, conceal loading/error states, capture focus, or block navigation.

## Verification

The final pass includes:

- static and Worker tests;
- full Playwright suite;
- focused browser checks for Home, Find Case search, Find Case upload, Understand Court Paper, Services, Documents/dashboard, case details, and Help;
- keyboard and active-navigation checks;
- icon/image missing-resource and console-error checks;
- reduced-motion, scanner-state, and Nayak animation-state checks;
- route/deep-link and sitemap review;
- JavaScript syntax and diff-whitespace checks;
- a final tracked-file and repository-status review before commit and push.

## Research notes

- Codebase inspection confirmed `paper` currently resolves to `state.page = "finder"` with `state.tab = "paper"`, which is why Find Case and Understand Court Paper render the same scanner page.
- The current interface already has a complete inline SVG path map, while five JPG icon tiles are used only for selected editorial/task treatments and the first-time tour.
- The repository contains both tracked and untracked generated browser output, plus a tracked superseded national-emblem image.
- Existing scanner and help copy already contains the safety boundaries required for the new educational page.
- External research was skipped because this change reorganizes existing prototype behavior and copy without introducing new judicial facts, official links, or procedural claims. Repository evidence: `assets/prototype-v3-app.js`, `assets/prototype-v3-locales.js`, and `.agent/asset-registry.json`.

## Definition of done

The submission pass is complete when Find Case contains both search and upload, Understand Court Paper is a distinct help page, old deep links work, the icon family is consistent, unused generated/superseded files are removed within the approved boundary, all checks pass, and the final commit contains no unrelated workspace changes.
