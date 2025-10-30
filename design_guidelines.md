# Rebooto Landing Page Design Guidelines

## Design Philosophy
**Approach**: Reference-based (Stripe + Linear + Notion marketing)
**Aesthetic**: Clean, contemporary SaaS with energetic accents
**Core Principle**: Professional minimalism with purposeful vibrancy

---

## Typography System
**Fonts**: 
- Headlines: **Sora** (CDN: Google Fonts) - geometric, modern
- Body: **Inter** (CDN: Google Fonts) - clarity, readability

**Hierarchy**:
- Hero headline: `text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]`
- Section headlines: `text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight`
- Subheadings: `text-xl md:text-2xl lg:text-3xl font-semibold`
- Body large: `text-lg md:text-xl leading-relaxed`
- Body default: `text-base md:text-lg leading-relaxed`
- Small text: `text-sm md:text-base`
- Labels: `text-xs md:text-sm uppercase tracking-wider font-semibold`

---

## Color Palette
**Primary Gradient**: Teal to Emerald (`#0D9488 → #10B981`)
**Accent**: Coral (`#FF6B6B`)
**Backgrounds**: 
- Base: `#FFFFFF`
- Surface: `#F9FAFB`
- Elevated: `#F3F4F6`
**Text**:
- Primary: `#111827`
- Secondary: `#6B7280`
- Muted: `#9CA3AF`
**Borders**: `#E5E7EB` (default), `#D1D5DB` (subtle)

---

## Spacing System
**Tailwind Units**: 4, 6, 8, 12, 16, 24, 32
**Section Padding**: `py-16 md:py-24 lg:py-32`
**Container**: `max-w-7xl mx-auto px-6 md:px-8 lg:px-12`
**Content Max-Width**: `max-w-4xl` (text blocks)
**Component Gaps**: `gap-6 md:gap-8 lg:gap-12`

---

## Layout & Structure

### Navigation
**Position**: `sticky top-0 z-50`
**Style**: Clean bar with subtle shadow on scroll
**Container**: `backdrop-blur-md bg-white/90 border-b border-gray-200/80`
**Content**: Logo (left) + nav links (center) + "Get Early Access" button (right)
**Height**: `h-16 md:h-20`
**Links**: `text-sm md:text-base font-medium text-gray-700 hover:text-teal-600 transition-colors`
**CTA Button**: Teal gradient, `px-6 py-2.5 rounded-full`

### Hero Section
**Layout**: Full viewport (90-100vh)
**Background**: Large hero image - modern workspace with IT professionals collaborating, bright natural lighting, clean tech aesthetic
**Image Treatment**: Subtle gradient overlay (teal to transparent, opacity 10%)
**Content Structure**: 
- Headline: Left-aligned or centered, max-width 800px
- Subheading: Below headline, max-width 600px
- Email capture form: Inline (input + button), max-width 500px
- Trust indicator: "Join 1,200+ IT professionals preparing for 2025"
**Buttons on Image**: `backdrop-blur-md bg-white/20 border border-white/30 text-white`

### Email Capture Form (Hero)
**Container**: `flex items-center gap-4 bg-white rounded-full p-2 shadow-lg max-w-lg`
**Input**: `flex-1 px-6 py-4 bg-transparent border-none focus:outline-none text-base`
**Button**: `px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold whitespace-nowrap`

### Value Proposition Section
**Layout**: 3-column grid on desktop, stack on mobile
**Cards**: White background, `rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all`
**Icons**: Heroicons (CDN), 48px, teal gradient fill
**Content**: Icon + headline + description
**Spacing**: `grid-cols-1 md:grid-cols-3 gap-8`

### Features Section (Alternating Layout)
**Structure**: 2-column alternating (image left/right)
**Images**: UI mockups showing platform features - dashboard screenshots, scenario interfaces, progress tracking
**Image Treatment**: `rounded-2xl shadow-2xl border border-gray-200`
**Text Side**: Headline + description + feature list with checkmarks
**Feature List**: Teal checkmark icons + `text-base md:text-lg`
**Spacing**: `gap-12 md:gap-16 lg:gap-24` between rows

