import { auth } from './firebase';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export const apiCall = async (method, endpoint, data = null) => {
  const token = await auth.currentUser?.getIdToken();
  return axios({
    method,
    url: `${BACKEND}${endpoint}`,
    data,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
};
