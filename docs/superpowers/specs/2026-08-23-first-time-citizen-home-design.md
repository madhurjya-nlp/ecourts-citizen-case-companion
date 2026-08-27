# First-Time Citizen Home Design

## Context

`prototype-v2.html` currently opens in a personalized dashboard for Asha Sen. That is useful for showing the living case timeline, but it assumes a profile and a known case before the citizen has chosen a task.

The approved change is to add one main public home screen for first-time citizens who want to start without login. The dashboard remains available, but it becomes a destination after the citizen chooses a path, not the first screen.

## Goal

Create a non-profile landing layer that answers, within the first viewport:

- Can I start without signing in?
- What can I do here?
- What if I do not know my CNR?
- Where do I go with only a court paper?
- Where can I get human legal help?

## Selected Approach

Use a task start page.

The first screen should ask: "What do you need to do about your case?"

Primary routes:

- Find my case: CNR search plus guided search for people who do not know the CNR.
- Read a court paper: notice/order reading and verification route.
- Check next date: next hearing/cause-list/timeline route.
- Get legal help: Legal Aid first, then Tele-Law, then category-only lawyer guidance.

Secondary routes:

- Try demo dashboard: opens the existing synthetic dashboard.
- Create demo space: remains available, but not required.
- Learn, lawyer categories, calculators: stay available through navigation.

## Screen Structure

The public home screen should use the existing V2 minimal civic visual system:

- top prototype disclosure bar;
- compact brand row with language/accessibility/help actions;
- no avatar or citizen name until a case/dashboard is opened;
- "No profile needed" message near the main heading;
- four large task buttons with stable touch targets;
- voice-intent demo bar;
- "Before you start" panel explaining useful inputs:
  - CNR, if available;
  - court notice/order;
  - party name;
  - hearing date;
  - case type or court name.

Mobile collapses to one column:

- disclosure;
- brand/actions;
- heading;
- four stacked or two-by-two task buttons depending on width;
- voice bar;
- before-you-start guidance.

## Interaction Model

Default route:

```text
page = home
```

Task routes:

```text
Find my case -> cases/search
Read a court paper -> documents/paper route or document helper state
Check next date -> demo dashboard or timeline-focused dashboard state
Get legal help -> lawyers/legal-help route
Try demo dashboard -> existing dashboard with selected synthetic case
Create demo space -> signup
```

The existing dashboard data and archetypes remain synthetic. If the citizen opens a synthetic dashboard from the public home, the UI should clearly label it as a demo case.

## Hackathon Guardrails

This build is for the Build What Moves India hackathon. The official brief says the prototype should solve a clear public-service problem through a complete citizen journey, work for Indian users including mobile users and people with limited digital experience, and use mock or synthetic data where personal information, payments, OTPs, or government systems would normally be involved.

The official rules also say not to access live government systems, reverse-engineer private systems, scrape personal or restricted information, use real Aadhaar/PAN/password/OTP/payment/sensitive data, or present the prototype as an official government product.

Therefore the UI must:

- keep the existing independent hackathon prototype disclosure visible;
- avoid official government logos or endorsement language;
- use only synthetic names, cases, documents, dates, payments, and credentials;
- never ask for real OTP, Aadhaar, payment, password, or court account details;
- distinguish official record, explanation, uncertainty, and legal advice limits;
- disclose what works and what is mocked;
- make the main journey actually clickable for demo review.

## Research Notes

- Local prior art: v1.8 already used a task launcher with "My case", "Court paper", "Pay / file", "Get help", owner selection, voice intent, language support, and recovery paths. V2 simplified into a dashboard-first demo; this change restores the first-time public-service entry while retaining the V2 living timeline.
- GOV.UK start-service guidance recommends giving users just enough information to know whether the service meets their need, one clear entry action, alternatives where relevant, and the documents/info needed before starting: https://design-system.service.gov.uk/patterns/start-using-a-service/
- NHS start-page guidance emphasizes service name, important before-start information, a start action, other access routes, and brevity for users with access needs: https://service-manual.nhs.uk/design-system/patterns/start-page
- NN/g warns that forcing people to identify an audience segment before choosing a task increases cognitive effort. For this prototype, task-first routing is better than making users start with profile/account/dashboard identity: https://www.nngroup.com/articles/audience-based-navigation/
- Build What Moves India official brief and FAQ require a working prototype, meaningful Codex/OpenAI involvement, mock data for unsafe unavailable integrations, no live government systems, no real sensitive data, and clear honesty about mocked dependencies: https://buildwhatmovesindia.com/brief and https://buildwhatmovesindia.com/faq

## Implementation Boundaries

Keep the change scoped to `prototype-v2.html` unless verification reveals a need to update docs or screenshots.

Do not rebuild the older v1.8 prototype. Reuse its task-first ideas only as product prior art.

Do not add a real backend, real eCourts connectivity, real authentication, real payment, upload storage, or live AI API calls.

## Acceptance Criteria

- Opening `prototype-v2.html` lands on the public home screen, not a named dashboard.
- The first viewport makes "start without login" clear.
- No profile avatar/name appears before a synthetic case is opened.
- The four primary task buttons are visible and usable on mobile.
- "Try demo dashboard" opens the existing dashboard experience.
- Signup remains optional.
- The prototype disclosure remains visible.
- All demo data remains synthetic.
- Keyboard focus and touch targets remain usable.
- Desktop and mobile screenshots show no overlapping text or broken layout.

## Spec Self-Review

- Placeholder scan: no TBD/TODO placeholders remain.
- Consistency check: the selected approach, routes, and acceptance criteria all describe a task-first public home before dashboard entry.
- Scope check: this is a single-prototype UI/interaction change, not a production architecture rewrite.
- Ambiguity check: signup is optional and secondary; the dashboard is a destination, not the initial route.
- Research check: research notes include local prior art, public-service start-page patterns, task-first navigation rationale, and official hackathon rules.
