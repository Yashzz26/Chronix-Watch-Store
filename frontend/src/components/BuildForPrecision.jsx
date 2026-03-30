import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function BuildForPrecision() {
  return (
    <section className="precision-section">
      <style>{`
        .precision-section {
          background: var(--color-cream);
          padding: var(--spacing-4xl) 0;
          overflow: hidden;
        }
        .precision-grid {
          display: grid;
          grid-template-columns: 0.6fr 0.4fr;
          gap: var(--spacing-4xl);
          align-items: center;
        }
        .precision-overline {
          font-family: var(--font-body);
          font-size: var(--font-size-xs);
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 600;
          display: block;
          margin-bottom: 12px;
        }
        .precision-title {
          font-family: var(--font-heading);
          font-size: 64px;
          color: var(--color-charcoal);
          line-height: 1.1;
          margin-bottom: 0;
          letter-spacing: -1px;
        }
        .precision-body-wrap {
          margin-top: var(--spacing-lg);
          max-width: 520px;
        }
        .precision-text {
          font-family: var(--font-body);
          font-size: var(--font-size-base);
          color: var(--color-gray-dark);
          line-height: 1.9;
          margin-bottom: 24px;
        }
        .btn-precision {
          background: var(--color-charcoal);
          color: #FFFFFF;
          font-family: var(--font-body);
          font-size: var(--font-size-sm);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 16px 52px;
          margin-top: 48px;
          border: none;
          transition: all var(--transition-slow);
          display: inline-block;
          text-decoration: none;
        }
        .btn-precision:hover {
          background: var(--color-gold);
          color: #FFFFFF;
        }
        .precision-image-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .precision-img-wrap {
          border: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          background: #fff;
          position: relative;
        }
        .precision-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }
        .precision-img-wrap:hover img {
          transform: scale(1.02);
        }
        .img-top { height: 420px; }
        .img-bottom { height: 240px; }

        @media (max-width: 991px) {
          .precision-grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }
          .precision-title { font-size: 48px; }
          .precision-image-column { flex-direction: row; }
          .img-top, .img-bottom { height: 300px; flex: 1; }
        }
        @media (max-width: 768px) {
          .precision-image-column { flex-direction: column; }
        }
      `}</style>

      <div className="container">
        <div className="precision-grid">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="precision-overline">THE CHRONIX PHILOSOPHY</span>
            <h2 className="precision-title">Built for Precision. <br /> Crafted for Excellence.</h2>
            <div className="precision-body-wrap">
              <p className="precision-text">
                Every Chronix watch is a result of hundreds of hours of meticulous design and precision engineering. 
                Our approach blends traditional horological craft with modern innovation to ensure every second is captured perfectly.
              </p>
              <p className="precision-text">
                We source only the finest materials—316L stainless steel, scratch-resistant sapphire crystal, 
                and hand-finished elements—to create timepieces that are as durable as they are elegant.
              </p>
            </div>
            <Link to="/about" className="btn-precision">
              The Maison Story
            </Link>
          </motion.div>

          <div className="precision-image-column">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="precision-img-wrap img-top"
             >
               <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856863/elegance-gold-luxury-watch-success-generated-by-ai_xtu3ez.jpg" alt="Detail Shot 1" />
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.4 }}
               className="precision-img-wrap img-bottom"
             >
               <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856864/20420_cln2fv.jpg" alt="Detail Shot 2" />
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
