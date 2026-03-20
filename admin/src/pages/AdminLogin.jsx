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
  const { isAdmin, isLoggedIn } = useAdminAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      navigate('/');
    }
  }, [isLoggedIn, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // initAdminAuthListener will handle the state update and redirect via useEffect or ProtectedRoute
      toast.success('Authenticating...');
    } catch (err) {
      toast.error('Invalid admin credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-obsidian-900 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden grain-overlay">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-4 p-md-5 rounded-4 w-100 position-relative"
        style={{ maxWidth: '450px' }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--color-amber), transparent)', opacity: 0.5, height: '2px' }} />
        
        <div className="text-center mb-5">
          <h1 className="font-display h2 fw-bold text-white mb-2">Admin Portal</h1>
          <p className="text-platinum small">Sign in with your admin account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label text-uppercase small fw-bold text-platinum tracking-widest mb-2 ps-1">Email Address</label>
            <div className="position-relative">
              <HiOutlineUser className="position-absolute start-0 top-50 translate-middle-y ms-3 text-platinum" />
              <input
                type="email"
                required
                className="form-control bg-obsidian-800 border-white-5 rounded-3 py-3 ps-5 text-white shadow-none"
                style={{ outline: 'none' }}
                placeholder="admin@chronix.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="form-label text-uppercase small fw-bold text-platinum tracking-widest mb-2 ps-1">Password</label>
            <div className="position-relative">
              <HiOutlineLockClosed className="position-absolute start-0 top-50 translate-middle-y ms-3 text-platinum" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                className="form-control bg-obsidian-800 border-white-5 rounded-3 py-3 ps-5 pe-5 text-white shadow-none"
                style={{ outline: 'none' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 text-platinum hover:text-white transition-colors shadow-none"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="btn btn-amber w-100 py-3 rounded-3 shadow-lg transition-all active-scale"
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm text-black" role="status" />
            ) : (
              'Authorized Entry'
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-top border-white-5 text-center">
          <p className="small text-platinum opacity-50 text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Internal Security System v2.0</p>
        </div>
      </motion.div>
    </div>
  );
}
