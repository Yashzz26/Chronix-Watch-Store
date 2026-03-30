import React from 'react';
import { motion } from 'framer-motion';

export default function CraftingTheSecond() {
  return (
    <section className="horological-story">
      <style>{`
        .horological-story {
          background: var(--color-white);
          overflow: hidden;
        }
        .story-container {
          display: flex;
          align-items: stretch;
          min-height: 600px;
        }
        .story-image-side {
          flex: 1;
          position: relative;
        }
        .story-image-side img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .gold-accent-bar {
          width: 4px;
          height: 80px;
          background: var(--color-gold);
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }
        .story-text-side {
          flex: 1;
          padding: var(--spacing-4xl) var(--spacing-4xl) var(--spacing-4xl) 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .story-overline {
          font-family: var(--font-body);
          font-size: var(--font-size-xs);
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: var(--spacing-sm);
          font-weight: 600;
        }
        .story-heading {
          font-family: var(--font-heading);
          font-size: 52px;
          color: var(--color-charcoal);
          margin-top: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          line-height: 1.1;
          letter-spacing: -1px;
        }
        .story-body {
          font-family: var(--font-body);
          font-size: var(--font-size-base);
          color: var(--color-gray-dark);
          line-height: 1.9;
          max-width: 480px;
          margin-top: var(--spacing-lg);
        }
        @media (max-width: 991px) {
          .story-container { flex-direction: column; }
          .story-text-side { padding: var(--spacing-2xl) var(--spacing-md); }
          .story-heading { font-size: var(--font-size-2xl); }
          .story-image-side { height: 400px; }
        }
      `}</style>
      
      <div className="story-container">
        <div className="story-image-side">
          <div className="gold-accent-bar" />
          <img src="https://res.cloudinary.com/dwfm8qeoz/image/upload/v1774856286/close-up-clock-with-time-change_jyy7jd.jpg" alt="Crafting the Second" />
        </div>
        
        <div className="story-text-side">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="story-overline">HOROLOGICAL STORY</span>
            <h2 className="story-heading">Crafting the <br /> Second.</h2>
            <p className="story-body">
              Every Chronix watch is a result of hundreds of hours of design and engineering. 
              We believe that a timepiece shouldn't just tell time—it should embody it, 
              connecting generations through the language of precision.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
