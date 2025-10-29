# TryRebooto Design Guidelines

## Design Approach
**Reference-Based Approach** drawing from premium EdTech and modern SaaS:
- **Linear**: Clean typography, smooth interactions, refined spacing
- **Stripe**: Professional elegance, strategic use of whitespace
- **Apple**: Premium minimalism with delightful details
- **Spline**: Playful 3D integration, interactive depth

## Core Design Principles
1. **Premium Minimalism**: Clean white canvas with subtle depth through glassmorphism and 3D elements
2. **Playful Professionalism**: Balance credibility with bouncy animations and interactive 3D shapes
3. **Delightful Interactions**: Cursor-aware elements, tilt effects, and smooth micro-interactions
4. **Progressive Engagement**: Strategic scrolling reveals interactive 3D geometric shapes and content

## Typography System
**Font Stack**: Plus Jakarta Sans (primary choice) or Inter via Google Fonts

**Hierarchy**:
- Hero Headline: text-6xl md:text-8xl, font-bold, tracking-tight
- Section Headers: text-4xl md:text-6xl, font-bold
- Subheadings: text-xl md:text-3xl, font-semibold
- Body Text: text-base md:text-lg, leading-relaxed
- Small Text: text-sm, tracking-wide

## Color Palette
**Base Colors**:
- Background: White (#FFFFFF) with subtle gray gradients
- Surface: Light gray (#F8F9FA to #F1F3F5)
- Text: Dark gray (#1A1A1A) for primary, (#6B7280) for secondary

**Accent Gradients**:
- Primary: Soft blue to purple (from #667EEA to #A78BFA)
- Hover states: Subtle intensity shifts
- Glassmorphic overlays: White with 10-20% opacity + backdrop blur

## Layout System
**Spacing Primitives**: Tailwind units of 4, 8, 12, 16, 20, 24, 32

**Container Strategy**:
- Full-width sections with `max-w-7xl mx-auto px-6 md:px-12`
- Hero: `min-h-screen` with centered content
- Content sections: `py-24 md:py-32`
- Mobile: `py-16 md:py-24`

**Grid Patterns**:
- Features: `grid-cols-1 md:grid-cols-3 gap-8 md:gap-12`
- How It Works: `grid-cols-1 lg:grid-cols-2 gap-16` with 3D visuals
- Hero/CTA sections: Centered single column, `max-w-4xl`

## Navigation
**Floating Glassmorphic Header**:
- Fixed position, top: 24px
- Glassmorphic treatment: `backdrop-blur-xl bg-white/70 border border-gray-200/50`
- Rounded full corners: `rounded-full`
- Inner padding: `px-8 py-4`
- Contains: Logo, navigation links, "Get Access" CTA button
- Subtle drop shadow for depth
- Smooth hide/show on scroll direction change

## Page Structure & Sections

### 1. Hero Section
**Layout**: Full viewport with large hero image background
**Components**:
- Large hero image: Abstract 3D geometric shapes (spheres, cubes, toruses) floating in light space with soft blue/purple gradient overlay
- Floating glassmorphic navigation at top
- Main headline: "Learn IT Support Through Real Scenarios"
- Subheading with value proposition
- Countdown timer: 2x2 grid on mobile, 1x4 on desktop with glassmorphic cards
- Primary CTA button with backdrop-blur-md bg-white/10 border border-white/20
- Interactive 3D sphere element floating in corner (responds to cursor movement)
- Smooth scroll indicator

### 2. Value Proposition Section
**Layout**: Three-column grid of benefit cards
**Components**:
- Section header: "Why TryRebooto?"
- Three glassmorphic cards with 3D tilt effect on hover
- Each card: Icon (3D-style), headline, description
- Subtle shadow and border treatment
- Interactive 3D geometric shape (pyramid) floating between cards on desktop

### 3. How It Works Section
**Layout**: Two-column alternating layout (image + text)
**Components**:
- Three steps with large numbers (01, 02, 03)
- Step 1: Text left, 3D mockup right showing scenario selection
- Step 2: 3D mockup left, text right showing problem-solving interface
- Step 3: Text left, progress dashboard mockup right
- Connecting curved lines between steps (desktop)
- Each mockup has subtle 3D depth and tilt on scroll

### 4. Interactive Skills Section
**Layout**: Four-column grid of skill categories
**Components**:
- Glassmorphic cards with hover lift effect
- 3D icon illustrations for each category
- Category name + sample topics list
- Cards respond to cursor proximity with subtle movement
- Floating 3D cube element in background

### 5. Email Signup Section
**Layout**: Centered with generous padding
**Components**:
- Compelling headline: "Start Your Journey"
- Glassmorphic email input with inline submit button
- Social proof counter: "Join 1,200+ learners"
- Privacy text below form
- Subtle gradient background overlay
- Floating 3D torus shape decoratively placed

### 6. Footer
**Layout**: Three-column grid (brand, links, social)
**Content**:
- Logo + minimal tagline
- Quick links: About, Support, Privacy, Terms
- Social icons with hover bounce
- Copyright notice

## Component Library

### Buttons
**Primary CTA**:
- When over images: `backdrop-blur-md bg-white/10 border border-white/20`
- When over solid backgrounds: Blue-to-purple gradient background
- `px-8 py-4 rounded-full text-base font-semibold`
- Bouncy hover animation (scale with spring physics)

**Secondary CTA**:
- `border-2 border-gray-300 bg-white hover:bg-gray-50`
- Rounded full, smooth transition

### Cards
**Glassmorphic Cards**:
- `backdrop-blur-lg bg-white/60 border border-gray-200/50`
- `rounded-3xl p-8 md:p-10`
- Subtle drop shadow: `shadow-xl shadow-gray-200/50`
- 3D tilt effect on hover using transform perspective
- Bouncy entrance animation on scroll

**Countdown Timer Boxes**:
- Glassmorphic treatment matching cards
- `rounded-2xl p-6`
- Large number: `text-5xl md:text-7xl font-bold`
- Label: `text-sm uppercase tracking-wider text-gray-500`

### Form Elements
**Email Input**:
- Glassmorphic: `backdrop-blur-lg bg-white/60 border border-gray-200/50`
- `rounded-full px-6 py-4 text-lg`
- Inline with button on desktop, stacked on mobile
- Focus: Subtle glow with gradient border

### 3D Interactive Elements
**Floating Geometric Shapes**:
- Scattered throughout page (sphere in hero, pyramid in value prop, cube in skills, torus in signup)
- Respond to cursor movement with parallax effect
- Subtle rotation animation loop
- Semi-transparent with gradient fills
- Maintain 1:1 aspect ratios

## Animations & Interactions

**Micro-interactions**:
- Button hover: Bouncy scale with spring physics
- Card hover: 3D tilt based on cursor position + lift
- Card entrance: Stagger fade-up with bounce
- Cursor proximity: Cards subtly move toward/away from cursor

**Scroll Animations**:
- Section reveals: Fade + slide up with easing
- 3D shapes: Parallax movement at different speeds
- Progress indicators: Smooth fill animations

**Easter Egg (Konami Code)**:
- Trigger: Up, Up, Down, Down, Left, Right, Left, Right, B, A
- Effect: Admin portal panel slides in from right side
- Panel: Glassmorphic with admin controls mockup
- Close button with smooth slide-out
- Celebration particle effect on activation

**Interactive Cursor**:
- Custom cursor dot that follows mouse
- Expands on interactive elements
- Trail effect with gradient

## Images

### Hero Image
**Description**: Large, high-quality abstract 3D render featuring floating geometric shapes (spheres, cubes, toruses) in a light, airy space with soft blue-purple gradient lighting
**Placement**: Full-screen background covering entire hero section
**Treatment**: Subtle overlay for text readability, fixed background attachment for parallax effect

### How It Works Mockups
**Description**: Clean, 3D-styled interface screenshots showing scenario selection, problem-solving decision trees, and progress dashboards with depth and perspective
**Placement**: Alternating right/left in How It Works section
**Treatment**: Floating with drop shadow, subtle 3D tilt, rounded corners (rounded-3xl)

### Skill Category Icons
**Description**: 3D illustrated icons for hardware, networking, software with isometric perspective
**Placement**: Top of each skill category card
**Treatment**: 80x80px with subtle shadow and gradient treatment

## Responsive Behavior
**Breakpoints**:
- Mobile: Single column stacking, simplified 3D effects
- Tablet (md:): Two-column grids, reduced animations
- Desktop (lg:): Full 3D interactions, cursor effects, floating shapes

**Mobile Adaptations**:
- Navigation: Compact floating bar
- Countdown: 2x2 grid layout
- 3D shapes: Reduced or static
- Tilt effects: Disabled
- Email form: Vertical stack

## Accessibility
- Touch targets: Minimum 44px
- Focus indicators: Prominent gradient outlines
- Color contrast: 4.5:1 minimum ratio maintained
- Reduced motion: Disable 3D effects and bouncy animations
- Countdown: aria-live regions
- Form labels: Visible or aria-labeled

## Brand Consistency
- Maintain light, airy premium aesthetic throughout
- Glassmorphism treatment consistent across all cards/overlays
- Blue-purple gradient used sparingly for accents
- Generous whitespace never compromised
- Playful 3D elements balanced with professional typography
- All geometric shapes maintain proper 1:1 aspect ratios