# Archived Components

This folder contains deprecated components that were removed from the active codebase during cleanup on October 31, 2025.

## Why These Were Archived

The Rebooto platform evolved from multiple design iterations. Initially, there were two design systems:
1. **Premium-prefixed** components (premium-hero, premium-footer, etc.) - An earlier design iteration
2. **Modern-prefixed** components (modern-hero, modern-footer, etc.) - The current active design

The codebase was cleaned up to remove unused components and maintain a single, consistent design system.

## Archived Components

### Landing Page Sections (Premium Design)
- `premium-footer.tsx` - Footer component from earlier premium design
- `premium-hero.tsx` - Hero section from earlier premium design  
- `premium-how.tsx` - How it works section from earlier premium design
- `premium-signup.tsx` - Email signup section from earlier premium design
- `premium-skills.tsx` - Skills showcase section from earlier premium design
- `premium-value.tsx` - Value proposition section from earlier premium design

### Landing Page Sections (Generic/Original Design)
- `footer.tsx` - Original footer (replaced by modern-footer.tsx)
- `hero.tsx` - Original hero section (replaced by modern-hero.tsx)
- `how-it-works.tsx` - Original how-it-works section (not used in current design)
- `value-proposition.tsx` - Original value prop section (not used in current design)
- `what-youll-learn.tsx` - Original learning section (not used in current design)
- `email-signup.tsx` - Standalone email signup component (integrated into modern sections)

### Utility Components
- `floating-nav.tsx` - Alternative navigation component (modern-nav.tsx is used instead)
- `flip-timer.tsx` - Flip-style countdown timer (countdown-timer.tsx is used instead)
- `admin-panel.tsx` - Unused admin panel component

## Active Design System

The current Rebooto platform uses:
- **Modern-prefixed** components for the landing page (ModernNav, ModernHero, ModernFeatures, ModernStats, ModernCTA, ModernFooter)
- **PremiumAuth** for authentication flows (still in use)
- **SmoothScroll** for scroll behavior (still in use)
- **CountdownTimer** for beta launch countdown (still in use)
- **StickyCountdown** for sticky countdown bar (still in use)

## Restoration

If you need to restore any of these components:
1. Copy the file from this archived folder back to its original location
2. Update any imports that reference it
3. Test thoroughly to ensure compatibility with current codebase

## Deletion

These files can be permanently deleted if:
- You're certain they won't be needed for reference
- You have a backup of the repository
- At least 6 months have passed since archival
