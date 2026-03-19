import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);
      if (success) {
        toast.success(`Welcome back, ${username}`);
        navigate('/');
      } else {
        toast.error('Invalid credentials');
      }
    }, 1000);
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="chronix-card p-5 p-md-5 position-relative overflow-hidden"
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-1 bg-gold" style={{ height: 2 }} />

        <div className="text-center mb-5">
          <h1 className="font-display h2 text-t1 mb-2">Entrance</h1>
          <p className="text-t3 text-[0.65rem] uppercase tracking-widest m-0">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-[0.65rem] uppercase text-t3 tracking-widest ps-1 mb-2 d-block">Identifer</label>
            <div className="position-relative">
              <HiOutlineUser className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
              <input
                required
                className="form-control chronix-input ps-5"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[0.65rem] uppercase text-t3 tracking-widest ps-1 mb-2 d-block">Keyphrase</label>
            <div className="position-relative">
              <HiOutlineLockClosed className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
              <input
                required
                type={showPass ? 'text' : 'password'}
                className="form-control chronix-input ps-5 pe-5"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="position-absolute end-0 me-3 top-50 translate-middle-y text-t3 border-0 bg-transparent p-0"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="btn-chronix-primary w-100 py-3 mt-4 d-flex align-items-center justify-content-center gap-3 shadow-lg"
          >
            {loading ? <div className="spinner-border spinner-border-sm text-bg" /> : 'Authenticate'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-top border-border border-opacity-50 text-center">
          <p className="text-t3 text-[0.7rem] uppercase tracking-wider mb-2">Internal Admin Demo</p>
          <p className="text-t2 text-xs font-mono bg-s2 d-inline-block px-3 py-1 rounded">admin / admin1234</p>
        </div>
      </motion.div>
    </div>
  );
}
