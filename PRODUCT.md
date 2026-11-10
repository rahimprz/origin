# Product

## Platform

web

## Stack

React, built with Vite. GSAP + ScrollTrigger (with Lenis) for scroll motion. A small Node/Express API with a JSON-file database and cookie-session login backs the admin dashboard; when no API is reachable (static hosting) the app falls back to a demo mode that stores data in the browser.

## Users

- **Authors** (first-time and experienced) who arrive with an idea, notes, a partial draft or a finished manuscript and need to understand what their book needs next, then trust a team with it.
- **The Origin Books Publishing team** (consultants, project and marketing staff) who use the admin dashboard daily to answer enquiries, move book projects through production, edit what the public site shows, and watch demand.

## Product Purpose

Origin Books Publishing takes authors from first idea to a written, edited, designed, published and distributed book (eBook, paperback, hardcover, audiobook), and then helps it find readers. The public site has to turn a hesitant author into an enquiry; the admin has to make sure no enquiry or project is dropped.

## Positioning

"Where every book begins." Authors can start from any point (idea, notes, draft, finished manuscript) and one team carries the book outward from there: writing, editing, design, publishing, distribution and marketing, in the order the book needs them. Editions are prepared for Amazon KDP and for wider retail, bookstore and library availability (IngramSpark), not one store.

## Operating Context

- Enquiries come from the contact form, the hero book starter, the four-step book planner and the offer popup; the team follows up by email or phone.
- Contact details (email, phone numbers, offices) are edited in the dashboard and shown in the header, footer, contact page, planner and "Talk to us" panel. Default email: info@originbookspublishing.com; no phone until the team adds one.
- A book moves through six stages: First draft → Editing → Design → Publishing → Distribution → Readers.
- 33 services in five volumes, in journey order: Writing (7), Editorial (5), Design & Production (6), Publishing & Distribution (7), Marketing & Author Platform (8).

## Capabilities and Constraints

- Admin manages: enquiries (status, notes, filters, CSV), the book-project board, website content (popup offer, announcement bar, contact details, testimonials, portfolio covers, videos) and an analytics overview.
- Must run as a static build (demo mode) and as a Node-hosted app (real login, persistent data).
- Prices are never quoted on the site.

## Brand Commitments

- Name: Origin Books Publishing ("Origin" for short). Tagline: "Where every book begins".
- Mark: a point of origin inside a growth ring, with an outer ring that opens as a spark escapes (`public/brand/origin-mark.svg`), used as a single-colour mask.
- Voice: warm, plain, author-respectful; short sentences; no hype, no superlatives.

## Evidence on Hand

- None supplied yet. The two covers on the site (*Your Story*, *The Seventh Light*) are sample editions credited to "Your Name", not client work.
- **Absent, never to be fabricated:** figures (books published, authors served, ratings), testimonials, named clients, awards, press logos, prices, turnaround guarantees, phone numbers or addresses. Testimonials and the portfolio stay hidden until the team adds real ones.

## Product Principles

1. Start where the author is: every entry point accepts "just an idea".
2. Show the next step: an author always knows what stage comes next and what to do.
3. One team, one book: every section connects writing, editing, design, publishing and promotion.
4. Nothing dropped: every enquiry and project is visible and owned in the admin.

## Accessibility & Inclusion

WCAG 2.2 AA. All motion respects `prefers-reduced-motion`; background videos are muted, decorative and pausable; popups are keyboard-trappable and dismissible with Escape.
