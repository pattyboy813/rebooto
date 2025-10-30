# Rebooto

## Overview  
Rebooto is a gamified IT support learning platform with email/password authentication, separate user and admin portals, and a modern, smooth-animated interface. The platform features AI-generated courses (OpenAI GPT-4o), progress tracking with XP/levels/achievements, and comprehensive admin management tools.

## User Preferences
I prefer detailed explanations, especially for complex architectural decisions. I want iterative development, with clear communication before major changes are made to the codebase. Ensure the design maintains a premium/minimalist aesthetic with playful elements.

## System Architecture

### UI/UX Decisions
The landing page features a modern, clean SaaS-inspired design with a teal-to-emerald gradient color scheme and coral accents. Typography uses Sora for headlines and Inter for body text. The design emphasizes white space, subtle animations via Framer Motion (fade-ups, gentle hovers), and a structured layout with clear sections: hero with email capture, feature cards, social proof stats, final CTA, and footer. Background includes animated gradient orbs and a subtle grid pattern. All elements use rounded corners, clean borders, and smooth transitions.

### Technical Implementations
**Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis for smooth scrolling, GSAP for advanced animations.  
**Backend**: Express.js, Node.js, PostgreSQL (Neon), Drizzle ORM.  
**Authentication**: Session-based email/password authentication with bcrypt password hashing. Sessions stored in PostgreSQL for persistence.

### Feature Specifications
- **Modern Hero Section**: Full-viewport hero with animated gradient orbs, grid pattern background, headline with teal gradient text, email signup form inline, and trust indicator showing signup count.
- **Feature Cards Section**: 4-column grid showcasing Real-World Scenarios, Gamified Learning, AI-Powered Guidance, and Job-Ready Skills. Each card has gradient icon, title, and description with hover lift effect.
- **Stats Section**: 4-column stats display (1,200+ Learners, 500+ Scenarios, 95% Completion, 24/7 Access) with gradient numbers on teal-emerald background.
- **Final CTA Section**: Full-width gradient background (teal to emerald) with centered white text, headline, and inline email signup form.
- **Email Signup**: Inline forms in hero and CTA sections with white rounded-full container, email input, and gradient button. Toast notifications on success/error.
- **Footer**: Clean 4-column layout with product/resources/company/connect sections, social icons, and copyright info.
- **Authentication**: Separate auth page accessible at /auth with email/password signup and login tabs (removed all Replit Auth/OAuth providers).

### System Design Choices
- **Frontend Structure**: Organized into pages (`home.tsx`, `dashboard.tsx`), modern landing sections (`modern-*.tsx`), auth components (`premium-auth.tsx`), and reusable Shadcn UI components.
- **Backend Structure**: Includes API routes (`routes.ts`), database storage (`storage.ts`), session-based auth (`auth.ts`), database connection (`db.ts`), and shared Drizzle schema definitions (`schema.ts`).
- **Data Model**: Comprehensive schema includes `users`, `courses`, `lessons`, `achievements`, `enrollments`, `userProgress`, `userAchievements`, and `emailSignups` tables for a gamified learning experience.
- **API Endpoints**: Public endpoints for email signups and count; local auth endpoints for signup, login, logout, and user info; protected endpoints for courses, progress, and achievements.
- **Security**: Protected routes use `requireAuth` middleware. Sessions are PostgreSQL-backed with secure cookies. Passwords hashed with bcrypt. User data sanitized before sending to client (removes hashedPassword).

## External Dependencies
- **Frontend Libraries**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis, GSAP (ScrollTrigger).
- **Backend Framework**: Express.js, Node.js.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Authentication**: Replit Auth (OpenID Connect) for Google, GitHub, X, Apple, and email/password support.
- **Validation**: Zod for form validation.