import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      toggleWishlist: (product) => {
        const { items } = get();
        const exists = items.find(i => i.id === product.id);
        
        if (exists) {
          // Remove if it already exists
          set({ items: items.filter(i => i.id !== product.id) });
          return false; // Returns false indicating it was removed
        } else {
          // Add if it doesn't exist
          set({ items: [product, ...items] });
          return true; // Returns true indicating it was added
        }
      },
      
      removeFromWishlist: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      
      clearWishlist: () => {
        set({ items: [] });
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
