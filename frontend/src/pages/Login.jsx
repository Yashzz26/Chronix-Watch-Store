import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineMail, HiEye, HiEyeOff, HiOutlineUser } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await signup(email, password, { displayName: name });
    }

    setLoading(false);
    if (result.success) {
      toast.success(isLogin ? 'Welcome back' : 'Account created successfully');
      navigate('/');
    } else {
      toast.error(result.error || 'Authentication failed');
    }
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
          <h1 className="font-display h2 text-t1 mb-2">{isLogin ? 'Entrance' : 'Registration'}</h1>
          <p className="text-t3 text-[0.65rem] uppercase tracking-widest m-0">
            {isLogin ? 'Authorized Access Only' : 'Create Your Chronix Account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode='wait'>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <label className="text-[0.65rem] uppercase text-t3 tracking-widest ps-1 mb-2 d-block">Full Name</label>
                <div className="position-relative">
                  <HiOutlineUser className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
                  <input
                    required
                    className="form-control chronix-input ps-5"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4">
            <label className="text-[0.65rem] uppercase text-t3 tracking-widest ps-1 mb-2 d-block">Email Address</label>
            <div className="position-relative">
              <HiOutlineMail className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
              <input
                required
                type="email"
                className="form-control chronix-input ps-5"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
            {loading ? <div className="spinner-border spinner-border-sm text-bg" /> : isLogin ? 'Authenticate' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 pt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="btn btn-link text-t3 text-[0.7rem] uppercase tracking-wider text-decoration-none hover-gold"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
