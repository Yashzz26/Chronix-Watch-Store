import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HiOutlineSparkles, 
  HiOutlineShieldCheck, 
  HiOutlineCpuChip, 
  HiOutlineArrowRight,
  HiOutlineCube
} from 'react-icons/hi2';

export default function About() {
  const reveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="about-page">
      <style>{`
        .about-page {
          background: var(--bg);
          color: var(--t1);
          overflow-x: hidden;
        }

        .about-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 120px;
          position: relative;
        }

        .hero-visual-frame {
          position: relative;
          border: 1px solid var(--border);
          padding: 1px;
          background: #FFF;
        }
        .hero-visual-frame img {
          width: 100%;
          height: auto;
          display: block;
        }

        .philosophy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 120px;
          align-items: start;
          padding: 160px 0;
        }

        .philosophy-image-box {
          border: 1px solid var(--border);
          padding: 40px;
          background: #FFF;
        }

        .stat-node {
          padding: 40px 0;
          border-bottom: 1px solid var(--border);
        }
        .stat-node:last-child { border-bottom: none; }

        .pillar-square {
          border: 1px solid var(--border);
          padding: 60px;
          transition: var(--transition);
        }
        .pillar-square:hover {
          border-color: var(--gold);
          background: var(--bg-1);
        }

        .manifesto-banner {
          background: #000;
          color: #FFF;
          padding: 200px 0;
          text-align: center;
          position: relative;
        }
        .manifesto-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(212,175,55,0.08), transparent);
        }

        @media (max-width: 991px) {
          .philosophy-grid { grid-template-columns: 1fr; gap: 60px; padding: 80px 0; }
        }
      `}</style>

      {/* HERO */}
      <section className="about-hero">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7">
              <motion.div initial="hidden" animate="visible" variants={reveal}>
                <span className="section-label-gold mb-4">About Chronix</span>
                <h1 className="font-display display-1 fw-bold mb-5" style={{ lineHeight: 0.95 }}>
                  Independent watch studio
                  <br />from Mumbai.
                </h1>
                <p className="lead text-t3 fw-light mb-5 pe-lg-5" style={{ lineHeight: 1.8 }}>
                  We build everyday watches with serviceable parts, measured proportions, and support that writes back in plain language.
                </p>
                <div className="d-flex gap-4 align-items-center">
                  <Link to="/allcollection" className="btn-gold px-5 py-3">Shop watches</Link>
                  <span className="x-small fw-bold tracking-widest opacity-30">Est. 2024</span>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-5">
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} className="hero-visual-frame">
                 <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2680&auto=format&fit=crop" alt="Editorial Watch" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="container">
        <div className="philosophy-grid">
          <div className="philosophy-image-box">
             <motion.img 
                whileInView={{ opacity: [0, 1], scale: [1.05, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=2574&auto=format&fit=crop" 
                alt="Horology Mastery" 
                className="w-100 h-auto"
             />
          </div>
          <div className="pt-lg-5">
             <motion.div whileInView="visible" initial="hidden" variants={reveal} viewport={{ once: true }}>
                <span className="section-label mb-3">How we build</span>
                <h2 className="font-display display-4 mb-5">Less manifesto, more clarity.</h2>
                <div className="space-y-4">
                   <p className="text-t2 fs-5 fw-light mb-4" style={{ lineHeight: 1.7 }}>
                      Watches should read cleanly, fit comfortably, and be easy to maintain. Everything else is noise.
                   </p>
                   <div className="stat-node">
                      <span className="section-label-gold mb-2">01. Movement</span>
                      <p className="text-t3 small m-0">Regulated calibres with parts any competent watchmaker can service.</p>
                   </div>
                   <div className="stat-node">
                      <span className="section-label-gold mb-2">02. Case</span>
                      <p className="text-t3 small m-0">316L steel with a mix of brushed and polished surfaces for easy refinishing.</p>
                   </div>
                   <div className="stat-node">
                      <span className="section-label-gold mb-2">03. Crystal</span>
                      <p className="text-t3 small m-0">Sapphire with anti-reflective coating so the dial stays legible outdoors.</p>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto-banner">
         <div className="container position-relative">
            <motion.div whileInView={{ opacity: [0, 1], y: [30, 0] }} viewport={{ once: true }} transition={{ duration: 1 }}>
               <span className="section-label-gold mb-4">A simple rule</span>
               <h2 className="font-display display-2 italic mb-0">“A watch should disappear on your wrist until you need the time.”</h2>
            </motion.div>
         </div>
      </section>

      {/* PILLARS */}
      <section className="section-padding-lg container">
         <div className="text-center mb-5 pb-5">
            <span className="section-label mb-3">CONSTITUTION</span>
            <h2 className="font-display display-4">Our Core Pillars</h2>
         </div>
         <div className="row g-4">
            {[
              { id: '01', title: 'Proportion', desc: 'Balanced lug-to-lug lengths and slim bezels for small wrists.', icon: <HiOutlineCpuChip /> },
              { id: '02', title: 'Endurance', desc: 'Serviceable steel, sapphire, and gaskets tested for humid cities.', icon: <HiOutlineShieldCheck /> },
              { id: '03', title: 'Finish', desc: 'Soft chamfers and brushed planes that pick up light without glare.', icon: <HiOutlineSparkles /> },
              { id: '04', title: 'Support', desc: 'Responsive email support and spare parts for every reference.', icon: <HiOutlineCube /> }
            ].map((p, idx) => (
              <div key={p.id} className="col-md-6 col-lg-3">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="pillar-square h-100"
                 >
                    <span className="section-label-gold mb-4" style={{ fontSize: '0.6rem' }}>PILLAR {p.id}</span>
                    <div className="h3 text-gold mb-3">{p.icon}</div>
                    <h3 className="h5 font-display fw-bold mb-3">{p.title}</h3>
                    <p className="x-small text-t3 tracking-wider fw-bold m-0" style={{ lineHeight: 1.6 }}>{p.desc}</p>
                 </motion.div>
              </div>
            ))}
         </div>
      </section>

      {/* FINAL CTA */}
      <section className="section-padding-lg bg-bg-1 border-top border-border">
         <div className="container text-center">
            <motion.div whileInView={{ opacity: [0, 1], scale: [0.95, 1] }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
               <h2 className="font-display display-3 mb-5">Spend time with the watches.</h2>
               <div className="d-flex justify-content-center">
                  <Link to="/allcollection" className="btn-gold px-5 py-3 d-flex align-items-center gap-3">
                    Shop the collection <HiOutlineArrowRight />
                  </Link>
               </div>
            </motion.div>
         </div>
      </section>
    </div>
  );
}

