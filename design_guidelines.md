# Pegasus Dreamscapes - Design Guidelines (Warm Beige Edition)

## Design Approach: Reference-Based (Luxury Real Estate)
Drawing inspiration from **Sotheby's International Realty** (timeless luxury) + **Ritz-Carlton** (refined elegance) + **Stripe** (clean execution), creating a sophisticated platform that exudes premium credibility.

**Color Palette matches brand logo**: Warm beige background (#E8E0D5 / HSL 40, 25%, 91%) with navy primary (#243654 / HSL 210, 50%, 25%) and terracotta/copper accent (#CC6B3A / HSL 25, 65%, 50%).

---

## Core Design Principles
1. **Dual-Funnel Clarity**: Clear "Sell" and "Invest" pathways throughout
2. **Elevated Trust**: Showcase metrics and transparency with premium presentation
3. **Timeless Luxury**: Light, warm aesthetic with sophisticated restraint
4. **Premium Form Experience**: Lead capture forms as luxury touchpoints

---

## Typography System

**Headline Font**: Playfair Display (Google Fonts)
- Weights: 500-700
- Usage: All H1, H2, H3 elements

**Body Font**: Inter (Google Fonts)
- Weights: 400-500
- Usage: Body text, labels, navigation

**Hierarchy**:
- Hero H1: text-6xl to text-7xl, font-bold (Playfair), leading-tight
- Section H2: text-4xl to text-5xl, font-semibold (Playfair)
- Card H3: text-2xl to text-3xl, font-medium (Playfair)
- Body text: text-base to text-lg, leading-relaxed (Inter)
- Labels: text-sm, font-medium, tracking-wide (Inter)

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
- 3-column features: grid-cols-1 md:grid-cols-3 gap-8
- 2-column splits: grid-cols-1 lg:grid-cols-2 gap-16
- Project cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12

---

## Component Library

### Navigation
- Sticky header with subtle shadow on scroll
- Logo left (refined mark + serif logotype)
- Center: horizontal navigation links with underline-on-hover
- Right: Navy CTA button + contact number
- Mobile: Elegant drawer menu

### Buttons
**Primary (Navy)**:
- Padding: px-8 py-4
- Text: font-semibold text-base (Inter)
- Rounded: rounded-md
- On images: backdrop-blur-md with navy bg-opacity-95

**Secondary (Brass outline)**:
- Border with subtle brass tint
- Hover: fill transition

### Cards
**Feature Cards**:
- Light background with subtle shadow (shadow-md)
- Border: 1px solid warm neutral
- Padding: p-8
- Brass accent icon at top
- Hover: shadow-lg transition

**Project Cards**:
- 16:9 image top, subtle rounded corners (rounded-lg)
- Content: p-6
- Metadata in small caps
- Brass accent metrics badges

### Forms
**Lead Capture**:
- Field spacing: space-y-6
- Labels: text-sm font-medium mb-2, navy tint
- Inputs: h-14, px-4, rounded-md, light background, navy border on focus
- Textarea: min-h-32
- Submit: Full-width mobile, right-aligned desktop
- Container: max-w-2xl, generous surrounding whitespace

### Footer
- 4-column desktop layout (stacked mobile)
- Sections: Links, Services, Contact, Legal
- Subtle top border (warm neutral)
- Small serif headings for column titles
- Copyright + disclosures
- Padding: py-16

---

## Page Structures

### Home Page
1. **Hero**: Full viewport (min-h-screen), luxury property image with 20% cream overlay, center-aligned headline + dual CTAs, subtle parallax
2. **Trust Metrics**: 4-stat row, minimal cards with serif numbers
3. **What We Do**: 3-column feature cards, brass icons
4. **Featured Project**: 2-column asymmetric split (60/40), large image left, content + metrics right
5. **Dual Pathways**: 2 premium cards, distinct visual treatment, prominent navy CTAs
6. **Why Pegasus**: Icon checklist, centered max-w-3xl, brass check marks
7. **Contact CTA**: Centered section with phone + email + form CTA

### Sell/Invest Pages
- Hero: 70vh, luxury property image, serif headline, single navy CTA
- Process: 3-step horizontal timeline with brass connector lines
- Benefits: 2-column grid with icons
- **Premium Form Section**: Isolated, cream background card, generous padding, max-w-2xl form
- FAQ: Accordion, max-w-3xl, serif questions

### Projects Page
- Grid of project cards with hover effects
- Category filters at top (pill-style buttons)
- Detail pages: Image gallery carousel, metrics dashboard, timeline visualization, transformation showcase

### About Page
- Story: Single column, max-w-3xl, generous line-height, drop cap first letter
- Values: 3-column icon cards
- Approach: Numbered steps with visual dividers
- Team: Grid with elegant photo frames, names in serif

---

## Images

**Required Hero Images**:
- **Home**: Modern luxury property exterior, golden hour lighting, wide angle
- **Sell**: Inviting residential property with warm natural light
- **Invest**: Upscale urban development or modern architectural design
- **Projects**: Featured transformation showcase
- **About**: Professional team in elegant setting

**Project Images**:
- Before/after split-screen comparisons
- Interior luxury design shots
- Consistent 16:9 aspect ratio
- Subtle rounded corners (rounded-lg)

**Image Treatment**:
- Light cream overlay (10-20% opacity) on heroes for text contrast
- Hover: subtle brightness increase on thumbnails
- All images: shadow-sm to shadow-md

---

## Interactions

**Minimal Animations**:
- Smooth scroll
- Staggered fade-in on card grids
- Button hover: subtle scale (1.02)
- Card hover: shadow elevation
- Form focus: border color smooth transition
- NO complex parallax or distracting motion

---

## Accessibility
- Clear labels on all form inputs
- Visible focus indicators (navy ring)
- Navy/cream contrast ratio ≥4.5:1
- Alt text for all images
- Semantic heading hierarchy maintained

---

**Design Philosophy**: Timeless luxury through restraint. Every element radiates premium quality while maintaining approachability. Forms are investment moments—design them as such.