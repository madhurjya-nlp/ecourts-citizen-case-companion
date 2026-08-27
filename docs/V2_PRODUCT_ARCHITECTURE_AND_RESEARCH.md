# V2 Product Architecture and Research Brief

## Submission stance

This project is an independent hackathon prototype. The demo uses only synthetic people, synthetic cases, deterministic explanations and mock backend behavior.

For the hackathon build, the product must not connect to live government systems, use private or undocumented APIs, scrape restricted/personal data, request real sensitive IDs, or appear official. Any future production integration should sit behind an approved `CourtDataAdapter` that can be implemented only when an authorized API, sandbox or data-sharing agreement exists.

## Product thesis

Citizens do not only use eCourts to "check status." They use it to answer practical questions:

- What happened in my case?
- What should I do before the next date?
- Where are my orders, notices and cause-list entries?
- Can I understand this without legal vocabulary?
- Do I need legal aid, Tele-Law, or a category of lawyer?
- What documents, dates, amounts or land measurements do I need to prepare?

The V2 design is therefore a case dashboard, not a portal homepage. The chosen direction is `C: Living Case Timeline` with a touch of `B: Guided Journey`.

## Dashboard archetypes

Use one common dashboard shell and automatically change emphasis by case type, stage and user role. This avoids confusing people with four different products while still tailoring the next action.

1. Criminal and Safety
   - Case types: summons, bail/remand, FIR-linked matters, criminal complaint, appearance.
   - Priority: attendance, liberty risk, urgent legal aid, bail/exemption questions.
   - Dashboard emphasis: next date, presence requirement, urgent documents, legal aid.

2. Family and Settlement
   - Case types: maintenance, divorce, custody, domestic violence, mediation.
   - Priority: privacy, safety, mediation, support documents, settlement notes.
   - Dashboard emphasis: private preparation, income/expense documents, mediation status.

3. Property, Money and Civil
   - Case types: land/property, recovery, injunction, consumer, cheque, contract.
   - Priority: documents, orders, fees, valuation, settlement comparison.
   - Dashboard emphasis: papers, latest order, compliance, land/calculation tools.

4. Public, Work and Rights
   - Case types: labour, service, pension, revenue, tribunal, public authority.
   - Priority: authority reply, relief sought, representation history, compliance.
   - Dashboard emphasis: document discipline, response status, appeal/compliance tracking.

Recommended assignment logic:

```text
dashboard_archetype = classify(case_type, act, forum, stage, user_role)
stage_overlay = pre_filing | filed | notice | hearing | order | compliance | settlement | disposed | appeal
visible_priority = policy(archetype, stage_overlay, risk_flags)
```

## Signup model

The official eCourts mobile app does not require registration, so the prototype should not make signup a hard gate. V2 uses:

- `Try without sign up` for judges and first-time citizens.
- `Create demo space` for a personalized synthetic dashboard.
- No phone, OTP, Aadhaar, password, payment detail, real CNR or court account.

In production, account creation should remain optional for saved preferences, alerts and multi-case continuity. Basic case search should still be possible without account creation.

## Legal education structure

Add a proper `Learn` section with short, category-level explanations:

- Civil / property
- Criminal
- Family
- Consumer / money recovery
- Labour / service / pension
- Revenue / land acquisition

Each article should explain common documents, ordinary stages, what to verify, and when to speak to a lawyer. It must not predict outcomes or give case-specific legal advice.

## Lawyer category guidance

The product should not become a lawyer marketplace. It should avoid:

- individual lawyer profiles in the demo;
- ratings, reviews, rankings, "best lawyer" labels, paid placement;
- success rates, outcome guarantees or promotional copy.

Recommended order:

1. Free legal aid where eligible.
2. Tele-Law or government-supported consultation where available.
3. Category-level private advocate guidance.

Examples:

- Property / land: civil litigation or property lawyer.
- Family / domestic: family court lawyer or legal aid counsel.
- Criminal / summons: criminal defence lawyer or legal aid counsel.
- Consumer / cheque / recovery: consumer, civil, commercial or NI Act practitioner.
- Labour / service / pension: labour, service-law or tribunal practitioner.
- Public authority / writ: constitutional, administrative-law or tribunal practitioner.

## Calculator page

V2 adds calculators as neutral preparation tools:

- land area converter;
- settlement comparison worksheet;
- simple interest helper;
- date interval helper.

Production cautions:

- Land units vary by state and sometimes district. Store source, region and effective date for every conversion factor.
- Stamp duty and court fees are state/forum/document specific. The app should deep-link or source-version official calculators instead of pretending there is one national formula.
- Settlement tools should compare numbers, time and costs. They should never recommend settlement or predict court outcomes.
- Limitation and appeal deadline calculators are legally risky. If added later, they must be verified by jurisdiction, statute, forum and order date.

## UI system

The requested visual direction is true minimalism:

- high-contrast text;
- visible 1px borders for containers and controls;
- no nested card stacks;
- no decorative blobs, heavy gradients or glass effects;
- restrained radius around 8px;
- generous negative space;
- dashboard-first first screen;
- stable navigation and consistent layout.

Motion:

- scroll reveal: fade + move up, 8-14px, short duration;
- click feedback: small scale-down and return, like a breath;
- no context-hiding animation for critical legal information;
- respect `prefers-reduced-motion`.

Accessibility:

- normal text should meet WCAG AA contrast targets;
- non-text boundaries and controls should remain visible at 3:1 or better;
- touch targets should be at least 44px;
- never rely on color alone;
- focus states must be visible.

## Production architecture

```text
Client app
  -> Auth/preferences service
  -> Case workspace service
  -> Explanation service
  -> Notification service
  -> Calculator service
  -> Legal help routing service
  -> CourtDataAdapter
       -> Mock adapter for demo
       -> Authorized sandbox adapter when available
       -> Authorized production API adapter when approved
```

Demo implementation:

- static HTML/CSS/JS;
- synthetic JSON embedded in the page;
- deterministic "AI-like" explanations;
- mock documents;
- no network dependency.

Production migration:

1. Extract the standalone prototype into components: dashboard shell, timeline, documents, learn, calculators, signup.
2. Move synthetic data into typed fixtures.
3. Build a mock API with the same contract as the future court adapter.
4. Add audit logging for explanation source, uncertainty and user-visible decisions.
5. Add optional account and notification services.
6. Integrate only approved official APIs/sandboxes when explicitly authorized.
7. Keep fallback assisted entry for citizens who have only a paper notice, CNR, party name or hearing date.

## V2 files

- `prototype-v2.html`: standalone working demo.
- `docs/V2_PRODUCT_ARCHITECTURE_AND_RESEARCH.md`: this rationale and migration plan.

