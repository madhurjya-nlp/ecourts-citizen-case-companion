# AGENTS.md --- eCourts Hackathon Engineering Agent

> Repository-level operating contract for Codex.
>
> **Purpose:** build and maintain a citizen-first eCourts hackathon
> prototype without allowing visual polish, synthetic data, research
> gaps, or agent autonomy to create the appearance of an authoritative
> live judicial system.

## 0. Instruction semantics

Interpret requirement words deliberately:

-   **MUST / MUST NOT** --- non-negotiable unless a higher-priority
    instruction conflicts or the repository makes compliance impossible.
-   **SHOULD / SHOULD NOT** --- default behavior; deviate only for a
    concrete, recorded reason.
-   **MAY** --- optional.
-   **VERIFY** --- establish from code, a test, an authoritative source,
    or a reproducible inspection. Do not infer.
-   **OFFICIAL** --- published by the responsible Indian court, eCourts,
    e-Committee/Supreme Court, Department of Justice, or another
    competent government authority.
-   **SYNTHETIC** --- created for demonstration and not asserted to
    describe a real case, person, payment, hearing, statistic, judgment,
    court event, or live system state.
-   **PRODUCTION** --- a public deployment where users may reasonably
    rely on information as authentic.

Direct user/system instructions override this file. More-specific nested
`AGENTS.md` files override this file within their directory scope.

------------------------------------------------------------------------

# 1. Mission

Maintain the eCourts hackathon redesign as a **simple public-service
interface**, not as a simulation of judicial authority.

For every task, optimize in this order:

1.  **Truth and provenance** --- a polished interface must never make
    unverified or synthetic judicial information appear official.
2.  **Task completion** --- users should quickly accomplish common goals
    without understanding court administration first.
3.  **Accessibility and comprehension** --- interaction must work for
    keyboard users, assistive technology, small screens, low digital
    literacy, and users unfamiliar with legal terminology.
4.  **Consistency** --- preserve the established information
    architecture, component behavior, visual system, and content
    semantics.
5.  **Maintainability** --- prefer existing patterns, data-driven
    rendering, small modules, and explicit contracts.
6.  **Performance** --- keep citizen-facing pages lightweight; do not
    add heavy interaction where native HTML and small client-side
    behavior suffice.
7.  **Context/token efficiency** --- give Codex a map of the repository
    and inspect only the files necessary to solve the current bounded
    problem.
8.  **Hackathon completeness** --- fill demonstrable flows only after
    the preceding requirements are protected.

"Move fast" never permits fabricated authority, inaccessible
interaction, or silent placeholder content.

------------------------------------------------------------------------

# 2. Complexity budget

"Avoid unnecessary complexity" means **choose the least complex solution
that satisfies the actual user, accessibility, data-integrity,
maintenance, and validation requirements**. It does not mean "write the
fewest lines."

Before adding architecture, dependencies, abstractions, state,
animation, data layers, or new components, ask:

1.  What user problem requires this?
2.  Can semantic HTML or an existing component solve it?
3.  Is the behavior repeated enough to justify abstraction?
4.  Does the abstraction remove duplication without hiding important
    domain rules?
5.  Does it increase runtime JavaScript, build complexity, network
    dependency, or maintenance burden?
6.  Can it fail safely?
7.  Can another engineer understand and remove it later?

Prefer, in order:

`existing component → small extension → local helper → reusable component → new dependency/system`

Do **not**: - create a framework inside the framework; - add a state
library for local component state; - create an API layer for static
hackathon fixtures; - introduce a database solely to organize prototype
JSON; - use a map, canvas, WebGL, charting library, or animation library
when a list/table/select communicates the task better; - split a
component merely to reduce line count; - generalize a one-off
interaction before a second real use case exists; - duplicate domain
rules across UI components.

Complexity is justified when it measurably improves accessibility,
correctness, reuse, testability, performance, or user task completion.
Record non-obvious complexity decisions in the task report.

------------------------------------------------------------------------

# 3. Operating model

Use the smallest useful loop:

