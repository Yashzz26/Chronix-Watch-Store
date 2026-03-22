import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineShieldCheck } from 'react-icons/hi2';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  const checkStrength = (pass) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPassStrength(score);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passphrases do not match");
      return;
    }
    if (passStrength < 2) {
      toast.error("Passphrase is too weak for our standards");
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.name });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        role: 'customer',
        createdAt: new Date().toISOString(),
        wishlist: [],
        photoURL: '',
        phone: '',
        address: '',
      });

      toast.success('Welcome to the Inner Circle');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Decorative Glow */}
      <div className="position-absolute top-0 start-50 translate-middle-x" style={{ width: '600px', height: '600px', background: 'rgba(212,175,55,0.03)', filter: 'blur(100px)', zIndex: 0, borderRadius: '50%' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="chronix-card p-5 w-100 position-relative z-1"
        style={{ maxWidth: '500px' }}
      >
        <div className="text-center mb-5">
           <h1 className="font-display display-6 text-t1 mb-2">Join the Elite</h1>
           <p className="text-t3 text-uppercase tracking-widest m-0" style={{ fontSize: '0.65rem' }}>Induct your presence into Chronix</p>
        </div>

        <form onSubmit={handleRegister} className="row g-4">
          <div className="col-12">
            <label className="text-uppercase text-t3 tracking-widest ps-1 mb-2 d-block" style={{ fontSize: '0.65rem' }}>Full Appellation</label>
            <div className="position-relative">
              <HiOutlineUser className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
              <input
                required
                className="form-control chronix-input ps-5"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div className="col-12">
            <label className="text-uppercase text-t3 tracking-widest ps-1 mb-2 d-block" style={{ fontSize: '0.65rem' }}>Digital Mail</label>
            <div className="position-relative">
              <HiOutlineMail className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
              <input
                required
                type="email"
                className="form-control chronix-input ps-5"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="col-12">
            <label className="text-uppercase text-t3 tracking-widest ps-1 mb-2 d-block" style={{ fontSize: '0.65rem' }}>Secure Passphrase</label>
            <div className="position-relative">
              <HiOutlineLockClosed className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
              <input
                required
                type="password"
                className="form-control chronix-input ps-5"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={e => {
                  setForm({...form, password: e.target.value});
                  checkStrength(e.target.value);
                }}
              />
            </div>
            
            {/* Strength Indicator */}
            {form.password && (
              <div className="mt-2 px-1">
                <div className="d-flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex-grow-1" style={{ height: 3, background: i <= passStrength ? 'var(--gold)' : 'rgba(255,255,255,0.05)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <p className="m-0 text-t3 text-uppercase tracking-widest" style={{ fontSize: '0.55rem' }}>
                  Security Level: {['Vulnerable', 'Moderate', 'Strong', 'Impermeable'][passStrength-1] || 'Unknown'}
                </p>
              </div>
            )}
          </div>

          <div className="col-12">
            <label className="text-uppercase text-t3 tracking-widest ps-1 mb-2 d-block" style={{ fontSize: '0.65rem' }}>Confirm Passphrase</label>
            <div className="position-relative">
              <HiOutlineShieldCheck className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
              <input
                required
                type="password"
                className="form-control chronix-input ps-5"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="col-12 pt-2">
            <button
              disabled={loading}
              className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 shadow-lg"
            >
              {loading ? (
                <div className="spinner-border spinner-border-sm text-dark" role="status" />
              ) : 'Request Induction'}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center">
           <Link to="/login" className="btn btn-link text-t3 text-uppercase tracking-widest text-decoration-none" style={{ fontSize: '0.7rem' }}>
             Already a member? Return to Login
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
