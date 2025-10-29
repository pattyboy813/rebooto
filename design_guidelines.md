# TryRebooto Design Guidelines

## Design Approach
**Reference-Based Approach** drawing inspiration from modern EdTech and SaaS leaders:
- **Linear**: Clean typography, smooth animations, tech-forward aesthetic
- **Stripe**: Professional trust-building, restrained elegance
- **Duolingo**: Approachable learning experience, gamification elements

## Core Design Principles
1. **Tech-Forward Credibility**: Dark aesthetic with purposeful gradients creates modern, professional atmosphere
2. **Progressive Disclosure**: Reveal value proposition through strategic scrolling with smooth GSAP animations
3. **Conversion-Focused**: Every section guides toward email signup with clear CTAs

## Typography System
**Font Stack**:
- Primary: Inter (via Google Fonts) - all UI elements, body text
- Display: Space Grotesk (via Google Fonts) - hero headlines, section titles

**Hierarchy**:
- Hero Headline: text-5xl md:text-7xl, font-bold, tracking-tight
- Section Headers: text-3xl md:text-5xl, font-bold
- Subheadings: text-xl md:text-2xl, font-semibold
- Body Text: text-base md:text-lg, leading-relaxed
- Small Text (countdown labels): text-sm, uppercase, tracking-wider

## Layout System
**Spacing Primitives**: Consistently use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for harmonious rhythm

**Container Strategy**:
- Full-width sections with inner `max-w-6xl mx-auto px-6`
- Hero: `min-h-screen` with centered content
- Content sections: `py-20 md:py-32` for generous breathing room
- Mobile: `py-12 md:py-20` responsive scaling

**Grid Patterns**:
- Feature showcase: `grid-cols-1 md:grid-cols-3 gap-8`
- How it works: `grid-cols-1 md:grid-cols-2 gap-12` alternating image/text
- Single column for hero, signup sections (max-w-3xl centered)

## Page Structure & Sections

### 1. Hero Section
**Layout**: Full viewport height, centered content with subtle gradient background overlay
**Components**:
- Logo/Brand lockup at top
- Main headline emphasizing "Learn IT Support Through Real Scenarios"
- Subheading explaining the interactive learning approach
- **Countdown Timer**: Four-column grid displaying Days/Hours/Minutes/Seconds with large numbers (text-4xl) and labels
- Primary CTA: "Get Early Access" button (large, gradient background)
- Scroll indicator with animated arrow

### 2. Value Proposition Section
**Layout**: Two-column grid (text + visual representation)
**Content**:
- Headline: "Why TryRebooto?"
- Three key benefits with icon + description cards
- Supporting visual showing interactive scenario preview
- Secondary CTA

### 3. How It Works Section
**Layout**: Staggered three-step process
**Components**:
- Step 1: "Choose Your Challenge" - card with sample scenario
- Step 2: "Solve Real Problems" - interactive decision tree preview
- Step 3: "Track Your Progress" - XP/achievement system mockup
- Use numbered badges (1, 2, 3) with connecting lines on desktop

### 4. What You'll Learn Section
**Layout**: Three-column grid of skill categories
**Components**:
- Category cards: Hardware Troubleshooting, Network Diagnostics, Software Issues
- Each card shows sample topics with check icons
- Gradient border treatment on hover

### 5. Email Signup Section
**Layout**: Centered, prominent call-to-action
**Components**:
- Compelling headline: "Be First to Learn"
- Email input with inline submit button (single row on desktop)
- Privacy reassurance text below
- Social proof: "Join 500+ early supporters" counter
- Gradient background treatment matching hero

### 6. Footer
**Layout**: Two-column grid (brand + links)
**Content**:
- Logo + tagline
- Social media icons (Twitter, LinkedIn, GitHub)
- Links: About, Contact, Privacy
- Copyright notice

## Component Library

### Buttons
**Primary CTA**:
- Blue-to-green gradient background matching brand
- `px-8 py-4 rounded-xl text-lg font-semibold`
- White text with subtle shadow
- Smooth scale transform on hover
- When over images: backdrop-blur-md bg-white/10 border border-white/20

**Secondary CTA**:
- Transparent with border: `border-2 border-blue-400/30`
- Hover: filled with subtle gradient

### Cards
**Feature Cards**:
- Dark background with subtle gradient border
- `rounded-2xl p-8 backdrop-blur-sm bg-white/5`
- Icon at top (use Heroicons CDN)
- Title + description layout
- Hover: lift with shadow, subtle glow effect

**Step Cards**:
- Similar to feature cards with numbered badge
- Left-aligned for better readability
- Connecting lines between steps (desktop only)

### Form Elements
**Email Input**:
- Dark background: `bg-white/5 border border-white/10`
- `rounded-xl px-6 py-4 text-lg`
- Placeholder: "your.email@example.com"
- Focus state: border glow effect
- Inline with submit button on desktop, stacked on mobile

### Countdown Timer
**Structure**: Four-box grid layout
**Each Box**:
- Large number display: `text-4xl md:text-6xl font-bold`
- Label below: `text-sm uppercase tracking-widest opacity-60`
- Subtle border and background
- Update animation on number change

## Animations (GSAP)
**Hero Entrance**:
- Fade in headline with upward slide (0.8s ease)
- Countdown timer animates in (stagger 0.1s per box)
- CTA button scales in (0.6s bounce)

**Scroll Animations**:
- Section headers: fade + slide up on scroll into view
- Cards: stagger entrance (0.15s between cards)
- Step connecting lines: draw animation on reveal

**Micro-interactions**:
- Button hover: scale(1.05) smooth
- Card hover: translateY(-4px) with shadow increase
- Input focus: subtle border pulse

**Performance**: Keep animations under 1s, use transform/opacity only

## Images

### Hero Background
**Description**: Abstract tech pattern or circuit board visualization with blue/green gradient overlay
**Placement**: Full-screen background, fixed position, subtle parallax scroll
**Treatment**: 40% opacity, blur overlay for text readability

### How It Works Visuals
**Description**: Clean mockup screenshots of interactive scenarios, showing decision trees and feedback
**Placement**: Alternating right/left with text in How It Works section
**Treatment**: Rounded corners (rounded-2xl), subtle drop shadow, slight tilt on desktop

### Skill Category Icons
**Description**: Modern line icons representing hardware, network, software
**Placement**: Top of each skill category card
**Treatment**: 64x64px, gradient stroke, animated on hover

## Responsive Behavior
**Breakpoints**:
- Mobile: Single column, stack all grids
- Tablet (md:): Two-column grids, larger typography
- Desktop (lg:): Three-column grids, full multi-column layouts

**Mobile Priorities**:
- Countdown timer: 2x2 grid instead of 1x4
- Email signup: Stack input and button vertically
- Navigation: Hamburger menu if needed
- Reduce animation complexity

## Accessibility
- All interactive elements: min-height 44px touch targets
- Form labels: visible or sr-only with aria-labels
- Color contrast: ensure 4.5:1 minimum on all text
- Focus indicators: prominent outline on all interactive elements
- Countdown: aria-live region for screen readers

## Brand Consistency
- Maintain dark theme throughout (no jarring light sections)
- Blue-to-green gradient: consistent accent across CTAs, borders, highlights
- Generous whitespace: never cramped, always breathing room
- Professional yet approachable: balance credibility with warmth