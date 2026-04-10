import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa6';
import useAuthStore from '../store/authStore';

const initialLogin = { email: '', password: '' };
const initialSignup = { name: '', email: '', password: '', confirm: '' };

export default function LoginSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, profile, login, signup, googleSignIn, facebookSignIn, loading } = useAuthStore();

  const [loginForm, setLoginForm] = useState(initialLogin);
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [busy, setBusy] = useState({ login: false, signup: false, google: false, facebook: false });

  const redirectTarget = useMemo(() => {
    if (location.state?.from?.pathname) return location.state.from.pathname;
    const stored = sessionStorage.getItem('chronix_post_verify_path');
    if (stored) return stored;
    return '/';
  }, [location.state]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (profile?.isPhoneVerified) {
      const target = redirectTarget === '/verify-otp' ? '/' : redirectTarget;
      navigate(target, { replace: true });
    } else {
      navigate('/verify-otp', { replace: true });
    }
  }, [isLoggedIn, profile?.isPhoneVerified, navigate, redirectTarget]);

  const handlePostAuth = (requiresOtp) => {
    const needsOtp = Boolean(requiresOtp);
    if (needsOtp) {
      sessionStorage.setItem('chronix_post_verify_path', redirectTarget);
      navigate('/verify-otp', { replace: true, state: { from: location.state?.from } });
    } else {
      const target = redirectTarget === '/verify-otp' ? '/' : redirectTarget;
      navigate(target, { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy((curr) => ({ ...curr, login: true }));
    const result = await login(loginForm.email.trim(), loginForm.password);
    setBusy((curr) => ({ ...curr, login: false }));
    if (result?.success) {
      toast.success('Signed in');
      handlePostAuth(result.requiresOtp);
    } else {
      toast.error(result?.message || 'Could not sign in');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (signupForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setBusy((curr) => ({ ...curr, signup: true }));
    const result = await signup(signupForm.email.trim(), signupForm.password, { name: signupForm.name.trim() });
    setBusy((curr) => ({ ...curr, signup: false }));
    if (result?.success) {
      toast.success('Account created');
      handlePostAuth(result.requiresOtp);
    } else {
      toast.error(result?.message || 'Could not create account');
    }
  };

  const handleGoogle = async () => {
    setBusy((curr) => ({ ...curr, google: true }));
    const result = await googleSignIn();
    setBusy((curr) => ({ ...curr, google: false }));
    if (result?.success) {
      toast.success('Signed in with Google');
      handlePostAuth(result.requiresOtp);
    } else {
      toast.error(result?.message || 'Google sign-in failed');
    }
  };

  const handleFacebook = async () => {
    setBusy((curr) => ({ ...curr, facebook: true }));
    const result = await facebookSignIn();
    setBusy((curr) => ({ ...curr, facebook: false }));
    if (result?.success) {
      toast.success('Signed in with Facebook');
      handlePostAuth(result.requiresOtp);
    } else {
      toast.error(result?.message || 'Facebook sign-in failed');
    }
  };

  const activeTab = location.pathname === '/register' ? 'register' : 'login';

  const goToTab = (tab) => {
    const targetPath = tab === 'register' ? '/register' : '/login';
    if (location.pathname !== targetPath) {
      navigate(`${targetPath}${location.search}`, { replace: true });
    }
  };

  const loginView = (
    <>
      <h2>Welcome back</h2>
      <p>Sign in with email and finish the OTP check on the next step.</p>
      <form onSubmit={handleLogin}>
        <div className="auth-field">
          <label className="auth-label">Email</label>
          <div className="auth-input-wrap">
            <HiOutlineEnvelope size={18} />
            <input
              type="email"
              className="auth-input"
              placeholder="you@email.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <HiOutlineLockClosed size={18} />
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
        </div>
        <button className="auth-submit" disabled={busy.login || loading}>
          {busy.login ? 'Signing in…' : 'Login'}
        </button>
      </form>
      <p className="auth-note">Every login routes through mobile OTP before we unlock the dashboard.</p>
      <div className="auth-divider">OR</div>
      <div className="social-stack">
        <button type="button" className="social-btn" onClick={handleGoogle} disabled={busy.google || loading}>
          <FcGoogle size={20} /> Google
        </button>
        <button type="button" className="social-btn" onClick={handleFacebook} disabled={busy.facebook || loading}>
          <FaFacebookF size={16} color="#1877F2" /> Facebook
        </button>
      </div>
    </>
  );

  const signupView = (
    <>
      <h2>Create account</h2>
      <p>Set up your login and complete mobile verification right after.</p>
      <form onSubmit={handleSignup}>
        <div className="auth-field">
          <label className="auth-label">Full name</label>
          <div className="auth-input-wrap">
            <HiOutlineUser size={18} />
            <input
              className="auth-input"
              placeholder="Your name"
              value={signupForm.name}
              onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
              required
              autoComplete="name"
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label">Email</label>
          <div className="auth-input-wrap">
            <HiOutlineEnvelope size={18} />
            <input
              type="email"
              className="auth-input"
              placeholder="you@email.com"
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrap">
            <HiOutlineLockClosed size={18} />
            <input
              type="password"
              className="auth-input"
              placeholder="At least 8 characters"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label">Confirm password</label>
          <div className="auth-input-wrap">
            <HiOutlineLockClosed size={18} />
            <input
              type="password"
              className="auth-input"
              placeholder="Repeat password"
              value={signupForm.confirm}
              onChange={(e) => setSignupForm({ ...signupForm, confirm: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>
        </div>
        <button className="auth-submit" disabled={busy.signup || loading}>
          {busy.signup ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      <p className="auth-note">We only activate the profile after you verify your mobile number.</p>
    </>
  );

  return (
    <div className="auth-shell d-flex align-items-center justify-content-center p-4">
      <style>{`
        .auth-shell {
          min-height: 100vh;
          background: radial-gradient(circle at top, rgba(212,175,55,0.08), transparent 60%), var(--bg);
        }
        .auth-grid {
          width: min(720px, 100%);
        }
        .auth-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: clamp(24px, 4vw, 36px);
          box-shadow: 0 20px 60px rgba(8,8,8,0.08);
        }
        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 24px;
          background: #f8f7f4;
        }
        .auth-tab {
          border: none;
          border-radius: 999px;
          padding: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          color: var(--t3);
        }
        .auth-tab.active {
          background: #111;
          color: #fff;
        }
        .auth-card h2 {
          font-family: var(--font-heading);
          font-size: 1.45rem;
          margin-bottom: 8px;
        }
        .auth-card p {
          color: var(--t3);
          margin-bottom: 24px;
          font-size: 0.9rem;
        }
        .auth-field {
          margin-bottom: 16px;
        }
        .auth-label {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--t3);
          font-weight: 700;
          margin-bottom: 8px;
        }
        .auth-input-wrap {
          position: relative;
        }
        .auth-input-wrap svg {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: var(--t3);
        }
        .auth-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px 12px 42px;
          font-size: 0.95rem;
          background: #f8f7f4;
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--gold);
          background: #fff;
        }
        .auth-submit {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 12px;
          background: var(--t1);
          color: #fff;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .social-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }
        .social-btn {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #fff;
          font-weight: 600;
          color: var(--t2);
        }
        .auth-note {
          font-size: 0.75rem;
          margin-top: 16px;
          color: var(--t3);
        }
        .auth-divider {
          text-align: center;
          margin: 20px 0;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: var(--t3);
        }
      `}</style>

      <div className="auth-grid">
        <section className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => goToTab('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => goToTab('register')}
            >
              Register
            </button>
          </div>
          {activeTab === 'login' ? loginView : signupView}
        </section>
      </div>
    </div>
  );
}

