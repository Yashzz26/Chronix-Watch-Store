import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import StarDisplay from './ui/StarDisplay';

const STORAGE_KEY = 'chronix_recently_viewed';
const MAX_ITEMS = 10;

/**
 * Read recently viewed product IDs from localStorage.
 * Returns: [{ productId, viewedAt }]
 */
export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Add a product to recently viewed (dedup, cap, newest first).
 */
export const addToRecentlyViewed = (productId) => {
  if (!productId) return;
  try {
    let list = getRecentlyViewed();
    list = list.filter(item => item.productId !== productId);
    list.unshift({ productId, viewedAt: Date.now() });
    list = list.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('[RecentlyViewed] Storage error:', err.message);
  }
};

/**
 * RecentlyViewed — horizontal scroll carousel of recently visited products.
 * Rendered at the bottom of ProductDetail page.
 *
 * Props:
 *   excludeId — current product ID to exclude from the list
 */
export default function RecentlyViewed({ excludeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const viewed = getRecentlyViewed()
        .filter(item => item.productId !== excludeId)
        .slice(0, 8);

      if (viewed.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.all(
          viewed.map(async ({ productId }) => {
            try {
              const docSnap = await getDoc(doc(db, 'products', productId));
              if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
              }
            } catch {
              return null;
            }
            return null;
          })
        );
        setProducts(results.filter(Boolean));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [excludeId]);

  if (loading || products.length === 0) return null;

  return (
    <section className="recently-viewed-section">
      <style>{`
        .recently-viewed-section {
          padding: 48px 0;
          border-top: 1px solid var(--border, #E0DED9);
        }
        .rv-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 24px;
        }
        .rv-scroll {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 8px;
        }
        .rv-scroll::-webkit-scrollbar { display: none; }
        .rv-card {
          scroll-snap-align: start;
          flex: 0 0 200px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease;
        }
        .rv-card:hover { transform: translateY(-4px); }
        .rv-card__img {
          width: 200px;
          height: 200px;
          background: var(--bg-1, #F5F3EF);
          border: 1px solid var(--border, #E0DED9);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .rv-card__img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .rv-card__cat {
          font-size: 0.55rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--gold, #D4AF37);
          margin-bottom: 2px;
        }
        .rv-card__name {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rv-card__price {
          font-size: 0.8rem;
          font-weight: 700;
          font-family: var(--font-mono, monospace);
        }
        .rv-clear-btn {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--t3, #888);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .rv-clear-btn:hover { color: var(--gold, #D4AF37); }
      `}</style>

      <div className="container">
        <div className="rv-header">
          <div>
            <span className="section-label-gold" style={{ fontSize: '0.6rem' }}>Recently viewed</span>
            <h3 className="h5 font-display m-0 mt-1">Continue Exploring</h3>
          </div>
          <button
            className="rv-clear-btn"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setProducts([]);
            }}
          >
            Clear history
          </button>
        </div>

        <div className="rv-scroll">
          {products.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="rv-card">
              <div className="rv-card__img">
                <img src={product.imageGallery?.[0]} alt={product.name} loading="lazy" />
              </div>
              <div className="rv-card__cat">{product.category || 'Chronix'}</div>
              <div className="rv-card__name">{product.name}</div>
              <StarDisplay rating={product.avgRating} count={product.reviewCount} size="0.6rem" />
              <div className="rv-card__price">₹{Number(product.price || 0).toLocaleString('en-IN')}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
