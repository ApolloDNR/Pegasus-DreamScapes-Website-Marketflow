# Pegasus Dreamscapes Corp - Design Guidelines

## Design Approach: Reference-Based (Real Estate + Modern SaaS Hybrid)

Drawing inspiration from **Compass Real Estate** (trust/professionalism) + **Webflow** (dark theme execution) + **Linear** (clean typography and spacing), creating a sophisticated real estate investment platform that balances credibility with modern design execution.

---

## Core Design Principles

1. **Dual-Funnel Clarity**: Every page must clearly direct users toward "Sell" or "Invest" pathways
2. **Data-Driven Trust**: Showcase numbers, metrics, and transparency throughout
3. **Professional Sophistication**: Dark theme executed with restraint, not drama
4. **Form-First Design**: Lead capture is primary—forms must feel premium, not generic

---

## Typography System

**Primary Font**: Inter (via Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- Small text/labels: 500 weight

**Hierarchy**:
- Hero H1: text-5xl to text-7xl, font-bold, leading-tight
- Section H2: text-4xl to text-5xl, font-semibold
- Card/Component H3: text-2xl to text-3xl, font-semibold
- Body text: text-base to text-lg, leading-relaxed
- Small text: text-sm, tracking-wide for labels/metadata

---

## Layout & Spacing System

**Tailwind Spacing Units**: Standardize on **4, 8, 12, 16, 20, 24** (p-4, py-8, gap-12, etc.)

**Section Padding**:
- Desktop: py-20 to py-32
- Mobile: py-12 to py-16

**Container Widths**:
- Full-width sections: w-full with inner max-w-7xl mx-auto px-6
- Content sections: max-w-6xl mx-auto
- Form containers: max-w-2xl mx-auto
- Text content: max-w-3xl mx-auto

**Grid Patterns**:
- 3-column cards (What We Do, Values, etc.): grid-cols-1 md:grid-cols-3 gap-8
- 2-column splits (Sell/Invest paths): grid-cols-1 lg:grid-cols-2 gap-12
- Project cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8

---

## Component Library

### Navigation Header
- Sticky top navigation, backdrop-blur effect on scroll
- Logo left (icon + text)
- Center links: horizontal list with hover underline effect
- Right side: "Sell a Property" CTA button (bronze accent)
- Mobile: Hamburger menu, full-screen overlay navigation

### Buttons
**Primary CTA** (bronze/blood-orange):
- Substantial padding: px-8 py-4
- Bold text: font-semibold text-base
- Rounded: rounded-lg
- Blurred background when on images: backdrop-blur-md bg-opacity-90

**Secondary/Outline**:
- Border style with hover fill transition
- Same sizing as primary

### Cards
**Feature/Service Cards**:
- Light border on dark background (subtle)
- Generous padding: p-8
- Icon at top (48x48px minimum)
- Title + description + optional link
- Hover: subtle lift effect (transform translate)

**Project Cards**:
- Image thumbnail top (16:9 aspect ratio)
- Content padding: p-6
- Metadata row (location, type) in smaller text
- Metrics badges: small rounded pills showing key numbers

### Forms
**Lead Capture Forms**:
- Generous spacing between fields: space-y-6
- Label above input: text-sm font-medium mb-2
- Input fields: 
  - Full-width inputs
  - Substantial height: h-12 to h-14
  - Padding: px-4
  - Border with focus state (bronze accent)
  - Rounded: rounded-lg
- Textarea: min h-32
- Submit button: full-width on mobile, auto-width on desktop, positioned right
- Form sections: max-w-2xl with clear visual grouping

### Footer
- Multi-column layout (4 columns on desktop, stacked mobile)
- Columns: Quick Links, Services, Contact, Company Info
- Subtle separator line at top
- Copyright and disclosure at bottom
- Minimal padding: py-12

---

## Page-Specific Layouts

### Home Page
1. **Hero**: Full-viewport height (min-h-screen), center-aligned content, large background image with dark overlay, headline + subheadline + dual CTAs side-by-side
2. **Trust Bar**: Single row, 4 stat cards, minimal design
3. **What We Do**: 3-column card grid, icons + titles + descriptions
4. **Featured Project**: 2-column split (image left, content right on desktop), metrics row
5. **Dual Path Section**: 2-column cards with clear visual separation, prominent CTAs
6. **Why Pegasus**: Bullet list with check icons, max-w-3xl centered
7. **Contact Teaser**: Centered text + CTA

### Sell/Invest Pages
- Hero: 60-70vh, clear headline, single CTA
- "How It Works": 3-step timeline/process visualization, horizontal on desktop
- Benefits: Icon list or card grid
- **Form Section**: Dedicated, visually separated, generous whitespace around form, form itself max-w-2xl
- FAQ: Accordion pattern, max-w-3xl

### Projects Page
- Grid layout of project cards
- Filter/category options at top (if multiple projects)
- Each card links to detail view
- Detail pages: Large image carousel, metrics dashboard, timeline, before/after section

### About Page
- Story section: Single column, max-w-3xl, generous line-height
- Mission/Values: Card grid or icon list
- Approach: 3-step visual diagram
- Team: Photo grid with name + role overlays

---

## Images

**Hero Images Required**:
- **Home Page**: Wide-angle modern property exterior or interior design shot, dark overlay (40-50% opacity) for text legibility
- **Sell Page**: Residential property exterior, warm/inviting
- **Invest Page**: Modern building/cityscape, professional tone
- **Projects Page**: Featured project image
- **About Page**: Team photo or workspace/site visit photo

**Project Images**:
- Before/After comparison shots for Nelson Dr project
- Interior design showcase images
- 16:9 aspect ratio for consistency

**Design Studio Page**:
- Interior styling examples (4-6 images in gallery grid)
- Mood board style presentation

**Image Treatment**:
- Subtle rounded corners: rounded-lg to rounded-xl
- All hero images: dark overlay for text contrast
- Project thumbnails: hover scale effect (subtle)

---

## Animations & Interactions

**Minimal Animation Strategy**:
- Smooth scroll behavior
- Fade-in on scroll for cards (subtle, delay stagger)
- Hover states: subtle scale/lift on cards and buttons
- Form focus states: border color transition
- **No**: Complex parallax, excessive motion, distracting hero animations

---

## Accessibility & Quality Standards

- All forms: Clear labels, proper input types, error states
- Focus indicators: Visible keyboard navigation
- Color contrast: Ensure text legibility on dark backgrounds
- Alt text: All images properly described
- Semantic HTML: Proper heading hierarchy

---

**Design Philosophy**: Professional credibility with modern execution. Every element should reinforce trust while maintaining visual sophistication. Forms are conversion points—treat them as premium experiences.