# Website experience coherence — October 3, 2026

## Approved scope

Refine the complete public website within its existing identity: predictable page changes and history, consistent request names and context, clear return paths, purposeful page endings, consistent reading/form geometry, and optional guidance that does not cover the content. This is a draft-preview update, not approval for a public launch, live intake activation, or a new offering.

Baseline: `0bd952f10460adbbf879da6a847a6a5f22d0c9ea`.

## Changes

- Forward navigation waits for the destination's own content. Native Back/Forward remains distinct from ordinary links; hash-only history cannot disable the next forward reset. Explicit gallery/form anchors and route-owned calculator/Saved focus targets retain their intended destination.
- Buyer representation and private-pilot links carry their explicit role. Buying-criteria links reach the existing form. Selected owner/partner context follows the page's matching actions, with deterministic return links.
- Property Review uses one public name in page content, intake, metadata and FAQ. The existing `/deal-blueprint` URL, compatibility redirects and backend classification remain.
- Real Estate, Tools and Our Work retain logical parent context. Exact `aria-current="page"` is limited to actual current pages. The duplicate Contact/Connect footer choice is removed, while the compatibility redirect remains.
- Saved work explicitly opens the saved version. Conflicting working inputs remain unchanged until confirmation; Cancel/Escape preserve them and Undo restores them after an accepted replacement.
- Peggy's editable review context crosses both public shells in a single-use, expiring in-memory transfer. The URL carries only an opaque marker. No conversation text is stored in history or browser storage by the transfer; no message or inquiry is sent automatically.
- The page guide uses a compact collapsible top treatment below the wide-screen rail breakpoint. Navigation and Close remain visible; the explained heading and controls clear the guide. Dynamic FAQ filters and section anchors refresh the wayfinder correctly.
- Pages with a concluding inquiry retain that ending. Optional related reading is a quiet row on informational pages. Tools has one page-guide invitation, clearly separate from the request-based Property Review.
- FAQ, utility and MarketFlow request surfaces use the existing paper/navy/copper typography and control rhythm. Supplemental access-process detail can be expanded; material access boundaries and contact consent remain visible.
- The final fresh-eyes pass corrects phone role-control focus, calculator prefix spacing, expanded-guide-to-chat section alignment and narrow legal-contact wrapping. All eight calculator tabs remain available.

## Preserved boundaries

No new routes, services, dependencies, provider integrations, schema changes, buyer-criteria API changes, public inventory, automatic offers, paid checkout or securities claims were added. Locked representation identity, consent text, review/access limitations and the original cinematic/project/founder assets remain. The homepage source image retains SHA-256 `a1de24393eda3bf7ca0ece805a96b71554b7006aee0fcede5d7c41554d8409a3`.

## Verification

- Node 22.23.2; TypeScript, production build, bundle budget and serverless runtime configurations.
- Complete Vitest suite: 261 passing files / 3,149 passing tests; 11 database-dependent files / 165 tests explicitly skipped by their integration configuration. New destination readiness, intent, saved-version, cross-shell handoff and guidance regressions are included.
- Real browser route continuity: forward arrival, history restoration, cross-shell footer navigation and direct gallery anchors.
- 92 shared-journey screenshot/accessibility/interaction checks at 320, 390, 768 and 1536 pixels in light and dark appearances, plus 72 Peggy guide/context/privacy states.
- All 46 public routes at 390px in light and dark appearances and 1440px light appearance: 138 passing route states, including auth, legal, legacy aliases and unavailable-backend states.
- Additional 333px collapsed/expanded guide and 1150px guide checks. Expanded guide's header/Close stay visible; the destination heading clears its lower edge.
- Independent review found and corrected arrival focus competition, current-page menu focus, metadata naming and fixed-header placement of Saved navigation. Required screenshot state was recaptured after layout settled.
- A separate final rendered audit rechecked 20 targeted states at 320px dark, 390px light, 1440px dark and 1536px light after its four concrete findings were repaired. All 33 icon-decorated calculator fields in five worksheets retained 40px prefix clearance; the three other calculators use undecorated fields. Rechecks had no page exceptions, attempted writes or horizontal overflow.

The repository's normal build wrapper cannot open its IPC pipe in the local sandbox. The documented equivalent `node --import tsx script/build.ts`, followed by the unchanged bundle/runtime checks, was used locally. The cloud browser rejects local loopback URLs, so local rendered verification uses the repository's isolated Chromium harness. The deployed draft is reviewed separately in the cloud browser after publication.

## Remaining acceptance

Local rendering and fixtures do not establish physical iOS/Safari behavior, live Peggy answers, actual backend delivery, legal/broker approval, production readiness or owner UX acceptance. Tests requiring a configured database remain explicitly skipped in the ordinary unit suite; no real form submission was used for this experience pass. Exact published source, hosted review and CI results accompany the draft release.
