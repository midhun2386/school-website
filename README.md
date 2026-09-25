# Oakwood International School Website

A modern, responsive, and elegant institutional website for Oakwood International School. Built with pure HTML5, CSS3, and JavaScript, featuring smooth animations, interactive counters, and Neon Postgres integration for admissions management.

## 🌟 Key Features

- **Distinctive Editorial Design**: Curated academic palette (deep forest green `#1F3D2B`, warm cream `#F5F1E8`, warm gold `#C9A66B`) with Playfair Display and Inter typography.
- **Responsive Architecture**: Fully responsive across mobile, tablet, and desktop viewports with a slide-out mobile navigation drawer.
- **Interactive UI**:
  - Glassmorphism sticky navbar with dynamic shadow on scroll.
  - Animated stat counters triggered on scroll entry.
  - Micro-interactions, hover effects, and progressive scroll reveal via `IntersectionObserver`.
- **9 Core Sections**:
  1. **Hero**: High-impact introduction with dual CTAs and quick key statistics.
  2. **Philosophy**: Core educational pillars and values.
  3. **Pathway**: Interactive academic progression from Early Years to Senior Secondary.
  4. **Alumni**: Notable alumni achievements, university placements, and testimonials.
  5. **Faculty**: Academic leadership spotlight and department faculty profiles.
  6. **Admissions**: Live admission application form with full client & server-side validation.
  7. **Vacancies**: Current career opportunities with requirements and direct apply links.
  8. **Help & Support**: Parent & student resources, FAQs, and portal access.
  9. **Contact & Footer**: Campus address, interactive location details, inquiry form, and quick links.
- **Neon Postgres Backend**:
  - Serverless function (`api/admissions.js`) connecting to Neon serverless Postgres.
  - Direct form submission handling with fallback demo handling for standalone static hosting.

## 📁 Project Structure

```
├── # School Website — Blueprint.md   # Architectural blueprint & specification
├── api/
│   └── admissions.js                # Serverless admission submission handler (Neon Postgres)
├── assets/
│   └── images/                      # Curated high-resolution imagery
│       ├── hero.jpg
│       ├── philosophy.jpg
│       ├── pathway-early.jpg
│       ├── pathway-primary.jpg
│       ├── pathway-middle.jpg
│       ├── pathway-secondary.jpg
│       └── pathway-senior.jpg
├── index.html                       # Semantic HTML5 markup for all 9 sections
├── style.css                        # CSS design system, responsive breakpoints, animations
├── script.js                        # Navigation, scroll-reveal, counter animation, form logic
└── README.md                        # Documentation
```

## 🚀 Getting Started

### Static Preview
Simply open `index.html` in any modern web browser or serve it with any local static server:
```bash
# Python 3
python -m http.server 8000

# or npx serve
npx serve .
```

### Serverless Backend Deployment (Vercel / Netlify)
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Set the environment variable:
   ```env
   DATABASE_URL=your_neon_postgres_connection_string
   ```
4. Install `@neondatabase/serverless` if running custom functions:
   ```bash
   npm install @neondatabase/serverless
   ```

## 🗄️ Database Schema (Neon Postgres)

```sql
CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  class_applied TEXT NOT NULL CHECK (class_applied IN (
    'Pre-KG', 'LKG', 'UKG',
    '1st', '2nd', '3rd', '4th', '5th',
    '6th', '7th', '8th', '9th', '10th', '11th', '12th'
  )),
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## 📄 License
MIT License
