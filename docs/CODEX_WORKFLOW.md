# Codex Workflow

## Before Editing

1. Read `AGENTS.md`.
2. Read `README.md`.
3. Read `docs/PRODUCT_BRIEF.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ENVIRONMENT.md`, and `docs/LAUNCH_CHECKLIST.md`.
4. Read design/launch gates in `docs/design/` and `docs/qa/`.
5. Inspect current git status with the safe-directory override if needed.
6. Identify whether existing dirty changes belong to the current task before touching nearby files.

## Work Rules

- Prefer one coherent launch-safe slice over scattered polish.
- Do not create fake readiness, fake inventory, fake status, fake metrics, or fake payment flows.
- Keep compliance boundaries explicit.
- Route property intake toward review; do not promise offers or outcomes.
- Preserve locked brand tokens and casing.
- Update docs when durable status, blockers, decisions, or source context changes.

## Verification

Minimum before calling a slice done:

```powershell
npm run check
npm test
npm run build
```

For UI/launch changes, also run desktop/mobile visual QA, accessibility checks, route smoke, SEO/link checks, and the launch matrix where practical.

## Final Report

End with what changed, what passed, what failed or was skipped, blockers, and the next task.
