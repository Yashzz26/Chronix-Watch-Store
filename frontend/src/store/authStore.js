import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const useAuthStore = create((set) => ({
  user: null,          // Firebase Auth user object
  userProfile: null,   // Firestore user document
  loading: true,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (loading) => set({ loading }),
}));

export const initAuthListener = () => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      useAuthStore.getState().setUser(firebaseUser);
      // Fetch Firestore profile
      try {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          useAuthStore.getState().setUserProfile(profileDoc.data());
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    } else {
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setUserProfile(null);
    }
    useAuthStore.getState().setLoading(false);
  });
};

export default useAuthStore;
