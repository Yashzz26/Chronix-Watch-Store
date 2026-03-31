import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function BuildForPrecision() {
  return (
    <section className="precision-section">
      <style>{`
        .precision-section {
          background: var(--bg-1);
          padding: var(--spacing-4xl) 0;
          overflow: hidden;
        }
        .precision-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-4xl);
          align-items: center;
        }
        .precision-title {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: var(--t1);
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }
        .precision-text {
          font-size: 1rem;
          color: var(--t2);
          line-height: 1.8;
          margin-bottom: 24px;
          max-width: 540px;
        }

        .precision-image-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .precision-img-wrap {
          border: 1px solid var(--border);
          background: #FFFFFF;
          height: 100%;
          overflow: hidden;
          border-radius: var(--radius);
        }
        .precision-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .precision-img-wrap:hover img {
          transform: scale(1.05);
        }
        
        .img-main { grid-column: span 2; height: 400px; }
        .img-sub { height: 260px; }

        @media (max-width: 991px) {
          .precision-grid { grid-template-columns: 1fr; }
          .precision-image-column { grid-template-columns: 1fr 1fr; }
          .img-main { height: 320px; }
        }

        @media (max-width: 576px) {
          .precision-image-column { grid-template-columns: 1fr; }
          .img-main, .img-sub { height: 280px; }
        }
      `}</style>

      <div className="container">
        <div className="precision-grid">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
            }}
          >
            <span className="section-label-gold">Inside the bench</span>
            <h2 className="precision-title">Designed with intention.</h2>
            <div className="precision-body-wrap">
              <p className="precision-text">
                We mill, finish, and test each prototype until the case, lugs, and dial feel balanced. Nothing ships unless it disappears on the wrist and tells the time without fuss.
              </p>
              <p className="precision-text">
                316L steel, sapphire, and serviceable components keep every watch honest to own years from now. Simple materials, straightforward upkeep.
              </p>
            </div>
            <Link to="/about" className="btn-chronix btn-chronix-primary mt-4">
              Read our approach
            </Link>
          </motion.div>

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
            className="precision-image-column"
          >
             <motion.div 
               variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
               className="precision-img-wrap img-main"
             >
               <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856863/elegance-gold-luxury-watch-success-generated-by-ai_xtu3ez.jpg" alt="Case finishing detail" />
             </motion.div>
             <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className="precision-img-wrap img-sub"
             >
               <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774431969/8931_f8it3v.jpg" alt="Case machining" />
             </motion.div>
             <motion.div 
               variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
               className="precision-img-wrap img-sub"
             >
               <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856864/20420_cln2fv.jpg" alt="Inner Mechanism" />
             </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

