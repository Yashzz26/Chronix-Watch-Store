import React from 'react';
import { motion } from 'framer-motion';

const StatItem = ({ number, label, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8 }}
    className="stat-item"
  >
    <span className="stat-number">{number}</span>
    <span className="stat-label">{label}</span>
  </motion.div>
);

export default function BuiltToLast() {
  return (
    <section className="built-to-last-section">
      <style>{`
        .built-to-last-section {
          background: var(--color-cream);
          padding: var(--spacing-4xl) 0;
          overflow: hidden;
        }
        .btl-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-4xl);
        }
        .btl-image-side {
          flex: 1.2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }
        .btl-image-wrap {
          border: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          overflow: hidden;
          background: #fff;
        }
        .btl-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }
        .btl-image-wrap:hover img {
          transform: scale(1.05);
        }
        .btl-text-side {
          flex: 0.8;
          padding-left: var(--spacing-2xl);
        }
        .btl-overline {
          font-family: var(--font-body);
          font-size: var(--font-size-xs);
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 600;
        }
        .btl-heading {
          font-family: var(--font-heading);
          font-size: var(--font-size-4xl);
          color: var(--color-charcoal);
          margin-top: var(--spacing-sm);
          line-height: 1.1;
          letter-spacing: -1px;
        }
        .btl-stats {
          margin: var(--spacing-2xl) 0;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-number {
          font-family: var(--font-heading);
          font-size: 48px;
          color: var(--color-gold);
          line-height: 1;
        }
        .stat-label {
          font-family: var(--font-body);
          font-size: var(--font-size-xs);
          color: var(--color-gray-dark);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 4px;
        }
        .btl-body {
          font-family: var(--font-body);
          font-size: var(--font-size-base);
          color: var(--color-gray-dark);
          line-height: 1.8;
          max-width: 480px;
        }
        @media (max-width: 991px) {
          .btl-container { flex-direction: column-reverse; gap: var(--spacing-2xl); }
          .btl-text-side { padding-left: 0; }
          .btl-image-side { width: 100%; }
        }
      `}</style>

      <div className="container">
        <div className="btl-container">
          <div className="btl-image-side">
            <div className="btl-image-wrap" style={{ gridRow: 'span 2' }}>
              <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856865/2151923179_ljyifn.jpg" alt="Material Detail" />
            </div>
            <div className="btl-image-wrap">
              <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856864/20420_cln2fv.jpg" alt="Watch Part" />
            </div>
            <div className="btl-image-wrap">
              <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856674/20420_evxmpx.jpg" alt="Assembly" />
            </div>
          </div>

          <div className="btl-text-side">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <span className="btl-overline">MATERIAL MASTERY</span>
              <h2 className="btl-heading">Built to Last.</h2>
              
              <div className="btl-stats">
                <StatItem number="500+" label="HOURS OF CRAFT" delay={0.2} />
                <StatItem number="10" label="YEAR WARRANTY" delay={0.4} />
                <StatItem number="10ATM" label="WATER DEPTH" delay={0.6} />
              </div>

              <p className="btl-body">
                We source the world&apos;s most resilient materials—316L stainless steel, 
                scratch-resistant sapphire crystal, and premium Italian leathers. 
                Every component is tested for absolute longevity.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
