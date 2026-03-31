import React from 'react';
import { motion } from 'framer-motion';

const SkeletonHero = () => {
  return (
    <section className="hero-cinematic-v2 py-5" style={{ background: '#080808' }}>
      <div className="container">
        <div className="row align-items-center min-vh-100">
          <div className="col-12 col-lg-6">
            <div className="placeholder-glow">
              <span className="placeholder col-4 rounded-pill mb-4" style={{ height: 20, background: 'rgba(212,175,55,0.1)' }}></span>
              <span className="placeholder col-10 rounded-3 mb-2" style={{ height: 80, background: 'rgba(255,255,255,0.05)' }}></span>
              <span className="placeholder col-8 rounded-3 mb-4" style={{ height: 80, background: 'rgba(255,255,255,0.05)' }}></span>
              <span className="placeholder col-9 rounded-2 mb-5" style={{ height: 60, background: 'rgba(255,255,255,0.03)' }}></span>
              <div className="d-flex gap-4">
                <span className="placeholder col-4 rounded-pill" style={{ height: 56, background: 'rgba(212,175,55,0.2)' }}></span>
                <span className="placeholder col-3 rounded-pill" style={{ height: 56, background: 'rgba(255,255,255,0.05)' }}></span>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6 text-center text-lg-end">
            <motion.div 
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.95, 1, 0.95] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ 
                width: '100%', 
                maxWidth: '500px', 
                height: '600px', 
                background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                display: 'inline-block'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkeletonHero;

