import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import { sendOtp, verifyOtp } from '../services/authService';

const otpError = (code) => {
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Please enter a valid mobile number.';
    case 'auth/billing-not-enabled':
      return 'Enable billing for Firebase Phone Auth (Blaze plan) before sending OTPs.';
    case 'auth/invalid-verification-code':
      return 'The code did not match. Try again.';
    case 'auth/code-expired':
      return 'Code expired. Request a new one.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute.';
    case 'auth/credential-already-in-use':
      return 'This number is already linked to another account.';
    case 'otp_send_failed':
      return 'Unable to send OTP via MSG91. Please check the number and try again.';
    case 'otp_verify_failed':
      return 'The code did not match what MSG91 generated.';
    case 'invalid_phone':
    case 'invalid_payload':
      return 'Enter the phone number again and resend the code.';
    default:
      return 'Could not verify the code. Please retry.';
  }
};

export default function OTPVerification() {
  const navigate = useNavigate();
  const { isLoggedIn, profile, fetchProfile } = useAuthStore();

  const [phone, setPhone] = useState(() => {
    if (profile?.phone?.startsWith('+91')) return profile.phone.replace('+91', '');
    if (profile?.phone?.startsWith('+')) return profile.phone.substring(3);
    return profile?.phone || '';
  });
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(0);
  const [sending, setSending] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    if (profile?.isPhoneVerified) {
      const stored = sessionStorage.getItem('chronix_post_verify_path') || '/';
      sessionStorage.removeItem('chronix_post_verify_path');
      navigate(stored === '/verify-otp' ? '/' : stored, { replace: true });
    }
  }, [isLoggedIn, profile?.isPhoneVerified, navigate]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formattedPhone = () => {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+91${phone}`;
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Enter a valid 10-digit number');
      return;
    }
    setSending(true);
    try {
      await sendOtp(formattedPhone());
      setStep('otp');
      setOtp(Array(6).fill(''));
      setTimer(60);
      toast.success(`OTP sent to ${formattedPhone()}`);
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch (error) {
      console.error('Send OTP error', error);
      toast.error(error.message || otpError(error.code));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    setSending(true);
    try {
      await verifyOtp(formattedPhone(), code);
      if (auth.currentUser?.uid) {
        await fetchProfile(auth.currentUser.uid);
      }
      toast.success('Phone verified');
      const stored = sessionStorage.getItem('chronix_post_verify_path') || '/';
      sessionStorage.removeItem('chronix_post_verify_path');
      navigate(stored === '/verify-otp' ? '/' : stored, { replace: true });
    } catch (error) {
      console.error('Verify OTP error', error);
      toast.error(error.message || otpError(error.code));
    } finally {
      setSending(false);
    }
  };

  const handleOtpInput = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKey = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && step === 'otp') {
      handleVerify(e);
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').trim();
    if (!/^[0-9]{6}$/.test(text)) return;
    const digits = text.split('');
    setOtp(digits);
    digits.forEach((digit, idx) => {
      if (otpRefs.current[idx]) {
        otpRefs.current[idx].value = digit;
      }
    });
    setTimeout(() => handleVerify(), 80);
  };

  return (
    <div className="otp-shell d-flex align-items-center justify-content-center p-4">
      <style>{`
        .otp-shell {
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
        }
        .otp-card {
          width: min(520px, 100%);
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: clamp(24px, 5vw, 48px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.08);
          position: relative;
        }
        .otp-card h1 {
          font-family: var(--font-heading);
          font-size: 1.9rem;
          margin-bottom: 8px;
        }
        .otp-lead {
          color: var(--t3);
          font-size: 0.95rem;
          margin-bottom: 32px;
        }
        .otp-label {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--t3);
          font-weight: 700;
          margin-bottom: 12px;
        }
        .otp-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px 16px 14px 46px;
          background: #f7f5f0;
          font-size: 1rem;
        }
        .otp-input:focus {
          outline: none;
          border-color: var(--gold);
          background: #fff;
        }
        .otp-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .otp-cell {
          width: 100%;
          height: 64px;
          border-radius: 16px;
          border: 1px solid var(--border);
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .otp-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .otp-button {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 14px;
          background: var(--t1);
          color: #fff;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .otp-secondary {
          background: transparent;
          border: none;
          color: var(--t3);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .otp-resend {
          background: none;
          border: none;
          font-size: 0.8rem;
          color: var(--gold);
          font-weight: 600;
        }
      `}</style>
      <div className="otp-card">
        <p className="section-label-gold mb-2">Two-step login</p>
        <h1>Verify your mobile</h1>
        <p className="otp-lead">We ask for a 6-digit code after every login so only you can unlock your profile.</p>

        {step === 'form' ? (
          <form onSubmit={handleSendOtp}>
            <label className="otp-label">Mobile number</label>
            <div className="position-relative mb-4">
              <HiOutlineDevicePhoneMobile className="position-absolute top-50 start-0 translate-middle-y ms-3 text-t3" size={20} />
              <input
                className="otp-input ps-5"
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                required
              />
            </div>
            <button className="otp-button" disabled={sending}>
              {sending ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="otp-actions">
              <label className="otp-label m-0">Enter code</label>
              <button
                type="button"
                className="otp-secondary d-flex align-items-center gap-1"
                onClick={() => {
                  setStep('form');
                  setOtp(Array(6).fill(''));
                  otpRefs.current.forEach((input) => input && (input.value = ''));
                }}
              >
                <HiOutlineArrowLeft /> Change number
              </button>
            </div>
            <div className="otp-grid" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-cell"
                  ref={(ref) => (otpRefs.current[idx] = ref)}
                  value={digit}
                  onChange={(e) => handleOtpInput(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKey(e, idx)}
                />
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-t3 small">Code sent to {formattedPhone()}</span>
              <button
                type="button"
                className="otp-resend"
                disabled={timer > 0 || sending}
                onClick={handleSendOtp}
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
              </button>
            </div>
            <button className="otp-button" disabled={sending}>
              {sending ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

