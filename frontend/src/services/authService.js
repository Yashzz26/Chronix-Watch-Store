import { auth } from '../lib/firebase';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) {
  console.warn('[Chronix] VITE_BACKEND_URL not set. OTP requests will fail.');
}

const authorizedFetch = async (path, options = {}) => {
  if (!BASE_URL) {
    throw new Error('Backend URL not configured');
  }
  const token = await auth.currentUser?.getIdToken?.(true);
  if (!token) {
    throw new Error('No active session. Please log in again.');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: JSON.stringify(options.body || {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
};

export const markPhoneVerified = (phone) => 
  authorizedFetch('/api/auth/phone/mark-verified', { body: { phone } });

export const bypassOtp = () => authorizedFetch('/api/auth/otp/bypass');
