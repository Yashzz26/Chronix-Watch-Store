import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineAdjustmentsHorizontal, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';

const features = [
  {
    icon: <HiOutlineAdjustmentsHorizontal size={32} strokeWidth={1} />,
    title: "Set-and-forget accuracy",
    description: "Regulated movements, tested gaskets, and clean layout keep the watch dependable."
  },
  {
    icon: <HiOutlineShieldCheck size={32} strokeWidth={1} />,
    title: "Day-one finish for years",
    description: "316L steel, sapphire, and airtight tolerances mean the case can be refinished again and again."
  },
  {
    icon: <HiOutlineSparkles size={32} strokeWidth={1} />,
    title: "Softer details",
    description: "Chamfered lugs, rounded edges, and slim markers keep the dial readable without shouting."
  }
];

export default function DesignedForExcellence() {
  return (
    <section className="excellence-section">
      <style>{`
        .excellence-section {
          background: var(--bg);
          padding: var(--spacing-4xl) 32px;
          border-bottom: 1px solid var(--border);
        }
        .excellence-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .excellence-title {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          color: var(--t1);
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          font-weight: 700;
        }
        
        .excellence-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .excellence-card {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .excellence-icon-wrap {
          width: 80px;
          height: 80px;
          color: var(--gold);
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border-radius: 50%;
          border: 1px solid var(--border);
          transition: var(--transition);
        }
        .excellence-card:hover .excellence-icon-wrap {
          border-color: var(--gold);
          transform: translateY(-8px);
          box-shadow: var(--shadow-gold);
        }

        .excellence-card-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--t1);
          margin-bottom: 16px;
          font-weight: 600;
        }
        .excellence-card-desc {
          font-size: 0.9375rem;
          color: var(--t2);
          line-height: 1.7;
          max-width: 300px;
        }

        @media (max-width: 991px) {
          .excellence-grid { grid-template-columns: 1fr; gap: 48px; }
        }
      `}</style>

      <div className="container">
        <div className="excellence-header">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
            }}
          >
            <span className="section-label mb-2">Design focus</span>
            <h2 className="excellence-title">Designed for clarity</h2>
          </motion.div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1, 
              transition: { staggerChildren: 0.2 } 
            }
          }}
          className="excellence-grid"
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="excellence-card"
            >
              <div className="excellence-icon-wrap">
                {feature.icon}
              </div>
              <h3 className="excellence-card-title">{feature.title}</h3>
              <p className="excellence-card-desc">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

