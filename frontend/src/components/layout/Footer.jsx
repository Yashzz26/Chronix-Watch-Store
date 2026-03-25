import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineEnvelopeOpen,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiChevronUp
} from 'react-icons/hi2';
import { 
  FaInstagram, 
  FaXTwitter, 
  FaFacebook,
  FaCcVisa,
  FaCcMastercard,
  FaApplePay,
  FaGooglePay
} from 'react-icons/fa6';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 1000);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
    }, 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-luxury">
      <style>{`
        .footer-luxury { background: linear-gradient(to bottom, #080808, #0B0B0B); position: relative; margin-top: 150px; border-top: 1px solid rgba(212,175,55,0.1); font-family: 'DM Sans', sans-serif; }
        .footer-glow { position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #D4AF37, transparent); opacity: 0.3; }
        .footer-noise { position: absolute; inset: 0; opacity: 0.02; pointer-events: none; background: url('https://grains.com/noise.png'); }
        
        .footer-main { padding: 100px 0 60px; }
        .footer-col-title { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 30px; letter-spacing: 0.05em; }
        
        .footer-link { color: #8F8C88; text-decoration: none; font-size: 0.9rem; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px; }
        .footer-link:hover { color: #D4AF37; transform: translateX(5px); }
        .footer-link::after { content: ''; display: block; width: 0; height: 1px; background: #D4AF37; transition: width 0.3s; position: absolute; bottom: -2px; }
        .footer-link:hover::after { width: 100%; }

        .social-circle { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #8F8C88; display: flex; align-items: center; justify-content: center; transition: all 0.3s; position: relative; }
        .social-circle:hover { background: rgba(212,175,55,0.1); border-color: #D4AF37; color: #D4AF37; transform: translateY(-5px) scale(1.1); box-shadow: 0 10px 20px rgba(212,175,55,0.2); }

        .newsletter-box { background: rgba(255,255,255,0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 35px; position: relative; }
        .newsletter-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 18px; color: #fff; font-size: 0.9rem; width: 100%; transition: 0.3s; }
        .newsletter-input:focus { border-color: #D4AF37; outline: none; box-shadow: 0 0 15px rgba(212,175,55,0.1); }
        .btn-subscribe { background: #D4AF37; color: #000; border: none; padding: 12px 25px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; transition: 0.3s; width: 100%; margin-top: 15px; }
        .btn-subscribe:hover { background: #F0D060; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212,175,55,0.3); }

        .trust-strip { background: rgba(212,175,55,0.02); border-top: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03); padding: 50px 0; }
        .trust-item { text-align: center; }
        .trust-icon { color: #D4AF37; margin-bottom: 15px; font-size: 1.8rem; }
        .trust-label { font-size: 0.75rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 5px; }
        .trust-desc { font-size: 0.7rem; color: #666; }

        .payment-icon { font-size: 1.5rem; color: #444; transition: all 0.3s; opacity: 0.6; }
        .payment-icon:hover { color: #D4AF37; opacity: 1; transform: scale(1.15); }

        .back-to-top { position: fixed; bottom: 40px; right: 40px; width: 50px; height: 50px; background: #D4AF37; color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 1000; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      `}</style>

      {/* Trust Strip */}
      <div className="trust-strip">
        <div className="container">
          <div className="row g-4 d-flex justify-content-center">
            {[
              { icon: <HiOutlineShieldCheck />, label: 'Secure Payments', desc: 'Institutional encryption' },
              { icon: <HiOutlineTruck />, label: 'Priority Shipping', desc: 'White-glove delivery' },
              { icon: <HiOutlineArrowPath />, label: 'Easy Returns', desc: '14-day archival window' },
              { icon: <HiOutlineCheckBadge />, label: 'Official Warranty', desc: '24-month protection' }
            ].map((it, i) => (
              <div key={i} className="col-6 col-md-3 trust-item">
                <div className="trust-icon">{it.icon}</div>
                <div className="trust-label">{it.label}</div>
                <div className="trust-desc">{it.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-main position-relative">
        <div className="footer-noise" />
        <div className="footer-glow" />
        <div className="container">
          <div className="row g-5">
            {/* 1. Brand Section */}
            <div className="col-12 col-lg-4">
               <Link to="/" className="text-decoration-none d-inline-block mb-4">
                  <span className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em' }}>
                    Chronix<span className="text-gold">.</span>
                  </span>
               </Link>
               <p className="text-t3 mb-4 pe-lg-5" style={{ lineHeight: 2, fontSize: '0.95rem' }}>
                  Since 2024, Chronix has redefined the curation of technical art. We provide a sanctuary for horological enthusiasts seeking precision, elegance, and a lasting legacy.
               </p>
               <div className="d-flex align-items-center gap-3 mb-4">
                  <span className="text-gold px-3 py-1 rounded-pill border border-gold border-opacity-30 x-small fw-bold tracking-widest uppercase">Since 2024</span>
                  <span className="text-t3 x-small italic font-display">"Precision. Elegance. Legacy."</span>
               </div>
               <div className="d-flex gap-3">
                 {[
                   { icon: <FaInstagram size={20} />, label: 'Instagram' },
                   { icon: <FaXTwitter size={20} />, label: 'Twitter' },
                   { icon: <FaFacebook size={20} />, label: 'Facebook' }
                 ].map(s => (
                   <motion.a href="#" key={s.label} className="social-circle text-decoration-none">
                      {s.icon}
                   </motion.a>
                 ))}
               </div>
            </div>

            {/* 2. Quick Links */}
            <div className="col-6 col-md-4 col-lg-2">
               <h4 className="footer-col-title">Collection</h4>
               <ul className="list-unstyled d-flex flex-column gap-3">
                  {['Analog Selection', 'Digital Mastery', 'Luxury Archive', 'Limited Editions'].map(link => (
                    <li key={link}><Link to="/allcollection" className="footer-link">{link}</Link></li>
                  ))}
               </ul>
            </div>

            {/* 3. The Maison */}
            <div className="col-6 col-md-4 col-lg-2">
               <h4 className="footer-col-title">The Maison</h4>
               <ul className="list-unstyled d-flex flex-column gap-3">
                  {['Our Story', 'Technical Atelier', 'Boutique Locator', 'Support Center'].map(link => (
                    <li key={link}><Link to="#" className="footer-link">{link}</Link></li>
                  ))}
               </ul>
            </div>

            {/* 4. Newsletter */}
            <div className="col-12 col-md-4 col-lg-4">
               <div className="newsletter-box">
                  <div className="d-flex align-items-center gap-3 mb-4">
                     <div className="p-2 rounded bg-gold text-black d-flex align-items-center"><HiOutlineEnvelopeOpen size={20} /></div>
                     <h4 className="m-0 text-white font-display fs-5">Join the Journal</h4>
                  </div>
                  <p className="text-t3 small mb-4">Get 10% off your first acquisition. Only exclusive drops, no spam.</p>
                  <form onSubmit={handleSubscribe}>
                     <AnimatePresence mode="wait">
                        {isSubscribed ? (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold py-3 fw-bold x-small uppercase tracking-widest">
                              Observation Logged. Welcome.
                           </motion.div>
                        ) : (
                           <motion.div exit={{ opacity: 0 }}>
                              <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="newsletter-input"
                              />
                              <button className="btn-subscribe shadow-lg">Request Access</button>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </form>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container py-5 border-top border-white border-opacity-5">
         <div className="row g-4 align-items-center">
            <div className="col-12 col-md-4">
               <p className="font-mono x-small text-t3 m-0 opacity-50 uppercase tracking-widest">
                  © 2024 Chronix Horological Group. All Rights Reserved.
               </p>
            </div>
            <div className="col-12 col-md-4 text-md-center">
               <div className="d-flex justify-content-md-center gap-4">
                  {['PRIVACY', 'TERMS', 'COOKIES'].map(it => (
                    <Link key={it} to="#" className="text-decoration-none x-small text-t3 tracking-widest hover-gold transition-all">{it}</Link>
                  ))}
               </div>
            </div>
            <div className="col-12 col-md-4 text-md-end">
               <div className="d-flex justify-content-md-end gap-3 align-items-center">
                  <FaCcVisa className="payment-icon" />
                  <FaCcMastercard className="payment-icon" />
                  <FaApplePay className="payment-icon" style={{ fontSize: '2rem' }} />
                  <FaGooglePay className="payment-icon" style={{ fontSize: '2.5rem' }} />
               </div>
            </div>
         </div>
         <div className="text-center mt-5">
            <p className="font-display fst-italic text-white-50 m-0 fs-5 opacity-40">"Time is the ultimate luxury."</p>
         </div>
      </div>

      {/* Back to Top */}
      <AnimatePresence>
         {showScrollTop && (
           <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 50 }}
             className="back-to-top"
             onClick={scrollToTop}
           >
              <HiChevronUp size={24} />
           </motion.div>
         )}
      </AnimatePresence>
    </footer>
  );
}
