import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineFilter, HiChevronDown } from 'react-icons/hi';
import { products, getDealProduct, categories } from '../data/products';
import ProductCard from '../components/product/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import HeroSection from '../components/layout/HeroSection';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('cat') || 'All';
  const sort = searchParams.get('sort') || 'default';

  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let result = [...products];

      if (category !== 'All') {
        result = result.filter(p => p.category === category);
      }

      if (sort === 'price-asc') result.sort((a, b) => (a.dealPrice || a.price) - (b.dealPrice || b.price));
      if (sort === 'price-desc') result.sort((a, b) => (b.dealPrice || b.price) - (a.dealPrice || a.price));

      setFiltered(result);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
    return () => clearTimeout(timer);
  }, [category, sort]);

  const dealProduct = getDealProduct();

  return (
    <div style={{ background: '#080808' }}>
      {/* 2A. HERO SECTION */}
      <HeroSection product={dealProduct} />

      <div className="container py-5">
        
        {/* 2C. CATEGORY PILLS */}
        <div className="d-flex align-items-center gap-3 mb-5 overflow-auto pb-2 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {['All', ...categories.filter(c => c !== 'All')].map(c => (
            <button
              key={c}
              onClick={() => setSearchParams({ cat: c, sort })}
              className="flex-shrink-0"
              style={{
                background: category === c ? '#D4AF37' : '#111',
                color: category === c ? '#000' : '#9A9690',
                border: category === c ? '1px solid #D4AF37' : '1px solid #2a2a2a',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '0.85rem',
                fontWeight: category === c ? 700 : 400,
                transition: 'all 0.3s ease',
                fontFamily: 'DM Sans'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 2D. PRODUCT GRID HEADER */}
        <div id="collection" className="row align-items-center justify-content-between mb-5 gy-4">
          <div className="col-12 col-md-auto">
            <h2 className="font-display h3 text-t1 mb-2">The Collection</h2>
            <p className="text-t3 text-sm d-flex align-items-center gap-2">
              Curated essence of <span className="text-t2 font-medium">{filtered.length}</span> exceptional timepieces
            </p>
          </div>

          <div className="col-12 col-md-auto d-flex align-items-center gap-3">
            {/* Sort Dropdown */}
            <div className="position-relative">
              <select
                value={sort}
                onChange={(e) => setSearchParams({ cat: category, sort: e.target.value })}
                className="form-select"
                style={{ 
                  background: '#0F0F0F', 
                  color: '#9A9690', 
                  border: '1px solid #1e1e1e',
                  fontSize: '0.85rem',
                  padding: '10px 40px 10px 15px',
                  borderRadius: '6px'
                }}
              >
                <option value="default">Sort by: Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2D. PRODUCT GRID */}
        <div className="row g-4">
          <AnimatePresence>
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="col-6 col-md-4 col-lg-3">
                  <SkeletonCard />
                </div>
              ))
            ) : (
              filtered.map((p, idx) => (
                <div key={p.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} index={idx} />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>

        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-5 my-5 text-center"
          >
            <p className="text-t3 font-display h4 fst-italic">No timepieces matching your selection were found.</p>
            <button
              onClick={() => setSearchParams({})}
              className="mt-3 text-gold text-sm text-decoration-underline"
              style={{ background: 'none', border: 'none', fontSize: '0.875rem' }}
            >
              Reset filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
