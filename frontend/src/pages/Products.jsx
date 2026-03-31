import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { categories } from '../data/products';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

const SkeletonCard = () => (
  <div className="bg-white border border-border p-4 h-100 animate-pulse">
    <div className="bg-bg-1 w-100 aspect-square mb-4" />
    <div className="h-6 bg-bg-1 w-3/4 mb-2" />
    <div className="h-4 bg-bg-1 w-1/2" />
  </div>
);

export default function Products({ filterCategory }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);

  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDbProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Could not load products');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const urlCategory = searchParams.get('cat') || 'All';
  const activeCategory = filterCategory || urlCategory;
  const sort = searchParams.get('sort') || 'default';
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredProducts = useMemo(() => {
    let result = [...dbProducts];
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (sort === 'price-low') {
      result.sort((a, b) => (a.dealPrice || a.price) - (b.dealPrice || b.price));
    } else if (sort === 'price-high') {
      result.sort((a, b) => (b.dealPrice || b.price) - (a.dealPrice || a.price));
    }
    return result;
  }, [dbProducts, activeCategory, sort]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sort]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleCategoryChange = (cat) => {
    setSearchParams({ cat, sort });
  };

  const handleSortChange = (newSort) => {
    setSearchParams({ cat: urlCategory, sort: newSort });
  };

  return (
    <div className="products-archive">
      <style>{`
        .products-archive {
          background: var(--bg);
          color: var(--t1);
          min-height: 100vh;
        }

        .archive-hero {
          padding: 120px 0 64px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 48px;
          background: #fff;
        }

        .archive-sidebar {
          position: sticky;
          top: 120px;
        }

        .category-filter-item {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--t2);
          padding: 12px 0;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          transition: color 0.2s ease;
        }
        .category-filter-item:hover { color: var(--gold); }
        .category-filter-item.active { color: var(--t1); border-bottom-color: var(--gold); }
        .category-count { font-family: var(--font-mono); font-size: 0.75rem; opacity: 0.5; }

        .archive-sort-select {
          width: 100%;
          background: var(--s1);
          border: 1px solid var(--border);
          color: var(--t1);
          padding: 12px 14px;
          border-radius: 14px;
          font-size: 0.9rem;
        }

        .archive-chips {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }

        .filter-chip {
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 6px 16px;
          background: transparent;
          font-size: 0.85rem;
          color: var(--t2);
          transition: all 0.2s ease;
        }

        .filter-chip.is-active {
          background: var(--t1);
          color: #fff;
          border-color: var(--t1);
        }

        .pagination-wrap {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 80px;
        }
        .page-node {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--s1);
          border: 1px solid var(--border);
          font-size: 0.85rem;
          color: var(--t2);
          border-radius: 14px;
          transition: var(--transition);
        }
        .page-node.active { background: var(--t1); color: #FFF; border-color: var(--t1); }
        .page-node:hover:not(.active) { border-color: var(--gold); color: var(--gold); }

        .product-card-institutional {
          border: 1px solid var(--border);
          background: #fff;
          border-radius: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: var(--transition);
          overflow: hidden;
        }
        .product-card-institutional:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .p-card-img {
          aspect-ratio: 1/1;
          background: var(--bg-1);
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .p-card-img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.5s ease;
        }
        .product-card-institutional:hover .p-card-img img { transform: scale(1.05); }
      `}</style>

      <div className="archive-hero">
        <div className="container">
          <div className="row align-items-end">
             <div className="col-lg-8">
                <span className="section-label-gold mb-3">All watches</span>
                <h1 className="font-display display-3 m-0 py-2">
                  {activeCategory === 'All' ? 'Every reference' : activeCategory}
                </h1>
                <p className="text-t3 mt-3" style={{ maxWidth: 520 }}>
                  Filter by category, sort by price, and find the watch that fits the way you actually live with it.
                </p>
             </div>
             <div className="col-lg-4 text-lg-end">
                <p className="text-t3 x-small fw-bold tracking-widest uppercase m-0 opacity-50">Free shipping across India</p>
             </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-5">
          {/* SIDEBAR */}
          <div className="col-lg-3 d-none d-lg-block">
            <aside className="archive-sidebar">
              <span className="section-label mb-4 d-block" style={{ fontSize: '0.65rem' }}>Categories</span>
              <div className="mb-5">
                {categories.map((cat) => (
                  <div 
                    key={cat} 
                    className={`category-filter-item ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    <span>{cat}</span>
                    <span className="category-count">
                      {cat === 'All' ? dbProducts.length : dbProducts.filter(p => p.category === cat).length}
                    </span>
                  </div>
                ))}
              </div>

              <span className="section-label mb-4 d-block" style={{ fontSize: '0.65rem' }}>Sort by</span>
              <select 
                className="archive-sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="default">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </aside>
          </div>

          {/* GRID */}
          <div className="col-lg-9">
            <div className="archive-chips d-none d-lg-flex">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`filter-chip ${activeCategory === cat ? 'is-active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="d-lg-none d-flex justify-content-between align-items-center mb-5">
               <span className="section-label m-0">{filteredProducts.length} WATCHES</span>
               <button className="btn-chronix-outline py-2 px-3 x-small fw-bold" onClick={() => setShowFilters(true)}>
                  <HiAdjustmentsHorizontal /> Filters
               </button>
            </div>

            <div className="row g-4">
              <AnimatePresence>
                {loading ? (
                   Array(6).fill(0).map((_, i) => <div className="col-md-6 col-xl-4" key={i}><SkeletonCard /></div>)
                ) : currentProducts.length > 0 ? (
                  currentProducts.map((p, idx) => (
                    <motion.div 
                      key={p.id}
                      className="col-md-6 col-xl-4"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (idx % 3) * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                       <div className="product-card-institutional">
                          <Link to={`/product/${p.id}`} className="p-card-img">
                             <img src={p.imageGallery[0]} alt={p.name} />
                          </Link>
                          <div className="p-4 bg-white flex-grow-1 d-flex flex-column">
                             <span className="section-label-gold x-small mb-2" style={{ fontSize: '0.55rem' }}>{p.category}</span>
                             <h3 className="h6 font-display fw-bold mb-3 flex-grow-1">{p.name}</h3>
                             <div className="d-flex justify-content-between align-items-end">
                                <span className="small fw-bold font-mono">₹{p.price.toLocaleString()}</span>
                                <button className="btn-chronix-outline py-1 px-3 x-small fw-bold" onClick={(e) => {
                                   e.preventDefault();
                                   addItem({...p, variants: p.variants?.[0] || null});
                                   toast.success('Added to cart');
                                }}>Add to cart</button>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-12 py-5 text-center text-t3 border border-border border-dashed">
                     <p className="uppercase tracking-widest small fw-bold">No watches match these filters.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination-wrap">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`page-node ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER OVERLAY */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed-inset bg-white p-5" style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
             <div className="d-flex justify-content-between align-items-center mb-5">
                <span className="section-label m-0">Refine filters</span>
                <button className="btn p-0" onClick={() => setShowFilters(false)}><HiXMark size={28} /></button>
             </div>
             {categories.map((cat) => (
               <div key={cat} className="h4 font-display py-3 border-bottom border-border" onClick={() => { handleCategoryChange(cat); setShowFilters(false); }}>
                  {cat}
               </div>
             ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

