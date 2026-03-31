import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function OwnTheMoment() {
  return (
    <section className="own-the-moment-section">
      <style>{`
        .own-the-moment-section {
          background: var(--s2);
          padding: 160px 32px;
          text-align: center;
          position: relative;
          color: #FFFFFF;
        }

        .cta-title {
          font-family: var(--font-heading);
          font-size: clamp(3rem, 10vw, 7rem);
          color: #FFFFFF;
          margin-bottom: 32px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 700;
        }

        .cta-subtext {
          font-size: clamp(1.1rem, 2vw, 1.5rem);
          color: rgba(255, 255, 255, 0.6);
          max-width: 720px;
          margin: 0 auto 64px;
          line-height: 1.6;
        }

        .btn-cta-gold {
          padding: 20px 64px;
          font-size: 1rem;
          font-weight: 700;
          background: var(--gold);
          color: var(--s2);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border-radius: var(--radius-sm);
          text-decoration: none;
          transition: var(--transition);
          display: inline-block;
        }
        .btn-cta-gold:hover {
          background: var(--gold-light);
          transform: translateY(-4px) scale(1.02);
          box-shadow: var(--shadow-gold);
        }

        .cta-footer-text {
          margin-top: 100px;
          opacity: 0.3;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="container">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.3 }}
           variants={{
             hidden: { opacity: 0, y: 40 },
             visible: { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } }
           }}
        >
          <span className="section-label-gold mb-4">Ready when you are</span>
          <h2 className="cta-title">Put it on, see how it feels.</h2>
          <p className="cta-subtext">
            Book a video sizing, drop by the studio, or have the watch shipped and try it at home. Keep it only if it feels right.
          </p>
          <div className="cta-actions">
            <Link to="/allcollection" className="btn-cta-gold">
              Shop the line
            </Link>
          </div>
          <p className="cta-footer-text">
            Chronix — Est. 2024
          </p>
        </motion.div>
      </div>
    </section>
  );
}

