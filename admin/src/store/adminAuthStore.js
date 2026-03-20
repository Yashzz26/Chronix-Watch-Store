import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const useAdminAuthStore = create((set) => ({
  admin: null,
  adminProfile: null,
  loading: true,
  isAdmin: false,
  setAdmin: (admin) => set({ admin }),
  setAdminProfile: (profile) => set({ adminProfile: profile }),
  setLoading: (loading) => set({ loading }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}));

export const initAdminAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      useAdminAuthStore.getState().setAdmin(user);
      try {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists() && profileDoc.data().role === 'admin') {
          useAdminAuthStore.getState().setAdminProfile(profileDoc.data());
          useAdminAuthStore.getState().setIsAdmin(true);
        } else {
          useAdminAuthStore.getState().setIsAdmin(false);
        }
      } catch (err) {
        useAdminAuthStore.getState().setIsAdmin(false);
      }
    } else {
      useAdminAuthStore.getState().setAdmin(null);
      useAdminAuthStore.getState().setIsAdmin(false);
    }
    useAdminAuthStore.getState().setLoading(false);
  });
};

export default useAdminAuthStore;
