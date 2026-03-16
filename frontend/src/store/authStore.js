import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Original login: username "admin", password "admin1234"
// Keep this for now. Firebase replaces it in Phase 3.
const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      profile: JSON.parse(localStorage.getItem('chronix-profile') || '{}'),

      login(username, password) {
        if (username === 'admin' && password === 'admin1234') {
          set({ isLoggedIn: true, user: { username } });
          return true;
        }
        return false;
      },
      logout() {
        set({ isLoggedIn: false, user: null });
      },
      updateProfile(data) {
        const updated = { ...get().profile, ...data };
        set({ profile: updated });
        localStorage.setItem('chronix-profile', JSON.stringify(updated));
      },
    }),
    { name: 'chronix-auth', partialize: (s) => ({ isLoggedIn: s.isLoggedIn, user: s.user }) }
  )
);

export default useAuthStore;
