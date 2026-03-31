import React from 'react';
import { motion } from 'framer-motion';

const StatItem = ({ number, label }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0 }
    }}
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
          background: var(--bg);
          padding: var(--spacing-4xl) 32px;
          overflow: hidden;
        }
        .btl-container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: var(--spacing-4xl);
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        .btl-image-side {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 20px;
        }
        .btl-image-wrap {
          border: 1px solid var(--border);
          overflow: hidden;
          background: #FFFFFF;
          border-radius: var(--radius);
        }
        .btl-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btl-image-wrap:hover img {
          transform: scale(1.05);
        }
        
        .btl-heading {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: var(--t1);
          margin-bottom: 24px;
          line-height: 1.1;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        .btl-stats {
          margin: 40px 0;
          display: flex;
          flex-wrap: wrap;
          gap: 40px;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-number {
          font-family: var(--font-heading);
          font-size: 3rem;
          color: var(--gold);
          line-height: 1;
          margin-bottom: 8px;
        }
        .stat-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--t3);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .btl-body {
          font-size: 1rem;
          color: var(--t2);
          line-height: 1.8;
          max-width: 440px;
        }

        @media (max-width: 991px) {
          .btl-container { grid-template-columns: 1fr; gap: 64px; }
          .btl-image-side { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
 
      <div className="btl-container">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1, 
              transition: { staggerChildren: 0.15 } 
            }
          }}
          className="btl-image-side"
        >
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} className="btl-image-wrap" style={{ gridRow: 'span 2' }}>
            <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856865/2151923179_ljyifn.jpg" alt="Material Detail" />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="btl-image-wrap" style={{ height: '240px' }}>
            <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856864/20420_cln2fv.jpg" alt="Watch Part" />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="btl-image-wrap" style={{ height: '240px' }}>
            <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856674/20420_evxmpx.jpg" alt="Assembly" />
          </motion.div>
        </motion.div>

        <div className="btl-text-side">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
            }}
          >
            <span className="section-label-gold">Material focus</span>
            <h2 className="btl-heading">Built to last.</h2>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1, 
                  transition: { staggerChildren: 0.1, delayChildren: 0.4 } 
                }
              }}
              className="btl-stats"
            >
              <StatItem number="500+" label="Hours of Craft" />
              <StatItem number="10" label="Year Warranty" />
              <StatItem number="10ATM" label="Water Depth" />
            </motion.div>

            <p className="btl-body">
              We source the world&apos;s most resilient materials—316L stainless steel, 
              scratch-resistant sapphire crystal, and premium Italian leathers. 
              Every component is tested for absolute longevity.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


