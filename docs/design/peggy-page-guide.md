# Peggy: a companion to the page

Owner direction, September 28, 2026 (Los Angeles): make Peggy feel like an assistant walking alongside the visitor, explaining what they are looking at, with a more memorable premium interface.

Starting source: `74bc58c6f634b7319bf020f088d10aa35116bbe7`, existing draft PR #26.

## Implementation checklist

- [x] G1. Refine Peggy around the approved Pegasus emblem, navy masthead, cream reading surface, live location strip and three useful guide actions.
- [x] G2. Follow the current public page and visible section; attach a bounded, inspectable snapshot only when the visitor sends. Exclude form fields, saved/private records and URL parameters. Allow context to be removed.
- [x] G3. Walk through real page sections with Previous, Next, End and Ask controls; support deliberately selected page text.
- [x] G4. Preserve editable drafts, access refresh, stop/reset isolation, saving and error recovery. Keep model inputs bounded and treat page text as untrusted evidence.
- [x] G5. Verify rendered desktop/mobile/theme states, keyboard behavior, route changes, context consent and exact request snapshots. Preserve the publication and owner-report receipts with this revision on draft PR #26.

## Visual specification

The generated desktop companion concept (`exec-0e466cb2-250f-4cba-a8d8-bfa3987782b3.png`) defines the panel. The tour-sheet concept (`exec-3a6be80b-e1f2-4b1a-a417-2d20ceca2840.png`) defines only the compact tour controls. The second concept's invented page imagery, replacement wordmark and property-service copy are rejected. Existing page assets, wordmark, content and page geometry remain authoritative.

- One 440px companion panel, maximum 860px tall, 8px radius, fine border and restrained shadow. On phones use the available viewport with safe areas and cookie space. The compact tour sheet leaves the page visible.
- Cream `#f5efe4`, navy `#132a38`, copper `#8e5030`; existing dark-theme reading tokens. No new gradients, glows or decorative avatar.
- Existing Pegasus emblem; Playfair Display for Peggy and the welcome headline, Inter for controls and reading. Heading 32px/1.15, body 14px/1.65, UI 13px, captions 11–12px. No negative tracking.
- Signature motifs: navy identity band; copper section rule; location breadcrumb; open, ruled action rows. No nested card grid.
- Lucide outline Compass, FileText, ArrowRight, ArrowLeft, X, ChevronDown, ListTree and TextSelect at 16–20px with consistent strokes. Existing logo remains unchanged.
- Quiet 180–220ms transitions and smooth user-initiated section navigation. Reduced motion skips both.

## Copy and states

Default: “Peggy”, “Your guide to Pegasus”, visible AI disclosure, current page / section, “Let’s look at this together.”, “I can explain this section, show you around, or help you find your next step.”, “You’re viewing”, current section heading, “Page context is ready when you send.”, “Explain this section”, “Show me around”, “A short walk through this page”, “Find my next step”, “About Peggy”, “Ask about what you’re looking at…”, “Page context included”, “Send”.

The concept omitted visible AI identity; “AI assistant · early access” is an intentional disclosure addition. Existing capability limitations remain in About Peggy. A local tour is explicitly labeled “Page guide · no message sent”, never presented as a generated reply.

Context details expose the exact bounded reading snapshot and an outline of actual sections. Explaining a section or selection prepares a draft and pins that source for review. Browsing alone never creates a conversation. A normal question uses the current snapshot at Send. The transcript identifies the source used for each question. A route change clears stale prepared context without erasing the visitor's conversation.

Tour: real page heading, compact excerpt of visible text, current step / total, previous, next or finish, end, and ask about this. No blocking backdrop; focus stays with the guide controls. Existing public pages determine available tour stops. Saved/private routes do not expose record contents.

## Evidence and remaining work

Current-source functional and fidelity evidence appears below. The exact published source, hosted CI and owner-report receipts are recorded on draft PR #26 and the owner checklist. Hosted Vercel delivery, configured live AI and physical-device acceptance remain distinct from this implementation.

## Verification and fidelity ledger

The implementation follows the companion-panel concept and the tour-controls portion of the second concept. Both concepts and actual Chromium screenshots were inspected with `view_image`. Cloud Browser returned `net::ERR_BLOCKED_BY_CLIENT` for the owned local preview, so the repository's isolated Chromium workflow supplied the renders. The desktop concept was checked at its native **1505 × 1045** viewport; additional renders cover 1440, 768, 390 and 320px in both themes.

| Comparison | Concept / source evidence | Implemented result |
| --- | --- | --- |
| Identity and image treatment | Existing Pegasus emblem and existing site behind the companion | Original logo and all site photographs remain intact. Generated replacement imagery and wordmark in the tour concept were rejected. |
| Hierarchy and copy | Peggy identity, location, editorial opening, viewed section, Explain, Tour, Next step, composer | Same sequence and action labels; required visible AI identity added. The above-the-fold copy check found no unrecorded product copy. |
| Type | Playfair title and heading; Inter body and UI | Explicit 30/32px desktop identity/heading, 14px reading/action text and deliberate 11–12px secondary controls. Mobile textarea stays 16px. |
| Palette | Cream paper, navy identity and primary actions, restrained copper | Existing theme tokens and exact navy masthead. Dark mode adapts reading surfaces; no new glow, gradient, art or logo. |
| Containers and spacing | One companion frame, section rule, open action rows | 440px panel retained for usable website space. Maximum height refined from 820 to 860px so all primary guide actions and About fit on a desktop. Phone body scrolls with composer and disclosure anchored. |
| Tour | Compact navy/cream sheet; section emphasis; Previous, Next, Ask and End | Real page headings and a fine copper margin mark. Removed the initial heavy heading outline. Home has six concise, authored tour introductions. Other pages use bounded published section text. |
| Source and consent | Context preview and explicit Send | Exact source available for inspection, context-off control, frozen section/selection attachment and a source label on each sent question. No automatic conversation on opening, touring, selecting or scrolling. |
| Responsive and keyboard | Mobile companion and smaller tour sheet | 320–1440px, light/dark, cookie and short-height states. Fixed a mobile-menu inert-state race and restored visible opener focus after closing a tour-to-chat session. |

Intentional variations: visible AI disclosure; a fixed 440px responsive panel; source detail and context-removal controls required for the real workflow; genuine current site text and imagery in the tour background; existing Send glyph and quieter About row. The implementation is faithfully verified against this scoped design specification. No known fixable visual mismatch remains in the checked states. Physical-device comfort and conversational quality require the separate acceptance below.

Functional evidence: TypeScript, production build and client budget pass. The complete regression run passes **226 files / 2,571 tests**, including 14 new page-context/client/service cases. The 64-state rendered guide matrix checks current section changes, six Home stops, selected passages, reviewed sending, pinned sources after scrolling, context off, Strategy Lab, route changes, query removal, saved/private exclusion and return focus. The established 46-state Peggy matrix retains interruption/recovery/save/reset and short-cookie coverage. Exact final source, rendered counts and hosted CI result are recorded on PR #26 and the owner checklist when publication completes.

The backend retains the existing provider/model. New snapshots are bounded, public-route allowlisted and supplied only in the user-message channel as untrusted page evidence. Each historical question retains its own source; page snapshots are excluded from automated intake extraction. No database migration, live message, intake submission, external notification, merge or production change is part of this pass.
