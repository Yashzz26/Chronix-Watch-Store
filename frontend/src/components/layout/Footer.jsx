import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1A1A1A', background: '#0A0A0A', marginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 600 }}>
              Chronix<span style={{ color: '#D4AF37' }}>.</span>
            </span>
            <p style={{ color: '#5A5652', fontSize: '0.85rem', marginTop: 12, lineHeight: 1.7, maxWidth: 220 }}>
              Precision instruments for those who understand that time is the only true luxury.
            </p>
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: 16 }}>Collection</p>
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
          <div>
            <p className="section-label" style={{ marginBottom: 16 }}>Account</p>
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
        <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#3A3A3A', fontSize: '0.78rem' }}>© 2025 Chronix. All rights reserved.</p>
          <p style={{ color: '#3A3A3A', fontSize: '0.78rem', fontStyle: 'italic',
            fontFamily: '"Cormorant Garamond", serif' }}>
            Time waits for no one.
          </p>
        </div>
      </div>
    </footer>
  );
}
