import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!username || !password) return toast.error('Enter credentials');

    setLoading(true);
    // Mock latency
    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);
      if (success) {
        toast.success(`Welcome back, ${username}`);
        navigate('/');
      } else {
        toast.error('Invalid credentials (admin/admin1234)');
      }
    }, 800);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{ width: '100%', maxWidth: 420, padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'rgba(212,175,55,0.1)',
            color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <HiOutlineLockClosed size={24} />
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem',
            fontWeight: 500, color: '#F0EDE8' }}>Sign In</h1>
          <p style={{ color: '#5A5652', fontSize: '0.85rem', marginTop: 8 }}>
            Access your Chronix account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Username</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3A3A3A' }} />
              <input
                className="input" style={{ paddingLeft: 40 }}
                placeholder="admin"
                value={username} onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3A3A3A' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="input" style={{ paddingLeft: 40, paddingRight: 44 }}
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#3A3A3A', cursor: 'pointer' }}
              >
                {showPass ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        <p style={{ color: '#3A3A3A', fontSize: '0.8rem', textAlign: 'center', marginTop: 24 }}>
          Don't have an account? <Link to="/login" style={{ color: '#5A5652', textDecoration: 'none' }}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
