# School Website — Blueprint
**Type:** Single-page (SPA-style, anchor navigation) demo site for freelance portfolio
**Stack:** HTML5 + CSS3 + Vanilla JS (no framework) · Neon Postgres (admissions data) · one small serverless API function
**Reference mood:** Editorial/premium school site (cream background, deep-green accents, large serif headings, thin rule lines, animated stat counters) — matches the style of the video you shared.

---

## 1. Goals

- One `index.html`, one `style.css`, one `script.js`. No build tools, no npm, no framework — keeps it easy to hand off and fast to load.
- Looks like a real premium school brand, not a template — big serif headline type, generous whitespace, cream/off-white base with a deep forest-green accent, subtle scroll-reveal animations.
- Every sitemap item becomes a section on the same page, reached via a sticky top nav with smooth-scroll anchors — no page reloads, so it feels instant.
- The **only** thing that needs a server round-trip is the admission form. Everything else is static.
- Optimized for speed: no external UI libraries, system-first font stack (or 1 Google Font, preloaded), compressed/lazy-loaded images, no layout-shifting animations, total JS under ~15KB uncompressed.

---

## 2. Design direction

| Element | Choice |
|---|---|
| Background | Warm cream `#F5F1E8` / off-white |
| Primary accent | Deep forest green `#1F3D2B` (nav, buttons, stat band) |
| Secondary accent | Muted gold/sand `#C9A66B` for small tags/labels |
| Headings | Large serif (e.g. "Playfair Display" or "Fraunces") |
| Body text | Clean sans-serif (e.g. "Inter" or system-ui) |
| Motifs | Thin horizontal rule + small uppercase eyebrow label above every section heading (e.g. "— OUR STORY"); big stat counters (e.g. "25+ Years", "1200+ Students"); rounded floating action buttons (WhatsApp / enquiry) bottom-right |
| Imagery | Full-bleed photo blocks alternating left/right with text, rounded 8–12px corners |
| Motion | Simple fade/slide-up on scroll via `IntersectionObserver`, animated number count-up for stats — both lightweight, no library |

---

## 3. Sitemap → Page sections (single page, anchor-linked)

Sticky nav links scroll to each `id`:

1. `#home` — Hero
2. `#philosophy` — The way the school is built
3. `#pathway` — Academic pathway (Pre-KG → 12th)
4. `#alumni` — Alumni & achievements
5. `#faculty` — School faculty
6. `#admissions` — Admission form
7. `#vacancies` — Careers/vacancies
8. `#help` — How to apply / contact / address
9. `#contact` — Contact + footer

---

## 4. Section-by-section content spec

### 4.1 Header / Nav
- Logo (text or placeholder crest) left, nav links center/right, "Apply Now" button (→ `#admissions`) right.
- Sticky on scroll, background turns solid cream once scrolled past hero (currently transparent-over-hero).