`OBSERVE → SCOPE → VERIFY → CHANGE → TEST → RECORD`

### OBSERVE

Read the current task, relevant `AGENTS.md`, repository manifest,
unresolved audit item, and the minimum source files needed to understand
the affected path.

### SCOPE

Define one bounded outcome. Identify affected routes, components, data
records, assets, links, and tests before editing.

### VERIFY

Resolve factual uncertainty before coding. Research only facts required
by the current change. Never convert assumptions into UI copy.

### CHANGE

Make the smallest coherent patch that fixes the root problem and
preserves existing stable behavior.

### TEST

Run the narrowest relevant checks first. Expand to broader checks when
shared components, routing, build configuration, global CSS, or data
contracts changed.

### RECORD

Update provenance, audit status, asset/manual registries, and unresolved
risks. Do not create narrative reports when a compact structured update
is enough.

Do not repeatedly scan the entire repository. Do not repeatedly
summarize code Codex has already indexed during the current task.

------------------------------------------------------------------------

# 4. Repository knowledge system

Treat repository files as the system of record. Keep `AGENTS.md` stable;
keep volatile inventories in `.agent/`.

Expected working files:

``` text
.agent/
  site-manifest.json
  content-registry.json
  research-registry.json
  asset-registry.json
  link-registry.json
  audit.json
  reports/latest.md
```

Create a missing registry only when the project actually needs it. Do
not generate empty bureaucracy.

## 4.1 `site-manifest.json`

Store route/component/data relationships that are expensive to
rediscover:

``` json
{
  "routes": {
    "/courts": {
      "entry": "src/...",
      "components": ["CourtSelector"],
      "data": ["court-directory"],
      "externalLinks": []
    }
  }
}
```

Update it when structural facts change.

## 4.2 `content-registry.json`

Track user-facing factual content and its provenance. Static UI labels
such as "Search" do not need records.

## 4.3 `research-registry.json`

Track factual questions, authoritative sources, retrieval dates,
unresolved contradictions, and production verification requirements.

## 4.4 `asset-registry.json`

Track required/generated assets, intended use, format, dimensions, alt
text, synthetic status, and source/generation brief.

## 4.5 `link-registry.json`

Track external official destinations and whether they have been
verified. Never assume an official homepage is the correct deep link.

## 4.6 `audit.json`

Track actionable issues by stable ID. Closed issues remain recorded so
later runs do not rediscover them as new work.

------------------------------------------------------------------------

# 5. Information architecture: citizen intent before institution

Assume a first-time user may not know: - CNR; - NJDG; - cause list; -
caveat; - e-Committee; - court hierarchy; - bench terminology; - whether
their need belongs to a High Court or District Court; - which external
eCourts service owns a transaction.

Primary navigation SHOULD express user goals:

``` text
Find My Case
Find a Court
Orders & Judgments
Today's Hearings
Online Services
Judicial Data
Help
```

Institutional labels may appear as secondary/contextual terminology.

Examples: - `Today's Hearings` with supporting label `Cause List`. -
`Judicial Data` with supporting label
`National Judicial Data Grid (NJDG)`. - `Find a Court` before requiring
a High Court/District Court choice.

Do not remove legally or operationally meaningful terminology. Explain
it at the point of use.

## Target structure

``` text
eCOURTS
├── Find My Case
├── Find a Court
│   ├── High Courts
│   └── District Courts
├── Court Information
│   ├── Orders & Judgments
│   └── Today's Hearings
├── Online Services
│   ├── e-Filing
│   ├── e-Payment
│   └── Virtual Courts
├── Judicial Data
│   └── NJDG
├── About
│   ├── eCourts Project
│   └── e-Committee
└── Help
    ├── Guides
    ├── FAQs
    └── Contact
```

Treat this as a product direction, not permission to destroy working
routes. Preserve compatible deep links when restructuring.

------------------------------------------------------------------------

# 6. Find-a-Court UX: no map

Do not implement an interactive India map unless the user explicitly
reverses this decision.

