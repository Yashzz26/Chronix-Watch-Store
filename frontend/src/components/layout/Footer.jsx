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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
    setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
    }, 3000);
  };

  return (
    <footer className="footer-main">
      <style>{`
        .footer-main {
          background: #000000;
          color: rgba(255, 255, 255, 0.7);
          border-top: 1px solid rgba(212, 175, 55, 0.25);
          padding: 80px 0 40px;
          font-family: var(--font-body);
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          font-family: var(--font-heading);
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0;
          display: inline-block;
          text-decoration: none;
        }

        .footer-logo span {
          color: var(--color-gold);
        }

        .footer-tagline {
          font-family: var(--font-body);
          font-size: 15px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 16px;
          max-width: 240px;
          line-height: 1.6;
        }

        .social-icons-wrap {
          display: flex;
          gap: 20px;
          margin-top: 32px;
        }

        .social-icon {
          color: rgba(255, 255, 255, 0.6);
          font-size: 20px;
          transition: all var(--transition-base);
          text-decoration: none;
        }

        .social-icon:hover {
          color: var(--color-gold);
          transform: scale(1.1);
        }

        .footer-col-title {
          font-family: var(--font-body);
          font-size: 14px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link-item {
          margin-bottom: 8px;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 15px;
          line-height: 2.2;
          transition: all var(--transition-fast);
        }

        .footer-link:hover {
          color: var(--color-gold);
        }

        .newsletter-text {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
        }

        .newsletter-input-group {
          display: flex;
          gap: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding-bottom: 8px;
        }

        .newsletter-input {
          background: transparent;
          border: none;
          color: #fff;
          width: 100%;
          font-family: var(--font-body);
          font-size: 14px;
          padding: 8px 0;
        }

        .newsletter-input:focus {
          outline: none;
        }

        .btn-subscribe {
          background: transparent;
          border: none;
          color: var(--color-gold);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          padding: 0 8px;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 48px;
          margin-top: 60px;
        }

        .copyright-text {
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .payment-icons {
          display: flex;
          gap: 24px;
          justify-content: flex-end;
          align-items: center;
        }

        .payment-icon {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.4);
          filter: grayscale(100%);
          transition: all var(--transition-base);
        }

        .payment-icon:hover {
          filter: grayscale(0%);
          color: var(--color-gold);
        }

        @media (max-width: 991px) {
          .footer-main { padding: 60px 20px 40px; }
          .payment-icons { justify-content: flex-start; margin-top: 20px; }
        }
      `}</style>


      <div className="container">
        <div className="row g-5">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="footer-brand-col">
              <Link to="/" className="footer-logo">
                Chronix<span>.</span>
              </Link>
              <p className="footer-tagline">
                Providing a sanctuary for horological enthusiasts seeking precision, elegance, and a lasting legacy since 2024.
              </p>
              <div className="social-icons-wrap">
                <a href="#" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className="social-icon" aria-label="X"><FaXTwitter /></a>
                <a href="#" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="footer-col-title">Collection</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><Link to="/products" className="footer-link">Analog Selection</Link></li>
              <li className="footer-link-item"><Link to="/products" className="footer-link">Digital Mastery</Link></li>
              <li className="footer-link-item"><Link to="/products" className="footer-link">Limited Editions</Link></li>
              <li className="footer-link-item"><Link to="/products" className="footer-link">Luxury Archive</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="footer-col-title">Maison</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><Link to="/about" className="footer-link">Our Story</Link></li>
              <li className="footer-link-item"><Link to="#" className="footer-link">Service Atelier</Link></li>
              <li className="footer-link-item"><Link to="#" className="footer-link">Boutique Locator</Link></li>
              <li className="footer-link-item"><Link to="#" className="footer-link">Support</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <h4 className="footer-col-title">The Journal</h4>
            <p className="newsletter-text">Subscribe for exclusive drops and technical insights.</p>
            <form onSubmit={handleSubscribe}>
              <AnimatePresence mode="wait">
                {isSubscribed ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold mt-2 fw-bold" style={{ fontSize: '14px' }}>
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
                    <button type="submit" className="btn-subscribe">Join</button>
                  </div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-6">
              <p className="copyright-text">
                © 2024 CHRONIX HOROLOGICAL GROUP. ALL RIGHTS RESERVED.
              </p>
            </div>
            <div className="col-12 col-md-6">
              <div className="payment-icons">
                <FaCcVisa className="payment-icon" />
                <FaCcMastercard className="payment-icon" />
                <FaApplePay className="payment-icon" style={{ fontSize: '28px' }} />
                <FaGooglePay className="payment-icon" style={{ fontSize: '36px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
