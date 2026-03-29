import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import StatCard from '../components/StatCard';
import { HiOutlineCurrencyRupee, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineShoppingBag } from 'react-icons/hi';
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  return `status-badge status-badge-${s}` || 'status-badge status-badge-pending';
};

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    getDocs(query(collection(db, 'users'))).then(snap => {
      setCustomers(snap.docs.filter(d => d.data().role !== 'admin').length);
    });
    return () => { unsubOrders(); unsubProducts(); };
  }, []);

  const totalRevenue = useMemo(() =>
    orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount || o.totalPrice || 0), 0),
    [orders]
  );

  const chartData = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!map.has(d)) map.set(d, { date: d, revenue: 0, orders: 0 });
      const day = map.get(d);
      day.orders += 1;
      if (['paid', 'shipped', 'delivered'].includes(o.status)) day.revenue += (o.totalAmount || o.totalPrice || 0);
    });
    return Array.from(map.values()).reverse().slice(0, 14);
  }, [orders]);

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
      <div className="spinner-border" style={{ color: '#D97706' }} role="status" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '32px 36px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: '1.85rem', color: '#111827', marginBottom: '4px', letterSpacing: '-0.02em' }}>
          Operations Hub
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
          Real-time metrics and high-priority actionables.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Gross Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={HiOutlineCurrencyRupee} trend={{ value: '+12.5%', isUp: true }} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Orders" value={orders.length} icon={HiOutlineShoppingCart} trend={{ value: '+4.2%', isUp: true }} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Active Customers" value={customers} icon={HiOutlineUsers} trend={{ value: '+8.1%', isUp: true }} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Products" value={products.length} icon={HiOutlineShoppingBag} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="glass p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiOutlineArrowTrendingUp style={{ color: '#D97706' }} /> Trailing 14-Day Revenue
                </h3>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Revenue Performance
                </p>
              </div>
            </div>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="date" stroke="#E5E7EB" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickMargin={8} axisLine={false} />
                  <YAxis stroke="#E5E7EB" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', color: '#111827', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    cursor={{ stroke: '#E5E7EB' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2.5} dot={{ fill: '#FFFFFF', stroke: '#D97706', strokeWidth: 2, r: 4 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass p-4 h-100 d-flex flex-column">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
              Low Stock Alert
            </h3>
            <div className="flex-grow-1 overflow-auto scrollbar-hide">
              {products.filter(p => p.stock < 5).map(p => (
                <div
                  key={p.id}
                  className="d-flex align-items-center gap-3 mb-2 p-3 rounded-3"
                  style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}
                >
                  <img
                    src={p.imageGallery?.[0]}
                    className="rounded-2 object-fit-contain"
                    style={{ width: 36, height: 36, background: '#F3F4F6', padding: 4, border: '1px solid #E5E7EB' }}
                    alt=""
                  />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0, maxWidth: 130 }} className="text-truncate">
                      {p.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#EF4444', margin: 0, fontWeight: 600 }}>
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                    </p>
                  </div>
                </div>
              ))}
              {products.filter(p => p.stock < 5).length === 0 && (
                <p style={{ color: '#9CA3AF', fontSize: '13px', fontStyle: 'italic' }}>Inventory stable.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Order Feed — Card Grid */}
      <div className="glass overflow-hidden">
        <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Live Order Feed
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              Most recent {Math.min(orders.length, 8)} orders
            </p>
          </div>
          <span
            className="status-badge status-badge-active"
            style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span className="live-dot" /> Live
          </span>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.slice(0, 8).map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(0,0,0,0.07)' }}
              style={{
                background: '#FFFFFF',
                border: '1px solid #F3F4F6',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#D97706', fontSize: '13px' }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {order.shippingAddress?.name || order.userEmail || 'Guest'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
                  {order.userEmail || order.shippingAddress?.email || '—'}
                </p>
              </div>
              <div className="text-end">
                <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString('en-IN')}
                </p>
                <div className="mb-1">
                  <span className={`status-badge status-badge-${(order.status || 'pending').toLowerCase()}`}>
                    {order.status || 'pending'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#D1D5DB' }}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })
                    : 'N/A'}
                </p>
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-5" style={{ color: '#D1D5DB', fontStyle: 'italic', fontSize: '14px' }}>
              No orders yet. They'll appear here in real-time.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
