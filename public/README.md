# Rebooto - Vanilla HTML/CSS/JavaScript Site

This is the public-facing website for Rebooto, built with vanilla HTML, CSS, and JavaScript.

## Structure

```
public/
├── index.html              # Landing page
├── css/
│   └── styles.css         # Custom styles, animations, theme
├── js/
│   ├── api.js             # API utilities, auth helpers
│   └── router.js          # Client-side routing (unused currently)
├── pages/                  # User portal pages
│   ├── login.html         # User authentication
│   ├── signup.html        # User registration
│   ├── dashboard.html     # User dashboard
│   ├── courses.html       # Course browsing
│   ├── course-detail.html # Individual course view
│   ├── lesson.html        # Lesson player with quiz support
│   └── support.html       # Support ticket submission
└── admin/                  # Admin portal pages
    ├── login.html         # Admin authentication
    ├── dashboard.html     # Admin dashboard with stats
    ├── courses.html       # AI course generator
    └── blog.html          # Blog post management
```

## Technologies

- **Tailwind CSS** - Via CDN (configured in each HTML file)
- **Google Fonts** - Inter (body) + Sora (headings)
- **GSAP** - For animations
- **Vanilla JavaScript** - No frameworks

## Features

### User Portal
- ✅ Landing page with animated gradient orbs
- ✅ Email/password authentication
- ✅ User dashboard with stats (level, XP, enrollments)
- ✅ Course browsing and enrollment
- ✅ Interactive lesson player with quiz support
- ✅ Support ticket submission

### Admin Portal
- ✅ Admin authentication
- ✅ Dashboard with analytics
- ✅ AI-powered course generation (OpenAI GPT-4o)
- ✅ Blog post management
- ✅ Full CRUD operations

## API Integration

All pages use the `window.API` utility (defined in `/js/api.js`):

```javascript
// Fetch data
const courses = await window.API.request('/api/courses');

// Post data
await window.API.request('/api/login', 'POST', { email, password });

// Check auth
const user = await window.API.checkAuth();

// Logout
await window.API.logout();
```

## Design System

The site maintains the exact same teal/emerald gradient aesthetic as the React version:

- **Primary Colors**: Teal (#14b8a6) to Emerald (#10b981)
- **Accent**: Coral (#fb923c)
- **Background**: Dark (#0c1219)
- **Animated Gradient Orbs**: Three floating orbs with blur effect

## How to Run

The server automatically serves static files from the `public/` directory:

```bash
npm run dev
```

Then visit:
- Landing: http://localhost:5000/
- User Login: http://localhost:5000/pages/login.html
- Admin Login: http://localhost:5000/admin/login.html

## Notes

- No build step required
- No React, Vite, or any frontend framework
- All backend API routes remain unchanged
- Session-based authentication works identically
- Same PostgreSQL database, same Express server
