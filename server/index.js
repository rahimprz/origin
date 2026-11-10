// Origin Books Publishing API + production static server.
//   npm run dev    -> API on :8787 (Vite proxies /api to it)
//   npm start      -> serves the built site from dist/ and the API on PORT (default 8787)
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as store from './store.js';
import { hashPassword, verifyPassword, setSession, clearSession, sessionUserId } from './auth.js';
import { SERVICES, STAGES, FORMATS, BOOK_STATES, LEAD_STATUSES, LEAD_SOURCES } from '../shared/catalog.js';
import { DEFAULT_CONTENT, generateSample } from '../shared/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const DIST = path.resolve(__dirname, '../dist');

const db = store.load();

// ---- first admin account ---------------------------------------------------
if (!db.users.length) {
  const email = (process.env.ADMIN_EMAIL || 'admin@originbookspublishing.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'originbooks';
  db.users.push({
    id: store.id('user'),
    email,
    name: 'Origin Books Publishing',
    password: hashPassword(password),
    mustChangePassword: !process.env.ADMIN_PASSWORD,
    createdAt: Date.now(),
  });
  store.save();
  console.log(`[admin] Created admin account ${email}${process.env.ADMIN_PASSWORD ? '' : ' with the default password "originbooks". Change it from Settings.'}`);
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '200kb' }));

const ids = (list) => new Set(list.map((x) => x.id));
const SERVICE_IDS = ids(SERVICES);
const STAGE_IDS = ids(STAGES);
const FORMAT_IDS = ids(FORMATS);
const STATE_IDS = ids(BOOK_STATES);
const STATUS_IDS = ids(LEAD_STATUSES);
const SOURCE_IDS = ids(LEAD_SOURCES);

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (v, allowed) => (Array.isArray(v) ? [...new Set(v.filter((x) => allowed.has(x)))] : []);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function publicUser(u) {
  return u && { id: u.id, email: u.email, name: u.name, mustChangePassword: !!u.mustChangePassword };
}

function requireAuth(req, res, next) {
  const uid = sessionUserId(req);
  const user = uid && db.users.find((u) => u.id === uid);
  if (!user) return res.status(401).json({ error: 'Please sign in again.' });
  req.user = user;
  next();
}

// ---- simple in-memory rate limiting for public writes ----------------------
const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

// ---- public ------------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ ok: true, mode: 'live' }));

app.get('/api/site', (req, res) => {
  const c = db.content;
  res.json({
    announcement: c.announcement,
    offer: c.offer,
    testimonials: c.testimonials.filter((t) => t.visible !== false),
    portfolio: c.portfolio.filter((p) => p.visible !== false && p.image),
    contact: c.contact || DEFAULT_CONTENT.contact,
    videos: c.videos,
  });
});

