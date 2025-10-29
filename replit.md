# TryRebooto

## Overview
TryRebooto is a modern pre-launch landing page for an interactive IT support learning platform. The MVP validates user interest through email signups and showcases the platform's value proposition with a polished, credible design.

## Purpose
- Validate interest in learning IT support through interactive experiences
- Collect user emails for launch notifications
- Build early brand trust with a functional, visually strong web presence
- Demonstrate the platform's concept and build anticipation

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, GSAP animations
- **Backend**: Express.js, Node.js
- **Storage**: In-memory storage (MemStorage)
- **Design**: Dark theme with blue/green gradients, Space Grotesk + Inter fonts

## Project Architecture

### Frontend Structure
- `/client/src/pages/home.tsx` - Main landing page
- `/client/src/components/sections/` - Page sections (Hero, Value Proposition, How It Works, etc.)
- `/client/src/components/countdown-timer.tsx` - Countdown timer component
- `/client/src/components/ui/` - Shadcn UI components

### Backend Structure
- `/server/routes.ts` - API routes for email signups
- `/server/storage.ts` - In-memory storage implementation
- `/shared/schema.ts` - Data models and validation schemas

## Key Features

### 1. Hero Section with Countdown Timer
- Full viewport height hero with gradient background
- Live countdown to launch date (Dec 31, 2025)
- Animated entrance with GSAP
- Dual CTAs for engagement

### 2. Value Proposition Section
- Three key benefits with icons
- Card-based layout with hover effects
- Scroll-triggered animations

### 3. How It Works Section
- Three-step process explanation
- Numbered cards with icons
- Staggered animation on scroll

### 4. What You'll Learn Section
- Three skill categories (Hardware, Network, Software)
- Topic lists with checkmarks
- Gradient border treatment on hover

### 5. Email Signup Section
- Form validation with Zod
- Real-time signup counter
- Success state handling
- Privacy reassurance

### 6. Footer
- Social media links (Twitter, LinkedIn, GitHub)
- Navigation links (About, Contact, Privacy)
- Copyright information

## Design System

### Colors
- **Primary**: Blue gradient (HSL 210 85% 48%)
- **Secondary**: Green accent (HSL 165 75% 55%)
- **Background**: Dark theme (HSL 220 6% 8%)
- **Gradients**: Blue-to-green brand gradient
- **Glassmorphism**: backdrop-blur-sm/md with semi-transparent backgrounds

### Typography
- **Display Font**: Space Grotesk (headlines, section titles)
- **Body Font**: Inter (UI elements, body text)
- **Responsive Hierarchy**: 
  - Mobile: 4xl headlines → Desktop: 7xl headlines
  - Mobile: base-lg body → Desktop: xl-2xl body
  - Smart scaling with sm:, md:, lg: breakpoints

### Spacing
- **Mobile-first approach**: 
  - Mobile: px-4, py-16, gap-3/4
  - Desktop: px-6, py-24/32, gap-6/8
- **Sections**: py-16 md:py-24 lg:py-32 for vertical spacing
- **Cards**: p-6 md:p-8 for internal padding

### Animations (GSAP)
- **Hero**: 
  - Staged timeline animations with overlapping delays
  - Parallax scrolling on background gradients (0.3x speed)
  - Pulsing gradient orbs
- **Countdown**: 
  - Stagger entrance with back.out easing (0.08s between)
  - Hover effects: scale-105 + glow + border color transition
- **Sections**: 
  - Scroll-triggered reveals (80-85% viewport)
  - Cards: alternating X-axis slide animations on How It Works
  - Staggered Y-axis entrances (0.15s) on other sections
- **Hover interactions**: 
  - Cards: elevation with glow effects, scale transforms
  - Buttons: shadow intensification, smooth transitions
  - Icons: scale-110 transforms

## Data Model

### EmailSignup
```typescript
{
  id: string;           // UUID
  email: string;        // Email address
  createdAt: Date;      // Signup timestamp
}
```

## API Endpoints

### POST /api/signups
Create a new email signup
- **Body**: `{ email: string }`
- **Validation**: Email format validation with Zod
- **Response**: Created signup object
- **Errors**: 400 (validation), 409 (duplicate email)

### GET /api/signups/count
Get total signup count
- **Response**: `{ count: number }`

## Running the Application
```bash
npm run dev
```
- Vite dev server for frontend
- Express server for backend
- Both served on same port (default: 5000)

## Next Phase Features
- Simple login and registration system
- Interactive troubleshooting scenarios (e.g., Wi-Fi diagnostics)
- XP and progress tracking system
- Lesson completion dashboard
- User feedback collection

## Development Notes
- GSAP loaded via CDN in index.html
- ScrollTrigger registered for scroll animations
- Responsive design: mobile-first with md/lg breakpoints
- Dark mode only (no light theme toggle in MVP)
- All interactive elements have data-testid attributes
- Email validation prevents duplicates
- In-memory storage resets on server restart

## Recent Changes
- 2025-10-29: Enhanced landing page with modern design, advanced GSAP animations (parallax, scroll-triggered reveals, timeline orchestration), improved mobile responsiveness (responsive grids, full-width buttons, adaptive text sizes), glassmorphism effects, hover interactions (scale, glow, elevation), and polished visual hierarchy across all sections
- 2025-10-29: Initial MVP implementation with complete landing page, countdown timer, and email signup functionality