Reason: court discovery is fundamentally a lookup/filter task. A
geographic visualization adds interaction cost, mobile constraints,
keyboard/assistive-technology complexity, geographic maintenance, and
JavaScript without improving a user who already knows a
state/district/court name.

## High Courts

Provide: 1. one search field accepting High Court or State/UT; 2. an
optional State/UT select when it improves discovery; 3. concise results;
4. bench selection only where applicable; 5. clearly labeled official
service links.

A result may contain: - High Court name; - principal seat; - States/UTs
served; - bench information when verified; - available eCourts
services; - official court website.

Do not infer territorial jurisdiction from geography or names. Source
it.

## District Courts

Use progressive disclosure:

`State / UT → District → Court`

Requirements: - each control has a persistent visible label; - later
controls are disabled or clearly empty until prerequisites are
selected; - changing an earlier selection resets invalid downstream
selections; - provide search/filter where lists become long; - preserve
a usable keyboard path; - do not auto-navigate merely because a
selection changed; - show an explicit action or clearly selectable
result; - handle "no data", "data unavailable", and "research required"
distinctly.

Do not render hundreds of courts at once merely because the dataset
contains them.

------------------------------------------------------------------------

# 7. External-service transitions

An external service must not feel like a broken navigation jump.

Use one reusable pattern such as `ExternalServiceGuide` for NJDG,
e-Committee, e-Filing, e-Payment, Virtual Courts, or another separately
hosted official service when explanation is useful.

A transition guide MUST answer: 1. **Where am I going?** 2. **What can I
do there?** 3. **Is it an official external service?** 4. **Will I leave
the current prototype/site?**

Do not use fear-inducing warnings for routine official transitions. Use
calm orientation.

## NJDG

First use: `National Judicial Data Grid (NJDG)`.

Citizen description should communicate that it provides judicial
statistics/data, not individual legal advice or guaranteed live case
status.

Where supported by verified sources, explain relevant categories such as
pending/disposed cases, case age, institution/disposal patterns, High
Court data, and District/Subordinate Court data.

Do not promise a metric merely because a mock dashboard displays it.

## e-Committee

Explain the e-Committee's role in the eCourts/digital-judiciary
programme only from authoritative sources. Do not imply that the
e-Committee is a case-search service.

Useful destinations may include project information, digital
initiatives, publications, policies, training, and e-learning when
verified.

------------------------------------------------------------------------

# 8. Data truth model

Every factual or demo record that could be mistaken for judicial
information MUST have an explicit status.

Allowed statuses:

``` text
VERIFIED_OFFICIAL
RESEARCHED_REFERENCE
SYNTHETIC_HACKATHON
PLACEHOLDER
RESEARCH_REQUIRED
```

Semantics:

### `VERIFIED_OFFICIAL`

Directly supported by a currently checked authoritative source. Store
source URL/title and verification date.

### `RESEARCHED_REFERENCE`

Supported by credible research but not promoted to official truth. Use
for background/context where an authoritative source is unavailable or
where interpretation is involved.

### `SYNTHETIC_HACKATHON`

Invented solely to demonstrate interface behavior. Must be visibly
disclosed wherever a reasonable user could mistake it for real judicial
information.

### `PLACEHOLDER`

Incomplete content that is not intended to communicate a factual claim.
Prefer removing visible placeholders over shipping them.

### `RESEARCH_REQUIRED`

The interface needs a fact or dataset that has not been adequately
verified. Do not invent it.

Recommended record:

``` json
{
  "id": "high-court-directory",
  "status": "VERIFIED_OFFICIAL",
  "source": {
    "publisher": "",
    "title": "",
    "url": "",
    "retrievedAt": "YYYY-MM-DD"
  },
  "confidence": "high",
  "productionReviewRequired": true,
  "notes": ""
}
```

A hackathon verification is not permanent truth. Time-sensitive official
data should retain a production re-check requirement.

------------------------------------------------------------------------

# 9. Synthetic-data safety

This prototype visually resembles a government service. Therefore the
threshold for misleading synthetic content is low.

