# AI Assist + Legal Help Architecture

## Product intent
AI is a comprehension and routing layer over official court information. It may:
- explain court events in plain language;
- identify what is known, unknown, and inferred;
- surface procedural/legal routes that may be relevant, with sources;
- generate questions a citizen should ask a lawyer;
- route the citizen to human legal assistance.

AI must not:
- predict case outcomes;
- tell the citizen that one legal strategy is definitely correct;
- fabricate deadlines, attendance requirements, rights, filings, or remedies;
- replace an advocate or official court record.

## Prototype implementation
The standalone prototype uses deterministic simulated AI responses. This demonstrates the intended interaction without an API key. Production architecture would use retrieval grounded in:
1. the user's official case record;
2. official orders / judgments attached to that case;
3. applicable statutes / procedural rules from authoritative sources;
4. public legal-services information.

Every answer should expose:
- Official source(s)
- What the system knows
- What is uncertain
- Whether human legal advice is recommended

## Human legal help hierarchy
### 1. Free legal aid first
Route to NALSA / State Legal Services Authority / District Legal Services Authority when the user may be eligible.

### 2. Government consultation
Offer Tele-Law as a government-supported consultation route where applicable.

### 3. Neutral advocate directory
Only if the user needs or wants a private advocate.

This is a directory, not a marketplace.

### Directory should allow
- state / district / court filters;
- name;
- State Bar Council and enrolment number/date;
- Bar Association membership where officially available;
- languages;
- professional/academic qualifications where permitted;
- broad areas of practice where permitted;
- contact information where authorised;
- profile claim / correction after verification.

### Directory must not include
- star ratings;
- reviews as a ranking mechanism;
- 'best/top lawyer' labels;
- success or win rates;
- paid/sponsored ranking;
- bidding for cases;
- lead-selling;
- promotional profile copy;
- outcome guarantees.

A 'Verified' badge means only that identity/enrolment data was checked against an authorised source. It is not an endorsement by eCourts.

## Scaling the directory
Do not require eCourts to manually create millions of lawyer profiles.

Preferred production model:
- federated/periodic import from authorised State Bar Council / Bar Association / Legal Services data;
- minimal read-only public profile generated from permitted fields;
- advocate can claim the profile to correct/update permitted information;
- verification is re-checked periodically;
- deactivated/suspended/not-practising status must be reflected when authoritative data permits.

## Why no commercial marketplace
The public service should help citizens access representation without creating incentives for solicitation, paid ranking or lead competition. Public legal-aid pathways remain visually primary.
