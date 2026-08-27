# UI/UX Refinement — v1

## Trigger
Mobile review of v0 showed two high-severity problems:
1. Relative image paths failed in the standalone prototype viewer, producing broken image placeholders.
2. The homepage still explained the design rationale instead of behaving like a simple citizen service.

## v1 design thesis
A first-time citizen should be able to answer, within seconds:
- What can I do here?
- How do I check my case?
- What if I do not know my CNR?
- Can I use my own language / listen instead of reading?
- Where do I go for human legal help?

## Changes made
- Self-contained embedded imagery: no dependency on relative asset paths in the competition demo HTML.
- Mobile-first hero: one clear question, one primary case-search task, three recovery/alternate paths.
- Regional language choices placed directly in the first screen.
- “I don't know my CNR” becomes a guided flow rather than an error/dead end.
- Court-paper flow added as a simulated upload/extraction journey.
- “Start with your goal” task cards limited to three major citizen intents.
- Accessibility controls reduced to three understandable options: Simple View, Read Aloud, High Contrast.
- Menu is functional and contains only major citizen destinations.
- Case workspace reorganized around summary, timeline, and AI Assist.
- Latest order now has three trust-separated layers: Official Record, Accessible Text, Simple Explanation.
- Legal help remains public-service-first: Legal Aid → Tele-Law → neutral advocate directory.
- Mobile hero imagery is an actual embedded image plus separate status/listen/language layers; desktop retains parallax behavior.

## Public skill frameworks consulted
- hueyexe/frontend-agent-skills: usability foundations, visual composition, accessibility, information architecture.
- PracticalSwan/agent-skills frontend-design: task fit, accessibility, IA, responsiveness, resilience and rendered verification as quality gates.
- sergiodxa/agent-skills frontend accessibility: semantic structure, screen readers, keyboard/focus, reduced motion and touch targets.

Project-local distilled versions are saved under `.agent-skills/` so the same criteria remain available for future versions.

## v1 remaining QA
- Real mobile browser interaction test after deployment.
- Keyboard focus trap/restore regression test for all modals.
- Screen-reader pass on Android TalkBack and desktop NVDA/VoiceOver when hardware is available.
- Regional-language copy review by native speakers before production use.
- Performance test over slow mobile data after hosting.
