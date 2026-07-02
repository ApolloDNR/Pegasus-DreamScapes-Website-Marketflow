# Pegasus Dreamscapes Website Agent Notes

## Product Identity

Pegasus Dreamscapes is the public-facing real estate operating-company website for Pegasus Dreamscapes Corp. It must communicate credibility, disciplined review, and lead routing for sellers, agents, investor-buyers, wholesalers/deal finders, development partners, and capital relationships.

Public brand casing is `Pegasus Dreamscapes`. Do not use `Pegasus DreamScapes` unless quoting legacy source material.

## Read First

Before editing, read:

1. `README.md`
2. `docs/AUTOMATION_GOAL.md`
3. `docs/PRODUCT_BRIEF.md`
4. `docs/ROADMAP.md`
5. `docs/DECISIONS.md`
6. `docs/ENVIRONMENT.md`
7. `docs/CODEX_WORKFLOW.md`
8. `docs/LAUNCH_CHECKLIST.md`
9. `docs/RELATED_PROJECTS.md`
10. `docs/design/final-design-lock.md`
11. `docs/design/visual-implementation-handoff.md`
12. `docs/qa/final-launch-gate.md`

## Launch Doctrine

Finish what is real, hide what is fake, and never fill a missing system with persuasive copy.

Real launch surfaces include Submit, Strategy Lab, Peggy web concierge, MarketFlow request access, FAQ/legal pages, SEO, and production intake wiring. Do not imply live inventory, live matching, public securities offerings, guaranteed offers, guaranteed outcomes, or automatic Deal Blueprint checkout.

## Current Repo Notes

This worktree may require a one-off safe-directory override for git commands on Windows:

```powershell
git -c safe.directory="C:/Users/Apoll/OneDrive/Documentos/New project/repos/pegasus-dreamscapes-website-github-main" status --short --branch
```

Do not revert existing dirty work unless Apollo explicitly asks. Work with the current branch and document blockers.

## Verification Commands

```powershell
npm run check
npm test
npm run build
```

Run route, accessibility, mobile, SEO, and launch-matrix checks before deployment.

## Stop Conditions

Stop for missing production secrets, destructive data risk, deployment approval, legal/compliance review, payment activation, regulated offer/securities language, or source-of-truth contradiction.
