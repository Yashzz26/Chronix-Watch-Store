import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  HiArrowRight, 
  HiOutlineShoppingCart,
  HiStar,
  HiOutlineArrowUpRight,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
  HiOutlineCheckBadge
} from 'react-icons/hi2';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import WatchModel from '../components/ui/WatchModel';
import SkeletonHero from '../components/ui/SkeletonHero';

// New Modular Components
import NewArrivals from '../components/NewArrivals';
import BuildForPrecision from '../components/BuildForPrecision';
import OwnTheMoment from '../components/OwnTheMoment';
import DesignedForExcellence from '../components/DesignedForExcellence';
import CraftedForEverySecond from '../components/CraftedForEverySecond';
import ClassicSeries from '../components/ClassicSeries';
import CraftingTheSecond from '../components/CraftingTheSecond';
import BuiltToLast from '../components/BuiltToLast';

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  const [searchParams] = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  
  // Database State
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDbProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const newArrivals = useMemo(() => dbProducts.slice(0, 4), [dbProducts]);

  return (
    <div className="home-minimal">
      <style>{`
        .home-minimal { 
          background: #FFFFFF; 
          color: var(--color-charcoal); 
          overflow-x: hidden; 
        }
        
        .hero-cinematic-v2 { 
          min-height: 100vh; 
          background: #080808; 
          color: #fff; 
          display: flex; 
          align-items: center; 
          position: relative; 
          overflow: hidden; 
        }
        
        .hero-headline { 
          font-family: var(--font-heading); 
          font-size: clamp(3.5rem, 8vw, 72px); 
          line-height: 1.1; 
          letter-spacing: -0.04em; 
          font-weight: 700; 
          margin-bottom: 24px; 
        }
        
        .hero-sub { 
          color: rgba(255, 255, 255, 0.7); 
          max-width: 480px; 
          font-size: 1.1rem; 
          line-height: 1.8; 
          margin-bottom: 40px; 
        }
        
        .text-gold-accent { 
          color: var(--color-gold);
        }
        
        .review-pill { 
          background: rgba(255,255,255,0.05); 
          backdrop-filter: blur(8px); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 99px; 
          padding: 8px 16px; 
          display: inline-flex; 
          align-items: center; 
          gap: 10px; 
          margin-bottom: 24px; 
        }
        
        .btn-hero-gold { 
          background: var(--color-gold); 
          color: var(--color-charcoal); 
          padding: 16px 52px; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 2px;
          transition: all var(--transition-base); 
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-hero-gold:hover { 
          background: var(--color-gold-light); 
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3);
          color: var(--color-charcoal);
        }

        .avatar-group {
          display: flex;
          align-items: center;
          gap: -12px;
        }

        .avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #080808;
          object-fit: cover;
          margin-left: -12px;
        }
        .avatar-img:first-child { margin-left: 0; }
      `}</style>

      {loading && <SkeletonHero />}
      {!loading && (
        <section className="hero-cinematic-v2" ref={heroRef}>
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
                    <span className="text-gold-accent">on Your Wrist</span>
                  </h1>
                  <p className="hero-sub mb-5 pe-lg-5">
                    Discover timepieces curated with absolute precision, premium materials, and designs that define generations of horological mastery.
                  </p>
                  <div className="d-flex flex-wrap gap-4 align-items-center">
                    <Link to="/allcollection" className="btn-hero-gold">Explore Collection</Link>
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      transition={{ delay: 0.5 }}
                      className="d-none d-md-flex align-items-center gap-3 ms-3"
                    >
                      <div className="avatar-group">
                         <img src="https://i.pravatar.cc/100?img=1" className="avatar-img" alt="User" />
                         <img src="https://i.pravatar.cc/100?img=2" className="avatar-img" alt="User" />
                         <img src="https://i.pravatar.cc/100?img=3" className="avatar-img" alt="User" />
                      </div>
                      <span className="x-small text-white opacity-50 fw-bold tracking-wider">JOIN 10K+ COLLECTORS</span>
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
                     <div style={{ height: '700px', width: '100%', filter: 'drop-shadow(0 40px 100px rgba(212,175,55,0.15))' }}>
                       <WatchModel />
                     </div>
                   </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      <NewArrivals products={newArrivals} loading={loading} addItem={addItem} />

      <DesignedForExcellence />

      <BuildForPrecision />

      <CraftedForEverySecond />

      <ClassicSeries />

      <CraftingTheSecond />

      <BuiltToLast />

      <OwnTheMoment />

    </div>
  );
}
