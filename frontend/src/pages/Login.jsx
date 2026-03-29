import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineLockClosed, 
  HiOutlineMail, 
  HiEye, 
  HiEyeOff, 
  HiOutlineUser, 
  HiOutlinePhone,
  HiOutlineArrowLeft
} from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// 🔴 Error Mapping Helper (S1.3)
const mapAuthError = (code) => {
  const errors = {
    'auth/invalid-verification-code': 'Invalid security code. Please check and try again.',
    'auth/code-expired': 'Security code has expired. Request a new one.',
    'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
    'auth/invalid-phone-number': 'The phone number provided is not valid.',
    'auth/user-disabled': 'This account has been suspended.',
    'auth/user-not-found': 'No account associated with this identity.',
    'auth/wrong-password': 'The passphrase provided is incorrect.',
    'auth/email-already-in-use': 'This email handle is already registered.',
    'auth/weak-password': 'The passphrase is too weak for our standards.',
    'auth/popup-closed-by-user': 'Authentication window was closed early.',
    'auth/network-request-failed': 'Network interruption. Check your connection.',
    'auth/operation-not-allowed': 'This authentication method is currently restricted.',
    'auth/account-exists-with-different-credential': 'Security Protocol: This email is already linked. Please login to merge your identities.'
  };
  return errors[code] || 'Authentication failed. Please check your credentials.';
};

