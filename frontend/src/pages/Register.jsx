import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser } from 'react-icons/hi';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pass) => {
    if (pass.length < 6) return 'weak';
    if (pass.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'strong';
    return 'medium';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: 'customer',
        createdAt: serverTimestamp(),
        wishlist: [],
        photoURL: '',
        phone: '',
        address: '',
      });

      toast.success('Account created successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'Email is already in use.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
      };
      setError(messages[err.code] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = validatePassword(formData.password);
  const strengthColor = {
    weak: 'bg-red-500',
    medium: 'bg-amber',
    strong: 'bg-green-500',
  }[strength];

  return (
    <div className="min-h-screen bg-obsidian-900 flex items-center justify-center px-4 relative overflow-hidden py-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-display text-3xl font-bold text-white">
              Chronix<span className="text-amber">.</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-display font-semibold text-white">Create account</h2>
          <p className="mt-1 text-platinum text-sm">Join the world of premium horology</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-platinum mb-2">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum text-lg" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-obsidian-700 text-white placeholder-platinum/50 text-sm pl-11 pr-4 py-3.5 rounded-xl border border-white/5 focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-platinum mb-2">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum text-lg" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-obsidian-700 text-white placeholder-platinum/50 text-sm pl-11 pr-4 py-3.5 rounded-xl border border-white/5 focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-platinum mb-2">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum text-lg" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="At least 6 characters"
                  className="w-full bg-obsidian-700 text-white placeholder-platinum/50 text-sm pl-11 pr-12 py-3.5 rounded-xl border border-white/5 focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-platinum hover:text-white transition-colors">
                  {showPass ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className={`h-1 flex-1 rounded-full ${strengthColor}`} />
                  <span className="text-[10px] uppercase font-bold text-platinum tracking-wider">{strength}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-platinum mb-2">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum text-lg" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  className="w-full bg-obsidian-700 text-white placeholder-platinum/50 text-sm pl-11 pr-12 py-3.5 rounded-xl border border-white/5 focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber hover:bg-amber-dark disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-platinum">
            Already have an account?{' '}
            <Link to="/login" className="text-amber hover:text-amber-light font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
