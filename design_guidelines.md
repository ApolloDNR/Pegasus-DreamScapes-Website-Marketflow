# Pegasus Dreamscapes - Design Guidelines (Light Luxury Edition)

## Design Approach: Premium Light Theme
Drawing inspiration from luxury real estate brands with a **clean, editorial aesthetic**. The design conveys **designed profits, disciplined execution, and community elevation** through sophisticated, professional visual treatment.

**Color Palette**: Light cream/white backgrounds (#FDFCFB / HSL 40, 20%, 98%) with bronze/blood-orange accents (#D4702C / HSL 25, 75%, 50%) and dark navy text (#1E2430 / HSL 220, 20%, 15%).

---

## Brand Identity

**Company Name**: Pegasus Dreamscapes

**Official Slogan** (for logo + brand): "Where Designed Profits Are Crafted."

**Homepage Hero Line**: "DESIGNED PROFITS ELEVATED COMMUNITIES"

**Subheadline**: "At Pegasus Dreamscapes, we specialize in turning distressed properties into stunning homes that empower communities and elevate living standards."

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
2. **Light Editorial Theme**: Clean white/cream backgrounds with bronze accents
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
- Hero H1: text-5xl to text-8xl, font-bold (Playfair), uppercase, leading-tight
- Section H2: text-3xl to text-6xl, font-bold (Playfair), uppercase
- Card H3: text-xl to text-3xl, font-semibold (Playfair)
- Body text: text-base to text-lg, leading-relaxed (Inter)
- Labels: text-sm, font-medium, tracking-wide (Inter)

---

## Color System

**Primary (Bronze/Blood-Orange)**: HSL 25, 75%, 50%
- Used for: CTAs, accents, highlights, icons
- High contrast against light backgrounds

**Secondary (Tan/Beige)**: HSL 38, 35%, 75%
- Used for: Section backgrounds, subtle accents, editorial highlights

**Background Hierarchy**:
- Main: HSL 40, 20%, 98% (warm cream/white)
- Card: HSL 0, 0%, 100% (pure white)
- Border: HSL 38, 25%, 85% (tan-tinted borders)
- Section Alternate: bg-tan/10 (subtle tan wash)

**Text Colors**:
- Foreground: HSL 220, 20%, 15% (dark navy)
- Muted: HSL 220, 12%, 45% (secondary text)

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
- Sticky header with light cream background
- Logo left (company logo image)
- Center/right: horizontal navigation links (dark text)
- Primary CTA button (bronze)
- Mobile: Slide-out menu
- Smooth scroll links to page sections

### Buttons
**Primary (Bronze)**:
- bg-primary (bronze/blood-orange)
- Padding: px-8 py-4
- Text: font-semibold text-base (Inter), white foreground
- Rounded: rounded-md
- Strong contrast against light backgrounds

**Secondary (Outline)**:
- Border with subtle dark tint
- Hover: fill transition

### Cards
**Service Cards**:
- White card background
- Border: 1px solid tan-tinted border
- Padding: p-8
- Bronze accent icon at top
- Hover: subtle shadow elevation (luxury-card class)

**Project Cards**:
- 16:9 image top, rounded corners
- Content: p-6
- Metadata badges in bronze accent
- Hover: shadow elevation

### Forms
**Lead Capture**:
- Field spacing: space-y-6
- Labels: text-sm font-medium mb-2, dark text
- Inputs: h-14, px-4, rounded-md, light input bg, bronze border on focus
- Textarea: min-h-32
- Submit: Full-width, bronze primary button
- Container: max-w-2xl, Card background

### Footer
- 4-column desktop layout (stacked mobile)
- Sections: Links, Services, Contact, Legal
- Light background matching main theme
- Small serif headings for column titles
- Tagline: "Where Designed Profits Are Crafted."
- Copyright + disclosures
- Padding: py-16

---

## Page Sections (Single-Page Layout)

### 1. HERO SECTION
- Full viewport (min-h-screen)
- Full-bleed background image with dark overlay
- H1: "DESIGNED PROFITS ELEVATED COMMUNITIES" (white text on dark image)
- Subheadline below
- Primary CTAs: "Sell a Property" (tan button) & "Invest With Pegasus" (outline)
- Tan accent bar at bottom

### 2. STATS SECTION
- Animated counter statistics
- Properties Transformed, Investment Volume, Client Satisfaction, Average Close Time
- Light background with grid layout

### 3. SERVICES SECTION
- Section heading "SERVICES" in dark serif
- Two-column editorial service cards (image left, content right)
- Additional services grid with 4 icon cards
- Light background with subtle tan wash (bg-tan/10)

### 4. TESTIMONIALS SECTION
- 3-column grid of client testimonials
- 5-star ratings in tan/bronze
- Client quotes with names and roles
- Trust badges (licensing, BBB, track record)

### 5. SELL A PROPERTY SECTION
- Short explanation: As-is offers, flexible solutions, transparent numbers
- Lead form fields: Name, Email, Phone, Property Address, Condition dropdown, Timeline to sell

### 6. INVEST WITH PEGASUS SECTION
- Explanation: Designed profits, disciplined execution, transparent underwriting
- Lead form fields: Name, Email, Phone, Capital range, Investment preference

### 7. DREAMSCAPER CREED SECTION
- Visually powerful layout with the creed
- Bronze accent styling
- Explanation of Dreamscapers identity

### 8. CONTACT SECTION
- Simple form: Name, Email, Phone, Message
- Business contact info placeholders

### 9. FOOTER
- Pegasus Dreamscapes logo
- Tagline: "Where Designed Profits Are Crafted."
- Quick links: Home, Sell, Invest, Contact
- Mission text

---

## Interactions

**Smooth Scroll**: Enabled globally for anchor links

**Premium Animations**:
- Fade-in-up on hero text with staggered delays
- Luxury card hover with subtle lift and shadow
- Button glow effects on primary CTAs
- Animated stat counters
- Form focus: bronze border transition

**Glassmorphism** (used on hero overlay buttons):
- backdrop-filter: blur(10px)
- Semi-transparent backgrounds

---

## Accessibility
- Clear labels on all form inputs
- Visible focus indicators (bronze ring)
- Light/dark contrast ratio ≥4.5:1
- Alt text for all images
- Semantic heading hierarchy maintained

---

**Design Philosophy**: Light, editorial sophistication that builds trust and conveys professionalism. Every element reflects the Pegasus Dreamscapes mission: designed profits through disciplined execution and community elevation.
