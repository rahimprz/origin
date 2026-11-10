// One API for the whole app with two adapters:
//   live  — talks to the Node API (/api/*), real login and database
//   demo  — static hosting fallback; data lives in this browser's localStorage
// Mode is detected once by asking /api/health.

import { DEFAULT_CONTENT, generateSample } from '../../shared/seed.js';

const DEMO_KEY = 'obp-demo-v1';
const DEMO_SESSION = 'obp-demo-session';
export const DEMO_LOGIN = { email: 'demo@originbookspublishing.com', password: 'demo' };

let modePromise;
export function getMode() {
  if (!modePromise) {
    modePromise = (async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch('/api/health', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        clearTimeout(t);
        if (!res.ok) return 'demo';
        const body = await res.json();
        return body && body.mode === 'live' ? 'live' : 'demo';
      } catch {
        return 'demo';
      }
    })();
  }
  return modePromise;
}

// ------------------------------------------------------------------ live

class ApiError extends Error {
  constructor(message, status, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

async function http(method, url, body) {
  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('We could not reach the server. Check your connection and try again.', 0);
  }
  if (res.status === 204) return null;
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new ApiError((data && data.error) || `Request failed (${res.status}).`, res.status, data && data.field);
  return data;
}

const live = {
  site: () => http('GET', '/api/site'),
  submitLead: (lead) => http('POST', '/api/leads', lead),
  track: (path) => http('POST', '/api/track', { path }).catch(() => {}),
  me: () => http('GET', '/api/auth/me').then((d) => d.user),
  login: (email, password) => http('POST', '/api/auth/login', { email, password }).then((d) => d.user),
  logout: () => http('POST', '/api/auth/logout'),
  changePassword: (current, next) => http('POST', '/api/auth/password', { current, next }).then((d) => d.user),
  leads: () => http('GET', '/api/admin/leads'),
  updateLead: (id, patch) => http('PATCH', `/api/admin/leads/${id}`, patch),
  deleteLead: (id) => http('DELETE', `/api/admin/leads/${id}`),
  projects: () => http('GET', '/api/admin/projects'),
  createProject: (p) => http('POST', '/api/admin/projects', p),
  updateProject: (id, patch) => http('PATCH', `/api/admin/projects/${id}`, patch),
  deleteProject: (id) => http('DELETE', `/api/admin/projects/${id}`),
  content: () => http('GET', '/api/admin/content'),
  saveContent: (c) => http('PUT', '/api/admin/content', c),
  visits: () => http('GET', '/api/admin/visits'),
  loadSample: () => http('POST', '/api/admin/sample'),
  clearSample: () => http('DELETE', '/api/admin/sample'),
  exportData: async () => {
    const [leads, projects, content, visits] = await Promise.all([live.leads(), live.projects(), live.content(), live.visits()]);
    return { leads, projects, content, visits };
  },
};

// ------------------------------------------------------------------ demo

function readDemo() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      db.content = { ...structuredClone(DEFAULT_CONTENT), ...db.content };
      return db;
    }
  } catch {
    /* corrupted or unavailable storage: start over */
  }
  const sample = generateSample();
  const db = { leads: sample.leads, projects: sample.projects, visits: sample.visits, content: structuredClone(DEFAULT_CONTENT) };
  writeDemo(db);
  return db;
}

function writeDemo(db) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(db));
  } catch {
    /* storage full or blocked; keep working in memory */
  }
  window.dispatchEvent(new CustomEvent('obp:demo-change'));
}

const wait = (ms = 180) => new Promise((r) => setTimeout(r, ms));
const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function requireDemoSession() {
  if (sessionStorage.getItem(DEMO_SESSION) !== '1') throw new ApiError('Please sign in again.', 401);
}

function mutate(fn) {
  const db = readDemo();
  const out = fn(db);
  writeDemo(db);
  return out;
}

