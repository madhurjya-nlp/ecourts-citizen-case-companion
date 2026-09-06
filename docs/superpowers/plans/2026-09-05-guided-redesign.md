# Guided eCourts redesign and voice implementation plan

Goal: Match the user-supplied Variation B mockup and its copy, with Home / Find Case / Nayak / Services / Learn navigation and accessible voice interaction.
Architecture: Preserve the vanilla SPA, existing case search, paper upload and chat endpoint. Modify existing renderers and locale packs. Share speech lifecycle in one small browser module.
Tech stack: Vanilla JavaScript, CSS, Web Speech, Playwright.

The user's supplied mockup establishes the design. Their centered Nayak request overrides the reference brief's four-item navigation. Keep prototype and privacy statements accurate where the image makes stronger claims than the implementation supports.

1. Update existing home, shell, finder, services and paper renderers and English mockup wording, retaining translations.
2. Replace the civic green visual tokens with indigo, restrained cards, serif headings and mobile navigation. Keep secondary functions in contextual entries.
3. Add voice input, editable transcript, optional spoken AI replies and read-aloud controls with cancellation and unsupported-browser feedback (voice subtask).
4. Check syntax and static/worker/browser tests; inspect mobile and desktop screenshots; fix regressions.

Research notes: Existing code already implements Web Speech case search and an AI chat worker. Reuse the existing inline icon system and official destination data. No new legal claims or service endpoints are required.
