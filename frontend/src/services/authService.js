import { auth } from '../lib/firebase';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) {
  console.warn('[Chronix] VITE_BACKEND_URL not set. OTP requests will fail.');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldRetry = (error) => {
  const message = error?.message || '';
  return /network|timeout|fetch/i.test(message);
};

const authorizedFetch = async (path, options = {}) => {
  if (!BASE_URL) {
    throw new Error('Backend URL not configured');
  }
  const token = await auth.currentUser?.getIdToken?.(true);
  if (!token) {
    throw new Error('No active session. Please log in again.');
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal || controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const markPhoneVerified = async (phone, { attempts = 3 } = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await authorizedFetch('/api/auth/phone/mark-verified', {
        body: { phone },
        timeoutMs: 7000,
      });
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error) || attempt === attempts) {
        throw error;
      }
      await sleep(400 * attempt);
    }
  }
  throw lastError;
};
