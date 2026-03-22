import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineTicket, HiArrowRight } from 'react-icons/hi';

export default function DealBanner({ product }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end - now;
      if (diff <= 0) return clearInterval(timer);
      setTimeLeft({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!product) return null;

  const pad = (n) => String(n).padStart(2, '0');
  const discountPercent = Math.round((1 - product.dealPrice / product.price) * 100);

  return (
    <section className="position-relative rounded-4 mb-5" style={{ background: 'linear-gradient(180deg, #0F0F0F 0%, #080808 100%)' }}>
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden rounded-4">
        <div className="w-100 h-100 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
      </div>

      <div className="position-relative z-1 flex-column flex-md-row d-flex align-items-center gap-5 p-4 p-md-5 p-lg-5">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="w-100 w-md-50 order-2 order-md-1"
        >
          <div className="d-flex align-items-center gap-3 text-gold mb-3">
             <HiOutlineTicket size={24} />
            <span className="section-label" style={{ fontSize: '0.75rem' }}>Limited Time Excellence</span>
          </div>

          <h2 className="display-hero text-t1 mb-4">
            Deal of <br /> the <span className="text-gold fst-italic">Day.</span>
          </h2>

          <p className="text-t2 fs-5 mb-5" style={{ maxWidth: 440 }}>
            The masterpiece {product.name} is now available at an exclusive appreciation price for the next few hours.
          </p>

          <div className="d-flex flex-wrap align-items-end gap-5 mb-5">
            <div>
              <p className="text-t3 text-uppercase tracking-widest mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.7rem' }}>
                <HiOutlineClock size={14} /> Time Remaining
              </p>
              <div className="d-flex gap-4 font-mono">
                {[
                  { v: timeLeft.h, l: 'Hrs' },
                  { v: timeLeft.m, l: 'Min' },
                  { v: timeLeft.s, l: 'Sec' }
                ].map((t, idx) => (
                  <div key={idx} className="d-flex flex-column align-items-center">
                    <span className="h2 text-t1 fw-medium m-0">{pad(t.v)}</span>
                    <span className="text-gold text-uppercase mt-1" style={{ fontSize: '0.6rem' }}>{t.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex flex-column">
               <span className="text-t3 text-uppercase tracking-widest mb-2" style={{ fontSize: '0.7rem' }}>Reserved Price</span>
               <span className="h1 text-gold font-mono fw-bold m-0">₹{product.dealPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link to={`/product/${product.id}`} className="btn-chronix-primary d-inline-flex align-items-center gap-3 text-decoration-none">
              Acquire Now
              <motion.span whileHover={{ x: 4 }} className="d-inline-block transition-transform">
                <HiArrowRight />
              </motion.span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          className="position-relative w-100 w-md-50 d-flex justify-content-center order-1 order-md-2"
        >
          <div className="position-absolute top-50 start-50 translate-middle bg-gold opacity-10 rounded-circle" style={{ width: '100%', height: '100%', filter: 'blur(100px)', zIndex: 0 }} />
          <img
            src={product.imageGallery[0]}
            alt={product.name}
            className="position-relative z-1 w-100" style={{ maxWidth: 340, filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.8))' }}
            loading="lazy"
            decoding="async"
          />
          <div className="position-absolute top-0 end-0 bg-gold text-dark fw-bold p-3 rounded-circle d-flex flex-column align-items-center justify-content-center" style={{ width: 80, height: 80, boxShadow: '0 10px 30px rgba(212,175,55,0.3)', zIndex: 10 }}>
            <span className="text-uppercase tracking-tighter" style={{ fontSize: '0.6rem' }}>Save</span>
            <span className="fs-4 font-mono lh-1">{discountPercent}%</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
