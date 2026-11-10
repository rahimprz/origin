// Default site content plus a deterministic generator for SAMPLE data.
// Sample leads/projects are synthetic and always flagged `sample: true` so the
// admin can label them and the team can clear them in one action.

import { SERVICES, STAGES, LEAD_STATUSES } from './catalog.js';
import { DEFAULT_CONTACT } from './brand.js';

export const DEFAULT_CONTENT = {
  announcement: {
    enabled: true,
    text: 'Speak with a publishing consultant about your book.',
    linkLabel: 'Start my book',
    action: 'planner',
  },
  offer: {
    enabled: true,
    title: 'Have a manuscript, or just the idea of one?',
    body: 'Tell us where your book stands today. We will reply with the next step, whether that is writing, editing, design or publishing.',
    cta: 'Start my book',
    trigger: 'scroll',
    delaySeconds: 25,
    scrollPercent: 45,
    snoozeDays: 7,
  },
  contact: structuredClone(DEFAULT_CONTACT),
  // Add real client words from the dashboard. Never invent them.
  testimonials: [],
  // Add finished covers from the dashboard. The section stays hidden until one is visible.
  portfolio: [],
  videos: {
    hero: { src: '/media/shelf.mp4', poster: '/media/shelf.webp', label: 'Library shelves' },
    readers: { src: '/media/reader.mp4', poster: '/media/reader.webp', label: 'A reader with a finished book' },
    showreel: [
      { id: 'v1', chapter: 'Writing', src: '/media/typewriter.mp4', poster: '/media/typewriter.webp' },
      { id: 'v2', chapter: 'Editing', src: '/media/keystrike.mp4', poster: '/media/keystrike.webp' },
      { id: 'v3', chapter: 'Design', src: '/media/pages.mp4', poster: '/media/pages.webp' },
      { id: 'v4', chapter: 'Distribution', src: '/media/library.mp4', poster: '/media/library.webp' },
      { id: 'v5', chapter: 'Readers', src: '/media/reader.mp4', poster: '/media/reader.webp' },
    ],
  },
};

// ---------------------------------------------------------------- sample data

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Amelia', 'Marcus', 'Priya', 'Owen', 'Hannah', 'Tobias', 'Leila', 'Grace', 'Samuel', 'Nadia', 'Felix', 'Rosa', 'Imran', 'Clara', 'Elliot', 'Maya', 'Joseph', 'Ines', 'Daniel', 'Harriet', 'Kwame', 'Lucy', 'Arjun', 'Beatrice'];
const LAST = ['Hart', 'Okafor', 'Lindqvist', 'Mercer', 'Patel', 'Doyle', 'Haddad', 'Ashby', 'Moreau', 'Kowalski', 'Bennett', 'Osei', 'Sato', 'Fairley', 'Quinn', 'Rahman', 'Whitlock', 'Navarro'];
const TITLES = ['A Map of Quiet Rivers', 'The Glasshouse Year', 'Salt and Ember', 'What the Tide Kept', 'Letters to Ravensmoor', 'The Long Field', 'Small Hours in Lisbon', 'Under the Copper Sky', 'The Ninth Winter', 'Notes from the Night Ferry', 'Kitchen Table Wisdom', 'The Orchard Keeper', 'Built on Monday', 'Running the Coast Road', 'A House of Paper Birds', 'The Cartographer’s Daughter'];
const GENRES = ['Literary fiction', 'Memoir', 'Thriller', 'Business', 'Self-help', 'Children’s', 'Fantasy', 'History', 'Romance', 'Poetry'];
const MESSAGES = [
  'I have a finished manuscript of about 80,000 words and would like help with editing and getting it onto Amazon.',
  'I have been writing my father’s story for two years and need help pulling it together into a book.',
  'Looking for a cover and interior design for my second novel. First one was self-published.',
  'I have an outline and some chapters. Interested in ghostwriting support to finish it.',
  'Would like to understand distribution beyond Amazon, especially libraries and bookstores.',
  'Need an audiobook edition of my existing paperback.',
  'Planning a launch for spring and want to discuss marketing and an author website.',
  'Children’s picture book, text complete, need illustration and printing guidance.',
];

