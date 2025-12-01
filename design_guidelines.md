# Pegasus Dreamscapes - Design Guidelines (Dark Cinematic Edition)

## Design Approach: Premium Dark Theme
Drawing inspiration from luxury real estate brands with a **dark, cinematic aesthetic**. The design conveys **designed profits, disciplined execution, and community elevation** through sophisticated visual treatment.

**Color Palette**: Dark charcoal/black backgrounds (#141618 / HSL 220, 15%, 8%) with bronze/blood-orange accents (#D4702C / HSL 25, 75%, 55%) and warm cream text (#EBE6E0 / HSL 35, 15%, 92%).

---

## Brand Identity

**Company Name**: Pegasus Dreamscapes

**Official Slogan** (for logo + brand): "Where Designed Profits Are Crafted."

**Homepage Hero Line**: "Where Designed Profits Are Crafted, and Communities Are Elevated."

**Subheadline**: "Pegasus Dreamscapes transforms distressed properties into high-performing assets through intentional design, disciplined execution, and community-focused restoration."

**Mission**: "Pegasus Dreamscapes exists to elevate communities by transforming distressed homes, underperforming neighborhoods, and forgotten blocks into restored, thriving, and beautiful environments. We design profits with intention — creating win–win outcomes for sellers, investors, and the communities we serve."

**The Dreamscaper Creed**:
- We are Dreamscapers.
- We repair what's broken.
- We restore what's forgotten.
- We protect what matters.
- We elevate communities through design, discipline, and intention.

---

## Core Design Principles
1. **Single-Page Experience**: Smooth scrolling navigation with clear section IDs
2. **Dark Cinematic Theme**: Charcoal/black backgrounds with bronze accents
3. **Premium Typography**: Playfair Display for headlines, Inter for body
4. **High-Contrast CTAs**: Bronze/blood-orange buttons that command attention
5. **Community-Centered Messaging**: Design profits + community elevation

---

## Typography System

**Headline Font**: Playfair Display (Google Fonts)
- Weights: 500-700
- Usage: All H1, H2, H3 elements

**Body Font**: Inter (Google Fonts)
- Weights: 400-500
- Usage: Body text, labels, navigation

**Hierarchy**:
- Hero H1: text-5xl to text-6xl, font-bold (Playfair), leading-tight
- Section H2: text-3xl to text-4xl, font-semibold (Playfair)
- Card H3: text-xl to text-2xl, font-medium (Playfair)
- Body text: text-base to text-lg, leading-relaxed (Inter)
- Labels: text-sm, font-medium, tracking-wide (Inter)

---

## Color System

**Primary (Bronze/Blood-Orange)**: HSL 25, 75%, 55%
- Used for: CTAs, accents, highlights, icons
- High contrast against dark backgrounds

**Background Hierarchy**:
- Main: HSL 220, 15%, 8% (near-black charcoal)
- Card: HSL 220, 15%, 12% (elevated dark surface)
- Border: HSL 220, 12%, 18% (subtle separation)

**Text Colors**:
- Foreground: HSL 35, 15%, 92% (warm cream)
- Muted: HSL 35, 12%, 60% (secondary text)

---

## Layout & Spacing System

**Tailwind Units**: 4, 8, 12, 16, 20, 24

**Section Padding**:
- Desktop: py-24 to py-32
- Mobile: py-16 to py-20

**Containers**:
- Full-width: w-full, inner max-w-7xl mx-auto px-6
- Content: max-w-6xl mx-auto
- Forms: max-w-2xl mx-auto
- Text: max-w-3xl mx-auto

**Grids**:
- 4-column services: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
- 2-column splits: grid-cols-1 lg:grid-cols-2 gap-16
- Project cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12

---

## Component Library

### Navigation
- Sticky header with dark background
- Logo left (company logo image)
- Center/right: horizontal navigation links
- Primary CTA button (bronze)
- Mobile: Slide-out menu
- Smooth scroll links to page sections

### Buttons
**Primary (Bronze)**:
- bg-primary (bronze/blood-orange)
- Padding: px-8 py-4
- Text: font-semibold text-base (Inter), dark foreground
- Rounded: rounded-md
- Strong contrast against dark backgrounds

**Secondary (Outline)**:
- Border with subtle cream tint
- Hover: fill transition

### Cards
**Service Cards**:
- Dark card background (slightly elevated from main bg)
- Border: 1px solid subtle dark border
- Padding: p-8
- Bronze accent icon at top
- Hover: subtle border glow

**Project Cards**:
- 16:9 image top, rounded corners
- Content: p-6
- Metadata badges in bronze accent
- Hover: shadow elevation

### Forms
**Lead Capture**:
- Field spacing: space-y-6
- Labels: text-sm font-medium mb-2, cream text
- Inputs: h-14, px-4, rounded-md, dark input bg, bronze border on focus
- Textarea: min-h-32
- Submit: Full-width, bronze primary button
- Container: max-w-2xl, Card background

### Footer
- 4-column desktop layout (stacked mobile)
- Sections: Links, Services, Contact, Legal
- Dark background matching main theme
- Small serif headings for column titles
- Tagline: "Where Designed Profits Are Crafted."
- Copyright + disclosures
- Padding: py-16

---

## Page Sections (Single-Page Layout)

### 1. HERO SECTION
- Full viewport (min-h-screen)
- H1: "Where Designed Profits Are Crafted, and Communities Are Elevated."
- Subheadline below
- Primary CTAs: "Sell a Property" & "Invest With Pegasus"
- Small tagline near logo: "Where Designed Profits Are Crafted."

### 2. SERVICES OVERVIEW
Four service cards in grid:
1. **Fix & Flip Acquisitions**: Transform distressed homes into high-performing assets through intentional design and calculated renovation.
2. **Buy & Hold / Rental Investments**: Value-add rental strategies designed for long-term stability, equity growth, and predictable performance.
3. **Design & Renovation Management**: Interior design, finish selection, layout optimization, and project oversight that raise ARV and rent potential.
4. **New Construction** (Coming Soon): Ground-up builds crafted through purposeful design, modern planning, and community-focused development.

### 3. FEATURED PROJECT / CASE STUDY
- Showcase a sample flip
- Property details: Type, Location, Strategy
- Description: cosmetic renovation, value-add, community uplift
- Before/after visual if available

### 4. SELL A PROPERTY SECTION
- Short explanation: As-is offers, flexible solutions, transparent numbers
- Lead form fields: Name, Email, Phone, Property Address, Condition dropdown, Timeline to sell

### 5. INVEST WITH PEGASUS SECTION
- Explanation: Designed profits, disciplined execution, transparent underwriting
- Lead form fields: Name, Email, Phone, Capital range, Investment preference

### 6. DREAMSCAPER CREED SECTION
- Visually powerful layout with the creed
- Bronze accent styling
- Explanation of Dreamscapers identity

### 7. CONTACT SECTION
- Simple form: Name, Email, Phone, Message
- Business contact info placeholders

### 8. FOOTER
- Pegasus Dreamscapes logo
- Tagline: "Where Designed Profits Are Crafted."
- Quick links: Home, Sell, Invest, Contact
- Mission text: "We design profits with intention and elevate communities through real estate."

---

## Interactions

**Smooth Scroll**: Enabled globally for anchor links
**Minimal Animations**:
- Staggered fade-in on card grids
- Button hover: subtle scale (1.02)
- Card hover: border glow or shadow elevation
- Form focus: bronze border transition
- NO complex parallax or distracting motion

---

## Accessibility
- Clear labels on all form inputs
- Visible focus indicators (bronze ring)
- Cream/dark contrast ratio ≥4.5:1
- Alt text for all images
- Semantic heading hierarchy maintained

---

**Design Philosophy**: Dark cinematic sophistication that commands attention and builds trust. Every element reflects the Pegasus Dreamscapes mission: designed profits through disciplined execution and community elevation.
