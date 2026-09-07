# UI polish and icon rhythm implementation plan

## Task 1: Shared shell spacing and safe-area behavior

- Update the existing citizen-shell CSS only.
- Add a shared bottom clearance strategy tied to the dock height and `env(safe-area-inset-bottom)`.
- Prevent small viewport overflow from shell padding/borders.
- Preserve all current focus, touch-target, and reduced-motion behavior.

## Task 2: Homepage scanner teaser hierarchy

- Adjust the existing `.scanner-teaser` layout at desktop and mobile so its accent, copy, and action read as one intentional block.
- Keep the current wording, disclosure semantics, and navigation action.
- Avoid adding new dependencies or decorative assets.

## Task 3: Verification and review

- Run static, worker, syntax, diff, and targeted browser checks.
- Run the full browser suite if the local server remains stable; isolate/re-run any server-only failure.
- Inspect the live/local homepage and documents route at desktop and 390px widths.
- Review the final diff for scope creep and preserve unrelated user changes.
