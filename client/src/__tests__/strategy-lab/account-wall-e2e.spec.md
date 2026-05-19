# Strategy Lab — Account Wall real-browser E2E spec (Task #101)

This is the canonical real-browser test plan for the Strategy Lab account
wall. It is intentionally committed alongside the jsdom unit and
integration tests so that any developer can re-run it through the testing
skill (`runTest`) from the Replit agent. The Vitest specs cover the hook
contract (`account-wall.test.tsx`) and the page integration in jsdom
(`account-wall-integration.test.tsx`); this spec covers the real browser
— Radix portals, the 600ms debounce on the actual event loop, real
localStorage + cookie + fingerprint persistence, and toast rendering.

## How to run

From the agent, invoke the testing skill with the test plan below as the
`testPlan` parameter and the documentation block as
`relevantTechnicalDocumentation`. Use a mobile viewport (400×800) so the
mobile action drawer is exposed; the Full Path workbench also renders
the same gated buttons if the drawer is unavailable.

```js
const result = await runTest({
  defaultScreenWidth: 400,
  defaultScreenHeight: 800,
  testPlan: /* TEST PLAN below */,
  relevantTechnicalDocumentation: /* DOCUMENTATION below */,
});
```

Last green run: status=success (Task #101 verification, May 2026).

## TEST PLAN

```
Test the Strategy Lab anonymous account-wall regression end-to-end.

The Strategy Lab grants 3 free anonymous engine runs (FREE_RUN_LIMIT = 3).
The 4th distinct scenario should automatically open the Account Wall
modal. After the user dismisses the wall, further form edits MUST NOT
re-pop the modal (this was a real regression where the modal re-popped
on every keystroke). Explicit gated actions (Save / Share / Export PDF)
must fire a "Sign in to continue" toast WITHOUT re-popping the modal
after dismissal (Task #101 contract).

Run counts are persisted in localStorage AND in a cookie AND in a
fingerprint-keyed localStorage slot, so a fresh browser context is
essential — DO NOT reuse an existing context.

Engine inputs are debounced 600ms before each run is counted, so wait
~1 second between distinct scenario edits.

Steps:
1. [New Context] Create a fresh browser context (so cookies and
   localStorage are empty).
2. [Browser] Navigate to /strategy-lab.
3. [Verify] The page loads with the Quick Read form visible
   ([data-testid="quick-form"]) and the runs-remaining indicator shows
   "3 of 3 free runs left" ([data-testid="text-runs-remaining-quick"]).
   The account-wall dialog ([data-testid="dialog-account-wall"]) is
   NOT visible.

4. [Browser] Scenario #1 — fill the Quick Read form:
   - Address ([data-testid="quick-input-address"]): "1247 Aberdeen Way"
   - Asking price ([data-testid="quick-input-price"]): 350000
   - Rehab budget ([data-testid="quick-input-rehab"]): 40000
   - ARV ([data-testid="quick-input-arv"]): 520000
   - Market rent ([data-testid="quick-input-rent"]): 3200
   Wait at least 1.2 seconds for the 600ms debounce to flush.
5. [Verify]
   - Verdict card [data-testid="quick-card-lane"] is visible.
   - Runs-remaining text reads "2 of 3 free runs left".
   - Account wall [data-testid="dialog-account-wall"] is NOT visible.

6. [Browser] Scenario #2 — change asking price to 360000. Wait ~1.2s.
7. [Verify] Runs-remaining reads "1 of 3 free runs left". Wall not
   visible.

8. [Browser] Scenario #3 — change asking price to 370000. Wait ~1.2s.
9. [Verify] Runs-remaining reads "0 of 3 free runs left" (or similar
   "Sign in" wording for runsLeft=0). Wall not visible.

10. [Browser] Scenario #4 — change asking price to 380000. Wait ~1.5s.
11. [Verify] The account wall [data-testid="dialog-account-wall"] IS
    now visible exactly once. Both [data-testid="btn-account-wall-dismiss"]
    and [data-testid="btn-account-wall-signin"] are visible.

12. [Browser] Click [data-testid="btn-account-wall-dismiss"].
13. [Verify] [data-testid="dialog-account-wall"] is no longer visible.

14. [Browser] Make ~10 small edits to the form, one after another,
    with ~700ms between edits (asking → 381000, 382000; rehab → 41000,
    42000; ARV → 521000, 522000; rent → 3210, 3220; asking → 383000,
    384000; final wait ~1.5s).
15. [Verify] CRITICAL — the account wall [data-testid="dialog-account-wall"]
    must remain CLOSED throughout and after these edits. This is the
    regression check.

16. [Browser] Reach the gated Save / Share / Export PDF actions. On
    mobile width the actions live in the mobile verdict drawer
    ([data-testid="mobile-verdict-drawer"]) — click
    [data-testid="mobile-drawer-collapsed"] to expand it. If the
    mobile drawer is not present in the current build, switch to Full
    Path ([data-testid="mode-full"]) and use the workbench buttons
    [data-testid="btn-save-snapshot"], [data-testid="btn-share-snapshot"],
    [data-testid="btn-export-pdf"] instead.

17. [Browser] Click Save (mobile-btn-save OR btn-save-snapshot).
18. [Verify] A toast titled "Sign in to continue" appears
    (description includes "save this snapshot"). The account wall does
    NOT re-open ([data-testid="dialog-account-wall"] stays hidden).

19. [Browser] Click Share (mobile-btn-share OR btn-share-snapshot).
20. [Verify] Toast "Sign in to continue" appears (description
    references "shareable link"). Wall stays closed.

21. [Browser] Click Export PDF (mobile-btn-pdf OR btn-export-pdf).
22. [Verify] Toast "Sign in to continue" appears (description
    references "Snapshot PDF"). Wall stays closed.

23. [Browser] Make one more form edit (asking → 385000) and wait ~1.5s.
24. [Verify] CRITICAL — the wall does NOT auto-re-pop. The
    wallDismissed session flag must still be honored after the gated
    actions.

Pass criteria:
- Wall auto-opens exactly once, on scenario #4.
- After dismissal, no number of subsequent input edits or gated action
  clicks causes the wall to re-pop.
- Each gated action button (Save / Share / Export PDF) shows a "Sign in
  to continue" toast.
```

## DOCUMENTATION

```
- Page: client/src/pages/strategy-lab.tsx (Quick Read mode is default).
- Free run limit constant: client/src/lib/strategy-lab-session.ts →
  FREE_RUN_LIMIT = 3. Runs are persisted in localStorage (key
  "pegasus.lab.runCount"), a same-name cookie, and a fingerprint-keyed
  localStorage slot. A fresh browser context resets all three.
- Run-limit useEffect lives at strategy-lab.tsx ~line 864. Inputs
  change → 600ms debounced timer → either bumpLabRunCount or
  openAccountWall("keep running new properties").
- openAccountWall is a no-op once the user dismissed the wall in the
  current session (sessionStorage key "pegasus.lab.wallDismissed").
  This is the regression guard.
- ensureAuth (used by Save/Share/PDF/Submit) fires a sign-in toast on
  every call AND tries to open the wall via the non-forced
  openAccountWall — which respects the session dismissal flag. So
  after the user dismisses the wall once, gated clicks show ONLY the
  toast (Task #101 contract).
- Mobile viewport (lg:hidden < 1024px) exposes the action drawer at
  the bottom: data-testid="mobile-verdict-drawer" with collapsed bar
  "mobile-drawer-collapsed". After expanding, mobile-btn-save /
  mobile-btn-share / mobile-btn-pdf are wired to handleSave /
  handleShare / handleExportPDF which all funnel through ensureAuth.
  In Full Path mode the same handlers are wired to btn-save-snapshot /
  btn-share-snapshot / btn-export-pdf inside the InstrumentWorkbench.
- Toast component: shadcn Toaster (client/src/components/ui/toaster.tsx).
  Toasts render with the title text "Sign in to continue".
- The auto-pop dialog has data-testid="dialog-account-wall"; dismiss
  with "btn-account-wall-dismiss".
```
