import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineAdjustmentsHorizontal, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';

const features = [
  {
    icon: <HiOutlineAdjustmentsHorizontal />,
    title: "Precision Engineering",
    description: "Every movement is calibrated to within microseconds of accuracy, ensuring timeless reliability."
  },
  {
    icon: <HiOutlineShieldCheck />,
    title: "Uncompromising Durability",
    description: "Built with 316L stainless steel and scratch-resistant sapphire crystal to withstand the test of time."
  },
  {
    icon: <HiOutlineSparkles />,
    title: "Artisanal Finish",
    description: "Hand-polished surfaces and meticulous detailing define the signature Chronix aesthetic."
  }
];

export default function DesignedForExcellence() {
  return (
    <section className="excellence-section">
      <style>{`
        .excellence-section {
          background: var(--color-white);
          padding: var(--spacing-4xl) 0;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }
        .excellence-header {
          text-align: center;
          margin-bottom: var(--spacing-3xl);
        }
        .excellence-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-3xl);
          color: var(--color-charcoal);
          letter-spacing: -0.5px;
          margin-bottom: var(--spacing-sm);
        }
        .excellence-tagline {
          font-family: var(--font-body);
          font-size: var(--font-size-sm);
          color: var(--color-gray-dark);
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        .excellence-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-xl);
        }
        .excellence-card {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .excellence-icon-wrap {
          width: 64px;
          height: 64px;
          color: var(--color-gold);
          margin-bottom: var(--spacing-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px; /* Visual scale for line-art icons */
        }
        .excellence-card-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-xl);
          color: var(--color-charcoal);
          margin-bottom: var(--spacing-sm);
        }
        .excellence-card-desc {
          font-family: var(--font-body);
          font-size: var(--font-size-base);
          color: var(--color-gray-dark);
          line-height: 1.7;
          max-width: 280px;
        }
        .excellence-divider {
          width: 80%;
          height: 1px;
          background: rgba(212, 175, 55, 0.15);
          margin: var(--spacing-2xl) auto 0;
        }

        @media (max-width: 991px) {
          .excellence-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-2xl);
          }
          .excellence-title {
            font-size: var(--font-size-2xl);
          }
        }
      `}</style>

      <div className="container">
        <div className="excellence-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="excellence-title"
          >
            Designed for Excellence
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="excellence-tagline"
          >
            HANDPICKED MASTERPIECES
          </motion.p>
        </div>

        <div className="excellence-grid">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="excellence-card"
            >
              <div className="excellence-icon-wrap">
                {feature.icon}
              </div>
              <h3 className="excellence-card-title">{feature.title}</h3>
              <p className="excellence-card-desc">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="excellence-divider" />
      </div>
    </section>
  );
}
