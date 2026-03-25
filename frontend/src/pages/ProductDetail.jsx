import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  HiStar, 
  HiOutlineShieldCheck, 
  HiOutlineTruck, 
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiOutlineMapPin,
  HiOutlineShoppingBag,
  HiArrowRight,
  HiMagnifyingGlassPlus,
  HiOutlineGlobeAlt,
  HiOutlineClock,
  HiOutlineTrophy,
  HiChevronRight,
  HiOutlineChatBubbleLeftRight,
  HiOutlineXMark,
  HiOutlineArrowsPointingOut
} from 'react-icons/hi2';
import { getProductById, products } from '../data/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { sanitizeText, sanitizeName } from '../utils/sanitize';
import toast from 'react-hot-toast';

// Image Magnify Component
const ImageMagnifier = ({ src, width, height, magnifierHeight = 150, magnifierWidth = 150, zoomLevel = 2, onZoomClick }) => {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);

  return (
    <div
      className="position-relative"
      style={{ height, width, cursor: 'crosshair' }}
      onMouseEnter={(e) => {
        const elem = e.currentTarget;
        const { width, height } = elem.getBoundingClientRect();
        setSize([width, height]);
        setShowMagnifier(true);
      }}
      onMouseMove={(e) => {
        const elem = e.currentTarget;
        const { top, left } = elem.getBoundingClientRect();
        const x = e.pageX - left - window.pageXOffset;
        const y = e.pageY - top - window.pageYOffset;
        setXY([x, y]);
      }}
      onMouseLeave={() => setShowMagnifier(false)}
    >
      <img src={src} style={{ height, width, objectFit: 'contain' }} alt="" className="product-hero-img" />
      
      {/* Reflection Effect */}
      <div className="product-reflection" />

      {/* Fullscreen Trigger */}
      <button 
        onClick={onZoomClick}
        className="position-absolute top-0 end-0 m-3 btn-icon bg-black bg-opacity-50 border-0 rounded-circle text-white"
        style={{ width: 44, height: 44, zIndex: 12 }}
      >
        <HiOutlineArrowsPointingOut size={20} />
      </button>

      <div
        style={{
          display: showMagnifier ? "" : "none",
          position: "absolute",
          pointerEvents: "none",
          height: `${magnifierHeight}px`,
          width: `${magnifierWidth}px`,
          top: `${y - magnifierHeight / 2}px`,
          left: `${x - magnifierWidth / 2}px`,
          opacity: "1",
          border: "2px solid #D4AF37",
          backgroundColor: "#111",
          backgroundImage: `url('${src}')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
          backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
          backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
          borderRadius: '50%',
          boxShadow: '0 0 30px rgba(0,0,0,0.8)',
          zIndex: 10
        }}
      />
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { user: authUser } = useAuthStore();
  const { addItem, addReview, getProductReviews } = useCartStore();

  const [activeImg, setActiveImg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Motion refs
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsStickyVisible(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!product) navigate('/404', { replace: true });
    window.scrollTo(0, 0);
  }, [product, navigate, id]);

  if (!product) return null;

  const reviews = getProductReviews(product.id);
  const discountAmount = 1000;
  const recommendations = products.filter(p => p.id !== product.id).slice(0, 4);

  const handleReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) { toast.error('Observation missing'); return; }
    addReview({
      id: `rev-${Date.now()}`,
      productId: product.id,
      user: sanitizeName(authUser?.displayName || 'Connoisseur'),
      rating,
      comment: sanitizeText(comment),
      date: new Date().toLocaleDateString(),
    });
    setComment('');
    toast.success('Your impression has been archived');
  };

  return (
    <div className="product-luxury-page" ref={containerRef}>
      <style>{`
        .product-luxury-page { background: #080808; color: #F0EDE8; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        .lux-badge { background: #D4AF37; color: #000; font-size: 0.65rem; font-weight: 800; padding: 6px 14px; border-radius: 20px; letter-spacing: 0.1em; }
        .product-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1; margin: 24px 0; }
        .price-chip { display: inline-flex; flex-direction: column; }
        .price-main { font-size: 3rem; color: #D4AF37; font-family: 'DM Mono', monospace; font-weight: 600; }
        .price-save { background: rgba(39, 174, 96, 0.1); color: #2ecc71; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; margin-left: 10px; }
        .cta-gold { background: linear-gradient(135deg, #D4AF37, #F0D060); color: #000; border: none; padding: 18px 40px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.15em; box-shadow: 0 10px 30px rgba(212,175,55,0.2); transition: all 0.3s; }
        .cta-gold:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(212,175,55,0.4); }
        .cta-outline { background: transparent; border: 1px solid #1e1e1e; color: #F0EDE8; padding: 18px 40px; border-radius: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s; }
        .cta-outline:hover { border-color: #D4AF37; color: #D4AF37; background: rgba(212,175,55,0.02); }
        .feature-box { background: #0F0F0F; border: 1px solid #1e1e1e; padding: 30px; border-radius: 16px; transition: all 0.3s; height: 100%; }
        .feature-box:hover { border-color: #D4AF37; transform: translateY(-5px); }
        .story-section { padding: 120px 0; background: #050505; position: relative; }
        .parallax-img { width: 100%; height: 500px; object-fit: cover; opacity: 0.4; filter: grayscale(1); }
        .rating-bar { height: 6px; background: #1e1e1e; border-radius: 3px; flex-grow: 1; overflow: hidden; }
        .rating-fill { height: 100%; background: #D4AF37; }
        .sticky-buy { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-top: 1px solid #1e1e1e; padding: 16px 0; z-index: 1000; }
        .mag-container { background: radial-gradient(circle at center, #161616 0%, #080808 100%); border: 1px solid #1e1e1e; border-radius: 20px; overflow: hidden; }
        
        .product-reflection {
          position: absolute; bottom: 10%; left: 50%; transform: translateX(-50%) rotateX(60deg);
          width: 80%; height: 40px; background: radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 70%);
          filter: blur(10px); z-index: 0; pointer-events: none;
        }
        
        /* Modal Styles */
        .lux-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.95); backdrop-filter: blur(20px);
          z-index: 2000; display: flex; align-items: center; justify-content: center;
        }
      `}</style>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="lux-modal-overlay"
            onClick={() => setIsFullscreen(false)}
          >
             <button className="position-absolute top-0 end-0 m-5 btn-icon text-white border-0 bg-transparent">
                <HiOutlineXMark size={40} />
             </button>
             <motion.img 
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                src={product.imageGallery[activeImg]} 
                className="img-fluid" 
                style={{ maxHeight: '85vh', objectFit: 'contain' }}
             />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="py-5 position-relative">
        <div className="container mt-5">
           <div className="row g-5 align-items-center">
              {/* Left Gallery */}
              <div className="col-12 col-lg-6">
                 <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="mag-container p-5 text-center position-relative">
                    <ImageMagnifier 
                      src={product.imageGallery[activeImg]} 
                      width="100%" 
                      height="auto" 
                    />
                    <div className="d-flex justify-content-center gap-3 mt-5">
                       {product.imageGallery.map((img, i) => (
                         <div 
                           key={i} 
                           onClick={() => setActiveImg(i)}
                           className={`rounded-2 overflow-hidden border transition-all cursor-pointer ${activeImg === i ? 'border-gold' : 'border-border'}`}
                           style={{ width: 70, height: 70, opacity: activeImg === i ? 1 : 0.4, background: '#111', padding: 8 }}
                         >
                            <img src={img} className="w-100 h-100 object-fit-contain" alt="" />
                         </div>
                       ))}
                    </div>
                 </motion.div>
              </div>

              {/* Right Content */}
              <div className="col-12 col-lg-6">
                 <div className="ps-lg-5">
                    <span className="lux-badge">CHRONIX EXCLUSIVE ACQUISITION</span>
                    <h1 className="product-title">{product.name}</h1>
                    
                    <div className="d-flex align-items-center gap-3 mb-5">
                       <div className="d-flex text-gold gap-1">
                          {[...Array(5)].map((_, i) => <HiStar key={i} size={18} />)}
                       </div>
                       <span className="text-t3 small tracking-widest uppercase">4.8 Rating • 132 REVIEWS • <HiOutlineCheckBadge className="text-gold" /> VERIFIED</span>
                    </div>

                    <div className="price-chip mb-2">
                       <div className="d-flex align-items-baseline">
                          <span className="price-main">₹{(product.dealPrice || product.price).toLocaleString()}</span>
                          <span className="price-save">SAVE ₹{discountAmount.toLocaleString()}</span>
                       </div>
                       <p className="text-t3 uppercase tracking-widest mt-1" style={{ fontSize: '0.6rem' }}>Exclusive Price for Chronix Members</p>
                    </div>

                    <div className="delivery-card p-4 rounded-4 border border-border bg-s2 mb-5 d-flex align-items-center justify-content-between">
                       <div className="d-flex align-items-center gap-3">
                          <HiOutlineTruck size={24} className="text-gold" />
                          <div>
                             <p className="text-white fw-bold mb-0" style={{ fontSize: '0.85rem' }}>Deliver to {location}</p>
                             <p className="text-t3 mb-0 x-small">Estimated priority arrival: 28 March</p>
                          </div>
                       </div>
                       <button className="btn p-0 text-gold font-mono small fw-bold">CHANGE</button>
                    </div>

                    <div className="d-flex gap-3 mb-4">
                       <button className="cta-gold flex-grow-1" onClick={() => { addItem(product); navigate('/checkout'); }}>Acquire Now</button>
                       <button className="cta-outline flex-grow-1" onClick={() => { addItem(product); toast.success('Added to your collection'); }}>
                          Add to Trunk
                       </button>
                    </div>
                    <p className="text-center text-t3 x-small tracking-widest uppercase"><HiOutlineClock /> High Demand: Only 4 units remain in stock</p>

                    <div className="service-grid row g-3 mt-5">
                       {[
                         { icon: <HiOutlineShieldCheck />, label: 'Warranty', val: '24 Months' },
                         { icon: <HiOutlineArrowPath />, label: 'Returns', val: 'Easy exchange' },
                         { icon: <HiOutlineCheckBadge />, label: 'Authentic', val: 'Verified 100%' }
                       ].map(s => (
                         <div key={s.label} className="col-4 text-center">
                            <div className="text-gold mb-2">{s.icon}</div>
                            <div className="text-white fw-bold x-small uppercase mb-1">{s.val}</div>
                            <div className="text-t3 x-small uppercase">{s.label}</div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="story-section overflow-hidden">
         <div className="container">
            <div className="row g-5 align-items-center">
               <div className="col-12 col-lg-6">
                  <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                     <h2 className="section-label mb-3">Manifesto of Time</h2>
                     <h3 className="font-display display-3 text-white mb-4">Crafted for the <span className="text-gold">Eternal</span></h3>
                     <p className="text-t2 lead mb-5" style={{ lineHeight: 2 }}>
                        A timepiece is more than a watch; it is a legacy. Each Chronix instrument is engineered with surgical precision, featuring high-grade materials and a design philosophy that transcends trends. Designed for the connoisseur, this piece represents the pinnacle of horological expertise.
                     </p>
                     <div className="row g-4">
                        <div className="col-6">
                           <div className="text-gold h2 font-mono mb-0">18K</div>
                           <div className="text-t3 uppercase x-small tracking-widest">Rose Gold Accents</div>
                        </div>
                        <div className="col-6">
                           <div className="text-gold h2 font-mono mb-0">SI</div>
                           <div className="text-t3 uppercase x-small tracking-widest">Swiss Internal Movement</div>
                        </div>
                     </div>
                  </motion.div>
               </div>
               <div className="col-12 col-lg-6">
                  <div className="position-relative">
                     <img src="https://images.unsplash.com/photo-1547996160-81dfa63595dd?q=80&w=2574&auto=format&fit=crop" className="rounded-4 w-100 shadow-2xl" style={{ filter: 'grayscale(0.5)' }} alt="" />
                     <div className="position-absolute bottom-0 start-0 p-5 bg-gradient-to-t from-black to-transparent w-100 rounded-bottom-4">
                        <p className="text-gold font-display italic fs-4">"Precision is our only standard."</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-5">
         <div className="container py-5">
            <div className="text-center mb-5">
               <h4 className="section-label mb-3">Institutional Features</h4>
               <h2 className="font-display display-5 text-white">Engineered Excellence</h2>
            </div>
            <div className="row g-4">
               {[
                 { icon: <HiOutlineGlobeAlt size={32} />, title: 'Universal Accuracy', text: 'Calibrated to global standards for unmatched reliability.' },
                 { icon: <HiOutlineTrophy size={32} />, title: 'Superior Materials', text: 'Grade-A stainless steel with sapphire crystal coating.' },
                 { icon: <HiOutlineCheckBadge size={32} />, title: '5ATM Resistance', text: 'Engineered for depth and durability in all environments.' }
               ].map(f => (
                 <div key={f.title} className="col-12 col-md-4">
                    <div className="feature-box">
                       <div className="text-gold mb-4">{f.icon}</div>
                       <h3 className="text-white h5 mb-3">{f.title}</h3>
                       <p className="text-t3 mb-0" style={{ fontSize: '0.9rem' }}>{f.text}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Recommendations Carousel */}
      <section className="py-5 border-top border-border">
         <div className="container py-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
               <div>
                  <h4 className="section-label mb-3">Curated Pairs</h4>
                  <h2 className="font-display h1 text-white m-0">Consolidate Your Collection</h2>
               </div>
               <Link to="/" className="text-gold text-decoration-none fw-bold d-flex align-items-center gap-2">View Full Vault <HiArrowRight /></Link>
            </div>
            <div className="row g-4 pb-4">
               {recommendations.map(p => (
                 <div key={p.id} className="col-6 col-md-3">
                    <Link to={`/product/${p.id}`} className="text-decoration-none group">
                       <div className="chronix-card p-4 transition-all hover:scale-105 h-100 d-flex flex-column text-center">
                          <img src={p.imageGallery[0]} className="w-100 h-100 object-fit-contain mb-4 filter-grayscale group-hover:filter-none transition-all" style={{ height: 180 }} alt="" />
                          <h4 className="text-white h6 mb-2 text-truncate">{p.name}</h4>
                          <p className="text-gold font-mono small">₹{p.price.toLocaleString()}</p>
                       </div>
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Enhanced Reviews */}
      <section className="py-5 bg-black">
         <div className="container py-5">
            <div className="row g-5">
               <div className="col-12 col-lg-4">
                  <div className="sticky-top" style={{ top: 120 }}>
                     <h2 className="font-display display-5 text-white mb-4">Clients Reputation</h2>
                     <div className="d-flex align-items-center gap-4 mb-5">
                        <div className="display-1 text-gold fw-bold font-mono">4.8</div>
                        <div>
                           <div className="d-flex text-gold mb-1">
                              {[...Array(5)].map((_, i) => <HiStar key={i} />)}
                           </div>
                           <p className="text-t3 uppercase tracking-widest x-small m-0">Average Satisfaction</p>
                        </div>
                     </div>
                     <div className="d-flex flex-column gap-3 mb-5">
                        {[5, 4, 3, 2, 1].map(r => (
                          <div key={r} className="d-flex align-items-center gap-3">
                             <span className="text-t3 small w-25">{r} Stars</span>
                             <div className="rating-bar"><div className="rating-fill" style={{ width: r === 5 ? '85%' : r === 4 ? '12%' : '1%' }} /></div>
                          </div>
                        ))}
                     </div>
                     <div className="glass p-4 rounded-4 border border-white-5">
                        <h4 className="text-white h6 mb-4 d-flex align-items-center gap-2">
                           <HiOutlineChatBubbleLeftRight className="text-gold" /> Chronicle Your Experience
                        </h4>
                        <form onSubmit={handleReview}>
                           <textarea 
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                              placeholder="Describe your acquisition..."
                              className="form-control bg-black border-border border-opacity-50 text-white mb-4 p-3"
                              style={{ height: 120 }}
                           />
                           <button className="cta-outline w-100 py-3">Submit Impression</button>
                        </form>
                     </div>
                  </div>
               </div>
               <div className="col-12 col-lg-8">
                  <div className="ps-lg-5">
                     <AnimatePresence>
                        {reviews.length > 0 ? reviews.map(r => (
                          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} key={r.id} className="p-4 mb-4 border-bottom border-border hover:bg-s2 transition-all rounded-4">
                             <div className="d-flex justify-content-between mb-3">
                                <div>
                                   <div className="fw-bold text-white mb-1">{r.user} <HiOutlineCheckBadge className="text-gold" size={14} /></div>
                                   <div className="text-gold d-flex gap-1">
                                      {[...Array(5)].map((_, i) => <HiStar key={i} size={14} style={{ opacity: i < r.rating ? 1 : 0.1 }} />)}
                                   </div>
                                </div>
                                <span className="text-t3 x-small">{r.date}</span>
                             </div>
                             <p className="text-t2 italic font-display fs-5 mb-3">"{r.comment}"</p>
                             <button className="btn p-0 text-t3 x-small uppercase tracking-widest hover:text-gold transition-all">Was this helpful? (12)</button>
                          </motion.div>
                        )) : (
                           <div className="p-5 text-center opacity-30">No impressions recorded yet.</div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Sticky Bar */}
      <AnimatePresence>
         {isStickyVisible && (
           <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="sticky-buy">
              <div className="container d-flex align-items-center justify-content-between">
                 <div className="d-flex align-items-center gap-3">
                    <img src={product.imageGallery[0]} className="sticky-thumb" style={{ width: 44, height: 44 }} alt="" />
                    <div className="d-none d-md-block">
                       <div className="text-white fw-bold small text-truncate" style={{ maxWidth: 200 }}>{product.name}</div>
                       <div className="text-gold font-mono small">₹{(product.dealPrice || product.price).toLocaleString()}</div>
                    </div>
                 </div>
                 <div className="d-flex gap-2">
                    <button className="btn-icon border border-border px-3 text-white d-none d-sm-block"><HiOutlineShoppingBag /></button>
                    <button className="cta-gold py-2 px-4 fs-6" onClick={() => navigate('/checkout')}>Buy This Piece <HiChevronRight /></button>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