app.post('/api/leads', (req, res) => {
  const b = req.body || {};
  if (str(b.company)) return res.json({ ok: true }); // honeypot
  if (limited(`lead:${req.ip}`, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many enquiries from this connection. Please try again in a few minutes or email us.' });
  }
  const lead = {
    id: store.id('lead'),
    createdAt: Date.now(),
    name: str(b.name, 120),
    email: str(b.email, 200).toLowerCase(),
    phone: str(b.phone, 40),
    bookState: STATE_IDS.has(b.bookState) ? b.bookState : '',
    title: str(b.title, 160),
    genre: str(b.genre, 80),
    website: /^https?:\/\/[^\s]+$/i.test(str(b.website, 200)) ? str(b.website, 200) : '',
    services: list(b.services, SERVICE_IDS),
    formats: list(b.formats, FORMAT_IDS),
    message: str(b.message, 5000),
    source: SOURCE_IDS.has(b.source) ? b.source : 'contact',
    status: 'new',
    notes: [],
  };
  if (!lead.name) return res.status(400).json({ error: 'Please tell us your name.', field: 'name' });
  if (!EMAIL_RE.test(lead.email)) return res.status(400).json({ error: 'That email address does not look complete.', field: 'email' });
  db.leads.unshift(lead);
  store.save();
  res.status(201).json({ ok: true, id: lead.id });
});

app.post('/api/track', (req, res) => {
  if (limited(`track:${req.ip}`, 120, 60 * 1000)) return res.status(204).end();
  const day = new Date().toISOString().slice(0, 10);
  let row = db.visits.find((v) => v.day === day && !v.sample);
  if (!row) db.visits.push((row = { day, count: 0 }));
  row.count += 1;
  store.save();
  res.status(204).end();
});

// ---- auth --------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const email = str(req.body?.email, 200).toLowerCase();
  const password = String(req.body?.password || '');
  if (limited(`login:${req.ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many sign-in attempts. Wait 15 minutes and try again.' });
  }
  const user = db.users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: 'That email and password do not match an account.' });
  }
  setSession(res, user);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const uid = sessionUserId(req);
  const user = uid && db.users.find((u) => u.id === uid);
  res.json({ user: publicUser(user) || null });
});

app.post('/api/auth/password', requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!verifyPassword(String(current || ''), req.user.password)) {
    return res.status(400).json({ error: 'Your current password is not correct.', field: 'current' });
  }
  if (String(next || '').length < 10) {
    return res.status(400).json({ error: 'Use at least 10 characters for the new password.', field: 'next' });
  }
  req.user.password = hashPassword(String(next));
  req.user.mustChangePassword = false;
  store.save();
  res.json({ user: publicUser(req.user) });
});

// ---- admin -------------------------------------------------------------------
const admin = express.Router();
admin.use(requireAuth);

admin.get('/leads', (req, res) => res.json(db.leads));

admin.patch('/leads/:id', (req, res) => {
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'That enquiry no longer exists.' });
  const b = req.body || {};
  if (b.status !== undefined) {
    if (!STATUS_IDS.has(b.status)) return res.status(400).json({ error: 'Unknown status.' });
    lead.status = b.status;
  }
  if (typeof b.note === 'string' && b.note.trim()) {
    lead.notes = [...(lead.notes || []), { at: Date.now(), text: str(b.note, 2000), by: req.user.email }];
  }
  store.save();
  res.json(lead);
});

admin.delete('/leads/:id', (req, res) => {
  const before = db.leads.length;
  db.leads = db.leads.filter((l) => l.id !== req.params.id);
  if (db.leads.length === before) return res.status(404).json({ error: 'That enquiry no longer exists.' });
  store.save();
  res.json({ ok: true });
});

function cleanProject(b, base = {}) {
  return {
    ...base,
    title: b.title !== undefined ? str(b.title, 160) : base.title,
    author: b.author !== undefined ? str(b.author, 120) : base.author,
    owner: b.owner !== undefined ? str(b.owner, 80) : base.owner,
    stage: b.stage !== undefined ? (STAGE_IDS.has(b.stage) ? b.stage : base.stage || 'manuscript') : base.stage,
    formats: b.formats !== undefined ? list(b.formats, FORMAT_IDS) : base.formats,
    services: b.services !== undefined ? list(b.services, SERVICE_IDS) : base.services,
    dueAt: b.dueAt !== undefined ? (Number(b.dueAt) || null) : base.dueAt,
    leadId: b.leadId !== undefined ? str(b.leadId, 80) || null : base.leadId,
  };
}

admin.get('/projects', (req, res) => res.json(db.projects));

admin.post('/projects', (req, res) => {
  const p = cleanProject(req.body || {}, { id: store.id('proj'), startedAt: Date.now(), stage: 'manuscript', formats: [], services: [], owner: '', dueAt: null, leadId: null });
  if (!p.title) return res.status(400).json({ error: 'Give the project a working title.', field: 'title' });
  db.projects.unshift(p);
  store.save();
  res.status(201).json(p);
});

admin.patch('/projects/:id', (req, res) => {
  const i = db.projects.findIndex((p) => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'That project no longer exists.' });
  db.projects[i] = cleanProject(req.body || {}, db.projects[i]);
  store.save();
  res.json(db.projects[i]);
});

admin.delete('/projects/:id', (req, res) => {
  db.projects = db.projects.filter((p) => p.id !== req.params.id);
  store.save();
  res.json({ ok: true });
});

admin.get('/content', (req, res) => res.json(db.content));

admin.put('/content', (req, res) => {
  const b = req.body || {};
  const next = { ...db.content };
  for (const key of Object.keys(DEFAULT_CONTENT)) if (b[key] !== undefined) next[key] = b[key];
  // light shape checks
  if (!Array.isArray(next.testimonials) || !Array.isArray(next.portfolio)) {
    return res.status(400).json({ error: 'Content is missing testimonials or portfolio lists.' });
  }
  if (next.contact) {
    const c = next.contact;
    next.contact = {
      email: str(c.email, 200),
      offices: (Array.isArray(c.offices) ? c.offices : []).slice(0, 6).map((o) => ({
        id: str(o?.id, 40) || store.id('office'),
        region: str(o?.region, 60),
        phone: str(o?.phone, 40),
        address: String(o?.address ?? '').slice(0, 300),
      })),
    };
    if (next.contact.email && !EMAIL_RE.test(next.contact.email)) {
      return res.status(400).json({ error: 'The contact email address does not look complete.' });
    }
  }
  db.content = next;
  store.save();
  res.json(db.content);
});

admin.get('/visits', (req, res) => res.json(db.visits));

admin.post('/sample', (req, res) => {
  const sample = generateSample();
  db.leads = [...db.leads.filter((l) => !l.sample), ...sample.leads].sort((a, b) => b.createdAt - a.createdAt);
  db.projects = [...db.projects.filter((p) => !p.sample), ...sample.projects];
  db.visits = [...db.visits.filter((v) => !v.sample), ...sample.visits];
  store.save();
  res.json({ ok: true });
});

admin.delete('/sample', (req, res) => {
  db.leads = db.leads.filter((l) => !l.sample);
  db.projects = db.projects.filter((p) => !p.sample);
  db.visits = db.visits.filter((v) => !v.sample);
  store.save();
  res.json({ ok: true });
});

admin.get('/export', (req, res) => {
  const { users, ...rest } = db;
  res.setHeader('Content-Disposition', `attachment; filename="origin-export-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(rest);
});

app.use('/api/admin', admin);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---- static site (production) ----------------------------------------------
if (existsSync(DIST)) {
  app.use(
    express.static(DIST, {
      index: false,
      setHeaders(res, file) {
        if (/\/assets\//.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    }),
  );
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
});

app.listen(PORT, () => console.log(`[api] Origin Books Publishing listening on http://localhost:${PORT}`));