### Stats/Social Proof Section
**Layout**: 4-column grid, centered
**Background**: Subtle teal gradient (5% opacity)
**Stats**: Large number (teal gradient text) + label below
**Numbers**: `text-4xl md:text-5xl lg:text-6xl font-bold`
**Labels**: `text-sm md:text-base text-gray-600`
**Metrics**: "1,200+ Learners", "500+ Scenarios", "95% Completion", "24/7 Access"

### Skills/Categories Section
**Layout**: 4-column grid on desktop, 2-column tablet, stack mobile
**Cards**: Minimal design - white background, `rounded-xl border border-gray-200 p-6 text-center hover:border-teal-500 transition-all`
**Icons**: Large 3D-style icons (hardware, networking, software, security) - 80x80px
**Content**: Icon + category name + scenario count
**Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

### Testimonials Section
**Layout**: 3-column grid
**Cards**: White background, `rounded-xl border border-gray-200 p-8`
**Content**: Quote + avatar + name + role
**Avatar**: 56px circular image, left of name/role
**Quote**: `text-base md:text-lg leading-relaxed text-gray-700`

### Final CTA Section
**Background**: Teal to emerald gradient
**Content**: Centered, white text
**Layout**: Headline + subheading + email form (on gradient background)
**Email Form (on gradient)**: `bg-white rounded-full p-2 shadow-xl max-w-lg mx-auto`
**Input**: Same as hero form
**Button**: `bg-gray-900 text-white` (inverted for contrast on white form)

### Footer
**Background**: `bg-gray-50 border-t border-gray-200`
**Layout**: 4-column grid + bottom bar
**Columns**: Product, Resources, Company, Connect
**Links**: `text-sm text-gray-600 hover:text-teal-600`
**Bottom Bar**: Logo + copyright + social icons
**Social Icons**: Heroicons, 20px, gray with teal hover

---

## Component Library

### Buttons
**Primary**: `bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all`
**Secondary**: `border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-gray-400 transition-all`
**On Images**: `backdrop-blur-md bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full font-semibold`

### Cards
**Feature Card**: `bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all`
**Stat Card**: `bg-white rounded-xl border border-gray-200 p-6 text-center`
**Testimonial Card**: `bg-white rounded-xl border border-gray-200 p-8`

### Icons
**Library**: Heroicons (CDN)
**Sizes**: 20px (inline), 24px (buttons), 48px (features), 80px (categories)
**Color**: Teal gradient for primary icons, gray for secondary

---

## Animations (Minimal)
**Framer Motion**:
- Page load: Fade-up on hero content (stagger 100ms)
- Scroll reveals: Fade-up on sections (threshold 0.2)
- Card hover: Subtle lift (`translateY(-4px)`) + shadow increase

**CSS Transitions**:
- Button hover: `transition-all duration-300`
- Card hover: `transition-all duration-300`
- Link color: `transition-colors duration-200`

**No**: Parallax, complex 3D transforms, scroll-triggered animations beyond fade-up

---

## Images
**Hero Image**: Full-width, high-quality photo - modern IT workspace, professionals collaborating, bright natural light, clean aesthetic (1920x1080 minimum)
**Feature Images**: UI mockups - platform dashboard, scenario interface, progress tracking (1200x800)
**Category Icons**: 3D-style illustrations - hardware (server), networking (router), software (code), security (shield) - 80x80px
**Testimonial Avatars**: Professional headshots, circular crop - 56x56px

**Treatment**: All images use `rounded-2xl` for mockups, `rounded-xl` for cards, circular for avatars

---

## Accessibility
**Focus Rings**: `ring-2 ring-teal-500 ring-offset-2`
**Touch Targets**: Minimum 44px height
**Contrast**: 4.5:1 minimum (text on backgrounds)
**Alt Text**: Descriptive for all images
**Keyboard Navigation**: Full support, logical tab order
**Reduced Motion**: Disable animations via `prefers-reduced-motion`