const DAY = 86400000;

export function generateSample(now = Date.now(), seed = 20261110) {
  const r = rng(seed);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const some = (arr, min, max) => {
    const n = min + Math.floor(r() * (max - min + 1));
    const copy = [...arr];
    const out = [];
    while (out.length < n && copy.length) out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
    return out;
  };
  const sources = ['planner', 'planner', 'planner', 'contact', 'contact', 'starter', 'offer', 'offer'];
  const states = ['idea', 'notes', 'partial', 'finished', 'finished'];
  const weightedServices = SERVICES.flatMap((s) =>
    ['line-editing', 'cover-design', 'amazon-kdp', 'ghostwriting', 'launch-plan', 'manuscript-assessment'].includes(s.id) ? [s.id, s.id, s.id] : [s.id],
  );

  const leads = [];
  for (let i = 0; i < 58; i++) {
    // more recent days are busier
    const ageDays = Math.floor(Math.pow(r(), 1.35) * 90);
    const createdAt = now - ageDays * DAY - Math.floor(r() * DAY);
    const first = pick(FIRST);
    const last = pick(LAST);
    let status = 'new';
    if (ageDays > 3) status = pick(['contacted', 'contacted', 'proposal', 'won', 'lost', 'new']);
    if (ageDays > 30) status = pick(['won', 'won', 'lost', 'proposal', 'contacted']);
    leads.push({
      id: `s-lead-${i + 1}`,
      sample: true,
      createdAt,
      name: `${first} ${last}`,
      email: `${first}.${last}@example.com`.toLowerCase(),
      phone: '',
      bookState: pick(states),
      title: r() > 0.35 ? pick(TITLES) : '',
      genre: pick(GENRES),
      services: Array.from(new Set(some(weightedServices, 1, 3))),
      formats: some(['ebook', 'paperback', 'hardcover', 'audiobook'], 1, 3),
      message: pick(MESSAGES),
      source: pick(sources),
      status,
      notes: status !== 'new' ? [{ at: createdAt + DAY * 0.6, text: 'Called and sent the welcome pack.' }] : [],
    });
  }
  leads.sort((a, b) => b.createdAt - a.createdAt);

  const projects = [];
  const won = leads.filter((l) => l.status === 'won');
  for (let i = 0; i < 14; i++) {
    const lead = won[i % Math.max(1, won.length)];
    const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(r() * STAGES.length))].id;
    const startedAt = now - Math.floor(10 + r() * 120) * DAY;
    projects.push({
      id: `s-proj-${i + 1}`,
      sample: true,
      title: TITLES[(i + 3) % TITLES.length],
      author: lead ? lead.name : `${pick(FIRST)} ${pick(LAST)}`,
      leadId: lead ? lead.id : null,
      stage,
      formats: some(['ebook', 'paperback', 'hardcover', 'audiobook'], 1, 3),
      services: Array.from(new Set(some(weightedServices, 2, 4))),
      startedAt,
      dueAt: startedAt + Math.floor(60 + r() * 120) * DAY,
      owner: pick(['Editorial team', 'Design team', 'Publishing team', 'Marketing team']),
    });
  }

  const visits = [];
  for (let d = 89; d >= 0; d--) {
    const day = new Date(now - d * DAY);
    const key = day.toISOString().slice(0, 10);
    const weekday = day.getUTCDay();
    const base = 140 + (89 - d) * 1.4;
    const weekly = weekday === 0 || weekday === 6 ? 0.72 : 1;
    visits.push({ day: key, count: Math.round(base * weekly * (0.85 + r() * 0.3)), sample: true });
  }

  return { leads, projects, visits };
}

export const STATUS_IDS = LEAD_STATUSES.map((s) => s.id);
