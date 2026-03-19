import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1A1A1A', background: '#0A0A0A', marginTop: 80 }}>
      <div className="container" style={{ padding: '48px 24px 32px' }}>
        <div className="row gy-5 mb-5">
          <div className="col-12 col-md-4">
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 600 }}>
              Chronix<span style={{ color: '#D4AF37' }}>.</span>
            </span>
            <p style={{ color: '#5A5652', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.7, maxWidth: 220 }}>
              Precision instruments for those who understand that time is the only true luxury.
            </p>
          </div>
          <div className="col-6 col-md-4">
            <p className="section-label mb-3">Collection</p>
            {['Analog', 'Smart Watch', 'Luxury', 'All Watches'].map(c => (
              <Link key={c} to={`/?cat=${c}`} style={{
                display: 'block', color: '#5A5652', textDecoration: 'none',
                fontSize: '0.875rem', padding: '4px 0', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#5A5652'}
              >{c}</Link>
            ))}
          </div>
          <div className="col-6 col-md-4">
            <p className="section-label mb-3">Account</p>
            {[['Profile', '/profile'], ['Cart', '/cart'], ['Sign In', '/login']].map(([l, h]) => (
              <Link key={l} to={h} style={{
                display: 'block', color: '#5A5652', textDecoration: 'none',
                fontSize: '0.875rem', padding: '4px 0', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
              onMouseLeave={e => e.currentTarget.style.color = '#5A5652'}
              >{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 24 }}
          className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <p style={{ color: '#3A3A3A', fontSize: '0.78rem', margin: 0 }}>© 2025 Chronix. All rights reserved.</p>
          <p style={{ color: '#3A3A3A', fontSize: '0.78rem', fontStyle: 'italic',
            fontFamily: '"Cormorant Garamond", serif', margin: 0 }}>
            Time waits for no one.
          </p>
        </div>
      </div>
    </footer>
  );
}
