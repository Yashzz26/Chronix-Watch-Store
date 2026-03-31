import React from 'react';
import { motion } from 'framer-motion';

export default function CraftingTheSecond() {
  return (
    <section className="horological-story">
      <style>{`
        .horological-story {
          background: var(--s2);
          overflow: hidden;
          color: #FFFFFF;
        }
        .story-container {
          display: flex;
          align-items: stretch;
          min-height: 700px;
        }
        .story-image-side {
          flex: 1.2;
          position: relative;
          overflow: hidden;
        }
        .story-image-side img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .horological-story:hover .story-image-side img {
          transform: scale(1.05);
        }

        .gold-border-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--gold);
          z-index: 2;
        }

        .story-text-side {
          flex: 1;
          padding: var(--spacing-4xl);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }
        
        .story-heading {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          color: #FFFFFF;
          margin-bottom: 32px;
          line-height: 1.05;
          letter-spacing: -0.02em;
          font-weight: 700;
        }
        .story-body {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.8;
          max-width: 480px;
        }

        @media (max-width: 991px) {
          .story-container { flex-direction: column-reverse; }
          .story-text-side { padding: var(--spacing-2xl) 24px; }
          .story-image-side { height: 400px; }
        }
      `}</style>
      
      <div className="story-container">
        <div className="story-text-side">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
            }}
          >
            <span className="section-label-gold">Notebook</span>
            <h2 className="story-heading">Why we build.</h2>
            <p className="story-body">
              Each release starts with sketches, rough brass cases, and weeks of small changes. The goal is simple:
              a watch that disappears on the wrist, keeps time without drama, and can be serviced decades from now.
            </p>
          </motion.div>
        </div>

        <div className="story-image-side">
          <div className="gold-border-accent" />
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856286/close-up-clock-with-time-change_jyy7jd.jpg" 
            alt="Craftsmanship" 
          />
        </div>
      </div>
    </section>
  );
}

