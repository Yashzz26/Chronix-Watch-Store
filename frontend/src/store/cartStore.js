import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to validate cart items on load (Section 1.6)
const isValidCartItem = (item) => {
  return (
    item &&
    (typeof item.id === 'number' || typeof item.id === 'string') &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.qty === 'number' &&
    item.qty > 0 &&
    item.qty <= 99 &&
    Array.isArray(item.imageGallery)
  );
};

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
      reviews: JSON.parse(localStorage.getItem('chronix-reviews') || '[]'),
      appliedCoupon: null,

      // ── Cart ──────────────────────────────────
      addItem(product) {
        // 🚀 S3.3: SKU-Based Keying
        const sku = product.variants?.sku || 'BASE';
        const itemKey = `${product.id}-${sku}`;
        
        const existingIndex = get().items.findIndex(i => {
          const currentSku = i.variants?.sku || 'BASE';
          return `${i.id}-${currentSku}` === itemKey;
        });

        if (existingIndex !== -1) {
          const updatedItems = [...get().items];
          updatedItems[existingIndex].qty += (product.qty || 1);
          set({ items: updatedItems });
        } else {
          set({ items: [...get().items, { ...product, qty: product.qty || 1 }] });
        }
      },
      removeItem(id, variants) {
        const sku = variants?.sku || 'BASE';
        const itemKey = `${id}-${sku}`;
        set({ 
          items: get().items.filter(i => {
            const currentSku = i.variants?.sku || 'BASE';
            return `${i.id}-${currentSku}` !== itemKey;
          }) 
        });
      },
      updateQty(id, variants, qty) {
        if (qty <= 0) return get().removeItem(id, variants);
        if (qty > 99) qty = 99;
        
        const sku = variants?.sku || 'BASE';
        const itemKey = `${id}-${sku}`;
        set({ 
          items: get().items.map(i => {
            const currentSku = i.variants?.sku || 'BASE';
            return `${i.id}-${currentSku}` === itemKey ? { ...i, qty } : i;
          }) 
        });
      },
      clearCart() {
        set({ items: [], appliedCoupon: null });
      },
      
      // ── Save for Later ────────────────────────
      moveToSaved(id, variants) {
        const sku = variants?.sku || 'BASE';
        const itemKey = `${id}-${sku}`;
        const item = get().items.find(i => {
           const currentSku = i.variants?.sku || 'BASE';
           return `${i.id}-${currentSku}` === itemKey;
        });
        if (!item) return;
        set({
          items: get().items.filter(i => {
             const currentSku = i.variants?.sku || 'BASE';
             return `${i.id}-${currentSku}` !== itemKey;
          }),
          savedItems: [...get().savedItems, item]
        });
      },
      moveToCart(id, variants) {
        const sku = variants?.sku || 'BASE';
        const itemKey = `${id}-${sku}`;
        const item = get().savedItems.find(i => {
           const currentSku = i.variants?.sku || 'BASE';
           return `${i.id}-${currentSku}` === itemKey;
        });
        if (!item) return;
        set({
          savedItems: get().savedItems.filter(i => {
             const currentSku = i.variants?.sku || 'BASE';
             return `${i.id}-${currentSku}` !== itemKey;
          }),
          items: [...get().items, item]
        });
      },
      removeSaved(id, variants) {
        const sku = variants?.sku || 'BASE';
        const itemKey = `${id}-${sku}`;
        set({ 
          savedItems: get().savedItems.filter(i => {
             const currentSku = i.variants?.sku || 'BASE';
             return `${i.id}-${currentSku}` !== itemKey;
          }) 
        });
      },
      totalItems() {
        return get().items.reduce((s, i) => s + i.qty, 0);
      },
      totalPrice() {
        const subtotal = get().items.reduce((s, i) => s + (i.dealPrice || i.price) * i.qty, 0);
        if (get().appliedCoupon) {
            const discount = (subtotal * get().appliedCoupon.discount) / 100;
            return subtotal - discount;
        }
        return subtotal;
      },
      
      applyCoupon(coupon) {
        set({ appliedCoupon: coupon });
      },
      removeCoupon() {
        set({ appliedCoupon: null });
      },

      // ── Reviews (localStorage, matching original script.js) ──
      addReview(review) {
        const updated = [...get().reviews, review];
        set({ reviews: updated });
        localStorage.setItem('chronix-reviews', JSON.stringify(updated));
      },
      getProductReviews(productId) {
        return get().reviews.filter(r => r.productId === productId);
      },
    }),
    { 
      name: 'chronix-cart', 
      partialize: (s) => ({ items: s.items, savedItems: s.savedItems }),
      onRehydrateStorage: () => (state) => {
        const migrateItem = item => {
          if (item.variants && !item.variants.sku) {
            return { 
              ...item, 
              variants: { ...item.variants, sku: 'LEGACY-BASE' } 
            };
          }
          return item;
        };

        if (state) {
          if (Array.isArray(state.items)) {
            state.items = state.items.map(migrateItem).filter(isValidCartItem);
          }
          if (Array.isArray(state.savedItems)) {
            state.savedItems = state.savedItems.map(migrateItem).filter(isValidCartItem);
          }
        }
      }
    }
  )
);

export default useCartStore;
