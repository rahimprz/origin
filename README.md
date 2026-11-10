# Origin Books Publishing — website and team dashboard

React (Vite) site for Origin Books Publishing with GSAP scroll motion, popups, stock video, and an admin dashboard for enquiries, book projects, website content (including contact details) and analytics.

```
/                 home: hero + book starter, manuscript-to-book scroll sequence,
                  service catalogue (5 volumes / 33 services), portfolio (once covers
                  are added), distribution, why Origin, testimonials (once added),
                  video reel, FAQ, enquiry form
/services/:slug   one page per volume: writing, editorial, design, publishing, marketing
/contact          enquiry form, contact details, FAQ
/admin            team dashboard (sign in required)
```

## Before going live

1. **Contact details.** The site shows `info@originbookspublishing.com` and no phone number until you add yours in **Dashboard → Website content → Contact details**. Phone numbers and offices you add there appear in the header, footer, contact page, book planner and the “Talk to us” button.
2. **Proof.** Testimonials and the portfolio shelf start empty and stay hidden. Add real client words and finished covers in **Website content**; nothing is invented.
3. **Services.** The 33 services, process and FAQ live in `shared/catalog.js`. Remove anything Origin does not offer.
4. **Brand basics.** Name, tagline and domain live in `shared/brand.js`.

## Run it locally

Requires Node 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

This starts the API on port 8787 and the site on http://localhost:5173 (Vite proxies `/api` to the API). The dashboard is at http://localhost:5173/admin.

First start creates the admin account. Set your own before you run it the first time:

```bash
ADMIN_EMAIL=you@originbookspublishing.com ADMIN_PASSWORD='a long password' npm run dev
```

If you don't set them, the account is `admin@originbookspublishing.com` / `originbooks` and the dashboard shows a banner until you change the password in **Settings**.

## Deploy

### Option A — Node host (recommended: real login and shared data)

Any host that runs Node (Hostinger VPS, Render, Railway, Fly.io, a plain VPS):

```bash
npm install && npm run build
```

```bash
NODE_ENV=production PORT=8787 SESSION_SECRET='random-64-chars' ADMIN_EMAIL=you@originbookspublishing.com ADMIN_PASSWORD='a long password' npm start
```

`npm start` serves the built site and the API from one process. Put it behind HTTPS (the session cookie is `Secure` in production; set `INSECURE_COOKIES=1` only for a plain-HTTP test).

| Variable | Purpose |
|---|---|
| `PORT` | Port to listen on (default 8787) |
| `SESSION_SECRET` | Signs login cookies. Set it, or everyone is signed out on every restart |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account (only used when no account exists yet) |
| `DATA_DIR` | Where the JSON database lives (default `server/data`). Back this folder up |
| `SEED_DEMO=1` | Fill a brand-new database with labelled sample data |

### Option B — static hosting (Cloudflare, Netlify, Vercel, cPanel / shared hosting)

```bash
npm run build
```

Upload `dist/`. Routing files are included for Cloudflare Workers (`wrangler.jsonc`), Netlify (`netlify.toml`), Vercel (`vercel.json`) and Apache/cPanel (`.htaccess`).

On Cloudflare (Workers & Pages → connect the GitHub repo) use build command `npm run build` and deploy command `npx wrangler deploy`. Do not add a `public/_redirects` file with `/* /index.html 200`: Cloudflare rejects it as an infinite redirect loop. `wrangler.jsonc` already handles routing.

Without the Node API the site runs in **demo mode**: forms and the dashboard work, but data is stored in each visitor's own browser, so enquiries do not reach the team. The dashboard sign-in for demo mode is `demo@originbookspublishing.com` / `demo`. Use Option A for production.

## The dashboard

- **Overview**: new enquiries, won, active projects and site visits with period comparison; enquiries over time; sources; services requested by volume; projects by stage; due dates; latest enquiries. Every chart has a table view.
- **Enquiries**: every website submission (planner, hero starter, contact form, offer popup). Search, filter by status and source, export CSV, open an enquiry to change status, add notes, reply by email, or turn it into a book project.
- **Book projects**: drag books between the six stages (First draft → Editing → Design → Publishing → Distribution → Readers). Each card carries its formats and day count.
- **Website content**: edit the popup offer (text and when it appears), the announcement bar, **contact details** (email, phone numbers, offices), testimonials, portfolio covers and every video, with live previews. Saved changes show on the site immediately.
- **Settings**: change password, export all data, load or remove sample data.

Sample data is synthetic and labelled “Sample” everywhere; remove it in Settings before going live.

## Popups

| Popup | Opens from |
|---|---|
| Book planner (4 steps, builds an Origin Edition cover as the author types) | Every “Start my book” button, hero starter, service pages |
| Offer bookmark (non-blocking; timing set in the dashboard) | Scroll depth, delay or exit intent |
| “How a book is made” chaptered video reel | Hero, reel band |
| Service details side sheet with previous/next | Every service in the catalogue |
| 3D cover viewer (drag to turn the book) | Portfolio shelf (shown once covers are added) |
| Talk to us (phones and email) | Bottom-right button |
| Services contents menu | Header |
| Storage notice | First visit |

All dialogs use the native `<dialog>` element (focus trap, Escape to close) and respect reduced-motion settings.

## Media and credits

- Video: Mixkit stock footage (free licence, https://mixkit.co/license/#videoFree), re-encoded to small H.264 files in `public/media/`: library shelves (50726), writer at a typewriter (10395), typewriter keys (18288), pages turning (3819), old library (18797), reader (1724), mother and daughter reading (4874), stacked books (21587).
- Logo mark, favicon, share image and the two sample covers (*Your Story*, *The Seventh Light*, both credited to “Your Name”): drawn for this site; sources are SVG/HTML, see `public/covers/*.json`.
- Service, process and FAQ copy: written for this site. Review it against what Origin actually offers.
- Fonts (self-hosted via Fontsource): Fraunces, Source Serif 4, Manrope, Courier Prime.

To use your own videos, upload MP4s and paste their URLs in **Dashboard → Website content → Videos**.

## Design system

The visual direction and product brief live in `PRODUCT.md` and `DESIGN.md`. Keep them with the code.
