import React, { useState } from 'react';
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
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (value) => {
    if (feedback.type) {
      setFeedback({ type: null, message: '' });
    }
    setEmail(value);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailPattern.test(trimmed)) {
      setFeedback({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: trimmed.toLowerCase(),
        createdAt: serverTimestamp()
      });
      setFeedback({ type: 'success', message: 'Thanks for joining.' });
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscribe failed:', error);
      setFeedback({ type: 'error', message: 'Could not subscribe right now. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer-main">
      <style>{`
        .footer-main {
          background: var(--s2);
          color: var(--t3);
          border-top: 1px solid var(--border);
          padding: var(--spacing-4xl) 32px;
          font-family: var(--font-body);
        }

        .footer-logo {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          color: #FFFFFF;
          text-decoration: none;
          margin-bottom: 24px;
          display: block;
        }
        .footer-logo span { color: var(--gold); }

        .footer-tagline {
          font-size: 0.9375rem;
          line-height: 1.7;
          max-width: 280px;
          margin-bottom: 32px;
          color: rgba(255, 255, 255, 0.5);
        }

        .social-icons-wrap {
          display: flex;
          gap: 20px;
        }

        .social-icon {
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.25rem;
          transition: var(--transition);
        }
        .social-icon:hover {
          color: var(--gold);
          transform: translateY(-2px);
        }

        .footer-col-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #FFFFFF;
          margin-bottom: 24px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link-item { margin-bottom: 12px; }

        .footer-link {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 0.875rem;
          transition: var(--transition);
        }
        .footer-link:hover { color: #FFFFFF; }

        .newsletter-text {
          font-size: 0.875rem;
          margin-bottom: 24px;
        }

        .newsletter-input-group {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }

        .newsletter-input {
          background: transparent;
          border: none;
          color: #FFFFFF;
          flex: 1;
          font-size: 0.875rem;
          padding: 8px 0;
        }
        .newsletter-input:focus { outline: none; }

        .btn-subscribe {
          background: transparent;
          border: none;
          color: var(--gold);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 48px;
          margin-top: 64px;
        }

        .copyright-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.05em;
        }

        .payment-icons {
          display: flex;
          gap: 24px;
          justify-content: flex-end;
          align-items: center;
          opacity: 0.4;
        }

        @media (max-width: 991px) {
          .footer-main { padding: var(--spacing-3xl) 24px; }
          .payment-icons { justify-content: flex-start; }
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
                Independent watch studio designing honest everyday pieces from Mumbai since 2024.
              </p>
              <div className="social-icons-wrap">
                <span className="social-icon" aria-label="Instagram"><FaInstagram /></span>
                <span className="social-icon" aria-label="X"><FaXTwitter /></span>
                <span className="social-icon" aria-label="Facebook"><FaFacebook /></span>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="footer-col-title">Collection</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><Link to="/allcollection?cat=Analog" className="footer-link">Classic line</Link></li>
              <li className="footer-link-item"><Link to="/allcollection?cat=Luxury" className="footer-link">Modern line</Link></li>
              <li className="footer-link-item"><Link to="/giftsforher" className="footer-link">Gifts for her</Link></li>
              <li className="footer-link-item"><Link to="/giftsforhim" className="footer-link">Gifts for him</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="footer-col-title">Studio</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><Link to="/about" className="footer-link">About Chronix</Link></li>
              <li className="footer-link-item"><Link to="/about" className="footer-link">Support</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <h4 className="footer-col-title">The Journal</h4>
            <p className="newsletter-text">Subscribe for exclusive drops and technical insights.</p>
            <form onSubmit={handleSubscribe}>
              <div className="newsletter-input-group">
                <input 
                  type="email" 
                  className="newsletter-input" 
                  placeholder="Email Address"
                  value={email}
                  onChange={e => handleInputChange(e.target.value)}
                  required
                  disabled={submitting}
                />
                <button type="submit" className="btn-subscribe" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Join'}
                </button>
              </div>
              <AnimatePresence>
                {feedback.type && (
                  <motion.p
                    key={`${feedback.type}-${feedback.message}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-2 fw-bold"
                    style={{ fontSize: '14px', color: feedback.type === 'success' ? 'var(--gold)' : '#ff7b7b' }}
                  >
                    {feedback.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-6">
              <p className="copyright-text">
                © {new Date().getFullYear()} Chronix. All rights reserved.
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

