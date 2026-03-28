import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
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

  const newArrivals = useMemo(() => products.slice(0, 4), []);

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

      {/* 1. HERO SECTION V2 */}
      <section className="hero-cinematic-v2" ref={heroRef}>
        <div className="hero-v2-glow" />
        <div className="container position-relative" style={{ zIndex: 10 }}>
          <div className="row align-items-center min-vh-100 py-5">
            <div className="col-12 col-lg-6">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="review-pill">
                  <div className="d-flex gap-1 text-gold">
                    <HiStar size={14} /><HiStar size={14} /><HiStar size={14} /><HiStar size={14} /><HiStar size={14} />
                  </div>
                  <span className="x-small fw-bold tracking-widest text-white opacity-75">4.9/5 FROM 1200+ REVIEWS</span>
                </div>

                <h1 className="hero-headline text-white mb-4">
                  Timeless Elegance <br /> 
                  <span className="text-gold-gradient">on Your Wrist</span>
                </h1>
                <p className="hero-sub text-white opacity-50 mb-5 pe-lg-5">
                  Discover timepieces curated with absolute precision, premium materials, and designs that define generations of horological mastery.
                </p>
                <div className="d-flex flex-wrap gap-4">
                  <Link to="/allcollection" className="btn-gold px-5 py-3">Explore Collection</Link>
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.5 }}
                    className="d-none d-md-flex align-items-center gap-3"
                  >
                    <div className="d-flex -space-x-2">
                       <img src="https://i.pravatar.cc/100?img=1" className="rounded-circle border border-2 border-dark" style={{ width: 32, height: 32 }} alt="User" />
                       <img src="https://i.pravatar.cc/100?img=2" className="rounded-circle border border-2 border-dark" style={{ width: 32, height: 32, marginLeft: -12 }} alt="User" />
                       <img src="https://i.pravatar.cc/100?img=3" className="rounded-circle border border-2 border-dark" style={{ width: 32, height: 32, marginLeft: -12 }} alt="User" />
                    </div>
                    <span className="x-small text-white opacity-50 fw-bold">JOIN 10K+ COLLECTORS</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-12 col-lg-6 mt-5 mt-lg-0 text-center text-lg-end">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                 className="animate-float"
               >
                 <img 
                   src={products[2].imageGallery[0]} 
                   className="img-fluid" 
                   style={{ maxHeight: '700px', filter: 'drop-shadow(0 40px 100px rgba(212,175,55,0.15))' }} 
                   alt="Luxury Watch Hero" 
                 />
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NEW ARRIVALS V2 */}
      <section className="section-padding container">
        <div className="text-center mb-5 pb-3">
          <span className="section-label">THE NEW ERA</span>
          <h2 className="section-title">New Arrivals</h2>
        </div>
        <div className="row g-4">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="col-12 col-md-6 col-lg-3"><SkeletonCard /></div>)
            ) : (
              newArrivals.map((p, i) => (
                <div key={p.id} className="col-12 col-md-6 col-lg-3">
                  <ProductCardEditorial product={p} index={i} addItem={addItem} />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="text-center mt-5 pt-4">
           <Link to="/allcollection" className="btn-ghost px-5">View All Products</Link>
        </div>
      </section>

      {/* 3. FEATURE FOCUS SECTION */}
      <section className="feature-focus-system bg-white">
        <div className="container">
          <div className="text-center mb-5 pb-5">
            <span className="section-label">THE ARCHITECTURE</span>
            <h2 className="section-title">Designed for Excellence</h2>
          </div>
          <div className="row align-items-center">
            <div className="col-12 col-md-4">
              <div className="feature-block-item text-md-end">
                <span className="feature-block-num">01.</span>
                <h3 className="feature-title">Trusted Precision</h3>
                <p className="feature-desc">High-quality quartz movement ensures accurate and dependable timekeeping in every environment.</p>
              </div>
              <div className="feature-block-item text-md-end">
                <span className="feature-block-num">02.</span>
                <h3 className="feature-title">Elegant Craftsmanship</h3>
                <p className="feature-desc">Refined designs with premium finishes, crafted for the modern professional and daily elegance.</p>
              </div>
            </div>
            
            <div className="col-12 col-md-4 text-center my-4 my-md-0">
               <motion.img 
                 whileInView={{ y: [20, 0], opacity: [0, 1] }}
                 viewport={{ once: true }}
                 src={products[5].imageGallery[0]} 
                 className="img-fluid animate-float" 
                 style={{ maxHeight: '550px' }}
                 alt="Main Feature Product" 
               />
            </div>

            <div className="col-12 col-md-4">
              <div className="feature-block-item">
                <span className="feature-block-num">03.</span>
                <h3 className="feature-title">Water Resistant</h3>
                <p className="feature-desc">Engineered to handle life's elements with ease, providing durability without compromising on style.</p>
              </div>
              <div className="feature-block-item">
                <span className="feature-block-num">04.</span>
                <h3 className="feature-title">Durable Materials</h3>
                <p className="feature-desc">Strong cases and scratch-resistant glass ensure your timepiece remains pristine for years to come.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORY STORYTELLING */}
      <section className="section-padding container">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <Link to="/allcollection?cat=classic" className="category-story-card">
              <img src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2574&auto=format&fit=crop" alt="Classic Collection" />
              <div className="category-story-content">
                <span className="section-label text-white opacity-75">LIMITED EDITION</span>
                <h3 className="hero-headline h2 text-white">The Classic <br /> Series</h3>
                <p className="small text-white opacity-50">Explore the foundation of our archival collection.</p>
              </div>
            </Link>
          </div>
          <div className="col-12 col-md-6">
            <Link to="/allcollection?cat=modern" className="category-story-card">
              <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2680&auto=format&fit=crop" alt="Modern Collection" />
              <div className="category-story-content">
                <span className="section-label text-white opacity-75">TECHNICAL CRAFT</span>
                <h3 className="hero-headline h2 text-white">Modern <br /> Minimalism</h3>
                <p className="small text-white opacity-50">Engineered for the contemporary landscape.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL STORY BLOCKS */}
      <section className="bg-white overflow-hidden">
        <div className="story-block">
          <div className="story-img-wrap">
            <img src="https://images.unsplash.com/photo-1622353382113-838c93f4129b?q=80&w=2670&auto=format&fit=crop" alt="Precision" />
          </div>
          <div className="story-content">
            <span className="section-label">HOROLOGICAL STORY</span>
            <h2 className="hero-headline h1">Crafting the <br /> Second.</h2>
            <p className="hero-sub opacity-75 pe-md-5">
              Every Chronix watch is a result of hundreds of hours of design and engineering. We believe that a timepiece shouldn't just tell time—it should embody it. From the micro-vibrations of the movement to the hand-polished bezel, every detail is a testament to our pursuit of perfection.
            </p>
            <Link to="/about" className="btn-ghost mt-4">Read Our Story</Link>
          </div>
        </div>

        <div className="story-block" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div className="story-content order-2 order-md-1">
            <span className="section-label">MATERIAL MASTERY</span>
            <h2 className="hero-headline h1">Built to <br /> Last.</h2>
            <p className="hero-sub opacity-75 pe-md-5">
              We source the world's most resilient materials—316L stainless steel, scratch-resistant sapphire crystal, and premium Italian leathers. Our watches are designed to survive the elements while maintaining an air of effortless sophisticated luxury.
            </p>
            <div className="d-flex gap-4 mt-5">
              <div className="text-center">
                <span className="font-display h3 d-block text-gold">10ATM</span>
                <span className="x-small tracking-widest opacity-50 fw-bold">WATER DEPTH</span>
              </div>
              <div className="text-center">
                <span className="font-display h3 d-block text-gold">72HRS</span>
                <span className="x-small tracking-widest opacity-50 fw-bold">POWER RESERVE</span>
              </div>
            </div>
          </div>
          <div className="story-img-wrap order-1 order-md-2">
            <img src="https://images.unsplash.com/photo-1548171916-c0ea9869685e?q=80&w=2672&auto=format&fit=crop" alt="Materials" />
          </div>
        </div>
      </section>

      {/* 6. FINAL FINAL CTA SECTION */}
      <section className="final-cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="section-label text-gold">THE FINAL WORD</span>
            <h2 className="display-4 font-display mb-4 text-white">Own the Moment.</h2>
            <p className="mx-auto mb-5 opacity-50" style={{ maxWidth: 600 }}>
              Join thousands of collectors who refuse to settle for anything less than horological excellence. Your next legacy piece is waiting.
            </p>
            <Link to="/allcollection" className="btn-gold px-5 py-3">Access the Collection</Link>
            <div className="mt-5 pt-4">
              <span className="x-small tracking-widest opacity-25 fw-bold">CHRONIX. GENÈVE — SINCE 2024</span>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

// EDITORIAL PRODUCT CARD
function ProductCardEditorial({ product, index, addItem }) {
  const navigate = useNavigate();
  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      style: { background: '#fff', color: '#111', border: '1px solid var(--border)' }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="editorial-product-card"
    >
      <Link to={`/product/${product.id}`} className="text-decoration-none">
        <div className="product-img-wrap p-4" style={{ background: 'var(--bg-2)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={product.imageGallery[0]} 
            alt={product.name} 
            className="img-fluid" 
            style={{ maxHeight: '240px', objectFit: 'contain' }}
          />
          <div className="card-quick-actions">
             <button onClick={(e) => { e.preventDefault(); navigate(`/product/${product.id}`); }} className="btn-gold flex-grow-1" style={{ fontSize: '0.65rem' }}>View Details</button>
             <button onClick={handleAddToCart} className="btn-ghost" style={{ fontSize: '0.65rem', padding: '10px' }}>
                <HiOutlineShoppingCart size={16} />
             </button>
          </div>
        </div>
        <div className="p-4 text-center">
           <span className="section-label" style={{ fontSize: '0.55rem', color: 'var(--gold)' }}>{product.category || "LUXURY SERIES"}</span>
           <h3 className="font-display h5 text-t1 mb-1">{product.name}</h3>
           <div className="x-small tracking-widest text-t3 mb-2">42 MM · CHRONOGRAPH</div>
           <div className="text-gold font-mono fw-bold">₹{product.price.toLocaleString()}</div>
        </div>
      </Link>
    </motion.div>
  );
}
