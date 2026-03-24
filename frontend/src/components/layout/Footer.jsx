import { Link } from 'react-router-dom';

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
      <div className="container py-5">
        <div className="row g-5 mb-5 pb-5 border-bottom border-border border-opacity-25">
          {/* Brand */}
          <div className="col-12 col-lg-4">
            <Link to="/" className="text-decoration-none">
              <span className="font-display d-block mb-4" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>
                Chronix<span className="text-gold">.</span>
              </span>
            </Link>
            <p className="font-body text-t3 mb-4 pe-lg-5" style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
              Distinctive instruments of horology, crafted for those who value the intersection of timeless art and precision engineering.
            </p>
            <div className="d-flex gap-3">
              {['IN', 'TW', 'FB'].map(social => (
                <button key={social} className="btn-outline-gold p-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="col-6 col-md-3 col-lg-2 ms-lg-auto">
            <h4 className="section-label mb-4">Collection</h4>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {['Analog', 'Luxury', 'Smart Watches', 'Archive'].map(item => (
                <li key={item}>
                  <Link to={`/?cat=${item === 'Archive' ? 'All' : item}`} className="text-decoration-none font-body text-t2 hover:text-gold transition-all" style={{ fontSize: '0.9rem' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h4 className="section-label mb-4">Maison</h4>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {['Our Legacy', 'Boutiques', 'Sustainability', 'Contact'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-decoration-none font-body text-t2 hover:text-gold transition-all" style={{ fontSize: '0.9rem' }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-12 col-md-6 col-lg-3">
            <h4 className="section-label mb-4">The Journal</h4>
            <p className="font-body text-t3 mb-4" style={{ fontSize: '0.85rem' }}>Subscribe to receive early access to limited editions.</p>
            <div className="position-relative">
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-100 bg-transparent border-0 border-bottom border-border py-2 text-white font-body"
                style={{ outline: 'none', fontSize: '0.9rem' }}
              />
              <button className="position-absolute end-0 bottom-0 py-2 bg-transparent border-0 text-gold font-body text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <p className="font-mono text-t3 m-0" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            © 2024 Chronix Horological Group. All Rights Reserved.
          </p>
          <div className="d-flex gap-4">
             {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(link => (
                <Link key={link} to="#" className="text-decoration-none font-body text-t3" style={{ fontSize: '0.75rem' }}>{link}</Link>
             ))}
          </div>
          <p className="font-display fst-italic text-t3 m-0" style={{ fontSize: '1.2rem' }}>
            Time is the ultimate luxury.
          </p>
        </div>
      </div>
    </footer>
  );
}