const demo = {
  async site() {
    await wait(60);
    const c = readDemo().content;
    return {
      announcement: c.announcement,
      offer: c.offer,
      testimonials: c.testimonials.filter((t) => t.visible !== false),
      portfolio: c.portfolio.filter((p) => p.visible !== false && p.image),
      contact: c.contact || DEFAULT_CONTENT.contact,
      videos: c.videos,
    };
  },
  async submitLead(lead) {
    await wait(650);
    if (lead.company) return { ok: true };
    if (!String(lead.name || '').trim()) throw new ApiError('Please tell us your name.', 400, 'name');
    if (!EMAIL_RE.test(String(lead.email || '').trim())) throw new ApiError('That email address does not look complete.', 400, 'email');
    const record = {
      id: uid('lead'),
      createdAt: Date.now(),
      status: 'new',
      notes: [],
      services: [],
      formats: [],
      source: 'contact',
      ...lead,
      name: String(lead.name).trim(),
      email: String(lead.email).trim().toLowerCase(),
    };
    delete record.company;
    if (!/^https?:\/\/\S+$/i.test(String(record.website || ''))) record.website = '';
    mutate((db) => db.leads.unshift(record));
    return { ok: true, id: record.id };
  },
  async track() {
    mutate((db) => {
      const day = new Date().toISOString().slice(0, 10);
      let row = db.visits.find((v) => v.day === day && !v.sample);
      if (!row) db.visits.push((row = { day, count: 0 }));
      row.count += 1;
    });
  },
  async me() {
    return sessionStorage.getItem(DEMO_SESSION) === '1'
      ? { id: 'demo', email: DEMO_LOGIN.email, name: 'Demo team', mustChangePassword: false, demo: true }
      : null;
  },
  async login(email, password) {
    await wait(400);
    if (String(email).trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) {
      throw new ApiError('That email and password do not match the demo account shown below.', 401);
    }
    sessionStorage.setItem(DEMO_SESSION, '1');
    return demo.me();
  },
  async logout() {
    sessionStorage.removeItem(DEMO_SESSION);
  },
  async changePassword() {
    throw new ApiError('Passwords are managed by the live server. The demo account always uses the password “demo”.', 400);
  },
  async leads() {
    requireDemoSession();
    await wait();
    return readDemo().leads;
  },
  async updateLead(id, patch) {
    requireDemoSession();
    await wait(120);
    return mutate((db) => {
      const lead = db.leads.find((l) => l.id === id);
      if (!lead) throw new ApiError('That enquiry no longer exists.', 404);
      if (patch.status) lead.status = patch.status;
      if (patch.note && patch.note.trim()) lead.notes = [...(lead.notes || []), { at: Date.now(), text: patch.note.trim(), by: DEMO_LOGIN.email }];
      return lead;
    });
  },
  async deleteLead(id) {
    requireDemoSession();
    await wait(120);
    mutate((db) => (db.leads = db.leads.filter((l) => l.id !== id)));
    return { ok: true };
  },
  async projects() {
    requireDemoSession();
    await wait();
    return readDemo().projects;
  },
  async createProject(p) {
    requireDemoSession();
    await wait(150);
    if (!String(p.title || '').trim()) throw new ApiError('Give the project a working title.', 400, 'title');
    const record = { id: uid('proj'), startedAt: Date.now(), stage: 'manuscript', formats: [], services: [], owner: '', dueAt: null, leadId: null, ...p };
    mutate((db) => db.projects.unshift(record));
    return record;
  },
  async updateProject(id, patch) {
    requireDemoSession();
    await wait(90);
    return mutate((db) => {
      const i = db.projects.findIndex((p) => p.id === id);
      if (i < 0) throw new ApiError('That project no longer exists.', 404);
      db.projects[i] = { ...db.projects[i], ...patch };
      return db.projects[i];
    });
  },
  async deleteProject(id) {
    requireDemoSession();
    await wait(90);
    mutate((db) => (db.projects = db.projects.filter((p) => p.id !== id)));
    return { ok: true };
  },
  async content() {
    requireDemoSession();
    await wait(120);
    return readDemo().content;
  },
  async saveContent(c) {
    requireDemoSession();
    await wait(300);
    return mutate((db) => (db.content = c));
  },
  async visits() {
    requireDemoSession();
    return readDemo().visits;
  },
  async loadSample() {
    requireDemoSession();
    const sample = generateSample();
    mutate((db) => {
      db.leads = [...db.leads.filter((l) => !l.sample), ...sample.leads].sort((a, b) => b.createdAt - a.createdAt);
      db.projects = [...db.projects.filter((p) => !p.sample), ...sample.projects];
      db.visits = [...db.visits.filter((v) => !v.sample), ...sample.visits];
    });
    return { ok: true };
  },
  async clearSample() {
    requireDemoSession();
    mutate((db) => {
      db.leads = db.leads.filter((l) => !l.sample);
      db.projects = db.projects.filter((p) => !p.sample);
      db.visits = db.visits.filter((v) => !v.sample);
    });
    return { ok: true };
  },
  async exportData() {
    requireDemoSession();
    const { leads, projects, content, visits } = readDemo();
    return { leads, projects, content, visits };
  },
};

// ------------------------------------------------------------------ facade

export const api = new Proxy(
  {},
  {
    get(_, key) {
      return async (...args) => {
        const mode = await getMode();
        const impl = mode === 'live' ? live : demo;
        if (!impl[key]) throw new Error(`Unknown API call: ${String(key)}`);
        return impl[key](...args);
      };
    },
  },
);

export { ApiError };
