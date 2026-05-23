# Keyboard accessibility audit — v1.0.1 public surface

**Date:** May 2026 (Task #141 — Wave 5 keyboard pass)
**Scope:** Every interactive element on the v1 public routes must show a visible
`focus-visible` ring on Tab, the desktop **More** dropdown must trap focus while
open and restore focus to its trigger on close, and tab order must follow
reading order.

## Baseline (already in place)

- **Global default ring** — `client/src/index.css` `:focus-visible` rule paints
  a 2px bronze outline with 2px offset on every focusable element, so any
  element that does not explicitly remove the outline inherits a visible focus
  state.
- **Skip-to-content link** — `.skip-to-content` slides into view on focus with
  its own bronze outline. Mounted at the top of every page via the layout.
- **Radix Esc + focus restoration** — `DropdownMenu`, `Sheet`, and `Dialog`
  from shadcn/Radix close on Esc and return focus to the trigger by default.

## Per-page audit

| Page | Interactive elements checked | Result |
| --- | --- | --- |
| `/` (Home) | Skip link, logo, 5 primary nav links, More trigger, More items, mobile menu trigger, hero CTAs, Strategy Lab CTA, Final CTA buttons, footer columns, theme toggle, Sign In | All show bronze ring on Tab. Hero CTAs use shadcn `Button` (built-in ring). |
| `/about` | Nav, belief-line block (non-interactive), Strategy Library link, Submit CTA, footer | Pass. |
| `/submit` | Nav, three field groups (Property / Situation / Contact), submit button, "Add another" reset on success | All inputs use shadcn `FormControl` which preserves the global ring; submit button uses bronze `Button`. |
| `/capital` | Nav, "Conversations, not pitches" block, contact link, footer | Pass. |
| `/connect` | Nav, six routing buttons | Buttons already carry explicit `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` and a visible `active:` pressed state (Wave 3, Task #134). |
| `/library` | Nav, article cards, article body links, footer | Pass — anchor tags inherit the global ring. |
| `/projects`, `/projects/nelson-dr` | Nav, case-study card links, "case study coming" panel, footer | Pass. |
| `/vendor-network` | Nav, intake form fields, submit, success view | Pass. |
| `/contact` | Nav, contact form, mailto + tel links, footer | Pass. |
| `/disclosures`, `/privacy`, `/terms` | Nav, in-body links, footer | Pass (anchors). Draft banner is non-interactive. |
| `/strategy-lab` | Nav, mode-switch tabs, input fields, action buttons | Pass — Radix Tabs trigger gets the global ring; shadcn `Input`/`Button` already styled. Out-of-scope per Brief §15 for redesign, focus states verified only. |
| `/marketflow` (gated landing) | Nav, "Request Beta Access" CTA, footer | Pass — CTA is a shadcn `Button`. |
| `/marketflow/access` | Nav, request-access form, submit | Pass. |

## Desktop **More** dropdown

- Trigger (`button[data-testid=button-nav-more]`) carries the standard nav
  `focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))]
  focus-visible:ring-offset-2`.
- Each `DropdownMenuItem` inside the menu now shows a **copper left border +
  cream background** on `:focus` / `data-[highlighted]` so keyboard users can
  always see the current item. Previously only a very faint cream wash was
  applied, which was easy to miss in light mode.
- The "Sign In" item at the bottom of the menu (unauthenticated state) carries
  an explicit 2px bronze ring with offset for the same reason.
- Focus trap + Esc restore — Radix's `DropdownMenuContent` is configured with
  its default `modal=true` behavior, which traps Tab inside the open menu and
  returns focus to the trigger button on close (Esc or outside click). Verified
  manually; no app-level override of `onCloseAutoFocus` exists.

## Mobile sheet

- Hamburger trigger has explicit `focus-visible:ring-2`.
- Inside the sheet, `NAV_PRIMARY` then a "More" group expose every link.
  Anchors inherit the global ring.
- Radix `Sheet` traps focus while open and restores focus to the trigger on
  close (default behavior, not overridden).

## Tab order

- Each public page's tab order matches reading order: skip link → header
  (logo → nav items → More → CTA → mobile menu) → hero → body sections in
  visual order → footer (brand block links → four columns left-to-right →
  bottom bar). No off-screen or out-of-order traps were found. `sr-only` voice
  anchors on the home page are non-interactive `<span>`s and do not pull focus.

## Notes / follow-ups deferred out of scope

- Admin / HQ surfaces (`/admin/*`, `/marketflow/*` dashboards) were not
  re-audited here — Task #141 brief scopes the public surface only.
- A formal Playwright keyboard test (Tab through every page, assert
  `document.activeElement` is visible) would be a useful regression net but is
  not required by the task brief.
