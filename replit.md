# Rebooto

## Overview  
Rebooto is a gamified IT support learning platform with email/password authentication, separate user and admin portals, and a modern, smooth-animated interface. The platform features AI-generated courses (OpenAI GPT-4o), progress tracking with XP/levels/achievements, and comprehensive admin management tools.

## User Preferences
I prefer detailed explanations, especially for complex architectural decisions. I want iterative development, with clear communication before major changes are made to the codebase. Ensure the design maintains a premium/minimalist aesthetic with playful elements.

## System Architecture

### UI/UX Decisions
The platform adopts a premium minimalist design using a white background, glassmorphism effects, and blue-purple gradients. Typography features Space Grotesk for headlines and Inter for body text, with a responsive hierarchy. Animations utilize Lenis for smooth scrolling, Framer Motion for entrance and interaction effects, and GSAP for scroll-triggered animations and 3D orb parallax effects. Key components like the floating navigation and various content cards incorporate glassmorphic styling, rounded corners, and soft shadows. A vintage flip timer countdown, simplified to a single unified display per time unit, maintains a mechanical/industrial aesthetic.

### Technical Implementations
**Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis for smooth scrolling, GSAP for advanced animations.  
**Backend**: Express.js, Node.js, PostgreSQL (Neon), Drizzle ORM.  
**Authentication**: Session-based email/password authentication with bcrypt password hashing. Sessions stored in PostgreSQL for persistence.

### Feature Specifications
- **Lenis Smooth Scrolling**: Buttery smooth scroll performance integrated with GSAP ScrollTrigger for animations.
- **Floating Glassmorphic Navigation**: Auto-hiding, responsive navigation with smooth Framer Motion transitions.
- **Premium Hero Section**: Features animated 3D gradient orbs, parallax effects, large responsive typography, and a vintage flip timer countdown to December 31, 2025.
- **Premium Content Sections**: Value proposition, "How It Works," and "Skills" sections utilize glassmorphic cards with gradient accents and hover effects.
- **Premium Email Signup**: Glassmorphic form with Zod validation, real-time signup counter, and confetti-style success message.
- **Konami Code Easter Egg**: Secret sequence (↑↑↓↓←→←→BA) triggers a sliding admin login panel.
- **Admin Login Panel**: Slides in with a spring animation, featuring a "Login with Replit" button for authentication.
- **Protected Admin Dashboard**: Authenticated users can view user profiles, signup statistics, and a detailed list of all email signups via a scrollable dialog. Includes logout functionality.
- **Premium Footer**: Contains social media links, navigation, and copyright information with a glassmorphic design.

### System Design Choices
- **Frontend Structure**: Organized into pages (`home.tsx`, `dashboard.tsx`), sections (`premium-*.tsx`), and reusable components (`smooth-scroll.tsx`, `floating-nav.tsx`, `admin-panel.tsx`, `ui/`).
- **Backend Structure**: Includes API routes (`routes.ts`), database storage (`storage.ts`), Replit Auth integration (`replitAuth.ts`), database connection (`db.ts`), and shared Drizzle schema definitions (`schema.ts`).
- **Data Model**: Comprehensive schema includes `users`, `courses`, `lessons`, `achievements`, `enrollments`, `userProgress`, `userAchievements`, and `emailSignups` tables for a gamified learning experience.
- **API Endpoints**: Public endpoints for email signups and count; Replit Auth endpoints for login, callback, logout, and user info; protected endpoints for retrieving all signups.
- **Security**: Admin dashboard protected by Replit Auth session authentication. Sessions are PostgreSQL-backed with secure cookies. OAuth 2.0 with PKCE is used.

## External Dependencies
- **Frontend Libraries**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis, GSAP (ScrollTrigger).
- **Backend Framework**: Express.js, Node.js.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Authentication**: Replit Auth (OpenID Connect) for Google, GitHub, X, Apple, and email/password support.
- **Validation**: Zod for form validation.