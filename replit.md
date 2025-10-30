# Rebooto

## Overview  
Rebooto is a gamified IT support learning platform with email/password authentication, separate user and admin portals, and a modern, smooth-animated interface. The platform features AI-generated courses (OpenAI GPT-4o), progress tracking with XP/levels/achievements, and comprehensive admin management tools.

## Recent Changes (Latest First)
- **ADMIN PORTAL FULLY FUNCTIONAL**: Admin Users page now has real backend endpoints for role management (toggle admin/user) and user deletion with confirmation dialog
- **AI COURSE GENERATOR UPGRADED**: Enhanced OpenAI prompt to generate PRACTICAL, hands-on IT support scenarios with real help desk tickets, specific error messages (beep codes, DNS errors, etc.), exact commands (ipconfig /all, sfc /scannow), 7-18 detailed troubleshooting steps based on difficulty, root cause explanations, and category-specific guidance
- **COMPLETE PUBLIC WEBSITE**: Built all public pages (Documentation, Blog, FAQ, Support/Contact, About Us, Pricing) with proper routing and footer navigation
- **ADMIN CAMPAIGNS & SETTINGS PAGES**: Created Email Campaigns composer with preview and Settings page with platform configuration (both have UI ready for backend integration)

## User Preferences
I prefer detailed explanations, especially for complex architectural decisions. I want iterative development, with clear communication before major changes are made to the codebase. Ensure the design maintains a premium/minimalist aesthetic with playful elements.

## System Architecture

### UI/UX Decisions
The entire site features a modern, clean SaaS-inspired design with a consistent teal-to-emerald gradient color scheme and coral accents. Typography uses Sora for headlines and Inter for body text. The design emphasizes white space, enhanced animations via Framer Motion (parallax scrolling, scroll-triggered reveals, fade-ups, smooth transitions), and premium aesthetics. Background includes animated gradient orbs and subtle grid patterns. All elements use rounded corners, clean borders, and smooth hover effects. The navigation header is sticky with backdrop blur and prominent Login/Signup CTAs.

### Technical Implementations
**Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis for smooth scrolling, GSAP for advanced animations.  
**Backend**: Express.js, Node.js, PostgreSQL (Neon), Drizzle ORM.  
**Authentication**: Session-based email/password authentication with bcrypt password hashing. Sessions stored in PostgreSQL for persistence.

### Feature Specifications

**Landing Page:**
- **Sticky Navigation Header**: Backdrop-blur navigation with Rebooto logo, smooth scroll navigation to sections, prominent Login and "Sign Up Free" buttons
- **Modern Hero Section**: Full-viewport hero with parallax-scrolling gradient orbs, animated grid pattern background, headline with teal gradient text, email signup form inline, trust indicator showing signup count, countdown timer to beta launch (Dec 31, 2025). Hero content remains fully opaque during scroll (no fade effect).
- **Sticky Countdown Bar**: Appears below header when scrolled past 350px, shows countdown in XX:XX:XX:XX format (no DHMS labels), unmounts from DOM when at top
- **Feature Cards Section**: 4-column grid with scroll-triggered staggered reveals, whileHover lift animations (y: -8), gradient icons, enhanced shadows on hover. Features: Real-World Scenarios, Gamified Learning, AI-Powered Guidance, Job-Ready Skills.
- **Stats Section**: 4-column stats with scale-up animations from 0.5 to 1.0, gradient numbers on teal-emerald background, smooth easing transitions.
- **Final CTA Section**: Full-width gradient background (teal to emerald) with centered white text, headline, and inline email signup form.
- **Email Signup**: Inline forms in hero and CTA sections with white rounded-full container, email input, and gradient button. Toast notifications on success/error.
- **Footer**: Clean 4-column layout with product/resources/company/connect sections, social icons, and copyright info.

