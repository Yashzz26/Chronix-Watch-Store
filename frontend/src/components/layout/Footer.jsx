import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-obsidian-800 border-t border-white/5 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div>
          <span className="font-display text-2xl font-bold text-white">
            Chronix<span className="text-amber">.</span>
          </span>
          <p className="mt-3 text-platinum text-sm leading-relaxed max-w-xs">
            Premium timepieces for those who understand that time is the ultimate luxury.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Shop</h4>
          <ul className="space-y-2">
            {['All Watches', 'Analog', 'Smart Watch', 'Luxury'].map((c) => (
              <li key={c}>
                <Link to={`/?category=${c}`} className="text-platinum text-sm hover:text-amber transition-colors">{c}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Account</h4>
          <ul className="space-y-2">
            {[['Profile', '/profile'], ['My Orders', '/orders'], ['Cart', '/cart']].map(([label, href]) => (
              <li key={label}>
                <Link to={href} className="text-platinum text-sm hover:text-amber transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-platinum text-xs">© 2025 Chronix. All rights reserved.</p>
        <p className="text-platinum/50 text-xs">Crafted with precision.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
