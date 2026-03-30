import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function OwnTheMoment() {
  return (
    <section className="own-the-moment-section">
      <style>{`
        .own-the-moment-section {
          background: var(--color-charcoal);
          padding: 140px 0;
          text-align: center;
          position: relative;
        }
        .cta-header {
          margin-bottom: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .cta-title {
          font-family: var(--font-heading);
          font-size: 76px;
          color: #FFFFFF;
          margin-bottom: 0;
          line-height: 1.1;
          letter-spacing: -1px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .cta-gold-line {
          width: 80px;
          height: 4px;
          background: var(--color-gold);
          margin-top: 28px;
        }
        .cta-subtext {
          font-family: var(--font-body);
          font-size: 22px;
          color: rgba(255, 255, 255, 0.75);
          max-width: 680px;
          margin: 32px auto 48px;
          line-height: 1.6;
        }
        .btn-cta-gold {
          background: var(--color-gold);
          color: var(--color-charcoal);
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 2.5px;
          padding: 18px 64px;
          border: none;
          border-radius: 2px;
          display: inline-block;
          text-decoration: none;
          transition: all var(--transition-slow);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
          text-transform: uppercase;
        }
        .btn-cta-gold:hover {
          background: var(--color-gold-light);
          transform: scale(1.03);
          box-shadow: 0 6px 28px rgba(212, 175, 55, 0.4);
          color: var(--color-charcoal);
        }
        @media (max-width: 991px) {
          .cta-title { font-size: 56px; }
          .cta-subtext { font-size: 18px; padding: 0 20px; }
        }
        @media (max-width: 768px) {
          .own-the-moment-section { padding: 100px 0; }
          .cta-title { font-size: 42px; }
        }
      `}</style>

      <div className="container">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="cta-header">
            <h2 className="cta-title">Own the Moment.</h2>
            <div className="cta-gold-line" />
          </div>
          <p className="cta-subtext">
            Join thousands of collectors who refuse to settle for anything less than horological excellence. 
            Your next legacy piece is waiting to be discovered.
          </p>
          <div className="cta-actions">
            <Link to="/allcollection" className="btn-cta-gold">
              Access the Collection
            </Link>
          </div>
          <div className="mt-5 pt-5 opacity-25">
             <span className="x-small text-white tracking-widest fw-bold">CHRONIX. GENÈVE — EST. 2024</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
