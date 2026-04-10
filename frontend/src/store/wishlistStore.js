import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../lib/firebase';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Validation to ensure stored data isn't corrupted
const isValidWishlistItem = (item) => {
  return (
    item &&
    (typeof item.id === 'number' || typeof item.id === 'string') &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    Array.isArray(item.imageGallery)
  );
};

// ─── Helper: get auth headers ────────────────────────────────────────────────
const getAuthHeaders = async () => {
  if (!auth.currentUser) return null;
  const token = await auth.currentUser.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,

      /**
       * Fetch wishlist from the backend (called on login / app init)
       * Merges server data with any locally cached items
       */
      fetchWishlist: async () => {
        try {
          const headers = await getAuthHeaders();
          if (!headers) return; // Not logged in

          set({ syncing: true });
          const res = await fetch(`${backendUrl}/api/wishlist`, { headers });
          const data = await res.json();

          if (res.ok && Array.isArray(data.items)) {
            const serverItems = data.items.filter(isValidWishlistItem);

            // Merge: keep local items that aren't on the server yet,
            // then sync them up to the server in the background
            const localOnly = get().items.filter(
              local => !serverItems.some(server => server.id === local.id)
            );

            // Set state to server items + local-only items
            set({ items: [...serverItems, ...localOnly], syncing: false });

            // Sync local-only items to the server
            for (const item of localOnly) {
              try {
                await fetch(`${backendUrl}/api/wishlist/add`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ productId: item.id }),
                });
              } catch (err) {
                console.warn('[Wishlist] Failed to sync local item to server:', item.id);
              }
            }
          } else {
            set({ syncing: false });
          }
        } catch (err) {
          console.error('[Wishlist] Fetch failed:', err.message);
          set({ syncing: false });
        }
      },

      /**
       * Toggle wishlist: add if not present, remove if present
       * Uses optimistic UI + background server sync
       */
      toggleWishlist: (product) => {
        const { items } = get();
        const exists = items.find(i => i.id === product.id);
        
        if (exists) {
          // Optimistic remove
          set({ items: items.filter(i => i.id !== product.id) });

          // Sync removal to backend
          getAuthHeaders().then(headers => {
            if (!headers) return;
            fetch(`${backendUrl}/api/wishlist/remove/${product.id}`, {
              method: 'DELETE',
              headers,
            }).catch(err => console.warn('[Wishlist] Remove sync failed:', err.message));
          });

          return false; // Indicates item was removed
        } else {
          // Optimistic add
          set({ items: [product, ...items] });

          // Sync addition to backend
          getAuthHeaders().then(headers => {
            if (!headers) return;
            fetch(`${backendUrl}/api/wishlist/add`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ productId: product.id }),
            }).catch(err => console.warn('[Wishlist] Add sync failed:', err.message));
          });

          return true; // Indicates item was added
        }
      },
      
      removeFromWishlist: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });

        // Sync removal to backend
        getAuthHeaders().then(headers => {
          if (!headers) return;
          fetch(`${backendUrl}/api/wishlist/remove/${id}`, {
            method: 'DELETE',
            headers,
          }).catch(err => console.warn('[Wishlist] Remove sync failed:', err.message));
        });
      },
      
      clearWishlist: () => {
        // Clear locally — server items will be removed individually
        const currentItems = get().items;
        set({ items: [] });

        getAuthHeaders().then(headers => {
          if (!headers) return;
          for (const item of currentItems) {
            fetch(`${backendUrl}/api/wishlist/remove/${item.id}`, {
              method: 'DELETE',
              headers,
            }).catch(() => {});
          }
        });
      },
      
      isInWishlist: (id) => {
        return get().items.some(i => i.id === id);
      }
    }),
    { 
      name: 'chronix-wishlist', 
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          // Filter out invalidated / corrupted elements
          state.items = state.items.filter(isValidWishlistItem);
        }
      }
    }
  )
);

export default useWishlistStore;
