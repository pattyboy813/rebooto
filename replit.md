# Rebooto

## Overview
Rebooto is a gamified IT support learning platform designed to provide an engaging and effective learning experience. It features email/password authentication, distinct user and admin portals, and a modern, smoothly animated user interface. The platform's core capabilities include AI-generated courses (powered by OpenAI GPT-4o), comprehensive progress tracking with XP, levels, and achievements, and robust administrative tools for content and user management. Rebooto aims to provide job-ready skills through real-world scenarios and gamified learning.

**Recent Updates (Oct 31, 2025)**: Code cleanup - archived 15 deprecated components to `/archived` folder. The codebase now uses a single, consistent Modern-prefixed design system. All lesson progression bugs fixed and AI course generator restructured for text-based theory content.

## User Preferences
I prefer detailed explanations, especially for complex architectural decisions. I want iterative development, with clear communication before major changes are made to the codebase. Ensure the design maintains a premium/minimalist aesthetic with playful elements.

## System Architecture

### UI/UX Decisions
The platform features a modern, clean SaaS-inspired design utilizing a consistent teal-to-emerald gradient color scheme with coral accents. Typography is handled by Sora for headlines and Inter for body text. The design prioritizes whitespace, enhanced animations via Framer Motion (parallax, scroll-triggered reveals, fade-ups, smooth transitions), and a premium aesthetic. Backgrounds incorporate animated gradient orbs and subtle grid patterns. All UI elements feature rounded corners, clean borders, and smooth hover effects. The navigation header is sticky with a backdrop blur and prominent calls to action.

### Technical Implementations
**Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis for smooth scrolling, GSAP for advanced animations.
**Backend**: Express.js, Node.js, PostgreSQL (Neon), Drizzle ORM.
**Authentication**: Session-based email/password authentication using bcrypt for password hashing. Sessions are persisted in PostgreSQL.
**Email Integration**: A dual-mode email system supporting the Replit Outlook connector (when hosted on Replit) or Azure AD OAuth2 client credentials flow for self-hosting. It can be configured for shared mailboxes and automatically detects the authentication method based on environment variables.

### Feature Specifications
**Landing Page**: Includes a sticky navigation, a modern hero section with parallax effects and a beta launch countdown, a sticky countdown bar, a feature cards section with scroll-triggered animations, a stats section with animated numbers, a final call-to-action section with email signup, and a clean footer.
**User Portal**:
- **Authentication**: Multi-step animated login (email -> password) and signup (name -> email -> password+DOB) flows with validation and navigation. Password reset functionality via email-based tokens.
- **Account Settings**: Comprehensive management at `/app/settings` with tabs for profile editing, password changes (requiring current password verification), and account deletion (with password confirmation).
- **Courses**: Pages to browse and enroll in courses, view course details, and an interactive lesson player (`/app/courses/:courseId/lessons/:lessonId`) with step navigation, progress tracking, and XP rewards. Lessons support scenario-based or array-based content and automatically advance.
**Admin Portal**: (Protected by `requireAdmin` middleware)
- **Dashboard**: Real-time statistics.
- **Course Creator**: AI-powered course generation tool using OpenAI GPT-4o, creating theoretical, text-based lessons. Allows for draft generation and publishing to the database.
- **Blog Management**: Full CRUD interface for blog posts, including publish/draft toggles, slug generation, markdown content, and tag management.
- **Admin Sidebar**: Gradient-themed navigation for admin functionalities.

### System Design Choices
- **Frontend Structure**: Organized into pages, modern landing sections, auth components, and reusable Shadcn UI components, all leveraging Framer Motion for animations.
- **Backend Structure**: Comprises API routes, database storage, session-based authentication, database connection, and Drizzle schema definitions.
- **Data Model**: Comprehensive schema for users, courses, lessons, achievements, enrollments, user progress, email signups, password reset tokens, and blog posts. Password reset tokens are cryptographically secure and single-use with a 1-hour expiry.
- **API Endpoints**: Public endpoints for signups and blog posts; authenticated endpoints for user management and learning progress; admin-protected endpoints for content and user management.
- **Security**: `requireAuth` and `requireAdmin` middleware protect routes. Sessions are PostgreSQL-backed with secure cookies. Passwords are bcrypt-hashed. Password reset tokens use `crypto.randomBytes`. User data is sanitized before client-side transmission.

## External Dependencies
- **Frontend Libraries**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Lenis, GSAP (ScrollTrigger).
- **Backend Framework**: Express.js, Node.js.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Authentication**: Session-based local email/password authentication.
- **Validation**: Zod.
- **AI**: OpenAI GPT-4o (for course generation).
- **Email**: Microsoft Outlook connector (Replit) or Azure AD OAuth2 (self-hosted).