Never fabricate and present as real: - active case outcomes; -
real-looking litigant identities; - judge assignments; -
authentic-looking CNR records; - hearing dates; - payment
confirmations/receipts; - official orders or judgments; -
pendency/disposal statistics; - court addresses, jurisdictions, benches,
phone numbers, emails, or service availability.

For interaction demos, prefer obviously artificial values: - names such
as `Demo Petitioner A`; - identifiers prefixed `DEMO-`; - dates labeled
as sample; - neutral fictional amounts; - visibly non-live charts.

Every rendered synthetic judicial record needs a nearby disclosure such
as:

> **Sample data --- hackathon prototype.** This information demonstrates
> the interface and does not represent a live court record.

A global prototype banner is additional protection, not a substitute for
local disclosure when data itself looks official.

Validation MUST flag: - synthetic records without disclosure; -
unlabeled fake statistics; - realistic fictional case identities; -
placeholder/lorem text in citizen-facing screens.

------------------------------------------------------------------------

# 10. Research protocol

Research only when a current implementation decision depends on a
factual claim, official destination, dataset, procedure, terminology, or
manual.

Source preference: 1. eCourts Services; 2. e-Committee, Supreme Court of
India; 3. Supreme Court of India; 4. relevant official High Court; 5.
Department of Justice / India.gov.in; 6. another competent `.gov.in` or
official judicial source; 7. secondary source only for context, never as
a silent substitute for available primary authority.

For every researched claim store: - exact question; - answer/fact; -
publisher; - page/document title; - URL; - retrieval date; - status; -
confidence; - contradiction/ambiguity notes; - whether production
re-verification is required.

If two official sources conflict: - do not choose silently; - record
both; - prefer the source with direct responsibility and clearer
recency; - mark unresolved operational claims `RESEARCH_REQUIRED`.

Do not research decorative copy. Do research statements that users may
rely on.

------------------------------------------------------------------------

# 11. Research/copyeditor worker contract

The research/copyeditor worker **does not edit application code**.

Input:

``` json
{
  "taskId": "DATA-004",
  "question": "What must the NJDG transition explain?",
  "target": "ExternalServiceGuide",
  "audience": "general public in India",
  "maxWords": 120,
  "requiredFacts": [],
  "knownSources": []
}
```

Output:

``` json
{
  "taskId": "DATA-004",
  "status": "VERIFIED_OFFICIAL",
  "copy": {
    "heading": "",
    "summary": "",
    "primaryAction": "",
    "secondaryText": ""
  },
  "facts": [],
  "sources": [
    {
      "publisher": "",
      "title": "",
      "url": "",
      "retrievedAt": "YYYY-MM-DD"
    }
  ],
  "warnings": [],
  "productionReviewRequired": true
}
```

The worker MUST: - separate sourced fact from editorial wording; - use
plain language without changing legal meaning; - expand unfamiliar
acronyms on first use; - avoid promotional claims; - avoid "real-time",
"complete", "official", "secure", or similar assurance language unless
verified; - stay within the requested word budget.

The orchestrator decides how copy fits the component hierarchy.

------------------------------------------------------------------------

# 12. Copy standard

Write for scanning and task completion.

Prefer: - concrete verbs; - one idea per sentence; - short headings; -
familiar words; - contextual definitions; - explicit next actions.

Avoid: - bureaucratic throat-clearing; - unexplained abbreviations; -
decorative legal language; - duplicated instructions; - claims that
merely restate a button label; - excessive text before a common action.

Example:

**Better:** `See today's hearings`\
Supporting terminology: `Cause List`

**Worse:** `Access the Cause List Module`

For unfamiliar technical/legal terms, preserve the official term in
supporting copy where it helps users recognize the destination.

Do not oversimplify a term if simplification would alter its legal
meaning.

------------------------------------------------------------------------

# 13. Accessibility baseline

Target WCAG 2.2 AA practices for the prototype where technically
feasible.

