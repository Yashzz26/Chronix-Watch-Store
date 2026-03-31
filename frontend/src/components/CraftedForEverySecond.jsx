import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineCube, HiOutlineUserGroup } from 'react-icons/hi2';

const details = [
  {
    icon: <HiOutlineCube size={28} strokeWidth={1} />,
    title: "Honest materials",
    description: "316L steel, sapphire, and vegetable-tanned leather stay wearable and easy to service anywhere."
  },
  {
    icon: <HiOutlineClock size={28} strokeWidth={1} />,
    title: "Reliable movements",
    description: "Regulated calibres ship running within ±10 seconds a day so you spend less time correcting them."
  },
  {
    icon: <HiOutlineUserGroup size={28} strokeWidth={1} />,
    title: "For real wearers",
    description: "Watches built to be worn, knocked, and used without babying them."
  }
];

export default function CraftedForEverySecond() {
  return (
    <section className="crafted-section">
      <style>{`
        .crafted-section {
          background: var(--bg-1);
          padding: var(--spacing-4xl) 32px;
          border-bottom: 1px solid var(--border);
        }
        .crafted-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .crafted-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 5vw, 3rem);
          color: var(--t1);
          letter-spacing: -0.02em;
          font-weight: 700;
        }
        .crafted-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .crafted-card {
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 48px 32px;
          text-align: center;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .crafted-card:hover {
          border-color: var(--gold);
          transform: translateY(-8px);
          box-shadow: var(--shadow-md);
        }
        .crafted-icon-wrap {
          color: var(--gold);
          margin-bottom: 24px;
        }
        .crafted-card-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          color: var(--t1);
          margin-bottom: 16px;
          font-weight: 600;
        }
        .crafted-card-desc {
          font-size: 0.875rem;
          color: var(--t2);
          line-height: 1.7;
        }
        @media (max-width: 991px) {
          .crafted-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="container">
        <div className="crafted-header">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
            }}
          >
            <span className="section-label-gold mb-2">Details that matter</span>
            <h2 className="crafted-title">Built for real life</h2>
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
              transition: { staggerChildren: 0.15 } 
            }
          }}
          className="crafted-grid"
        >
          {details.map((detail, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0.98 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="crafted-card"
            >
              <div className="crafted-icon-wrap">
                {detail.icon}
              </div>
              <h3 className="crafted-card-title">{detail.title}</h3>
              <p className="crafted-card-desc">{detail.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

