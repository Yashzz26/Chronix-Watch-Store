import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const completeEmailVerification = useAuthStore((state) => state.completeEmailVerification);
  const [status, setStatus] = useState('Verifying your email…');

  useEffect(() => {
    const verify = async () => {
      const code = new URLSearchParams(window.location.search).get('oobCode');
      if (!code) {
        setStatus('This verification link is incomplete or invalid.');
        return;
      }

      try {
        await checkActionCode(auth, code);
        await applyActionCode(auth, code);
        const profile = await completeEmailVerification();
        toast.success('Email verified successfully.');
        if (profile) {
          navigate('/', { replace: true });
        } else {
          setStatus('Email verified. Please sign in to finish creating your profile.');
        }
      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('This verification link is expired or has already been used.');
      }
    };

    verify();
  }, [completeEmailVerification, navigate]);

  return (
    <section className="container py-5 text-center">
      <h1 className="mb-3">Email verification</h1>
      <p className="text-t3">{status}</p>
      <button className="auth-submit mt-3" onClick={() => navigate('/login')}>
        Continue to login
      </button>
    </section>
  );
}
