import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, getMode } from '../lib/api.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [mode, setMode] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = checking
  const [data, setData] = useState({ leads: null, projects: null, visits: null, content: null });
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const loading = useRef({});

  useEffect(() => {
    getMode().then(setMode);
    api
      .me()
      .then((u) => setUser(u || null))
      .catch(() => setUser(null));
  }, []);

  const toast = useCallback((message, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const handleError = useCallback(
    (err) => {
      if (err && err.status === 401) {
        setUser(null);
        toast('Your session ended. Please sign in again.', 'bad');
      } else toast(err?.message || 'Something went wrong. Please try again.', 'bad');
    },
    [toast],
  );

  const load = useCallback(
    async (key, force = false) => {
      if (!force && (data[key] || loading.current[key])) return;
      loading.current[key] = true;
      try {
        const value = await api[key]();
        setData((d) => ({ ...d, [key]: value }));
        setErrors((e) => ({ ...e, [key]: null }));
      } catch (err) {
        setErrors((e) => ({ ...e, [key]: err.message || 'Could not load.' }));
        if (err.status === 401) setUser(null);
      } finally {
        loading.current[key] = false;
      }
    },
    [data],
  );

  const patch = useCallback((key, fn) => setData((d) => ({ ...d, [key]: fn(d[key]) })), []);

  const signIn = useCallback(async (email, password) => {
    const u = await api.login(email, password);
    setData({ leads: null, projects: null, visits: null, content: null });
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
    setData({ leads: null, projects: null, visits: null, content: null });
  }, []);

  const value = useMemo(
    () => ({ mode, user, setUser, data, errors, load, patch, toast, toasts, dismissToast, handleError, signIn, signOut }),
    [mode, user, data, errors, load, patch, toast, toasts, dismissToast, handleError, signIn, signOut],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}

/** Load one or more collections when a page mounts. */
export function useCollections(...keys) {
  const { data, errors, load } = useAdmin();
  useEffect(() => {
    keys.forEach((k) => load(k));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ready = keys.every((k) => data[k]);
  const error = keys.map((k) => errors[k]).find(Boolean);
  return { ready, error, reload: () => keys.forEach((k) => load(k, true)) };
}

// ---- formatting helpers ----------------------------------------------------
const DAY = 86400000;
export const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtShort = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const fmtNum = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : n.toLocaleString('en-GB'));
export function ago(t) {
  const d = Date.now() - t;
  if (d < 60000) return 'just now';
  if (d < 3600000) return `${Math.floor(d / 60000)} min ago`;
  if (d < DAY) return `${Math.floor(d / 3600000)} h ago`;
  const days = Math.floor(d / DAY);
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`;
  return fmtShort(t);
}
export const daysBetween = (a, b) => Math.round((b - a) / DAY);
export { DAY };