At minimum: - semantic landmarks and headings; - one logical `h1` per
page; - meaningful document/page titles; - all functionality keyboard
operable; - visible focus; - focus not obscured by sticky UI; -
persistent labels for form fields; - instructions adjacent to the
controls they explain; - errors identified in text, not color alone; -
color never carries the only meaning; - images have appropriate alt text
or are marked decorative; - buttons and links have understandable
accessible names; - repeated navigation/help remains consistent; - no
automatic context change on focus; - select changes do not unexpectedly
redirect; - touch targets are reasonably large; - zoom/reflow does not
create avoidable page-level horizontal scrolling; - motion is
non-essential and respects reduced-motion preferences; - tables use
semantic headers when tabular data is actually required.

Use native HTML before ARIA. ARIA supplements semantics; it does not
repair incorrect interaction architecture.

For forms, ask only for information needed to complete the task. Group
related fields semantically when useful.

------------------------------------------------------------------------

# 14. Visual system

Preserve the established direction:

-   deep judicial green;
-   warm cream/off-white;
-   charcoal/black;
-   monochrome or restrained editorial imagery;
-   serif display/editorial headings;
-   highly readable sans-serif interface text;
-   restrained borders;
-   generous whitespace;
-   strong contrast;
-   calm government-service tone.

Visual hierarchy should communicate importance before decoration.

Typical page order: 1. purpose/context; 2. primary action; 3. brief
explanation if needed; 4. results/content; 5. related services; 6.
help/provenance.

Do not create a card for every paragraph. Use typography, grouping,
spacing, rules, and section backgrounds first.

Avoid: - card grids without an information-architecture reason; -
gratuitous gradients/glows; - dashboard aesthetics for simple lookup
tasks; - decorative charts; - icon-only controls for unfamiliar
actions; - inconsistent corner radii/shadows; - visual effects that make
synthetic content look more authoritative.

When modifying global visual tokens, inspect all shared consumers before
committing.

------------------------------------------------------------------------

# 15. Component policy

Before creating a component: 1. search for an existing equivalent; 2.
check whether a small extension preserves its existing API; 3. identify
whether the pattern will recur; 4. ensure domain rules have one owner.

Likely reusable patterns:

``` text
Button
SearchField
PageHeader
ServiceCard
ExternalServiceGuide
CourtSelector
DataStatusBadge
PrototypeNotice
EmptyState
SourceNote
PDFCard
```

These names are conceptual; use repository conventions rather than
forcing renames.

A new reusable component is justified when: - the interaction appears in
at least two real places; - consistency has user/accessibility value; -
centralizing a domain rule prevents drift.

Do not turn simple text/layout fragments into components merely for
abstraction.

------------------------------------------------------------------------

# 16. Asset-generation contract

The coding agent should not invent untracked visual assets ad hoc.

For each missing asset, create/update an asset registry record:

``` json
{
  "assetId": "home-hero-01",
  "page": "/",
  "purpose": "homepage editorial hero",
  "format": "jpg",
  "dimensions": "2400x1000",
  "subject": "diverse Indian citizens represented as an editorial portrait montage",
  "composition": "wide crop with safe text area on left",
  "style": "monochrome, restrained, high-detail editorial illustration",
  "alt": "Portrait montage representing people served by India's courts",
  "synthetic": true,
  "disclosure": "AI-generated editorial illustration",
  "prompt": ""
}
```

## SVG

Use for: - interface icons; - simple diagrams; - decorative motifs; -
non-photographic illustrations.

SVG requirements: - valid `viewBox`; - no embedded raster unless
justified; - consistent stroke/fill language across the icon family; -
avoid microscopic detail; - test at intended rendered size; - decorative
SVGs should not pollute the accessibility tree.

## JPG

Use for photographic/editorial imagery where transparency is
unnecessary.

Requirements: - define intended crop/aspect ratio before generation; -
preserve text-safe area if overlaid; - optimize file size appropriate to
display dimensions; - provide alt text based on purpose, not visual
trivia.

AI-generated people/courts must be treated as **editorial
illustration**, never evidence, archival photography, or depiction of an
actual proceeding.

