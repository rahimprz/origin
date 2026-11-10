import { useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, Link } from 'react-router-dom';
import { ExternalLink, FileText, Inbox, KanbanSquare, LayoutDashboard, LogOut, Menu, Settings as Cog, X, CircleCheck, CircleAlert } from 'lucide-react';
import '../styles/popups.css';
import '../styles/admin.css';
import { AdminProvider, useAdmin } from './AdminContext.jsx';
import Login from './Login.jsx';
import Overview from './Overview.jsx';
import Leads from './Leads.jsx';
import Projects from './Projects.jsx';
import Content from './Content.jsx';
import Settings from './Settings.jsx';
import { BRAND } from '../../shared/brand.js';

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: 'new' },
  { to: '/admin/projects', label: 'Book projects', icon: KanbanSquare },
  { to: '/admin/content', label: 'Website content', icon: FileText },
  { to: '/admin/settings', label: 'Settings', icon: Cog },
];

function Toasts() {
  const { toasts, dismissToast } = useAdmin();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          {t.tone === 'bad' ? <CircleAlert aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
          <span>{t.message}</span>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <X aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ModeChip() {
  const { mode } = useAdmin();
  if (!mode) return null;
  return mode === 'live' ? (
    <span className="mode mode--live" title={`Connected to the ${BRAND.name} server`}>
      <span className="mode__dot" /> Live server
    </span>
  ) : (
    <span className="mode mode--demo" title="No server found. Data is stored in this browser only.">
      <span className="mode__dot" /> Demo mode · saved in this browser
    </span>
  );
}

function Shell() {
  const { user, signOut, data, load } = useAdmin();
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setNavOpen(false), [pathname]);
  useEffect(() => {
    load('leads');
  }, [load]);

  const newCount = data.leads ? data.leads.filter((l) => l.status === 'new').length : null;

  return (
    <div className={`admin${navOpen ? ' nav-open' : ''}`}>
      <aside className="a-side" data-ink="house">
        <Link to="/admin" className="a-brand">
          <span className="nib" aria-hidden="true" />
          <span>
            <span className="a-brand__name">{BRAND.name}</span>
            <span className="a-brand__line">Team dashboard</span>
          </span>
        </Link>
        <nav className="a-nav" aria-label="Dashboard">
          {NAV.map(({ to, end, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={end} className="a-nav__item">
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {badge && newCount ? (
                <span className="a-nav__badge" aria-label={`${newCount} new`}>
                  {newCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className="a-side__foot">
          <a className="a-nav__item" href="/" target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            <span>View website</span>
          </a>
          <div className="a-user">
            <span className="a-user__avatar" aria-hidden="true">
              {(user?.name || user?.email || '?').slice(0, 1).toUpperCase()}
            </span>
            <span className="a-user__email">{user?.email}</span>
            <button type="button" className="a-iconbtn a-iconbtn--dark" onClick={signOut} title="Sign out">
              <LogOut aria-hidden="true" />
              <span className="sr-only">Sign out</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="a-main">
        <header className="a-top">
          <button type="button" className="a-iconbtn a-top__menu" onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen} aria-label="Menu">
            {navOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <ModeChip />
        </header>
        {user?.mustChangePassword && (
          <p className="a-banner">
            You are using the default password. <Link to="/admin/settings">Change it in Settings</Link> before sharing this dashboard.
          </p>
        )}
        <main className="a-page" id="admin-main">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="enquiries" element={<Leads />} />
            <Route path="projects" element={<Projects />} />
            <Route path="content" element={<Content />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
      <div className="a-scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />
    </div>
  );
}

function Gate() {
  const { user } = useAdmin();
  useEffect(() => {
    document.title = `Dashboard | ${BRAND.name}`;
  }, []);
  if (user === undefined) {
    return (
      <div className="admin-loading" role="status">
        <span className="nib" aria-hidden="true" />
        <span>Opening the dashboard…</span>
      </div>
    );
  }
  return user ? <Shell /> : <Login />;
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <Gate />
      <Toasts />
    </AdminProvider>
  );
}
