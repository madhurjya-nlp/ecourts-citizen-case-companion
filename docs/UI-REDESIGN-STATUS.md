# UI redesign status - 5 September 2026

Implemented in `assets/prototype-v3-app.js` and `assets/citizen-shell.css`:

- Search-first Home with localized role choices and a secondary disclosure for assisted use and WhatsApp.
- Warm white, saffron, green, teal, amber and blue semantic palette.
- Divided common-action rows and lighter FAQ surfaces.
- Distinct case stage visibility, accurate selected tabs, expandable history, metadata and online/offline checklists.
- Working official/plain-language record switch.
- Home search accepts the sample CNR, case number and party name.
- Direct Help-to-NYK entry; mobile launcher occupies reserved dock space.
- Compact mobile journey indicator.

The presentation enhancement follows the existing `addJourneyEnhancements` pattern. The render entry calls `applyCitizenHierarchy` after it. Backend, AI request contracts and PDF implementation were not changed.

Still outside this pass: new icon family, professional advocate workflows, complete removal of older CSS rules, and automatic source disclosures inside AI responses. The advocate role records session intent but does not introduce a lawyer dashboard.

Visual evidence is local under `output/playwright/redesign-*`; do not ship test artifacts. Tests explicitly cover hidden case stages, expanded checklists and the record mode switch.
