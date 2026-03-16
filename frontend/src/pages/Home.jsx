import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { products, getDealProduct, categories } from '../data/products';
import ProductCard from '../components/product/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import DealBanner from '../components/product/DealBanner';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading]           = useState(true);
  const [category, setCategory]         = useState(searchParams.get('cat') || 'All');
  const [sort, setSort]                 = useState('default');
  const dealProduct = getDealProduct();

  // Simulate load (replace with real fetch in Phase 3)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = products
    .filter(p => category === 'All' || p.category === category)
    .sort((a, b) => {
      const pa = a.dealPrice || a.price, pb = b.dealPrice || b.price;
      if (sort === 'asc')  return pa - pb;
      if (sort === 'desc') return pb - pa;
      return 0;
    });

  return (
    <div>
      {/* Deal banner */}
      {dealProduct && <DealBanner product={dealProduct} />}

      {/* Collection section */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px' }}>

        {/* Section header */}
        <div style={{ marginBottom: 48 }}>
          <p className="section-label">Our Collection</p>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 400, color: '#F0EDE8',
            lineHeight: 1.15, marginTop: 8,
          }}>
            Timepieces for every<br />
            <em style={{ fontStyle: 'italic', color: '#D4AF37' }}>occasion</em>
          </h2>
        </div>

        {/* Filters + Sort row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', alignItems: 'center',
          gap: 16, marginBottom: 40,
          paddingBottom: 24, borderBottom: '1px solid #1A1A1A',
        }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const active = category === cat;
              return (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: '8px 18px',
                  background: active ? '#D4AF37' : 'transparent',
                  color: active ? '#080808' : '#5A5652',
                  border: `1px solid ${active ? '#D4AF37' : '#2A2A2A'}`,
                  borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem',
                  fontWeight: active ? 600 : 400,
                  fontFamily: '"Outfit", sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.borderColor = '#D4AF37', e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={e => !active && (e.currentTarget.style.borderColor = '#2A2A2A', e.currentTarget.style.color = '#5A5652')}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="default">Sort: Default</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}
          >
            {filtered.length === 0 ? (
              <p style={{ color: '#5A5652', gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
                No timepieces in this category.
              </p>
            ) : (
              filtered.map(p => (
                <motion.div key={p.id} variants={cardAnim}>
                  <ProductCard product={p} />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
