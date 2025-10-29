# TryRebooto

## Overview
TryRebooto is a modern pre-launch landing page for an interactive IT support learning platform. The MVP features a premium minimalist design with playful 3D elements, smooth scrolling, and a secret Konami code easter egg that reveals an admin dashboard. The platform validates user interest through email signups while building anticipation for launch.

## Purpose
- Validate interest in learning IT support through interactive experiences
- Collect user emails for launch notifications
- Build early brand trust with a polished, premium web presence
- Demonstrate the platform's concept and build anticipation
- Provide secret admin access via Konami code easter egg

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis
- **Backend**: Express.js, Node.js
- **Storage**: In-memory storage (MemStorage)
- **Animations**: GSAP (ScrollTrigger), Framer Motion, Lenis smooth scroll
- **Design**: Premium/minimalist with playful elements - white backgrounds, glassmorphism, blue-purple gradients, Space Grotesk + Inter fonts

## Project Architecture

### Frontend Structure
- `/client/src/pages/home.tsx` - Premium landing page
- `/client/src/pages/dashboard.tsx` - Protected admin dashboard
- `/client/src/components/sections/premium-*.tsx` - Premium sections (Hero, Value, How, Skills, Signup, Footer)
- `/client/src/components/smooth-scroll.tsx` - Lenis smooth scroll wrapper
- `/client/src/components/floating-nav.tsx` - Floating glassmorphic navigation
- `/client/src/components/admin-panel.tsx` - Sliding admin login panel
- `/client/src/hooks/use-konami.tsx` - Konami code detection hook
- `/client/src/components/ui/` - Shadcn UI components

### Backend Structure
- `/server/routes.ts` - API routes for email signups
- `/server/storage.ts` - In-memory storage implementation
- `/shared/schema.ts` - Data models and validation schemas

## Key Features

### 1. Lenis Smooth Scrolling
- Buttery smooth scroll performance throughout site
- Integrated with GSAP ScrollTrigger for animations
- Configurable duration and easing
- Enhanced user experience

### 2. Floating Glassmorphic Navigation
- Auto-hides on scroll down, shows on scroll up
- Rounded-full design with backdrop-blur-xl
- Mobile responsive with hamburger menu
- Contains logo, nav links, and CTA button
- Smooth transitions with Framer Motion

### 3. Premium Hero Section
- Animated 3D gradient orbs following cursor movement
- Parallax effects on scroll
- Large responsive typography (5xl to 8xl)
- Gradient text effects on headline
- **Vintage flip timer countdown** with split-flap display aesthetic:
  - Mechanical/industrial design (dark gray panels, white text)
  - 3D flip animations using Framer Motion rotateX transforms
  - Responsive sizing (mobile 40px tiles → desktop 96px tiles)
  - Two-digit displays for days, hours, mins, secs
  - Metallic rivets/screws in corners
  - "LAUNCH COUNTDOWN" branding
  - Fits 375px+ viewports with px-1 mobile padding
- Dual CTAs with gradient buttons

### 4. Premium Value Proposition
- Three benefit cards with glassmorphic design
- Gradient icon backgrounds (blue/purple/green)
- Hover scale effects and shadows
- Scroll-triggered Framer Motion animations

### 5. Premium How It Works
- Three numbered step cards
- Gradient numbered badges
- Icon illustrations for each step
- Glassmorphic card design with hover effects

### 6. Premium Skills Section
- Three category cards (Hardware, Network, Software)
- Checkmark lists for each category
- Glassmorphic design with gradient accents
- Responsive grid layout

### 7. Premium Email Signup
- Glassmorphic form design
- Form validation with Zod
- Real-time signup counter display
- Success state with confetti-style message
- Privacy reassurance

### 8. Konami Code Easter Egg
- Secret sequence: ↑↑↓↓←→←→BA
- Triggers admin panel to slide in from right
- Visual feedback with animations
- Fun discovery mechanism for admin access

### 9. Admin Login Panel
- Slides in from right with spring animation
- Username and password form
- Connects to auth backend
- Success message about finding easter egg
- Close button to dismiss

### 10. Protected Admin Dashboard
- Authentication check via /api/auth/me
- Redirects to home if not authenticated
- Displays signup statistics (Total Signups count)
- Quick action buttons:
  - Manage Scenarios
  - **View All Signups** (opens dialog with full signups list)
  - Analytics Dashboard
  - Settings
- **Signups List Dialog**:
  - Fetches all signups via GET /api/signups
  - Displays email and timestamp for each signup
  - Scrollable list with proper test IDs
  - Glassmorphic design with gradient icons
- Logout functionality
- Premium glassmorphic design matching landing page

### 11. Premium Footer
- Social media links (X/Twitter, LinkedIn, GitHub)
- Navigation links
- Copyright information
- Glassmorphic design

## Design System

### Colors
- **Primary**: Blue gradient (HSL 217 91% 60%)
- **Secondary**: Purple accent (HSL 271 91% 65%)
- **Background**: White/Light gray (HSL 0 0% 100%)
- **Gradients**: Blue-to-purple brand gradient
- **Glassmorphism**: backdrop-blur-lg/xl with bg-white/60 semi-transparent backgrounds
- **Text**: Dark gray (900) for headlines, gray (600-700) for body

### Typography
- **Display Font**: Space Grotesk (headlines, section titles)
- **Body Font**: Inter (UI elements, body text)
- **Responsive Hierarchy**: 
  - Mobile: 4xl-5xl headlines → Desktop: 6xl-8xl headlines
  - Mobile: base-lg body → Desktop: lg-xl body
  - Smart scaling with sm:, md:, lg: breakpoints

