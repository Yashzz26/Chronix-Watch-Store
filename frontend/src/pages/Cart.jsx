import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlineShoppingCart } from 'react-icons/hi';
import useCartStore from '../store/cartStore';

export default function Cart() {
  const { items, removeItem, updateQty, totalPrice } = useCartStore();
  const total = totalPrice();

  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <HiOutlineShoppingCart style={{ fontSize: 56, color: '#2A2A2A', marginBottom: 16 }} />
      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem',
        fontWeight: 400, color: '#5A5652', marginBottom: 24 }}>
        Your cart is empty
      </h2>
      <Link to="/" className="btn-primary"
        style={{ display: 'inline-block', textDecoration: 'none' }}>
        Explore Collection
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p className="section-label" style={{ marginBottom: 8 }}>Your Selection</p>
      <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.6rem',
        fontWeight: 400, color: '#F0EDE8', marginBottom: 48 }}>
        Shopping Cart
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}
        className="cart-layout">
        <style>{`@media(max-width:768px){.cart-layout{grid-template-columns:1fr!important}}`}</style>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <AnimatePresence>
            {items.map(item => {
              const price = item.dealPrice || item.price;
              return (
                <motion.div key={item.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '80px 1fr auto',
                    gap: 20, alignItems: 'center',
                    padding: '20px 0',
                    borderBottom: '1px solid #1A1A1A',
                  }}
                >
                  {/* Image */}
                  <div style={{ background: '#0A0A0A', borderRadius: 8, padding: 8,
                    border: '1px solid #2A2A2A', aspectRatio: '1/1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.imageGallery[0]} alt={item.name}
                      style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                  </div>

                  {/* Details */}
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#5A5652',
                      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {item.category}
                    </p>
                    <p style={{ fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '1.15rem', color: '#F0EDE8', marginBottom: 12 }}>
                      {item.name}
                    </p>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      {['-', item.qty, '+'].map((v, i) => (
                        <button key={i} onClick={() => {
                          if (v === '-') updateQty(item.id, item.qty - 1);
                          if (v === '+') updateQty(item.id, item.qty + 1);
                        }}
                        disabled={typeof v === 'number'}
                        style={{
                          width: i === 1 ? 40 : 30, height: 30,
                          background: 'transparent',
                          border: '1px solid #2A2A2A',
                          borderLeft: i > 0 ? 'none' : '1px solid #2A2A2A',
                          borderRadius: i === 0 ? '6px 0 0 6px' : i === 2 ? '0 6px 6px 0' : 0,
                          color: typeof v === 'number' ? '#F0EDE8' : '#9A9690',
                          cursor: typeof v === 'number' ? 'default' : 'pointer',
                          fontFamily: typeof v === 'number' ? '"DM Mono", monospace' : 'inherit',
                          fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'color 0.15s',
                        }}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price + remove */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '1rem',
                      color: '#D4AF37', marginBottom: 12 }}>
                      ₹{(price * item.qty).toLocaleString('en-IN')}
                    </p>
                    <button onClick={() => removeItem(item.id)} style={{
                      background: 'none', border: 'none', color: '#3A3A3A',
                      cursor: 'pointer', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#C0392B'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3A3A3A'}
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 28, minWidth: 280, position: 'sticky', top: 88 }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem',
            fontWeight: 500, color: '#F0EDE8', marginBottom: 20, paddingBottom: 16,
            borderBottom: '1px solid #1A1A1A' }}>
            Order Summary
          </h3>
          {[
            ['Subtotal', `₹${total.toLocaleString('en-IN')}`],
            ['Shipping', 'Free'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
              marginBottom: 12, fontSize: '0.9rem' }}>
              <span style={{ color: '#5A5652' }}>{label}</span>
              <span style={{ color: '#9A9690', fontFamily: '"DM Mono", monospace' }}>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between',
            paddingTop: 16, marginTop: 8, borderTop: '1px solid #1A1A1A', marginBottom: 24 }}>
            <span style={{ color: '#F0EDE8', fontWeight: 600 }}>Total</span>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '1.1rem', color: '#D4AF37', fontWeight: 500 }}>
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
          <Link to="/checkout" className="btn-primary"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%' }}>
            Proceed to Checkout
          </Link>
          <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 12,
            fontSize: '0.85rem', color: '#5A5652', textDecoration: 'none',
            transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
          onMouseLeave={e => e.currentTarget.style.color = '#5A5652'}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
