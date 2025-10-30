# Rebooto

## Overview  
Rebooto is a gamified IT support learning platform with email/password authentication, separate user and admin portals, and a modern, smooth-animated interface. The platform features AI-generated courses (OpenAI GPT-4o), progress tracking with XP/levels/achievements, and comprehensive admin management tools.

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

### System Design Choices
- **Frontend Structure**: Organized into pages (`home.tsx`, `dashboard.tsx`), modern landing sections (`modern-nav.tsx`, `modern-hero.tsx`, `modern-features.tsx`, `modern-stats.tsx`, `modern-cta.tsx`, `modern-footer.tsx`), auth components (`premium-auth.tsx`), and reusable Shadcn UI components. All animations use Framer Motion with scroll-triggered reveals (useInView), parallax effects (useTransform), and smooth transitions.
- **Backend Structure**: Includes API routes (`routes.ts`), database storage (`storage.ts`), session-based auth (`auth.ts`), database connection (`db.ts`), and shared Drizzle schema definitions (`schema.ts`).
- **Data Model**: Comprehensive schema includes `users`, `courses`, `lessons`, `achievements`, `enrollments`, `userProgress`, `userAchievements`, and `emailSignups` tables for a gamified learning experience.
- **API Endpoints**: Public endpoints for email signups and count; local auth endpoints for signup, login, logout, and user info; protected endpoints for courses, progress, and achievements.
- **Security**: Protected routes use `requireAuth` middleware. Sessions are PostgreSQL-backed with secure cookies. Passwords hashed with bcrypt. User data sanitized before sending to client (removes hashedPassword).

## External Dependencies
- **Frontend Libraries**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis, GSAP (ScrollTrigger).
- **Backend Framework**: Express.js, Node.js.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Authentication**: Session-based local email/password authentication only (Replit Auth removed).
- **Validation**: Zod for form validation.