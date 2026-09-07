# UI polish and icon rhythm design

## Goal

Polish the shared citizen shell and homepage/scanner presentation without changing the existing visual direction, icon assets, navigation model, or document-analysis behavior.

## Scope

- Keep the current inline SVG icon pack and visual treatment.
- Remove avoidable mobile viewport overflow from the shared shell.
- Reserve predictable bottom clearance for the fixed navigation dock, including device safe-area padding.
- Preserve usable touch targets and visible focus states.
- Give the homepage scanner teaser a clearer visual priority while keeping it restrained and disclosure-safe.
- Normalize only the spacing/placement rules that affect the above surfaces.

## Non-goals

- No new icon dependency or icon redesign.
- No route/data/API changes.
- No change to scanner state handling or Worker contract.
- No new animation system; respect existing reduced-motion behavior.

## Design decisions

1. Use CSS-only adjustments in the existing citizen shell stylesheet where possible.
2. Use `env(safe-area-inset-bottom)` for dock and page bottom spacing, with a sensible fallback.
3. Keep the dock's 44px+ interaction targets and existing Nayak treatment.
4. Make the scanner teaser visually distinct through spacing, border/accent hierarchy, and action alignment—not through a new component or large decorative treatment.
5. Keep synthetic/demo disclosures unchanged and visible.

## Research note

External research is skipped because this is a repository-local visual consistency pass. The decisions are based on the existing shell tokens, component patterns, accessibility rules in `AGENTS.md`, and live desktop/mobile inspection of the deployed route.

## Acceptance criteria

- At 390px viewport width, the page has no horizontal overflow beyond browser scrollbar rounding.
- Fixed dock does not obscure the final visible content and respects safe-area inset.
- Header/tool icons retain consistent visual size and at least 44px pointer targets.
- Homepage scanner teaser is discoverable before or alongside the primary action tiles and remains readable at mobile width.
- Existing scanner, navigation, modal, and homepage interactions remain unchanged.
- Targeted static, worker, browser, syntax, and diff checks pass; any infrastructure-only flake is recorded precisely.