**User Portal:**
- **Dashboard**: Teal/emerald themed dashboard with sticky header, Level/XP badges, progress tracking, course cards with teal gradients, achievements system with unlocked/locked states, admin portal access card
- **Authentication**: Multi-step animated auth flows at /auth with tabs for login and signup. Login: email → password (2 steps). Signup: name → email → password+DOB (3 steps). Features slide transitions, step validation, and back navigation. Collects firstName, lastName, email, password, and dateOfBirth.
- **Courses Page** (/app/courses): Browse all available courses with teal/emerald gradient cards showing title, description, difficulty, XP reward, and lesson count. Includes enrollment functionality.
- **Course Detail** (/app/courses/:id): View course overview with lesson list, progress tracking, and start/continue lesson buttons. Maintains consistent teal/emerald theme.
- **Lesson Player** (/app/courses/:courseId/lessons/:lessonId): Interactive lesson player supporting scenario-based content (problem/steps/solution format). Features step navigation, progress bar, XP rewards on completion, and automatic navigation to next lesson. Uses memoized content transformation for optimal performance.

**Admin Portal:** (Protected with requireAdmin middleware)
- **Admin Dashboard** (/admin/dashboard): Real-time statistics dashboard showing Total Users, Active Courses, Email Signups, and Completion Rate. Data fetched via /api/admin/stats endpoint.
- **Course Creator** (/admin/courses): AI-powered course generation tool using OpenAI GPT-4o. Two-step workflow: (1) Generate draft with AI - creates 3-5 lessons with detailed IT support scenarios, stored temporarily in React state. (2) Publish course - permanently saves course and lessons to database. Features include course title/description/difficulty inputs, AI generation button, lesson editing capabilities, and publish functionality. Redirects to admin dashboard after successful publish.
- **Admin Sidebar**: Gradient-themed sidebar navigation with links to Dashboard, Course Creator, Users, Email Campaigns, and Settings pages. Includes logout functionality.
- **Admin Credentials**: admin@rebooto.com / A5dzPbRmggEe (for testing)

### System Design Choices
- **Frontend Structure**: Organized into pages (`home.tsx`, `dashboard.tsx`, `courses.tsx`, `course-detail.tsx`, `lesson-player.tsx`), modern landing sections (`modern-nav.tsx`, `modern-hero.tsx`, `modern-features.tsx`, `modern-stats.tsx`, `modern-cta.tsx`, `modern-footer.tsx`), auth components (`premium-auth.tsx`), and reusable Shadcn UI components. All animations use Framer Motion with scroll-triggered reveals (useInView), parallax effects (useTransform), and smooth transitions. All course-related pages maintain consistent teal/emerald gradient theme.
- **Backend Structure**: Includes API routes (`routes.ts`), database storage (`storage.ts`), session-based auth (`auth.ts`), database connection (`db.ts`), and shared Drizzle schema definitions (`schema.ts`).
- **Data Model**: Comprehensive schema includes `users`, `courses`, `lessons`, `achievements`, `enrollments`, `userProgress`, `userAchievements`, and `emailSignups` tables for a gamified learning experience. Course schema includes `lessonCount` field (default 0) for efficient lesson counting.
- **Lesson Content Format**: Lessons support flexible content formats including scenario-based lessons (problem/steps/solution) and array-based lessons. Content is transformed via useMemo in the lesson player for optimal performance.
- **API Endpoints**: Public endpoints for email signups and count; local auth endpoints for signup, login, logout, and user info; protected endpoints for courses, progress, achievements, and lesson completion; admin-protected endpoints for stats, course generation, and course management.
- **Security**: Protected routes use `requireAuth` middleware. Admin routes use stronger `requireAdmin` middleware that verifies isAdmin flag in session. Sessions are PostgreSQL-backed with secure cookies. Passwords hashed with bcrypt. User data sanitized before sending to client (removes hashedPassword).

## External Dependencies
- **Frontend Libraries**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis, GSAP (ScrollTrigger).
- **Backend Framework**: Express.js, Node.js.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Authentication**: Session-based local email/password authentication only (Replit Auth removed).
- **Validation**: Zod for form validation.