Do not generate seals, emblems, signatures, court orders, or documentary
artifacts in a way that could be mistaken for authentic official
material.

------------------------------------------------------------------------

# 17. PDF/manual policy

Every PDF link in the prototype must resolve to either: 1. a verified
official document, or 2. a clearly labeled hackathon prototype manual.

Do not recreate an existing official manual merely to make the prototype
look complete if linking to the official source is appropriate.

Prototype manuals should normally be **3--6 concise pages**, but content
determines length.

Each prototype manual should contain: - cover/title; - purpose and
intended user; - prerequisite information; - numbered workflow; -
explanation of unfamiliar terminology; - sample/demo state clearly
labeled; - troubleshooting/help path; - authoritative references; - a
`Production verification required` section; - hackathon disclaimer.

Required disclaimer:

> **HACKATHON PROTOTYPE**\
> This document contains prototype and/or sample content prepared for
> demonstration purposes. Procedures, links, screenshots, contact
> details, service availability, and judicial information must be
> checked against current official sources before public or production
> deployment.

If screenshots contain synthetic records, label them in the screenshot
or adjacent caption.

A manual must not claim that a workflow is legally sufficient unless
that claim is explicitly verified.

Suggested manuals only where corresponding UI exists: - Find a Case; -
Find a Court; - Case Status; - Orders & Judgments; - Today's Hearings /
Cause Lists; - e-Filing; - e-Payment; - Virtual Courts; - NJDG; -
Accessibility / Using eCourts.

------------------------------------------------------------------------

# 18. Auditor contract

The auditor finds problems; it does not patch.

Prefer structured output:

``` json
{
  "page": "/njdg",
  "filesInspected": ["src/..."],
  "problems": [
    {
      "id": "UX-014",
      "type": "content",
      "severity": "high",
      "location": "/njdg",
      "problem": "NJDG acronym is presented without orientation before external navigation.",
      "evidence": "",
      "recommendedAction": "Add the shared external-service guide.",
      "requiresResearch": true
    }
  ]
}
```

Types:
`ux | content | data | accessibility | link | visual | asset | code | performance`

Severity: - **critical** --- could materially mislead users, expose
unsafe data, break a primary task, or create a severe accessibility
barrier; - **high** --- blocks or seriously confuses an important
journey; - **medium** --- meaningful quality/usability issue with a
workaround; - **low** --- polish or minor consistency issue.

Do not inflate severity to make the report look important.

------------------------------------------------------------------------

# 19. Link handling

Classify links as: - internal route; - verified official external
service; - official document; - prototype document; - unresolved.

For external links: - verify the destination; - prefer the specific
official destination needed for the task; - indicate external transition
when context would otherwise be surprising; - do not label a link
"official" unless its authority is established; - detect redirects/dead
links when tooling permits.

Do not replace a broken official deep link with a guessed URL.

------------------------------------------------------------------------

# 20. Testing strategy

After every patch, test according to blast radius.

## Local change

Run: - relevant unit/component tests; - relevant type/lint checks; -
affected route render; - changed interaction.

## Shared component/data/global style change

Also run: - known consumers; - responsive checks; - broader test/build
command; - synthetic/provenance checks where applicable.

## Routing/build/config change

Run the production-equivalent build if available.

Validation checklist: - page renders without console/runtime errors; -
primary action works; - keyboard path works; - visible focus exists; -
labels and errors are understandable; - internal links resolve; -
external links are correctly classified; - no dead buttons; - no lorem
ipsum; - no accidental placeholder text; - no unexplained acronym at
first meaningful use; - no undisclosed synthetic judicial data; - no
broken images/icons; - referenced PDFs exist or are explicitly
pending; - responsive layout does not create avoidable horizontal
overflow; - headings remain logical; - empty/loading/error states are
distinguishable; - changed components preserve existing stable behavior.

If a check cannot run, record why and what was inspected instead. Never
state "tests pass" when they were not run.

------------------------------------------------------------------------

# 21. Performance and dependency discipline

Public-service UX benefits from predictability and low overhead.