### 4.2 Hero (`#home`)
- Full-width photo/video-style banner (can reuse a static hero image since we're not embedding video).
- Big serif headline + one-line tagline + primary CTA ("Book a Campus Visit" / "Apply Now").
- Stat strip directly below hero: e.g. "25+ Years", "1200+ Students", "98% Board Results", "40+ Faculty" — animated count-up on scroll into view.

### 4.3 Philosophy — "How the school is built" (`#philosophy`)
- Eyebrow label + serif heading ("Built on Purpose" / "The Foundation We Stand On").
- Short welcome note, styled like a pull-quote (large serif quote, small caption "A Note from the Principal").
- 2–3 pillar cards (Values / Infrastructure / Teaching Philosophy) with icon + short text.

### 4.4 Academic Pathway (`#pathway`)
- Eyebrow + heading ("The Path We Walk With Every Student").
- Horizontal stage cards, one per phase, each with a photo, stage name, age/grade range, 2-line description:
  - Pre-KG / LKG / UKG (Early Years)
  - 1st–5th (Primary)
  - 6th–8th (Middle)
  - 9th–10th (Secondary / Board prep)
  - 11th–12th (Senior Secondary / streams)
- This directly reuses the "IB Programme card" layout style from your reference video.

### 4.5 Alumni (`#alumni`)
- Dark green full-width band (matches reference) with 3 stat counters: e.g. "500+ Alumni", "50+ Toppers", "20+ Career Fields".
- Below, on cream background: eyebrow "Where They Are Now" + heading "Outstanding Alumni".
- Grid of achievement cards: student photo (placeholder), name, achievement (board topper / Olympiad / sports / college placement).

### 4.6 School Faculty (`#faculty`)
- Eyebrow + heading ("Meet Our Educators").
- Responsive grid of faculty cards: circular photo, name, subject, qualification (e.g. "M.Sc. Mathematics, B.Ed.").
- Simple CSS grid, 3–4 per row desktop, 1 per row mobile.

### 4.7 Admissions (`#admissions`)
- Eyebrow + heading ("Begin Your Child's Journey").
- Short admission-process blurb (3 steps, numbered).
- **Form fields:**
  - Full Name (text, required)
  - Phone Number (tel, required, pattern-validated)
  - Email (email, required)
  - Address (textarea, required)
  - Class Applying For (select/dropdown, required) — options:
    `Pre-KG, LKG, UKG, 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th, 11th, 12th`
  - Submit button → posts to API → success/error message shown inline (no page reload).
- Client-side validation first (HTML5 `required`, `pattern`, `type=email`) so bad data never reaches the server call.

### 4.8 Vacancies (`#vacancies`)
- Eyebrow + heading ("Join Our Team").
- Simple list/grid of open positions (role title, department, "Apply via email/phone" — for the demo this can just be static cards with a mailto: link, no separate DB needed).

### 4.9 Help Info (`#help`)
- 3-column layout:
  1. **How to Apply** — numbered mini-steps, links to `#admissions`.
  2. **How to Contact** — phone, email, office hours.
  3. **Address** — full address text + embedded Google Map iframe (lazy-loaded).

### 4.10 Contact / Footer (`#contact`)
- School name, short blurb, quick links, social icons, address, phone, email.
- Floating buttons: WhatsApp chat + "Enquire" — fixed bottom-right, matches reference video's floating action buttons.

---

## 5. Admissions data flow (only dynamic part of the site)

```
[Admission Form in index.html]
        │  (fetch POST, JSON)
        ▼
[Serverless function: /api/admissions]
        │  (parameterized SQL insert, via @neondatabase/serverless or pg)
        ▼
[Neon Postgres — admissions table]
```

**Why a serverless function and not "pure static + JS hitting Postgres directly":**
Postgres credentials can never be exposed in browser JS. A tiny serverless function (1 file, e.g. Vercel/Netlify Function or a single Node/Express route) is the minimum backend needed to keep the DB connection string secret. Everything else on the site stays 100% static HTML/CSS/JS — this is the one exception, and it's kept as small as possible.

### 5.1 Neon Postgres schema

```sql
CREATE TABLE admissions (
  id            SERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  address       TEXT NOT NULL,
  class_applied TEXT NOT NULL CHECK (
    class_applied IN (
      'Pre-KG','LKG','UKG',
      '1st','2nd','3rd','4th','5th',
      '6th','7th','8th','9th','10th','11th','12th'
    )
  ),
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.2 API contract

`POST /api/admissions`

Request body:
```json
{
  "full_name": "Aarav Kumar",
  "phone": "9876543210",
  "email": "aarav@example.com",
  "address": "12, Race Course Road, Coimbatore",
  "class_applied": "5th"
}
```

Response (success):
```json
{ "success": true, "message": "Application received." }
```

Response (error):
```json
{ "success": false, "message": "Please fill all required fields correctly." }
```

Server-side does: validate required fields + `class_applied` against the allowed list → parameterized insert (never string-concatenated SQL, avoids injection) → return JSON.

### 5.3 Frontend submit logic (script.js, sketch)
```js
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const res = await fetch('/api/admissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  showMessage(result.message, result.success);
  if (result.success) form.reset();
});
```

---

## 6. File structure

```
school-site/
├── index.html          → all sections, semantic HTML, one file
├── style.css            → single stylesheet, CSS variables for colors/fonts, mobile-first
├── script.js             → nav smooth-scroll, scroll-reveal, stat count-up, admission form submit
├── /assets/
│   ├── images/            → hero, pathway, alumni, faculty photos (WebP, compressed)
│   └── favicon.ico
└── /api/
    └── admissions.js     → single serverless function, connects to Neon via env var connection string
```

---

## 7. Performance checklist

- No CSS/JS frameworks — hand-written CSS with variables, hand-written JS with zero dependencies.
- One font family pair max, loaded with `font-display: swap`, `<link rel="preload">` on the primary weight.
- All images: WebP format, explicit `width`/`height` (no layout shift), `loading="lazy"` on everything below the fold.
- Google Map embedded via `loading="lazy"` iframe, only in the Help section (bottom of page).
- CSS/JS minified for the delivered build; kept unminified in source for client handoff/editing.
- Scroll animations via `IntersectionObserver` only — no scroll-linked JS libraries.
- Admission form works even if JS is slow to load (native HTML5 validation as first line of defense).
- Target: Lighthouse Performance 90+, page weight under ~1.5MB total.

---

## 8. Build order (suggested)

1. HTML skeleton — all sections with placeholder text/images, nav + anchors working.
2. CSS design system — color variables, typography scale, spacing, base components (buttons, cards, eyebrow labels).
3. Section-by-section styling top to bottom (Hero → Contact).
4. JS: smooth scroll, sticky nav state, stat count-up, scroll-reveal.
5. Admission form: markup + client validation + `fetch` wiring.
6. Neon Postgres: create table, add serverless `/api/admissions` function, connect via env variable connection string.
7. Swap placeholder images/copy for real client content once approved.
8. Performance pass: compress images, lazy-load, Lighthouse check.

---

## 9. Notes for the client pitch

- This blueprint intentionally keeps the whole front end framework-free — easy to explain as "fast, no bloat, nothing to break," which is a strong pitch point for a small school budget.
- The Postgres piece is the only "real backend" cost — everything else can be hosted for free/near-free as static files.
- All content in this blueprint (numbers, section names, sample copy) is placeholder — to be swapped with the actual school's real details, photos, and stats before delivery.