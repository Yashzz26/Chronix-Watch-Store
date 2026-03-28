import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HiOutlineSparkles, 
  HiOutlineShieldCheck, 
  HiOutlineCpuChip, 
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineWrenchScrewdriver
} from 'react-icons/hi2';

export default function About() {
  const reveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="about-page bg-bg overflow-hidden">
      <style>{`
        /* Standardized Spacing & Typography */
        .section-padding-lg { padding: 160px 0; }
        @media (max-width: 768px) { .section-padding-lg { padding: 80px 0; } }

        .about-page { font-family: var(--font-body); color: var(--t1); }
        
        /* 1. HERO SECTION */
        .about-hero {
          min-height: 100vh;
          background: #080808;
          color: #fff;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .hero-glow {
          position: absolute;
          top: 20%;
          right: -10%;
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%);
          filter: blur(160px);
          pointer-events: none;
        }
        .hero-headline {
          font-family: var(--font-display);
          font-size: clamp(3.5rem, 9vw, 8rem);
          line-height: 0.85;
          letter-spacing: -0.04em;
          font-weight: 700;
        }
        .hero-img-box {
          position: relative;
          z-index: 2;
          box-shadow: 0 50px 100px rgba(0,0,0,0.6);
          border-radius: 8px;
          overflow: hidden;
        }

        /* NEW: Hero Transition */
        .hero-transition {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 25vh;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.9));
          z-index: 5;
        }

        /* 2. PHILOSOPHY SECTION (REDESIGNED) */
        .story-section-grid {
          display: flex;
          align-items: flex-start; /* Move text UP to same vertical level as image top */
          gap: 80px;
        }

        .story-image-container {
          flex: 0 0 48%;
          aspect-ratio: 4/5;
          max-height: 520px; /* Capped height */
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.08);
        }

        .story-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .story-image-container:hover img {
          transform: scale(1.04);
        }

        .story-text-container {
          flex: 0 0 52%;
          max-width: 520px;
        }

        /* 3. TIMELINE */
        .timeline-track {
          position: relative;
          padding: 60px 0 0;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          margin-top: 80px;
        }
        .timeline-item { position: relative; width: 33%; }
        .timeline-dot {
          width: 10px;
          height: 10px;
          background: var(--gold);
          border-radius: 50%;
          margin-bottom: 24px;
        }
        .timeline-year { font-family: var(--font-mono); color: var(--gold); font-size: 0.75rem; letter-spacing: 0.15em; font-weight: 600; }

        /* 4. MASTERY (2-COLUMN) */
        .mastery-feature-item {
          padding: 40px 0;
          border-bottom: 1px solid var(--border);
          display: flex;
          gap: 24px;
          transition: var(--transition);
        }
        .mastery-feature-item:last-child { border-bottom: none; }
        .mastery-feature-item:hover { transform: translateX(12px); }

        /* 5. PRINCIPLES / PILLARS */
        .pillar-item { padding: 60px 40px; border-right: 1px solid var(--border); transition: var(--transition); }
        .pillar-item:last-child { border-right: none; }
        .pillar-item:hover { background: rgba(0,0,0,0.02); }
        .pillar-num { font-size: 0.75rem; font-weight: 800; color: var(--gold); margin-bottom: 16px; display: block; opacity: 0.8; }
        .pillar-h { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; margin-bottom: 16px; }

        /* 6. SIGNATURE (THE PAUSE) */
        .brand-signature {
          padding: 80px 0;
          text-align: center;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin: 120px 0;
          background: rgba(212,175,55,0.02);
        }
        .signature-quote {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          color: var(--t1);
          font-style: italic;
          font-weight: 300;
          line-height: 1.2;
        }

        /* 7. VISUAL BANNER (FIXED VISIBILITY) */
        .visual-banner {
          position: relative;
          height: 80vh;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .visual-banner img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          z-index: 1;
        }

        /* 8. FINAL CTA (UPGRADED DEPTH) */
        .final-cta-section {
          background: radial-gradient(circle at center, rgba(255,255,255,0.05), transparent), radial-gradient(circle at center, #151515, #080808);
          padding: 200px 0;
          position: relative;
        }
        .cta-glow-btn {
          box-shadow: 0 0 40px rgba(212,175,55,0.1);
          transition: all 0.4s ease;
        }
        .cta-glow-btn:hover {
          box-shadow: 0 0 60px rgba(212,175,55,0.25);
          transform: translateY(-8px);
        }
        
        /* Global Hover Micro-Interactions */
        .btn-gold:hover { transform: translateY(-4px); transition: all 0.3s ease; }
        .hero-img-box:hover { transform: translateY(-10px) scale(1.02); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .vision-img { transition: transform 0.8s ease; }
        .vision-img:hover { transform: scale(1.05); }

        /* Responsive Fixes */
        @media (max-width: 991px) {
          .story-section-grid { flex-direction: column; gap: 40px; }
          .story-image-container { flex: 0 0 100%; width: 100%; aspect-ratio: 16/9; max-height: none; }
          .story-text-container { flex: 0 0 100%; max-width: 100%; }
          .pillar-item { border-right: none; border-bottom: 1px solid var(--border); padding: 40px 20px; }
          .timeline-track { flex-direction: column; gap: 40px; }
          .timeline-item { width: 100%; }
        }
      `}</style>

      {/* 1. HERO SECTION (UPGRADED) */}
      <section className="about-hero">
        <div className="hero-glow" />
        <div className="container position-relative" style={{ zIndex: 10 }}>
          <div className="row align-items-start min-vh-100 py-5 pt-lg-5">
            <div className="col-12 col-lg-7 pt-lg-5 mt-lg-5">
              <motion.div initial="hidden" animate="visible" variants={reveal}>
                <span className="section-label-gold">EST. 2024 — THE MAISON</span>
                <h1 className="hero-headline mb-4">
                  Crafting Timeless <br />
                  <span className="text-gold-gradient">Horological Art.</span>
                </h1>
                <p className="hero-sub text-white opacity-40 mb-5 pe-lg-5 lead" style={{ maxWidth: 500, lineHeight: 1.8 }}>
                  A Chronix timepiece is more than a watch. It is a commitment to precision, a celebration of legacy, and a container for your story.
                </p>
                <div className="d-flex align-items-center gap-4">
                  <Link to="/allcollection" className="btn-gold px-5 py-3">Explore Archive</Link>
                  <a href="#philosophy" className="text-white opacity-40 text-decoration-none x-small tracking-widest fw-bold">SCROLL TO DISCOVER</a>
                </div>
              </motion.div>
            </div>
            <div className="col-12 col-lg-5 mt-5 mt-lg-0">
               <motion.div 
                 initial={{ opacity: 0, x: 40 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 1.2, delay: 0.3 }}
                 className="hero-img-box animate-float"
               >
                 <img 
                    src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2574&auto=format&fit=crop" 
                    alt="Chronix Editorial Shot" 
                    className="img-fluid"
                    style={{ filter: 'grayscale(0.1) contrast(1.05)' }}
                 />
                 <div className="position-absolute bottom-0 end-0 p-4 bg-gold text-white x-small fw-bold tracking-widest">
                    MAISON ARCHIVE — № 001
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
        <div className="hero-transition" />
      </section>

      {/* 2. THE CHRONIX STORY / PHILOSOPHY (REBUILT) */}
      <section id="philosophy" className="section-padding-lg bg-white">
        <div className="container">
          <div className="story-section-grid">
            <div className="story-image-container">
              <motion.img 
                whileInView={{ opacity: [0, 1], scale: [1.05, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                src="/images/philosophy.webp" 
                alt="Our Philosophy" 
                loading="lazy"
              />
            </div>
            
            <div className="story-text-container">
              <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true }}>
                <span className="section-label text-gold">THE GENESIS</span>
                <h2 className="font-display display-3 mb-4 mt-2 fw-bold" style={{ letterSpacing: '-0.02em' }}>Our Philosophy</h2>
                <div className="space-y-4">
                  <p className="text-t1 mb-4 fs-5 fw-normal" style={{ lineHeight: 1.6 }}>
                    Founded on the principles of Swiss-inspired engineering, Chronix was born from a singular vision: to return to the absolute value of the second in an age of digital noise.
                  </p>
                  <p className="text-t3 mb-4 fw-light" style={{ lineHeight: 1.9, fontSize: '1.1rem' }}>
                    We believe that luxury should not be synonymous with excess, but with <strong className="text-t1 fw-bold">intentionality</strong>. Every gear, every mechanical movement, and every archival case is a deliberate choice made for those who value technical art above decoration.
                  </p>
                  <p className="text-t3 fw-light" style={{ lineHeight: 1.9, fontSize: '1.1rem' }}>
                    Our journey began with a single design—a pursuit of the perfect equilibrium between form and function. Today, that pursuit continues in every timepiece we release to our global community of collectors.
                  </p>
                </div>

                {/* TIMELINE */}
                <div className="timeline-track">
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <span className="timeline-year">2024</span>
                    <p className="small fw-bold m-0 mt-2 text-t1">Genesis</p>
                    <p className="x-small text-t3 m-0">The Vision Begins</p>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <span className="timeline-year">2025</span>
                    <p className="small fw-bold m-0 mt-2 text-t1">The Archive</p>
                    <p className="x-small text-t3 m-0">First Collection Launch</p>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot bg-transparent border border-gold" />
                    <span className="timeline-year">2026 — FUTURE</span>
                    <p className="small fw-bold m-0 mt-2 text-gold">Evolution</p>
                    <p className="x-small text-t3 m-0">Global Horizon</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MASTERY REDESIGN (2-COLUMN UPGRADE) */}
      <section className="section-padding-lg bg-bg">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true }}>
                <span className="section-label-gold">THE ENGINEERING</span>
                <h2 className="font-display display-3 mb-4 mt-2">Mastery in Every Detail</h2>
                <p className="text-t2 mb-5 lead fw-light">
                  Our pursuit of mechanical excellence involves hundreds of hours of design, where technical innovation meets traditional horology.
                </p>
                <div className="hero-img-box shadow-lg" style={{ height: 450 }}>
                   <img src="/images/watch_macro_detail_1774691520993.png" alt="Mechanical Detail" className="w-100 h-100 object-fit-cover" />
                </div>
              </motion.div>
            </div>
            
            <div className="col-12 col-lg-6">
              <div className="ps-lg-5">
                <mastery-features>
                  <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mastery-feature-item">
                    <HiOutlineCpuChip className="text-gold" size={32} />
                    <div>
                      <h4 className="font-display h4 mb-2">Mechanical Caliber</h4>
                      <p className="text-t3 small m-0">High-frequency movements engineered for absolute dependable consistency.</p>
                    </div>
                  </motion.div>
                  <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mastery-feature-item">
                    <HiOutlineSparkles className="text-gold" size={32} />
                    <div>
                      <h4 className="font-display h4 mb-2">316L Mastery</h4>
                      <p className="text-t3 small m-0">Surgical-grade stainless steel with hand-polished finishes for lasting luster.</p>
                    </div>
                  </motion.div>
                  <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mastery-feature-item">
                    <HiOutlineShieldCheck className="text-gold" size={32} />
                    <div>
                      <h4 className="font-display h4 mb-2">Archival Protection</h4>
                      <p className="text-t3 small m-0">Scratch-resistant sapphire crystal with quadruple-layer anti-reflective coating.</p>
                    </div>
                  </motion.div>
                  <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mastery-feature-item">
                    <HiOutlineCube className="text-gold" size={32} />
                    <div>
                      <h4 className="font-display h4 mb-2">10ATM Sealing</h4>
                      <p className="text-t3 small m-0">Engineered gaskets ensuring integrity at depths up to 100 meters.</p>
                    </div>
                  </motion.div>
                </mastery-features>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BRAND SIGNATURE / NOTE (ENHANCED) */}
      <section className="container">
        <motion.div 
          whileInView={{ opacity: [0, 1], y: [40, 0] }} 
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="brand-signature"
        >
          <span className="font-mono text-gold x-small tracking-widest d-block mb-4 fw-bold">OUR MANIFESTO</span>
          <p className="signature-quote">
            “Designed with precision. <br /> Built for legacy.”
          </p>
          <div className="mx-auto mt-5" style={{ width: '60px', height: '1px', background: 'var(--gold)', opacity: 0.3 }} />
        </motion.div>
      </section>

      {/* 5. PRINCIPLES SECTION (RESTRUCTURED) */}
      <section className="section-padding-lg bg-white overflow-hidden">
        <div className="container">
          <div className="text-center mb-5 pb-4">
             <span className="section-label text-gold">THE FOUR PILLARS</span>
             <h2 className="font-display display-4 mt-3">Core Principles</h2>
          </div>
          <div className="d-flex flex-wrap justify-content-center border-top border-bottom border-border" style={{ gap: '32px' }}>
            <div style={{ flex: '1 1 250px' }}>
              <div className="pillar-item h-100">
                <span className="pillar-num">01. PRECISION</span>
                <h4 className="pillar-h">The Caliber</h4>
                <p className="text-t3 m-0 fw-light" style={{ lineHeight: 1.7 }}>Obsessive attention to timekeeping accuracy at every physical scale.</p>
              </div>
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <div className="pillar-item h-100">
                <span className="pillar-num">02. PERFORMANCE</span>
                <h4 className="pillar-h">Materials</h4>
                <p className="text-t3 m-0 fw-light" style={{ lineHeight: 1.7 }}>Curation of the world's most resilient alloys and ethically sourced leather.</p>
              </div>
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <div className="pillar-item h-100">
                <span className="pillar-num">03. INNOVATION</span>
                <h4 className="pillar-h">Engineering</h4>
                <p className="text-t3 m-0 fw-light" style={{ lineHeight: 1.7 }}>Seamless integration of modern endurance with traditional horology.</p>
              </div>
            </div>
            <div style={{ flex: '1 1 250px' }}>
              <div className="pillar-item h-100">
                <span className="pillar-num">04. LEGACY</span>
                <h4 className="pillar-h">Heritage</h4>
                <p className="text-t3 m-0 fw-light" style={{ lineHeight: 1.7 }}>Timepieces balanced to eventually become valuable family artifacts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VISUAL BANNER (FIXED VISIBILITY) */}
      <section className="visual-banner">
        <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2680&auto=format&fit=crop" alt="Legacy Watch" />
        <div className="banner-overlay" />
        <div className="container position-relative text-center" style={{ zIndex: 2 }}>
          <motion.div 
            whileInView={{ opacity: [0, 1], y: [40, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="hero-headline h1 text-white mb-0" style={{ fontWeight: 900 }}>Built to Last.</h2>
            <p className="text-gold-gradient fw-bold tracking-widest small mt-4">CHRONIX ARCHIVAL SERIES — EST. 2024</p>
          </motion.div>
        </div>
      </section>

      {/* 7. FINAL CTA (UPGRADED) */}
      <section className="final-cta-section">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label-gold mb-4">THE DESTINATION</span>
            <h2 className="display-4 font-display mb-4 text-white">Own the Moment.</h2>
            <p className="text-white opacity-40 mb-5 mx-auto fs-5 fw-light" style={{ maxWidth: 600 }}>
              Join our exclusive circle of collectors and discover the masterpiece that speaks to your ambition.
            </p>
            <div className="d-flex justify-content-center">
              <Link to="/allcollection" className="btn-gold px-5 py-3 cta-glow-btn">
                Access the Collection
                <HiOutlineArrowRight className="ms-3" size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