Before adding a dependency, verify: - the repository does not already
provide the capability; - native browser/framework functionality is
insufficient; - bundle/runtime cost is proportionate; -
maintenance/security implications are acceptable; - the feature cannot
be implemented more simply.

Avoid large client libraries for: - basic filtering; - simple
accordions/tabs; - icon rendering; - static charts; - court selection; -
trivial animation.

Prefer server/static rendering for stable informational content when
compatible with the project architecture.

Do not prematurely optimize invisible micro-performance while a user
journey remains confusing or incorrect.

------------------------------------------------------------------------

# 22. Failure and empty-state design

A public service must explain failure without blaming the user.

For search/lookup flows distinguish: - no matching result; - invalid
input; - incomplete selection; - service unavailable; - data not
included in prototype; - research/data not yet verified.

Never display a fabricated result merely to avoid an empty screen.

Error copy should say: 1. what happened; 2. what the user can do next;
3. where official help exists when appropriate.

------------------------------------------------------------------------

# 23. Reporting

Maintain `.agent/reports/latest.md` only when there is meaningful work
to record.

Recommended sections:

``` md
# eCourts Agent Report
## Scope
## Completed
## Verification Performed
## Research / Sources
## Synthetic Data
## Accessibility
## Assets / Manuals
## Unresolved
## Production Blockers
```

Keep reports factual and compact. Link issue IDs instead of repeating
full histories.

Metrics such as "site completeness" or "verified percentage" may be
shown only when the denominator is defined. Label estimates as
estimates.

------------------------------------------------------------------------

# 24. Definition of done

A task is done only when all applicable conditions are true:

-   requested behavior/content exists;
-   the solution is no more complex than the problem requires;
-   factual claims have the correct provenance status;
-   synthetic content is unmistakably disclosed;
-   affected routes/components render;
-   primary interaction works with pointer and keyboard;
-   relevant accessibility checks were performed;
-   links/assets/PDF references resolve or are explicitly marked
    unresolved;
-   targeted tests/checks were run;
-   no new obvious regression was introduced;
-   registries/audit were updated when the task changes their truth;
-   unresolved production verification is documented.

Do not declare the whole site "production ready" from a partial audit.

------------------------------------------------------------------------

# 25. Default decisions

When uncertain, use these deterministic defaults:

  -----------------------------------------------------------------------
  Situation                           Default
  ----------------------------------- -----------------------------------
  Fact cannot be verified             `RESEARCH_REQUIRED`

  Demo content is invented            `SYNTHETIC_HACKATHON`

  UI term is unfamiliar               plain-language label + official
                                      term

  External official service           orient user before surprising
                                      transition

  Existing component can solve it     reuse/extend it

  One-off abstraction has no second   keep it local
  use                                 

  Map vs searchable court selector    selector

  Fancy interaction vs semantic       semantic control
  control                             

  Empty real data vs fake             honest empty state
  complete-looking data               

  AI image vs documentary implication clearly synthetic editorial
                                      illustration

  Full-repo scan vs targeted          targeted inspection
  inspection                          

  Test scope unclear                  start targeted, expand by blast
                                      radius

  Official sources conflict           record conflict; do not guess
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 26. Task execution template

For substantial work, silently organize the run around:

``` text
GOAL
What user-visible outcome must change?

CONTEXT
Which route/component/data/source owns it?

CONSTRAINTS
Truth status, accessibility, visual system, dependencies, hackathon safety.

PLAN
Smallest sequence of edits.

DONE WHEN
Observable checks proving the outcome.
```

Do not emit this template as verbose narration unless the user asks for
a plan.

------------------------------------------------------------------------

# 27. Final guardrail

The prototype's visual credibility is a risk as well as an asset.

At every decision point ask:

> Could a reasonable member of the public mistake this screen, record,
> statistic, document, image, or instruction for current authoritative
> judicial information?

If **yes**, either verify it from an appropriate official source or
label it unmistakably as prototype/synthetic. If neither is possible, do
not publish it in the user-facing prototype.
