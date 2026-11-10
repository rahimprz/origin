import { useState } from 'react';
import { Download, Database, KeyRound, Server } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAdmin } from './AdminContext.jsx';
import { ConfirmDelete, Field, PageHead, downloadFile } from './ui.jsx';
import { BRAND } from '../../shared/brand.js';

export default function Settings() {
  const { user, setUser, mode, toast, handleError, load } = useAdmin();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    const errs = {};
    if (!pw.current) errs.current = 'Enter your current password.';
    if (pw.next.length < 10) errs.next = 'Use at least 10 characters.';
    if (pw.next !== pw.confirm) errs.confirm = 'The two new passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = await api.changePassword(pw.current, pw.next);
      setUser(u);
      setPw({ current: '', next: '', confirm: '' });
      toast('Password changed.');
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      else handleError(err);
    } finally {
      setBusy(false);
    }
  }

  async function exportAll() {
    try {
      const data = await api.exportData();
      downloadFile(`origin-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2));
    } catch (err) {
      handleError(err);
    }
  }

  async function sample(action) {
    try {
      if (action === 'load') await api.loadSample();
      else await api.clearSample();
      await Promise.all(['leads', 'projects', 'visits'].map((k) => load(k, true)));
      toast(action === 'load' ? 'Sample data loaded. It is labelled “Sample” everywhere.' : 'Sample data removed.');
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <>
      <PageHead title="Settings" sub={`Signed in as ${user?.email}`} />
      <div className="settings">
        <section className="a-card" aria-labelledby="set-pw">
          <h2 className="a-h2" id="set-pw">
            <KeyRound aria-hidden="true" /> Password
          </h2>
          {mode === 'live' ? (
            <form className="a-form-inline" onSubmit={changePassword} noValidate>
              <Field label="Current password" error={errors.current}>
                <input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </Field>
              <Field label="New password" hint="at least 10 characters" error={errors.next}>
                <input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </Field>
              <Field label="Repeat the new password" error={errors.confirm}>
                <input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </Field>
              <button type="submit" className="btn btn--small" disabled={busy}>
                Change password
              </button>
            </form>
          ) : (
            <p className="a-sub">The demo account always uses the password “demo”. Passwords are managed by the live server.</p>
          )}
        </section>

        <section className="a-card" aria-labelledby="set-data">
          <h2 className="a-h2" id="set-data">
            <Database aria-hidden="true" /> Data
          </h2>
          <p className="a-sub">Download everything as JSON for backups or to move to another system.</p>
          <button type="button" className="btn btn--ghost btn--small" onClick={exportAll}>
            <Download aria-hidden="true" /> Export all data
          </button>
          <hr className="a-rule" />
          <h3 className="a-h3">Sample data</h3>
          <p className="a-sub">Synthetic enquiries, projects and visits for training or a demo. Every sample record is labelled “Sample”.</p>
          <div className="a-row">
            <button type="button" className="btn btn--ghost btn--small" onClick={() => sample('load')}>
              Load sample data
            </button>
          </div>
          <div className="a-isolated">
            <ConfirmDelete label="Remove all sample data" confirmLabel="Yes, remove samples" note="Real enquiries and projects are not touched." onConfirm={() => sample('clear')} />
          </div>
        </section>

        <section className="a-card" aria-labelledby="set-server">
          <h2 className="a-h2" id="set-server">
            <Server aria-hidden="true" /> Server
          </h2>
          {mode === 'live' ? (
            <>
              <p className="a-sub">Connected to the {BRAND.name} server. Enquiries are stored on the server and every team member sees the same data.</p>
              <dl className="facts">
                <div>
                  <dt>Admin email</dt>
                  <dd>
                    Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> before the first start.
                  </dd>
                </div>
                <div>
                  <dt>Sessions</dt>
                  <dd>
                    Set <code>SESSION_SECRET</code> so sign-ins survive a restart.
                  </dd>
                </div>
                <div>
                  <dt>Data folder</dt>
                  <dd>
                    <code>DATA_DIR</code> (default <code>server/data</code>). Back it up.
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="a-sub">
              Demo mode: no server was found, so everything you change is stored in this browser only. Deploy with <code>npm start</code> on a Node host to share real data with the team.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
