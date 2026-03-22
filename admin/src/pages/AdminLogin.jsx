import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import useAdminAuthStore from '../store/adminAuthStore';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { admin, isAdmin } = useAdminAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin && isAdmin) {
      navigate('/');
    }
  }, [admin, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Authenticating...');
    } catch (err) {
      toast.error('Invalid admin credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-obsidian-900 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden grain-overlay">
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-4 p-md-5 rounded-4 w-100 position-relative"
        style={{ maxWidth: '450px' }}
      >
        {/* Top amber shimmer line */}
        <div className="position-absolute top-0 start-0 w-100 rounded-top-4" style={{
          background: 'linear-gradient(90deg, transparent, var(--color-amber), transparent)',
          opacity: 0.5, height: '2px'
        }} />

        <div className="text-center mb-5">
          <div className="mb-3">
            <span className="font-display fw-bold text-white" style={{ fontSize: '1.6rem' }}>
              Chronix<span className="text-amber">.</span>
            </span>
          </div>
          <h1 className="font-display h3 fw-bold text-white mb-2">Admin Portal</h1>
          <p className="text-platinum small mb-0">Sign in with your admin account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label text-uppercase small fw-bold text-platinum tracking-widest mb-2 ps-1"
              style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              Email Address
            </label>
            <div className="position-relative">
              <HiOutlineUser className="position-absolute top-50 translate-middle-y text-platinum"
                style={{ left: '16px', zIndex: 1 }} />
              <input
                type="email"
                required
                className="form-control chronix-input rounded-3 py-3 ps-5 pe-3"
                placeholder="admin@chronix.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="form-label text-uppercase small fw-bold text-platinum tracking-widest mb-2 ps-1"
              style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              Password
            </label>
            <div className="position-relative">
              <HiOutlineLockClosed className="position-absolute top-50 translate-middle-y text-platinum"
                style={{ left: '16px', zIndex: 1 }} />
              <input
                type={showPass ? 'text' : 'password'}
                required
                className="form-control chronix-input rounded-3 py-3 ps-5 pe-5"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn border-0 position-absolute top-50 translate-middle-y text-platinum shadow-none p-1"
                style={{ right: '12px', zIndex: 1, background: 'transparent' }}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-amber w-100 py-3 rounded-3 fw-bold shadow-lg"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm text-black me-2" role="status" />
                Authenticating...
              </>
            ) : (
              'Authorized Entry'
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-top border-white-5 text-center">
          <p className="text-platinum opacity-50 text-uppercase mb-0"
            style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}>
            Internal Security System v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
