# Rebooto Design Guidelines

## Design Philosophy
**Dual Identity System**:
- **User Portal** (/app/*): Engagement-focused with 3D elements, glassmorphism, blue-purple gradients
- **Admin Portal** (/admin/*): Efficiency-focused with dark theme, data clarity, orange-red accents

---

# USER PORTAL

## Typography
**Fonts**: Space Grotesk (headlines), Inter (body)
- Hero: `text-6xl md:text-8xl font-bold tracking-tight`
- Sections: `text-4xl md:text-6xl font-bold`
- Subheads: `text-xl md:text-3xl font-semibold`
- Body: `text-base md:text-lg leading-relaxed`

## Colors
- Background: `#FFFFFF`, Surface: `#F8F9FA`
- Text: `#1A1A1A` (primary), `#6B7280` (secondary)
- Gradient: `#667EEA → #A78BFA` (blue-purple)
- Glassmorphic: `bg-white/60 backdrop-blur-lg border-gray-200/50`

## Layout
**Containers**: `max-w-7xl mx-auto px-6 md:px-12`
**Sections**: `py-24 md:py-32` (content), `py-16 md:py-24` (mobile)
**Grids**: `grid-cols-1 md:grid-cols-3 gap-8 md:gap-12`

## Navigation
Floating glassmorphic header: `fixed top-24 backdrop-blur-xl bg-white/70 border-gray-200/50 rounded-full px-8 py-4`
- Hide/show on scroll direction
- Components: Logo, nav links, user avatar, CTA

## Key Pages

### Landing (/app)
**Hero**: Full viewport, 3D geometric background (spheres/cubes in blue-purple space)
- Headline + subheading + countdown timer (vintage flip to Dec 31 2025)
- CTA: `backdrop-blur-md bg-white/10 border-white/20`
- Interactive 3D sphere with cursor parallax

**Value Props**: 3-card grid, glassmorphic with 3D tilt on hover, floating pyramid decoration

**How It Works**: Alternating 2-column, 3 numbered steps (01-03), 3D mockups with scroll-triggered tilt, curved connecting lines

**Skills**: 4-column grid, glassmorphic cards, 3D icons (hardware/networking/software/security), cursor proximity response

**Signup**: Centered, glassmorphic email input + inline button, "Join 1,200+ learners", floating torus

### Dashboard (/app/dashboard)
Sidebar (profile card, stats, categories) + main area (progress cards, scenario grid, badges)
- Interactive progress rings with gradient fills

### Scenario (/app/scenarios/:id)
Full-screen decision tree: white background, glassmorphic decision nodes, animated connecting lines, floating progress tracker, hint drawer, 3D visual aids

### Progress (/app/progress)
Grid: skill radar chart (blue-purple gradient), timeline, achievement masonry, streak calendar

## Components

### Buttons
- **Primary (on images)**: `backdrop-blur-md bg-white/10 border-white/20 px-8 py-4 rounded-full`
- **Primary (solid)**: Blue-purple gradient, `px-8 py-4 rounded-full`
- **Secondary**: `border-2 border-gray-300 bg-white hover:bg-gray-50 rounded-full`

### Cards
**Glassmorphic**: `backdrop-blur-lg bg-white/60 border-gray-200/50 rounded-3xl p-8 md:p-10 shadow-xl` + 3D tilt hover

**Countdown Boxes**: Glassmorphic `rounded-2xl p-6`, vintage flip animation, `text-5xl md:text-7xl font-bold`

### Forms
**Email Input**: `backdrop-blur-lg bg-white/60 border-gray-200/50 rounded-full px-6 py-4`, gradient border on focus

### 3D Elements
Floating shapes (sphere/pyramid/cube/torus): semi-transparent gradients, cursor parallax, subtle rotation, 1:1 aspect ratios

## Animations
- **Lenis**: Smooth scrolling sitewide
- **Framer Motion**: Page transitions, stagger fade-up card entrances
- **GSAP**: Section reveals, parallax, progress fills
- **Micro**: Button spring scale, 3D card tilt, proximity movement

---

# ADMIN PORTAL

## Typography
**Font**: Inter (all contexts)
- Dashboard: `text-3xl md:text-5xl font-bold`
- Sections: `text-2xl md:text-3xl font-semibold`
- Cards: `text-xl font-semibold`
- Body: `text-sm md:text-base`
- Labels: `text-xs uppercase tracking-wide`

## Colors
- Background: `#0F0F11`, Surface: `#1A1A1D → #24242A`
- Text: `#FFFFFF` (primary), `#9CA3AF` (secondary)
- Gradient: `#FF7A18 → #FF3B30` (orange-red)
- Glassmorphic: `bg-black/40 backdrop-blur-lg border-white/10`
- Status: Success `#10B981`, Warning `#F59E0B`, Danger `#EF4444`

## Layout
**Structure**: Top nav (h-16) + left sidebar (w-64) + main content (`p-8 md:p-12`)

## Navigation
**Top Bar**: `h-16 backdrop-blur-xl bg-black/80 border-b border-white/10`
- Logo, global search, notifications, admin avatar
- Active: orange-red gradient underline

**Sidebar**: `w-64 bg-black/40 backdrop-blur-lg border-r border-white/10`
- Sections: Dashboard, Users, Scenarios, Analytics, Campaigns, Settings
- Active: `border-left-4` orange-red gradient + `bg-white/5`
- Hover: `bg-white/5`
- Collapsible to icons (tablet), hidden (mobile hamburger)

## Key Pages

### Dashboard (/admin/dashboard)
**Stat Cards**: `backdrop-blur-lg bg-black/40 border-white/10 rounded-2xl p-6`
- Large number with orange-red gradient, trend arrow, mini sparkline

**Charts**: User growth line, completion pie, category bars (orange-red gradient fills)

**Activity Feed**: Glassmorphic scrollable list, timestamp + user + action + status badge

### Users (/admin/users)
Search/filter bar + data table
- Headers: `text-xs uppercase` orange-red gradient
- Rows: `hover:bg-white/5`, alternating backgrounds
- Actions: Edit/Delete icons, bulk checkboxes, pagination

### Scenarios (/admin/scenarios)
Grid/list toggle: thumbnail cards with stats (completions, time, difficulty) + actions

### Analytics (/admin/analytics)
Date range selector + engagement metrics, funnel chart, skill heatmap, difficulty scatter, export button

### Campaigns (/admin/campaigns)
2-column: campaign list + preview
- Builder: template selector, rich text editor, recipient segments, schedule controls

### Settings (/admin/settings)
Tabs (General/Security/Integrations/Billing), glassmorphic form sections, orange-red toggle switches

## Components

### Buttons
- **Primary**: `bg-gradient orange-red px-6 py-3 rounded-lg font-semibold`
- **Secondary**: `border-white/20 bg-white/5 hover:bg-white/10`
- **Danger**: `bg-red-600 hover:bg-red-700`

### Cards
`backdrop-blur-lg bg-black/40 border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20`

### Tables
- **Header**: `bg-white/5 border-b border-white/10 text-xs uppercase`
- **Row**: `hover:bg-white/5 border-b border-white/5`

### Forms
- **Input**: `backdrop-blur-lg bg-black/40 border-white/10 rounded-lg px-4 py-3 focus:border-orange-500`
- **Toggle**: `bg-white/10` (off), orange-red gradient (on)

### Badges
`rounded-full px-3 py-1 text-xs`
- Active: `bg-green-500/20 text-green-400`
- Pending: `bg-amber-500/20 text-amber-400`
- Inactive: `bg-gray-500/20 text-gray-400`

### Charts
Chart.js/Recharts: dark theme, orange-red gradients, `white/10` gridlines, glassmorphic tooltips

---

# SHARED

## Authentication
Centered glassmorphic card on gradient background
- **Providers**: Email/password + Google/GitHub/Apple/X (Replit Auth)
- **Provider buttons**: Icon + label, `backdrop-blur-md bg-white/10` (user) or `bg-black/40` (admin)
- Error states: red border + message

## Responsive
**Breakpoints**: md: 768px, lg: 1024px, xl: 1280px
- Mobile nav: Hamburger → slide-in drawer with glassmorphic backdrop
- Admin sidebar: Icons-only (tablet), hidden (mobile)

## Accessibility
- Touch targets: 44px minimum
- Focus rings: Orange-red (admin), blue-purple (user)
- Contrast: 4.5:1 minimum
- Reduced motion: Disable 3D/parallax/complex animations
- ARIA labels, full keyboard navigation

## Images
**User Portal**:
- Hero: Full-screen 3D render (floating spheres/cubes/toruses, blue-purple gradient lighting)
- Mockups: 3D-styled UI screenshots with depth, `rounded-3xl`, alternating placement
- Icons: 80x80px 3D isometric (hardware/networking/software/security)

**Admin Portal**: No hero images; focus on data visualizations