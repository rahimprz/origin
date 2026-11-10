import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAdmin } from './AdminContext.jsx';
import { DEMO_LOGIN } from '../lib/api.js';
import { BRAND } from '../../shared/brand.js';

export default function Login() {
  const { signIn, mode } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <section className="login__cover" data-ink="house" aria-hidden="true">
        <span className="nib login__nib" />
        <p className="login__series">{BRAND.series}</p>
        <p className="login__title">Team dashboard</p>
        <p className="login__line">Enquiries, book projects and the website, in one place.</p>
        <img className="login__book" src="/covers/your-story.webp" alt="" width="853" height="1280" />
      </section>
      <section className="login__panel">
        <form className="login__form" onSubmit={submit} noValidate>
          <h1>Sign in</h1>
          <p className="a-sub">{BRAND.name} team only.</p>
          <label className="a-field">
            <span>Email address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
          </label>
          <label className="a-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          {error && (
            <p className="a-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="spin" aria-hidden="true" /> Signing in
              </>
            ) : (
              <>
                Sign in <ArrowRight className="arrow" aria-hidden="true" />
              </>
            )}
          </button>
          {mode === 'demo' && (
            <div className="login__demo">
              <p>
                <strong>Demo mode.</strong> No server was found, so this dashboard runs on sample data stored in your browser.
              </p>
              <p>
                Email <code>{DEMO_LOGIN.email}</code> · Password <code>{DEMO_LOGIN.password}</code>
              </p>
              <button
                type="button"
                className="a-link"
                onClick={() => {
                  setEmail(DEMO_LOGIN.email);
                  setPassword(DEMO_LOGIN.password);
                }}
              >
                Fill in the demo account
              </button>
            </div>
          )}
          <a className="a-link login__back" href="/">
            Back to the website
          </a>
        </form>
      </section>
    </div>
  );
}
