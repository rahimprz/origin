// Tiny JSON-file database. Writes are serialised and atomic (temp file + rename),
// which is plenty for a small team's leads, projects and site content.
import { promises as fs } from 'node:fs';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONTENT, generateSample } from '../shared/seed.js';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'server/data');
const FILE = path.join(DATA_DIR, 'db.json');

const EMPTY = () => ({
  users: [],
  leads: [],
  projects: [],
  visits: [],
  content: structuredClone(DEFAULT_CONTENT),
  meta: { createdAt: Date.now() },
});

let db;
let queue = Promise.resolve();

export function load() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (existsSync(FILE)) {
    db = { ...EMPTY(), ...JSON.parse(readFileSync(FILE, 'utf8')) };
    // content keys added in later versions get their defaults
    db.content = { ...structuredClone(DEFAULT_CONTENT), ...db.content };
  } else {
    db = EMPTY();
    if (process.env.SEED_DEMO === '1') {
      const sample = generateSample();
      db.leads = sample.leads;
      db.projects = sample.projects;
      db.visits = sample.visits;
    }
  }
  return db;
}

export function get() {
  return db;
}

export function save() {
  const snapshot = JSON.stringify(db, null, 2);
  queue = queue.then(async () => {
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, snapshot);
    await fs.rename(tmp, FILE);
  });
  return queue;
}

export function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
