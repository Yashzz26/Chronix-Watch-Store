import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineEnvelopeOpen 
} from 'react-icons/hi2';
import { 
  FaInstagram, 
  FaXTwitter, 
  FaFacebook 
} from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer 
      className="position-relative overflow-hidden pt-5" 
      style={{ 
        background: '#050505', 
        borderTop: '1px solid #111', 
        marginTop: '120px' 
      }}
    >
      {/* Background Glow */}
      <div 
        className="position-absolute" 
        style={{ 
          width: '400px', height: '400px', 
          background: 'rgba(212,175,55,0.03)', 
          filter: 'blur(100px)', 
          top: '-200px', left: '50%', transform: 'translateX(-50%)',
          borderRadius: '50%'
        }} 
      />

      <div className="container py-5 position-relative" style={{ zIndex: 1 }}>
        <div className="row g-5 mb-5 pb-5 border-bottom border-border border-opacity-25">
          {/* Brand & Story */}
          <div className="col-12 col-lg-4">
            <Link to="/" className="text-decoration-none d-inline-block mb-4">
              <span className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
                Chronix<span className="text-gold">.</span>
              </span>
            </Link>
            <p className="font-body text-t3 mb-4 pe-lg-5" style={{ lineHeight: 1.8, fontSize: '0.9rem' }}>
              Exceptional instruments of horology for the modern connoisseur. We curate timepieces that define legacies through precision, art, and engineering.
            </p>
            <div className="d-flex gap-2">
              {[
                { icon: <FaInstagram size={18} />, label: 'Instagram' },
                { icon: <FaXTwitter size={18} />, label: 'Twitter' },
                { icon: <FaFacebook size={18} />, label: 'Facebook' }
              ].map(social => (
                <button key={social.label} className="btn-icon p-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, border: '1px solid #1e1e1e', color: '#5A5652', background: 'transparent' }}>
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="col-6 col-md-3 col-lg-2 ms-lg-auto">
            <h4 className="section-label mb-4" style={{ fontSize: '0.65rem' }}>Collection</h4>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {['Analog', 'Luxury', 'Smart Watches', 'Archive'].map(item => (
                <li key={item}>
                  <Link to={`/?cat=${item === 'Archive' ? 'All' : item}`} className="text-decoration-none font-body text-t3 hover:text-gold transition-all" style={{ fontSize: '0.85rem' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="section-label mb-4" style={{ fontSize: '0.65rem' }}>The Maison</h4>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {['Our Heritage', 'Boutiques', 'Sustainability', 'Contact'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-decoration-none font-body text-t3 hover:text-gold transition-all" style={{ fontSize: '0.85rem' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-12 col-md-6 col-lg-3">
            <h4 className="section-label mb-4" style={{ fontSize: '0.65rem' }}>The Journal</h4>
            <div className="chronix-card p-4" style={{ background: '#0A0A0A', border: '1px solid #1e1e1e' }}>
                <div className="d-flex align-items-center gap-3 mb-3 text-gold">
                    <HiOutlineEnvelopeOpen size={20} />
                    <span className="text-uppercase tracking-widest fw-bold" style={{ fontSize: '0.6rem' }}>Early Access</span>
                </div>
                <p className="text-t3 mb-3" style={{ fontSize: '0.75rem' }}>Subscribe to receive notifications for limited collection drops.</p>
                <div className="position-relative">
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    className="w-100 bg-transparent border-0 border-bottom border-border py-2 text-white font-body"
                    style={{ outline: 'none', fontSize: '0.85rem' }}
                  />
                  <button className="position-absolute end-0 bottom-0 py-2 bg-transparent border-0 text-gold font-body text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                    Join
                  </button>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 py-4">
          <div className="d-flex flex-column gap-2">
            <p className="font-mono text-t3 m-0" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                © 2024 Chronix Horological Group.
            </p>
            <div className="d-flex gap-3">
                {['Privacy', 'Terms', 'Cookies'].map(link => (
                    <Link key={link} to="#" className="text-decoration-none font-body text-t3" style={{ fontSize: '0.7rem' }}>{link}</Link>
                ))}
            </div>
          </div>
          <p className="font-display fst-italic text-t3 m-0" style={{ fontSize: '1.2rem', opacity: 0.6 }}>
            "Time is the ultimate luxury."
          </p>
        </div>
      </div>
    </footer>
  );
}