### Glassmorphism Style
- **Navigation**: backdrop-blur-xl bg-white/70 border-white/20
- **Cards**: backdrop-blur-lg bg-white/60 border-gray-200/50
- **Accents**: rounded-3xl corners throughout
- **Shadows**: Soft shadows with color hints (shadow-blue-500/30)
- **3D Depth**: Layered glass effects with subtle borders

### Spacing
- **Mobile-first approach**: 
  - Mobile: px-4-6, py-16-20, gap-4-6
  - Desktop: px-6-8, py-24-32, gap-8-12
- **Sections**: py-20 md:py-32 lg:py-40 for vertical spacing
- **Cards**: p-6 md:p-10 for glassmorphic cards
- **Max widths**: max-w-7xl for content containers

### Animations

#### Lenis Smooth Scroll
- Duration: 1.2s
- Easing: ease-in-out
- Integrated with GSAP ScrollTrigger
- Smooth momentum scrolling

#### Framer Motion
- **Entrance animations**: 
  - Initial: opacity 0, y 20-40
  - Animate: opacity 1, y 0
  - Duration: 0.5-0.8s with delays
- **Scroll triggers**: whileInView with once: true
- **Hover effects**: 
  - Scale: 1.02-1.05
  - Transition: spring physics
- **Admin panel**: 
  - Slide in: x from 100% to 0
  - Spring: type "spring", stiffness 300, damping 30

#### GSAP Effects
- **3D Orbs**: 
  - Parallax following cursor movement
  - Smooth transforms with GSAP
  - Gradient animations
- **ScrollTrigger**: 
  - Integrated with Lenis
  - Trigger points at 80% viewport

#### Hover Interactions
- **Cards**: scale-105 + shadow enhancement
- **Buttons**: Gradient shifts, glow effects
- **Icons**: Subtle rotations, scale-110

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

### Public Endpoints

#### POST /api/signups
Create a new email signup
- **Body**: `{ email: string }`
- **Validation**: Email format validation with Zod
- **Response**: Created signup object
- **Errors**: 400 (validation), 409 (duplicate email)

#### GET /api/signups/count
Get total signup count
- **Response**: `{ count: number }`

### Admin Endpoints (Protected - requireAuth)

#### GET /api/signups
Get all email signups (sorted by newest first)
- **Response**: `EmailSignup[]`
- **Auth**: Requires admin session

#### POST /api/auth/login
Admin authentication (for Konami easter egg)
- **Body**: `{ username: string, password: string }`
- **Response**: Session created, user object returned
- **Errors**: 401 (invalid credentials)

#### GET /api/auth/me
Check current authentication status
- **Response**: Current user object or 401 if not authenticated
- **Used by**: Dashboard page for protection

#### POST /api/auth/logout
Logout current admin session
- **Response**: Success message

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

## Routes

### Public Routes
- `/` - Premium landing page with all sections
- `/dashboard` - Protected admin dashboard (requires auth)

### Protected Route Behavior
- Dashboard checks authentication via /api/auth/me
- Redirects to home if not authenticated
- Shows loading state during auth check

## Development Notes
- **Lenis**: Smooth scroll library integrated with GSAP
- **GSAP**: ScrollTrigger for scroll-based animations
- **Framer Motion**: All entrance and interaction animations
- **Responsive**: Mobile-first design with md/lg breakpoints
- **Theme**: Light mode only (premium/minimalist aesthetic)
- **Data-testid**: All interactive elements have test identifiers
- **Email validation**: Prevents duplicate signups
- **Storage**: In-memory, resets on server restart
- **Easter egg**: Konami code (↑↑↓↓←→←→BA) reveals admin panel
- **Glassmorphism**: backdrop-blur effects throughout

## Performance Considerations
- Lenis smooth scroll adds ~5KB
- GSAP + ScrollTrigger included for animations
- Framer Motion for React animations
- CSS 3D transforms for hero orbs (no Three.js dependency)
- Consider motion-reduction media query for accessibility

## Security Notes
- Admin dashboard protected by session authentication
- Easter egg provides alternative admin access
- Session managed server-side with express-session
- Passwords should be properly hashed (bcrypt)

## Recent Changes
- 2025-10-29: **Vintage flip timer implementation** - Replaced standard countdown with authentic split-flap display (old train station/airport aesthetic) featuring 3D flip animations, mechanical styling, dark gradient panels, white text, metallic rivets. Fully responsive with mobile-first sizing (fits 375px+ viewports). Fixed navigation with logo scroll-to-top button and proper test IDs. Fixed dashboard signups bug - added GET /api/signups endpoint and dialog UI to display full signups list with emails and timestamps.
- 2025-10-29: **Complete premium redesign** - Implemented Lenis smooth scrolling, floating glassmorphic navigation, premium sections with 3D effects, Konami code easter egg (↑↑↓↓←→←→BA), admin login panel, and protected dashboard with signup analytics. Changed from dark theme to premium/minimalist white aesthetic with glassmorphism throughout. All animations migrated to Framer Motion with scroll triggers.
- 2025-10-29: Enhanced landing page with modern design, advanced GSAP animations, improved mobile responsiveness, glassmorphism effects, hover interactions, and polished visual hierarchy
- 2025-10-29: Initial MVP implementation with complete landing page, countdown timer, and email signup functionality
