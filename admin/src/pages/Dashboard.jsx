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
  if (['paid', 'completed'].includes(s)) return `status-badge status-badge-${s}`;
  if (s === 'delivered') return 'status-badge status-badge-delivered';
  if (s === 'pending') return 'status-badge status-badge-pending';
  if (s === 'cancelled') return 'status-badge status-badge-cancelled';
  if (s === 'shipped') return 'status-badge status-badge-shipped';
  return 'status-badge status-badge-pending';
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

  const totalRevenue = useMemo(() => {
    return orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount || o.totalPrice || 0), 0);
  }, [orders]);

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
      <div className="spinner-border text-amber" role="status" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 p-md-5"
    >
      <div className="mb-5">
        <h1 className="font-display fw-bold text-white mb-1">Operations Hub</h1>
        <p className="text-platinum small">Real-time analytical metrics and high-priority actionables.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Gross Revenue"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
            icon={HiOutlineCurrencyRupee}
            trend={{ value: '+12.5%', isUp: true }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={HiOutlineShoppingCart}
            trend={{ value: '+4.2%', isUp: true }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Customers"
            value={customers}
            icon={HiOutlineUsers}
            trend={{ value: '+8.1%', isUp: true }}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Products"
            value={products.length}
            icon={HiOutlineShoppingBag}
          />
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="glass p-4 h-100 border border-white-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="h6 text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <HiOutlineArrowTrendingUp className="text-amber" /> Trailing 14-Day Velocity
                </h3>
                <p className="x-small text-platinum opacity-50 m-0 text-uppercase tracking-widest mt-1">Revenue Performance</p>
              </div>
            </div>
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickMargin={10} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E8EAF0' }}
                    cursor={{ stroke: 'rgba(245,166,35,0.2)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={3} dot={{ fill: '#111118', stroke: '#F5A623', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="glass p-4 h-100 border border-white-5 d-flex flex-column">
            <h3 className="h6 text-white fw-bold mb-4">At Risk Matrix</h3>
            <div className="flex-grow-1 overflow-auto pe-2 scrollbar-hide">
              <p className="x-small text-platinum opacity-50 text-uppercase tracking-widest mb-3">Critically Low Stock</p>
              {products.filter(p => p.stock < 5).map(p => (
                <div key={p.id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-obsidian-800 border border-white-5 mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <img src={p.imageGallery?.[0]} className="rounded-1 object-fit-contain p-1 border border-white-5 bg-obsidian-900" style={{ width: 36, height: 36 }} alt="" />
                    <div>
                      <p className="text-white small fw-bold m-0 text-truncate" style={{ maxWidth: 120 }}>{p.name}</p>
                      <p className="x-small text-danger fw-bold opacity-75 m-0">{p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}</p>
                    </div>
                  </div>
                </div>
              ))}
              {products.filter(p => p.stock < 5).length === 0 && (
                <p className="text-platinum small opacity-50 fst-italic">Inventory levels stable.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Order Feed (Card-Based) ── */}
      <div className="glass overflow-hidden border border-white-5">
        <div className="px-4 py-4 border-bottom border-white-5 d-flex align-items-center justify-content-between">
          <div>
            <h2 className="font-display h5 fw-bold text-white mb-0">Live Order Feed</h2>
            <p className="x-small text-platinum opacity-50 mb-0 mt-1">Most recent {Math.min(orders.length, 8)} transactions</p>
          </div>
          <span className="status-badge status-badge-active" style={{ fontSize: '10px' }}>
            ● Live
          </span>
        </div>

        <div className="p-4 d-flex flex-column gap-3">
          {orders.slice(0, 8).map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              className="d-flex align-items-center justify-content-between p-4 rounded-4 border border-white-5 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Left: Order info */}
              <div style={{ flex: '0 0 65%' }}>
                <div className="d-flex align-items-center gap-3 mb-1">
                  <span
                    className="font-mono fw-bold text-amber"
                    style={{ fontSize: '14px', letterSpacing: '0.02em' }}
                  >
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-white fw-medium" style={{ fontSize: '14px' }}>
                    {order.shippingAddress?.name || order.userEmail || 'Guest'}
                  </span>
                </div>
                <p
                  className="mb-0 text-platinum"
                  style={{ fontSize: '12px', opacity: 0.6 }}
                >
                  {order.userEmail || order.shippingAddress?.email || '—'}
                </p>
              </div>

              {/* Right: Amount + Badge + Time */}
              <div className="text-end" style={{ flex: '0 0 35%' }}>
                <p className="fw-bold text-white mb-1" style={{ fontSize: '1.1rem' }}>
                  ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString('en-IN')}
                </p>
                <div className="mb-1">
                  <span className={getStatusBadgeClass(order.status)}>
                    {order.status || 'pending'}
                  </span>
                </div>
                <p className="mb-0 text-platinum" style={{ fontSize: '11px', opacity: 0.5 }}>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('en-IN', {
                        hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short',
                      })
                    : 'N/A'}
                </p>
              </div>
            </motion.div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-5 text-platinum opacity-25 fst-italic small">
              No orders yet. They'll appear here in real-time.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