export default function Login() {
  const { 
    login, 
    signup, 
    googleSignIn, 
    completePhoneLogin, 
    isLoggedIn, 
    lastAuthMethod,
    pendingEmail,
    setLoading: setStoreLoading 
  } = useAuthStore();

  const [activeTab, setActiveTab ] = useState(lastAuthMethod === 'phone' ? 'phone' : 'email');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Phone Auth States
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('chronix_last_phone') || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' or 'verify'
  const [timer, setTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Recaptcha Cleanup Lifecycle (S1.2)
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          const container = document.getElementById('recaptcha-container');
          if (container) container.innerHTML = ''; // Full wipe
        } catch (e) {
          console.warn('Recaptcha cleanup minor error');
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (isLoggedIn) return null;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const initRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('Recaptcha initialized security context.')
      });
    }
  };

  const handleEmailSubmit = async (e) => {
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
      toast.success(isLogin ? 'Successfully Authenticated' : 'Account Established');
      navigate('/');
    } else {
      triggerShake();
      toast.error(mapAuthError(result.error));
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await googleSignIn();
    setLoading(false);
    if (result.success) {
      toast.success('Google Authentication Successful');
      navigate('/');
    } else if (result.error === 'auth/account-exists-with-different-credential') {
      setEmail(result.email || ''); // Pre-fill the email for the user
      setIsLogin(true); // Force login mode
      toast('Identity Linkage Required. Please verify your password.', { icon: '🔐' });
    } else {
      toast.error(mapAuthError(result.error));
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (attempts >= 3) return toast.error('Account locked temporarily. Too many attempts.');
    if (!phoneNumber || phoneNumber.length < 10) return toast.error('Please enter a valid phone number');
    
    setLoading(true);
    try {
      initRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      
      localStorage.setItem('chronix_last_phone', phoneNumber);
      setOtpStep('verify');
      setTimer(30);
      setAttempts(prev => prev + 1);
      toast.success('Security code dispatched');
    } catch (error) {
      console.error(error);
      toast.error(mapAuthError(error.code));
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) return toast.error('Provide the 6-digit code');

    setLoading(true);
    try {
      // 🛡️ S1.4: Explicit Session Expiry Verification
      if (!window.confirmationResult) {
        throw { code: 'auth/session-expired' };
      }

      const result = await window.confirmationResult.confirm(otpCode);
      const storeResult = await completePhoneLogin(result.user);
      
      if (storeResult.success) {
        toast.success('Mobile Identity Verified');
        navigate('/');
      } else {
        throw { code: 'auth/sync-error' };
      }
    } catch (error) {
      triggerShake();
      console.error('OTP Verification Error:', error.code || error.message);
      toast.error(mapAuthError(error.code || 'invalid-verification-code'));
      setLoading(false);
    }
  };

  // 🧠 OTP Logic with Auto-submit
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
    
    // Auto-submit on 6th digit
    if (value && index === 5) {
      // Need to wait for state update to get full code
      const fullCode = [...newOtp];
      fullCode[5] = value.slice(-1);
      if (fullCode.every(d => d !== '')) {
        setTimeout(() => handleVerifyOtp(), 100);
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    const data = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(data)) return;
    const newOtp = [...otp];
    data.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    if (data.length === 6) {
      setTimeout(() => handleVerifyOtp(), 100);
    } else if (otpRefs.current[data.length - 1]) {
      otpRefs.current[data.length - 1].focus();
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div id="recaptcha-container"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={shake 
          ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } 
          : { opacity: 1, scale: 1, y: 0, x: 0 }
        }
        className="chronix-card p-4 p-md-5 position-relative overflow-hidden"
        style={{ width: '100%', maxWidth: 460, background: '#fff' }}
      >
        {pendingEmail && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-3 bg-gold bg-opacity-10 border border-gold border-opacity-20 d-flex align-items-center gap-3"
          >
            <HiOutlineLockClosed className="text-gold flex-shrink-0" size={24} />
            <div className="small">
              <p className="fw-bold m-0 text-gold" style={{ fontSize: '0.75rem' }}>Identity Linkage Active</p>
              <p className="m-0 text-t2 opacity-75" style={{ fontSize: '0.65rem' }}>Verify your password for <strong>{pendingEmail}</strong> to merge your Google profile.</p>
            </div>
          </motion.div>
        )}
        <div className="position-absolute top-0 start-0 w-100 h-1" style={{ height: 3, background: 'var(--gold)' }} />

        <div className="text-center mb-4">
          <h1 className="font-display h2 text-t1 mb-2">{isLogin ? 'Sign In' : 'Create Account'}</h1>
          <p className="text-t3 text-uppercase tracking-widest m-0" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
            Production-Grade Auth Security
          </p>
        </div>

        {/* Auth Tabs */}
        <div className="d-flex mb-4 p-1 bg-light rounded-3" style={{ border: '1px solid var(--border)' }}>
          <button 
            disabled={otpStep === 'verify'}
            onClick={() => { setActiveTab('email'); setOtpStep('phone'); }}
            className={`flex-grow-1 py-2 text-uppercase font-mono border-0 rounded-2 transition-all ${activeTab === 'email' ? 'bg-white shadow-sm text-t1 fw-bold' : 'bg-transparent text-t3 opacity-50'}`}
            style={{ fontSize: '0.65rem' }}
          >
            Email
          </button>
          <button 
            disabled={otpStep === 'verify'}
            onClick={() => setActiveTab('phone')}
            className={`flex-grow-1 py-2 text-uppercase font-mono border-0 rounded-2 transition-all ${activeTab === 'phone' ? 'bg-white shadow-sm text-t1 fw-bold' : 'bg-transparent text-t3 opacity-50'}`}
            style={{ fontSize: '0.65rem' }}
          >
            Phone (OTP)
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'email' ? (
            <motion.div key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <form onSubmit={handleEmailSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label className="text-uppercase text-t3 tracking-widest mb-2 ps-1 d-block" style={{ fontSize: '0.6rem', fontWeight: 700 }}>Full Appellation</label>
                    <div className="position-relative">
                      <HiOutlineUser className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
                      <input required className="form-control chronix-input ps-5" placeholder="Identity" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="text-uppercase text-t3 tracking-widest mb-2 ps-1 d-block" style={{ fontSize: '0.6rem', fontWeight: 700 }}>Email Handle</label>
                  <div className="position-relative">
                    <HiOutlineMail className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
                    <input required type="email" className="form-control chronix-input ps-5" placeholder="email@chronix.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-uppercase text-t3 tracking-widest mb-2 ps-1 d-block" style={{ fontSize: '0.6rem', fontWeight: 700 }}>Passphrase</label>
                  <div className="position-relative">
                    <HiOutlineLockClosed className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
                    <input required type={showPass ? 'text' : 'password'} className="form-control chronix-input ps-5 pe-5" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" className="position-absolute end-0 me-3 top-50 translate-middle-y text-t3 border-0 bg-transparent p-0" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                    </button>
                  </div>
                </div>

                <button disabled={loading} className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 shadow-sm border-0">
                  {loading ? <div className="spinner-border spinner-border-sm" /> : isLogin ? 'Access Account' : 'Establish Membership'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label className="text-uppercase text-t3 tracking-widest mb-2 ps-1 d-block" style={{ fontSize: '0.6rem', fontWeight: 700 }}>Mobile Number</label>
                    <div className="d-flex gap-2">
                       <div className="bg-light px-3 py-2 rounded-2 border d-flex align-items-center text-t2 font-mono" style={{ fontSize: '0.9rem' }}>+91</div>
                       <div className="position-relative flex-grow-1">
                          <HiOutlinePhone className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3" />
                          <input 
                            required 
                            type="tel" 
                            className="form-control chronix-input ps-5" 
                            placeholder="Phone Number" 
                            value={phoneNumber} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setPhoneNumber(val);
                              localStorage.setItem('chronix_last_phone', val);
                            }} 
                          />
                       </div>
                    </div>
                    <p className="mt-3 text-t3 small opacity-60">Disposable security code will be dispatched via SMS.</p>
                  </div>
                  <button disabled={loading} className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 shadow-sm border-0">
                    {loading ? <div className="spinner-border spinner-border-sm" /> : 'Request Dispatch'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                       <label className="text-uppercase text-t3 tracking-widest ps-1 d-block" style={{ fontSize: '0.6rem', fontWeight: 700 }}>Verification Grid</label>
                       <button type="button" onClick={() => { setOtpStep('phone'); setOtp(['','','','','','']); }} className="btn btn-link p-0 text-t3 text-decoration-none x-small d-flex align-items-center gap-1 font-mono uppercase tracking-tighter" style={{ fontSize: '0.55rem' }}>
                          <HiOutlineArrowLeft /> Edit Number
                       </button>
                    </div>
                    <div className="d-flex justify-content-between gap-2 mb-4" onPaste={handleOtpPaste}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => otpRefs.current[idx] = el}
                          type="text"
                          maxLength={1}
                          className="form-control text-center p-0 font-mono fw-bold"
                          style={{ width: '48px', height: '52px', fontSize: '1.2rem', borderRadius: '10px', background: '#F9FAFB', border: `1px solid ${shake && !digit ? '#F87171' : 'var(--border)'}` }}
                          value={digit}
                          onChange={e => handleOtpChange(e.target.value, idx)}
                          onKeyDown={e => handleOtpKeyDown(e, idx)}
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                    <div className="text-center">
                       <button 
                         type="button" 
                         disabled={timer > 0 || loading} 
                         onClick={handleSendOtp}
                         className="btn btn-link text-gold text-decoration-none x-small font-mono fw-bold uppercase"
                         style={{ fontSize: '0.65rem' }}
                       >
                         {timer > 0 ? `Retry in ${timer}s` : 'Resend Security Code'}
                       </button>
                    </div>
                  </div>
                  <button disabled={loading} className="btn-chronix-primary w-100 py-3 d-flex align-items-center justify-content-center gap-3 shadow-sm border-0">
                    {loading ? <div className="spinner-border spinner-border-sm" /> : 'Verify Identity'}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OR Divider */}
        <div className="position-relative text-center my-4">
          <div className="position-absolute w-100 top-50 translate-middle-y" style={{ height: 1, background: 'var(--border)', zIndex: 0 }} />
          <span className="bg-white px-3 text-uppercase text-t3 tracking-widest position-relative" style={{ fontSize: '0.55rem', zIndex: 1, letterSpacing: '0.1em' }}>Secure Social Induction</span>
        </div>

        {/* Global Google Sign-In */}
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn w-100 py-3 d-flex align-items-center justify-content-center gap-3 transition-all hover-glow"
          style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>

        <div className="mt-4 pt-3 text-center border-top border-border">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="btn btn-link text-t3 text-uppercase tracking-widest text-decoration-none"
            style={{ fontSize: '0.65rem', fontWeight: 700 }}
          >
            {isLogin ? "New to Chronix? Create an account" : "Already a member? Sign in"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
