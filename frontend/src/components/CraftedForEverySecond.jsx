import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineCube, HiOutlineUserGroup } from 'react-icons/hi2';

const details = [
  {
    icon: <HiOutlineCube />,
    title: "Material Mastery",
    description: "We source the world's most resilient materials—316L stainless steel and scratch-resistant sapphire crystal."
  },
  {
    icon: <HiOutlineClock />,
    title: "Precision Timekeeping",
    description: "Discover timepieces curated with absolute precision, premium materials, and horological mastery."
  },
  {
    icon: <HiOutlineUserGroup />,
    title: "For the Collector",
    description: "Join thousands of collectors who refuse to settle for anything less than excellence on their wrist."
  }
];

export default function CraftedForEverySecond() {
  return (
    <section className="crafted-section">
      <style>{`
        .crafted-section {
          background: var(--color-white);
          padding: var(--spacing-4xl) 0;
        }
        .crafted-header {
          text-align: center;
          margin-bottom: var(--spacing-3xl);
        }
        .crafted-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-3xl);
          color: var(--color-charcoal);
          letter-spacing: -0.5px;
        }
        .crafted-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-lg);
        }
        .crafted-card {
          background: var(--color-white);
          border: 1px solid rgba(0, 0, 0, 0.06);
          padding: 40px 32px;
          text-align: center;
          transition: all var(--transition-base);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .crafted-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-4px);
        }
        .crafted-icon-wrap {
          font-size: 48px;
          color: var(--color-gold);
          margin-bottom: var(--spacing-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .crafted-card-title {
          font-family: var(--font-heading);
          font-size: var(--font-size-xl);
          color: var(--color-charcoal);
          margin-bottom: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }
        .crafted-card-desc {
          font-family: var(--font-body);
          font-size: var(--font-size-sm);
          color: var(--color-gray-dark);
          line-height: 1.7;
          margin-top: var(--spacing-sm);
        }
        @media (max-width: 991px) {
          .crafted-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container">
        <div className="crafted-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="crafted-title"
          >
            Crafted for Every Second
          </motion.h2>
        </div>

        <div className="crafted-grid">
          {details.map((detail, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="crafted-card"
            >
              <div className="crafted-icon-wrap">
                {detail.icon}
              </div>
              <h3 className="crafted-card-title">{detail.title}</h3>
              <p className="crafted-card-desc">{detail.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
