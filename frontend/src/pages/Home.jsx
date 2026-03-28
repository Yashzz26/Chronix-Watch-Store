import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  HiArrowRight, 
  HiOutlineShoppingCart,
  HiStar,
  HiOutlineArrowUpRight,
  HiOutlineShieldCheck,
  HiOutlineArrowPath
} from 'react-icons/hi2';
import { products } from '../data/products';
import SkeletonCard from '../components/ui/SkeletonCard';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [searchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(true);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  const newArrivals = useMemo(() => products.slice(0, 3), []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-minimal">
      <style>{`
        .home-minimal { background: var(--bg); color: var(--t1); overflow-x: hidden; }
        
        /* --- 1. HERO --- */
        .hero-cinema { 
          min-height: 90vh; 
          display: flex; 
          align-items: center; 
          position: relative; 
          overflow: hidden; 
          background: #080808; 
          color: #fff;
        }
        .hero-grain { 
          position: absolute; 
          inset: 0; 
          background: url('https://grains.com/noise.png'); 
          opacity: 0.02; 
          pointer-events: none; 
          z-index: 1; 
        }
        .hero-glow { 
          position: absolute; 
          top: 35%; 
          right: 0%; 
          width: 800px; 
          height: 800px; 
          background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%); 
          filter: blur(120px); 
          pointer-events: none; 
          z-index: 0; 
        }
        .hero-headline { 
          font-family: var(--font-display); 
          font-size: clamp(3.5rem, 8vw, 7.5rem); 
          line-height: 0.95; 
          letter-spacing: -0.04em; 
          font-weight: 700; 
          margin-bottom: 24px; 
        }
        .hero-sub { 
          color: #a0a0a0; 
          max-width: 480px; 
          font-size: 1.1rem; 
          line-height: 1.7; 
          margin-bottom: 40px; 
        }

        .review-avatar-group {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }
        .review-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--gold);
          overflow: hidden;
        }
        .review-text {
          font-size: 0.8rem;
          color: var(--gold);
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        /* --- 2. NEW ARRIVALS --- */
        .section-header { 
          padding: 120px 0 60px; 
          text-align: center; 
        }
        .section-title { 
          font-family: var(--font-display); 
          font-size: clamp(2.5rem, 5vw, 4rem); 
          font-weight: 700; 
          margin-bottom: 16px; 
        }

        /* --- 3. FEATURES GRID --- */
        .features-grid { padding: 100px 0; background: var(--bg-2); }
        .feature-item { 
          padding: 40px; 
        }
        .feature-title { 
          font-family: var(--font-display); 
          font-size: 1.8rem; 
          font-weight: 700; 
          margin-bottom: 12px; 
        }
        .feature-desc { 
          color: var(--t2); 
          font-size: 0.95rem; 
          line-height: 1.7; 
        }

        /* --- 4. LIFESTYLE GRID --- */
        .lifestyle-section { padding: 120px 0; }
        .lifestyle-grid { 
          display: grid; 
          grid-template-columns: repeat(12, 1fr); 
          gap: 24px; 
        }
        .lifestyle-item { position: relative; border-radius: 12px; overflow: hidden; height: 500px; }
        .lifestyle-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .lifestyle-item:hover img { transform: scale(1.05); }
        .lifestyle-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 60%, rgba(0,0,0,0.8));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
          color: #fff;
        }

        /* --- 5. DARK BANNER --- */
        .archive-banner { 
          background: #0a0a0a; 
          color: #fff; 
          padding: 140px 0; 
          text-align: center; 
          position: relative;
        }

        .cta-group {
          display: flex;
          gap: 24px;
          align-items: center;
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="hero-cinema" ref={heroRef}>
        <div className="hero-grain" />
        <div className="hero-glow" />
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-12 col-lg-7">
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 1 }}
              >
                <div className="review-avatar-group">
                  <div className="review-avatar">
                    <img src="https://i.pravatar.cc/100?img=33" alt="Reviewer" className="w-100 h-100 object-fit-cover" />
                  </div>
                  <div className="review-text">“THE ULTIMATE INSTRUMENT” — J. DOE</div>
                </div>

                <h1 className="hero-headline">
                  Crafting Timeless <br /> 
                  <span className="text-gold-gradient">Horological Art</span>
                </h1>
                <p className="hero-sub">
                  An elite selection of curated timepieces for the modern connoisseur. Engineered for those who understand that perfection is the only standard.
                </p>
                <div className="cta-group">
                  <Link to="/allcollection" className="btn-gold">Explore Archive</Link>
                  <Link to="/allcollection" className="btn-ghost" style={{ color: '#D4AF37', border: 'none', padding: '0px' }}>
                    Shop Collection <HiArrowRight className="ms-1" />
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="col-12 col-lg-5 d-none d-lg-block">
               <motion.div 
                 style={{ opacity: heroOpacity, scale: heroScale }}
                 className="text-end"
               >
                 <motion.img 
                   animate={{ y: [0, -20, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   src={products[2].imageGallery[0]} 
                   className="img-fluid" 
                   style={{ maxWidth: '480px', filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8))' }} 
                   alt="Featured Watch" 
                 />
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NEW ARRIVALS */}
      <section className="container">
        <div className="section-header">
          <span className="section-label">Seasonal Drops</span>
          <h2 className="section-title">New Arrivals</h2>
        </div>
        <div className="row g-4">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="col-12 col-md-4"><SkeletonCard /></div>)
            ) : (
              newArrivals.map((p, i) => (
                <div key={p.id} className="col-12 col-md-4">
                  <ProductCardElite product={p} index={i} addItem={addItem} />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="text-center mt-5 pt-4">
           <Link to="/allcollection" className="btn-outline-gold">View Full Archive</Link>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section className="features-grid mt-5">
        <div className="container">
          <div className="row align-items-center g-0">
            <div className="col-12 col-md-4">
              <div className="feature-item text-md-end">
                <h3 className="feature-title">Institutional Precision</h3>
                <p className="feature-desc">Calibrated movements that define industry accuracy standards, ensuring every second counts.</p>
              </div>
              <div className="feature-item text-md-end">
                <h3 className="feature-title">Institutional Grading</h3>
                <p className="feature-desc">Every timepiece undergoes rigorous verification by our archival group before release.</p>
              </div>
            </div>
            <div className="col-12 col-md-4 text-center">
              <motion.img 
                whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                src={products[5].imageGallery[0]} 
                alt="Feature Focus" 
                className="img-fluid p-4"
                style={{ maxHeight: '500px' }}
              />
            </div>
            <div className="col-12 col-md-4">
              <div className="feature-item">
                <h3 className="feature-title">Technical Mastery</h3>
                <p className="feature-desc">Sourcing the rarest materials worldwide to craft skeletal structures of immense durability.</p>
              </div>
              <div className="feature-item">
                <h3 className="feature-title">Priority Logistics</h3>
                <p className="feature-desc">White-glove delivery experience designed for the protection of archival assets.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIFESTYLE GRID */}
      <section className="lifestyle-section container">
        <div className="section-header">
          <span className="section-label">Editorial</span>
          <h2 className="section-title">In Proper Context</h2>
        </div>
        <div className="lifestyle-grid">
          <motion.div 
            whileInView={{ opacity: [0,1], y: [20,0] }}
            className="lifestyle-item col-12 col-md-8" style={{ gridColumn: 'span 8' }}
          >
            <img src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2574&auto=format&fit=crop" alt="Lifestyle" />
            <div className="lifestyle-overlay">
              <h3 className="font-display h2">The Modern Maison</h3>
              <p className="small">Redefining the standard of daily instruments.</p>
            </div>
          </motion.div>
          <motion.div 
            whileInView={{ opacity: [0,1], y: [20,0] }}
            className="lifestyle-item col-12 col-md-4" style={{ gridColumn: 'span 4' }}
          >
            <img src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2574&auto=format&fit=crop" alt="Lifestyle" />
            <div className="lifestyle-overlay">
              <h3 className="font-display h3">Vault Archives</h3>
              <p className="small">Limited seasonal technical releases.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. ARCHIVE BANNER */}
      <section className="archive-banner">
        <div className="container position-relative z-1">
          <span className="section-label">The Absolute Archive</span>
          <h2 className="display-3 font-display mb-4">A Sanctuary for Horological Art.</h2>
          <p className="mx-auto mb-5" style={{ maxWidth: 600, opacity: 0.7 }}>
            Experience the curation of silence and precision. Every piece tells a story of engineering brilliance and aesthetic restraint.
          </p>
          <Link to="/allcollection" className="btn-gold">Access the Collection</Link>
        </div>
      </section>

    </div>
  );
}

// ELITE PRODUCT CARD
function ProductCardElite({ product, index, addItem }) {
  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} Archived`, {
      style: { background: '#fff', color: '#111', border: '1px solid var(--border)' }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="chronix-card p-0"
    >
      <Link to={`/product/${product.id}`} className="text-decoration-none">
        <div className="product-img-wrap p-5" style={{ background: 'var(--bg-2)' }}>
          <img src={product.imageGallery[0]} alt={product.name} className="img-fluid" />
        </div>
        <div className="p-4 text-center">
           <span className="section-label" style={{ fontSize: '0.6rem', color: 'var(--gold)' }}>{product.category}</span>
           <h3 className="font-display h4 text-t1 mb-2">{product.name}</h3>
           <div className="text-gold font-mono fw-bold mb-3">₹{product.price.toLocaleString()}</div>
           <button 
             className="btn-gold w-100" 
             style={{ fontSize: '0.7rem', padding: '10px' }}
             onClick={handleAddToCart}
           >
             Secure Delivery
           </button>
        </div>
      </Link>
    </motion.div>
  );
}
