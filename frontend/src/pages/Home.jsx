import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  HiArrowRight, 
  HiOutlineShieldCheck, 
  HiOutlineTruck,
  HiOutlineShoppingCart,
  HiStar,
  HiOutlineCheckBadge,
  HiOutlineSparkles,
  HiOutlineGlobeAlt,
  HiOutlineClock,
  HiOutlineRocketLaunch,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowUpRight
} from 'react-icons/hi2';
import { products, getDealProduct, categories } from '../data/products';
import SkeletonCard from '../components/ui/SkeletonCard';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const category = searchParams.get('cat') || 'All';
  const sort = searchParams.get('sort') || 'default';
  const [loading, setLoading] = useState(true);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  const dealProduct = getDealProduct();
  const heroProduct = products[2]; // G-Shock GA2100 - High Detail choice

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (sort === 'price-low') result.sort((a, b) => (a.dealPrice || a.price) - (b.dealPrice || b.price));
    else if (sort === 'price-high') result.sort((a, b) => (b.dealPrice || b.price) - (a.dealPrice || a.price));
    return result;
  }, [category, sort]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [category, sort]);

  return (
    <div className="home-luxury">
      <style>{`
        .home-luxury { background: #070707; color: #F0EDE8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        
        /* --- 1. HERO --- */
        .hero-cinema { min-height: 95vh; display: flex; align-items: center; position: relative; overflow: hidden; background: radial-gradient(circle at 75% 50%, rgba(212,175,55,0.1) 0%, transparent 60%); }
        .hero-grain { position: absolute; inset: 0; background: url('https://grains.com/noise.png'); opacity: 0.03; pointer-events: none; z-index: 1; animation: grain 8s steps(10) infinite; }
        @keyframes grain { 0%, 100% { transform: translate(0,0); } 10% { transform: translate(-1%,-1%); } 20% { transform: translate(1%,1%); } }
        .hero-glow { position: absolute; top: 50%; right: 5%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%); filter: blur(120px); pointer-events: none; z-index: 0; }
        .hero-headline { font-family: 'Cormorant Garamond', serif; font-size: clamp(4rem, 9vw, 8rem); line-height: 0.95; letter-spacing: -0.04em; font-weight: 700; margin-bottom: 28px; }
        .gold-reveal { background: linear-gradient(135deg, #D4AF37, #FBE08F); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-sub { color: #8F8C88; max-width: 520px; font-size: 1.15rem; line-height: 1.8; margin-bottom: 45px; }
        .btn-lux-primary { background: #D4AF37; color: #000; padding: 18px 45px; border-radius: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.85rem; transition: all 0.4s; box-shadow: 0 10px 30px rgba(212,175,55,0.2); border: none; text-decoration: none; }
        .btn-lux-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 40px rgba(212,175,55,0.4); background: #F0D060; color: #000; }
        .hero-reflection { position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%) rotateX(60deg); width: 100%; height: 80px; background: radial-gradient(ellipse at center, rgba(212,175,55,0.2) 0%, transparent 75%); filter: blur(30px); pointer-events: none; }
        
        /* --- 2. STORY STRIP --- */
        .story-strip { padding: 80px 0; border-bottom: 1px solid #161616; text-align: center; background: #090909; }
        .section-label { font-size: 0.7rem; color: #D4AF37; text-transform: uppercase; letter-spacing: 0.4em; border-bottom: 1px solid rgba(212,175,55,0.3); display: inline-block; padding-bottom: 8px; margin-bottom: 24px; }

        /* --- 3. CATEGORY CARDS --- */
        .cat-card { position: relative; height: 420px; border-radius: 20px; overflow: hidden; background: #111; cursor: pointer; border: 1px solid #1e1e1e; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @media (max-width: 768px) { .cat-card { height: 280px; } }
        .cat-card:hover { border-color: #D4AF37; transform: translateY(-10px); }
        .cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s; opacity: 0.6; }
        .cat-card:hover .cat-img { transform: scale(1.1); opacity: 0.8; }
        .cat-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 20%, rgba(0,0,0,0.95)); display: flex; flex-direction: column; justify-content: flex-end; padding: 40px; }
        .cat-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem, 3vw, 2.5rem); color: #fff; transform: translateY(10px); transition: all 0.4s; }
        .cat-card:hover .cat-title { transform: translateY(0); color: #D4AF37; }

        /* --- 4. PRODUCT CARD V2 --- */
        .product-v2 { background: #0F0F0F; border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden; transition: all 0.4s ease; height: 100%; position: relative; }
        .product-v2:hover { border-color: rgba(212,175,55,0.5); transform: translateY(-5px); box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .pv2-image-box { aspect-ratio: 1; background: radial-gradient(circle at center, #1b1b1b, #0a0a0a); display: flex; align-items: center; justify-content: center; padding: 30px; position: relative; overflow: hidden; }
        .pv2-img { max-width: 90%; max-height: 90%; object-fit: contain; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .product-v2:hover .pv2-img { transform: scale(1.1); }
        .pv2-badge { position: absolute; top: 15px; left: 15px; font-size: 0.6rem; font-weight: 800; background: #D4AF37; color: #000; padding: 5px 10px; border-radius: 4px; text-transform: uppercase; z-index: 5; }
        .pv2-quick { position: absolute; bottom: 0; left: 0; right: 0; background: #D4AF37; color: #000; font-size: 0.75rem; font-weight: 700; padding: 12px; transform: translateY(100%); transition: all 0.3s; text-align: center; text-decoration: none; border: none; cursor: pointer; z-index: 10; }
        .product-v2:hover .pv2-quick { transform: translateY(0); }

        /* --- 5. BANNER --- */
        .featured-banner { height: 500px; background: linear-gradient(to right, #000, transparent), url('https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2574&auto=format&fit=crop'); background-size: cover; background-position: center; border-radius: 24px; display: flex; align-items: center; padding: 80px; position: relative; overflow: hidden; }
        
        /* --- 6. WHY CHOOSE --- */
        .why-box { background: #0d0d0d; border: 1px solid #1a1a1a; padding: 40px; border-radius: 20px; text-align: center; height: 100%; transition: 0.3s; }
        .why-box:hover { border-color: #D4AF37; transform: translateY(-5px); background: #111; }
        .why-icon-wrap { width: 80px; height: 80px; background: rgba(212,175,55,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; color: #D4AF37; border: 1px solid rgba(212,175,55,0.1); }

        /* --- 7. TESTIMONIALS --- */
        .review-card { background: #0F0F0F; padding: 40px; border-radius: 24px; border: 1px solid #1e1e1e; position: relative; border-left: 4px solid #D4AF37; }
        .quote-icon { position: absolute; top: 20px; right: 30px; opacity: 0.08; font-size: 4rem; color: #D4AF37; }

        /* --- 8. URGENCY --- */
        .urgency-strip { background: #0a0a0a; padding: 25px 0; border-top: 1px solid #161616; border-bottom: 1px solid #161616; }
        .scrolling-text { white-space: nowrap; animation: scroll 60s linear infinite; display: flex; gap: 80px; }
        .ticker-dot { width: 6px; height: 6px; background: #D4AF37; border-radius: 50%; opacity: 0.5; }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .pill-btn {
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 0.8rem;
          cursor: pointer;
          border: 1px solid #1e1e1e;
          background: #0f0f0f;
          color: #9A9690;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .pill-btn:hover { border-color: #3a3a3a; }
        .pill-btn.active { background: #D4AF37; color: #000; font-weight: 700; border-color: transparent; }

        .hover-gold:hover { color: #D4AF37 !important; }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="hero-cinema" ref={heroRef}>
        <div className="hero-grain" />
        <div className="hero-glow" />
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-12 col-lg-7">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <span className="section-label">Institutional Precision</span>
                <h1 className="hero-headline text-white">
                  Crafting Timeless <br /> 
                  <span className="gold-reveal">Horological Art</span>
                </h1>
                <p className="hero-sub">
                  An elite selection of curated instruments for the modern connoisseur. Engineered for those who understand that perfection is the only standard.
                </p>
                <div className="d-flex gap-4 align-items-center mb-5">
                   <Link to="/allcollection" className="btn-lux-primary shadow-lg d-inline-flex align-items-center gap-2">
                     Acquire Now <HiArrowRight />
                   </Link>
                   <Link to="/allcollection" className="text-decoration-none fw-bold small tracking-widest uppercase hover-gold transition-all" style={{ color: '#D4AF37' }}>
                     Our Heritage
                   </Link>
                </div>
                
                <div className="d-flex flex-wrap gap-4 gap-md-5 pt-4 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center gap-2 small text-t3 uppercase tracking-widest">
                    <HiStar className="text-gold" /> Trusted by 10k+
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-t3 uppercase tracking-widest">
                    <HiOutlineShieldCheck className="text-gold" /> 2-Year Warranty
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-t3 uppercase tracking-widest">
                    <HiOutlineTruck className="text-gold" /> Free Shipping
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-12 col-lg-5 d-none d-lg-block">
               <motion.div 
                 style={{ opacity: heroOpacity, scale: heroScale }}
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 1, delay: 0.2 }}
                 className="position-relative text-end"
               >
                 <motion.img 
                   animate={{ y: [0, -25, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   src={heroProduct.imageGallery[0]} 
                   className="img-fluid position-relative z-1" 
                   style={{ maxWidth: '480px', filter: 'drop-shadow(0 50px 100px rgba(0,0,0,0.9))' }} 
                   alt="" 
                 />
                 <div className="hero-reflection" />
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND STORY STRIP */}
      <section className="story-strip">
         <div className="container">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
               <span className="section-label">Foundations of Chronix</span>
               <h2 className="font-display display-4 text-white mb-4">Established in Absolute <span className="text-gold">Excellence</span></h2>
               <p className="text-t2 mx-auto" style={{ maxWidth: 800, fontSize: '1.05rem', lineHeight: 1.9 }}>
                  Since 2024, Chronix has been the sanctuary for horology enthusiasts. We don't just sell watches; we archive moments of engineering brilliance. Every piece in our collection is a testament to the fact that time is the ultimate luxury.
               </p>
            </motion.div>
         </div>
      </section>

      {/* 3. CATEGORY CARDS */}
      <section className="py-5 bg-black">
         <div className="container py-5">
            <div className="row g-4">
               {[
                 { title: 'Gifts for Him', img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop', link: '/giftsforhim', label: 'Masculine Precision' },
                 { title: 'Gifts for Her', img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop', link: '/giftsforher', label: 'Eternal Elegance' },
                 { title: 'New Arrivals', img: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop', link: '/allcollection', label: '2024 Collection' }
               ].map((c, i) => (
                 <div key={i} className="col-12 col-md-4">
                    <Link to={c.link} className="text-decoration-none">
                       <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} className="cat-card">
                          <img src={c.img} className="cat-img" alt="" />
                          <div className="cat-overlay">
                             <span className="text-gold x-small uppercase tracking-widest mb-2">{c.label}</span>
                             <h3 className="cat-title">{c.title}</h3>
                             <div className="mt-3 text-white-50 x-small d-flex align-items-center gap-2 opacity-0 hover-opacity-100 transition-all">
                                EXPLORE <HiArrowRight />
                             </div>
                          </div>
                       </motion.div>
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. CURATED COLLECTION */}
      <section className="py-5">
         <div className="container py-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
               <div>
                  <span className="section-label">Curated Portfolio</span>
                  <h2 className="font-display display-5 text-white m-0">Institutional Selection</h2>
               </div>
               <div className="d-flex gap-4">
                  <div className="d-flex gap-2 bg-s2 p-1 rounded-pill border border-border">
                     {['All', 'Analog', 'Luxury'].map(cat => (
                       <button 
                         key={cat} 
                         className={`pill-btn ${category === cat ? 'active' : ''}`}
                         onClick={() => setSearchParams({ cat, sort })}
                       >
                         {cat}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="row g-4">
               <AnimatePresence mode="wait">
                  {loading ? (
                    Array(8).fill(0).map((_, i) => <div className="col-6 col-lg-3" key={i}><SkeletonCard /></div>)
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.slice(0, 8).map((p, i) => (
                      <div className="col-6 col-lg-3" key={p.id}>
                         <ProductCardV2 product={p} index={i} addItem={addItem} />
                      </div>
                    ))
                  ) : (
                    <div className="col-12 py-5 text-center opacity-30">No instruments recorded for this criteria.</div>
                  )}
               </AnimatePresence>
            </div>
            
            <div className="text-center mt-5 pt-4">
               <Link to="/allcollection" className="text-gold text-decoration-none fw-bold tracking-widest uppercase small d-inline-flex align-items-center gap-3">
                 View Full Archive <HiArrowRight />
               </Link>
            </div>
         </div>
      </section>

      {/* 5. FEATURED BANNER */}
      <section className="container py-5">
         <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} className="featured-banner">
            <div className="position-relative z-1" style={{ maxWidth: 500 }}>
               <span className="section-label">Highlight</span>
               <h2 className="display-3 font-display text-white mb-4">The Analog <span className="text-gold">Sovereign</span></h2>
               <p className="text-t2 mb-5 lead">
                  A masterpiece of mechanical complexity and aesthetic simplicity. Now available in the Chronix Vault.
               </p>
               <Link to="/product/1" className="btn-lux-primary d-inline-block">Discover Sovereign</Link>
            </div>
         </motion.div>
      </section>

      {/* 6. WHY CHOOSE CHRONIX */}
      <section className="py-5 bg-black">
         <div className="container py-5">
            <div className="text-center mb-5 pb-4">
               <span className="section-label">The Standard</span>
               <h2 className="font-display display-5 text-white">Why Chronix?</h2>
            </div>
            <div className="row g-4">
               {[
                 { icon: <HiOutlineSparkles size={40} />, title: 'Pure Engineering', text: 'Calibrated movements that define industry accuracy.' },
                 { icon: <HiOutlineCheckBadge size={40} />, title: 'Certified Authenthic', text: 'Every instrument is verified by our in-house masters.' },
                 { icon: <HiOutlineGlobeAlt size={40} />, title: 'Global Heritage', text: 'Sourcing the finest materials from around the world.' },
                 { icon: <HiOutlineRocketLaunch size={40} />, title: 'Priority Logistics', text: 'White-glove delivery straight to your trunk.' }
               ].map((it, i) => (
                 <div key={i} className="col-6 col-lg-3">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} className="why-box">
                       <div className="why-icon-wrap">{it.icon}</div>
                       <h3 className="text-white h5 mb-3">{it.title}</h3>
                       <p className="text-t3 mb-0 small">{it.text}</p>
                    </motion.div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 7. SOCIAL PROOF / TESTIMONIALS */}
      <section className="py-5">
         <div className="container py-5">
            <div className="row g-5 align-items-center">
               <div className="col-12 col-lg-4">
                  <span className="section-label">Reputation</span>
                  <h2 className="font-display display-4 text-white mb-4">Patron Stories</h2>
                  <p className="text-t2">Join the league of 10,000+ collectors who have trusted Chronix with their most valuable asset: time.</p>
                  <div className="d-flex text-gold gap-2 fs-2 mt-4">
                     {[...Array(5)].map((_, i) => <HiStar key={i} />)}
                  </div>
               </div>
               <div className="col-12 col-lg-8">
                  <div className="row g-4">
                     {[
                       { name: 'Vikram Seth', role: 'Watch Collector', text: 'The attention to detail in the packaging alone was enough to tell me Chronix is different. The watch is a masterpiece.' },
                       { name: 'Sarah Jones', role: 'Architect', text: 'Clean, minimal, and premium. Exactly what I was looking for in a daily driver. The service was impeccable.' }
                     ].map((t, i) => (
                       <div key={i} className="col-12 col-md-6">
                          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i*0.2 }} className="review-card">
                             <HiOutlineChatBubbleLeftRight className="quote-icon" />
                             <p className="italic fs-5 mb-5" style={{ lineHeight: 1.6, color: '#D4CE98' }}>"{t.text}"</p>
                             <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-s2 overflow-hidden" style={{ width: 44, height: 44 }}>
                                   <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" className="w-100 h-100 object-fit-cover" />
                                </div>
                                <div>
                                   <div className="text-white fw-bold small">{t.name}</div>
                                   <div className="text-gold x-small tracking-widest uppercase">{t.role}</div>
                                </div>
                             </div>
                          </motion.div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 8. URGENCY STRIP */}
      <section className="urgency-strip mb-5 overflow-hidden">
         <div className="scrolling-text">
            {[...Array(8)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="text-white-50 fw-bold tracking-widest uppercase x-small d-flex align-items-center gap-3">
                   SEASONAL ACQUISITION EVENT · UP TO 20% OFF ALL ANALOG PIECES · SECURE YOUR LEGACY TODAY
                </span>
                <div className="ticker-dot" />
              </React.Fragment>
            ))}
         </div>
      </section>

    </div>
  );
}

// PRODUCT CARD V2
function ProductCardV2({ product, index, addItem }) {
  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} Archived`, {
      style: { background: '#0f0f0f', color: '#F0EDE8', border: '1px solid #1e1e1e' }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="product-v2"
    >
      <div className="pv2-image-box">
        {product.isOnDeal && <div className="pv2-badge">Deal of Day</div>}
        {index < 2 && <div className="pv2-badge" style={{ left: 'auto', right: 15, background: '#000', color: '#D4AF37', border: '1px solid #D4AF37' }}>Limited</div>}
        <img src={product.imageGallery[0]} alt={product.name} className="pv2-img" />
        <button className="pv2-quick shadow-lg" onClick={handleAddToCart}>
           SECURE IN TRUNK <HiOutlineShoppingCart className="ms-1" />
        </button>
      </div>
      
      <div className="p-4 d-flex flex-column gap-2 text-center">
         <span className="text-gold x-small uppercase tracking-widest">{product.category}</span>
         <h3 className="text-white h5 m-0 text-truncate font-display" style={{ fontSize: '1rem' }}>{product.name}</h3>
         <div className="d-flex align-items-center justify-content-center gap-2 font-mono">
            <span className="fw-bold" style={{ color: '#F0D060' }}>₹{(product.dealPrice || product.price).toLocaleString()}</span>
            {product.isOnDeal && <span className="text-white-50 small text-decoration-line-through">₹{product.price.toLocaleString()}</span>}
         </div>
         <Link to={`/product/${product.id}`} className="mt-2 text-white-50 x-small text-decoration-none border-bottom border-white-10 d-inline-block mx-auto pb-1 hover-gold transition-all">
            VIEW SPECIFICATIONS
         </Link>
      </div>
    </motion.div>
  );
}
