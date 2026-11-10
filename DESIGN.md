---
name: Origin Books Publishing
description: Growth rings. Every book grows outward from one point of origin.
colors:
  house: "#2a1a3b"
  house-deep: "#1b1027"
  house-lift: "#3e2a55"
  on-house: "#f7f1ea"
  on-house-soft: "#cbbcd8"
  paper: "#faf6f0"
  paper-2: "#f1ebe2"
  paper-3: "#e3dacd"
  ink: "#1f1824"
  ink-2: "#4e4553"
  ink-3: "#6a6072"
  copper: "#c4875c"
  copper-bright: "#e3a77c"
  proof-red: "#c2412b"
  writing-olive: "#46552b"
  editorial-mulberry: "#7a2a48"
  design-indigo: "#2d3a80"
  publishing-petrol: "#1b4a57"
  marketing-terracotta: "#e8693e"
  chart-writing: "#6b8a2c"
  chart-editorial: "#c2477a"
  chart-design: "#4b5fd1"
  chart-publishing: "#1f8a9c"
  chart-marketing: "#e8693e"
typography:
  display: "Fraunces Variable (opsz), weight 600, sentence case, -0.01em to -0.02em"
  body: "Source Serif 4 Variable (opsz), 400, 1.0625rem / 1.65"
  ui: "Manrope Variable, 500–700, for navigation, buttons, labels, tables"
  manuscript: "Courier Prime, only for the typed manuscript page"
rounded:
  button: "999px (pill)"
  control: "8px"
  panel: "14px"
  field: "0px (full-bleed ink sections stay square)"
spacing:
  gutter: "clamp(20px, 4vw, 64px)"
  section: "clamp(96px, 14vh, 160px)"
---

# Design System: Origin Books Publishing

## North Star: "Growth Rings"

A tree grows outward from one point, a ring at a time, and the rings are where paper comes from. The site uses that as its one idea: every book starts at a point of origin (an idea, notes, a draft) and grows outward through writing, editing, design, publishing and readers. The mark is that point inside its rings; the hero book sits at the centre of faint rings on paper; the closing call to action sits inside rings on the house aubergine.

The structure is inherited from a proven publishing-site skeleton (sticky section spine, pinned manuscript-to-book sequence, horizontal service volumes, book planner, admin dashboard), restyled so nothing reads as the sibling brand.

## Colour

- **House Aubergine** frames everything: masthead, spine, footer, primary buttons, dialogs' dark sides, the admin sidebar.
- **Terracotta** is the single action colour (every "Start my book"), the announcement strip and the Marketing volume. Text on it is near-black (#24130c), never white.
- **Copper** (copper, copper-bright) is the foil: series numbers, the mark on dark fields, active nav rules. Small doses only.
- **Volume inks**, in the order a book needs them: olive (Writing), mulberry (Editorial), indigo (Design & Production), petrol (Publishing & Distribution), terracotta (Marketing & Author Platform). Each ink field defines its own readable foreground and soft foreground in `tokens.css`; contrast is 5:1 or better for body text on every field.
- **Warm paper** (paper, paper-2, paper-3) carries the reading. Ink, Ink 2 and Ink 3 for text on paper.
- Footage is overprinted into the ink of the field it sits in (luminosity + colour blend), never shown in full colour.

## Typography

- **Fraunces** for what the book says: titles, section headings, volume names, the planner's cover. Sentence case, weight 600, optical sizing on.
- **Source Serif 4** for what people read: body copy, decks (italic), quotes, FAQ answers.
- **Manrope** for what people operate: navigation, buttons, chips, labels, tables, the admin's data.
- Small labels (stage numbers, format bands, table headers) are Manrope uppercase with open tracking and never sit above a heading.

## Shape and depth

- Buttons are pills; inputs and chips have 8px corners; floating panels 14px. Full-bleed ink sections stay square so the colour fields read as bands.
- Flat by default: structure comes from ink fields and 1px hairlines. Two shadows only: a lift for floating things and a book shadow for 3D books.

## Signatures

- **The spine**: a 64px strip on the left (1024px and up) that takes the ink of the section in view, with its number, title and a copper progress rule.
- **Manuscript to book**: a pinned six-stage sequence; a typed page gets red-pencil edits, flips into the *Seventh Light* cover, becomes hardcover, paperback and eBook, goes out to stores, then reaches a reader. The section re-inks at every stage.
- **Origin Edition cover**: the book planner builds a cover live from the author's working title and name.
- **Growth rings**: `--rings` (on dark) and `--rings-ink` (on paper) background motifs. Use at most one ring field per viewport.

## Rules

- Do give every section one ink as its ground and register it with the spine (`data-spine="No.|Title|ink"`).
- Do keep one terracotta action per viewport.
- Do respect reduced motion: no pins, no smooth scrolling, every item reachable.
- Don't use gradients, glass effects, or coloured side stripes on cards.
- Don't show figures, prices, client names, testimonials or awards the business has not supplied.
