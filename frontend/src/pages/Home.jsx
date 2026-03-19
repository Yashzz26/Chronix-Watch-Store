import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineFilter, HiChevronDown } from 'react-icons/hi';
import { products, getDealProduct, categories } from '../data/products';
import DealBanner from '../components/product/DealBanner';
import ProductCard from '../components/product/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';

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
    <div className="container py-5">
      {/* Hero / Deal */}
      <DealBanner product={dealProduct} />

      {/* Grid Controls */}
      <div className="row align-items-center justify-content-between mb-5 gy-4">
        <div className="col-12 col-md-auto">
          <h2 className="font-display h3 text-t1 mb-2">The Collection</h2>
          <p className="text-t3 text-sm d-flex align-items-center gap-2">
            Showing <span className="text-t2 font-medium">{filtered.length}</span> exceptional timepieces
          </p>
        </div>

        <div className="col-12 col-md-auto d-flex align-items-center gap-3">
          {/* Category Filter */}
          <div className="position-relative flex-grow-1">
            <select
              value={category}
              onChange={(e) => setSearchParams({ cat: e.target.value, sort })}
              className="form-select chronix-input py-2 text-sm text-t2 border-border"
              style={{ background: '#0F0F0F', paddingLeft: 40 }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <HiOutlineFilter className="position-absolute start-0 ms-3 top-50 translate-middle-y text-t3 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="position-relative flex-grow-1">
            <select
              value={sort}
              onChange={(e) => setSearchParams({ cat: category, sort: e.target.value })}
              className="form-select chronix-input py-2 text-sm text-t2 border-border"
              style={{ background: '#0F0F0F' }}
            >
              <option value="default">Sort by: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-4">
        <AnimatePresence mode="wait">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <SkeletonCard />
              </div>
            ))
          ) : (
            filtered.map((p, idx) => (
              <div key={p.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
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
          className="py-24 text-center"
        >
          <p className="text-t3 font-display h4 fst-italic">No timepieces matching your selection were found.</p>
          <button
            onClick={() => setSearchParams({})}
            className="mt-3 text-gold text-sm text-decoration-underline"
            style={{ background: 'none', border: 'none' }}
          >
            Reset filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
