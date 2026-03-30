import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
    const handleScroll = () => setShowScrollTop(window.scrollY > 800);
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
    <footer className="footer-main">
      <style>{`
        .footer-main {
          background: #080808;
          color: #fff;
          margin-top: 0;
          font-family: var(--font-body);
        }

        .trust-strip {
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 60px 0;
        }

        .trust-item {
          text-align: center;
        }

        .trust-icon {
          color: var(--gold);
          font-size: 2rem;
          margin-bottom: 15px;
        }

        .trust-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .trust-desc {
          font-size: 0.7rem;
          color: var(--t3);
        }

        .footer-content {
          padding: 80px 0 60px;
        }

        .footer-logo {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 24px;
          display: inline-block;
          text-decoration: none;
        }

        .footer-logo span {
          color: var(--gold);
        }

        .footer-description {
          color: #a0a0a0;
          font-size: 0.95rem;
          line-height: 1.8;
          max-width: 320px;
          margin-bottom: 30px;
        }

        .footer-title {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 25px;
          color: #fff;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link-item {
          margin-bottom: 12px;
        }

        .footer-link {
          color: #a0a0a0;
          text-decoration: none;
          font-size: 0.9rem;
          transition: var(--transition);
        }

        .footer-link:hover {
          color: var(--gold);
          transform: translateX(4px);
        }

        .newsletter-input-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .newsletter-input {
          flex-grow: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius);
          padding: 10px 16px;
          color: #fff;
          font-size: 0.9rem;
        }

        .newsletter-input:focus {
          border-color: var(--gold);
          outline: none;
          background: rgba(255,255,255,0.08);
        }

        .social-link {
          color: #fff;
          font-size: 1.25rem;
          opacity: 0.6;
          transition: var(--transition);
        }

        .social-link:hover {
          opacity: 1;
          color: var(--gold);
          transform: translateY(-3px);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 60px 0;
        }

        .payment-icons {
          display: flex;
          gap: 20px;
          opacity: 0.4;
        }

        .payment-icon {
          font-size: 1.5rem;
        }

        .back-to-top {
          position: fixed;
          bottom: 40px;
          right: 40px;
          width: 48px;
          height: 48px;
          background: var(--gold);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 100;
          box-shadow: var(--shadow-md);
        }
      `}</style>


      <div className="footer-content">
        <div className="container">
          <div className="row g-5">
            <div className="col-12 col-lg-4">
              <Link to="/" className="footer-logo">
                Chronix<span>.</span>
              </Link>
              <p className="footer-description">
                Curation of technical art since 2024. Providing a sanctuary for horological enthusiasts seeking precision, elegance, and a lasting legacy.
              </p>
              <div className="d-flex gap-4">
                <a href="#" className="social-link"><FaInstagram /></a>
                <a href="#" className="social-link"><FaXTwitter /></a>
                <a href="#" className="social-link"><FaFacebook /></a>
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h4 className="footer-title">Collection</h4>
              <ul className="footer-links">
                <li className="footer-link-item"><Link to="/allcollection" className="footer-link">Analog Selection</Link></li>
                <li className="footer-link-item"><Link to="/allcollection" className="footer-link">Digital Mastery</Link></li>
                <li className="footer-link-item"><Link to="/allcollection" className="footer-link">Limited Editions</Link></li>
                <li className="footer-link-item"><Link to="/allcollection" className="footer-link">Luxury Archive</Link></li>
              </ul>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h4 className="footer-title">Maison</h4>
              <ul className="footer-links">
                <li className="footer-link-item"><Link to="/about" className="footer-link">Our Story</Link></li>
                <li className="footer-link-item"><Link to="#" className="footer-link">Service Atelier</Link></li>
                <li className="footer-link-item"><Link to="#" className="footer-link">Boutique Locator</Link></li>
                <li className="footer-link-item"><Link to="#" className="footer-link">Support</Link></li>
              </ul>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <h4 className="footer-title">The Journal</h4>
              <p className="footer-link" style={{ cursor: 'default' }}>Subscribe for exclusive drops and technical insights.</p>
              <form onSubmit={handleSubscribe}>
                <AnimatePresence mode="wait">
                  {isSubscribed ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold mt-3 fw-bold">
                      Observation Logged.
                    </motion.p>
                  ) : (
                    <div className="newsletter-input-group">
                      <input 
                        type="email" 
                        className="newsletter-input" 
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                      <button className="btn-gold" style={{ padding: '0 24px', fontSize: '0.75rem' }}>Join</button>
                    </div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-6">
              <p className="m-0" style={{ fontSize: '0.75rem', opacity: 0.5, letterSpacing: '0.1em' }}>
                © 2024 CHRONIX HOROLOGICAL GROUP. ALL RIGHTS RESERVED.
              </p>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex justify-content-md-end align-items-center gap-4">
                <div className="payment-icons">
                  <FaCcVisa className="payment-icon" />
                  <FaCcMastercard className="payment-icon" />
                  <FaApplePay className="payment-icon" style={{ fontSize: '2rem' }} />
                  <FaGooglePay className="payment-icon" style={{ fontSize: '2.5rem' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
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
