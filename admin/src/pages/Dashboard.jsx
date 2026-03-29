import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import StatCard from '../components/StatCard';
import { HiOutlineCurrencyRupee, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineShoppingBag } from 'react-icons/hi';
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const STATUS_COLORS = {
  pending: 'badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1',
  paid: 'badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1',
  shipped: 'badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1',
  delivered: 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1',
  cancelled: 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1',
};

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time synchronization
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
    return Array.from(map.values()).reverse().slice(0, 14); // Last 14 dates
  }, [orders]);

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center h-100 min-vh-50" style={{ height: '300px' }}>
      <div className="spinner-border text-amber" role="status" />
    </div>
  );

  return (
    <div className="p-4 p-md-5">
      <div className="mb-5">
        <h1 className="font-display fw-bold text-white mb-1">Operations Hub</h1>
        <p className="text-platinum small">Real-time analytical metrics and high-priority actionables.</p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Gross Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={HiOutlineCurrencyRupee} trend={{ value: '+12.5%', isUp: true }} />
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

      <div className="row g-4 mb-5">
         <div className="col-lg-8">
            <div className="glass p-4 h-100 shadow-sm border border-white-5" style={{ borderRadius: '12px' }}>
               <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="h6 text-white fw-bold m-0 d-flex align-items-center gap-2"><HiOutlineArrowTrendingUp className="text-amber" /> Trailing 14-Day Velocity</h3>
                    <p className="x-small text-platinum opacity-50 m-0 text-uppercase tracking-wide mt-1">Revenue Performance</p>
                  </div>
               </div>
               <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickMargin={10} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={3} dot={{ fill: '#111118', stroke: '#F5A623', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
         <div className="col-lg-4">
            <div className="glass p-4 h-100 shadow-sm border border-white-5 d-flex flex-column" style={{ borderRadius: '12px' }}>
               <h3 className="h6 text-white fw-bold mb-4">At Risk Matrix</h3>
               <div className="flex-grow-1 overflow-auto pe-2 scrollbar-hide">
                  <p className="x-small text-platinum opacity-50 text-uppercase tracking-wide mb-3">Critically Low Stock</p>
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
                  {products.filter(p => p.stock < 5).length === 0 && <p className="text-platinum small">Inventory levels stable.</p>}
               </div>
            </div>
         </div>
      </div>

      <div className="glass overflow-hidden shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="px-4 py-4 border-bottom border-white-5 d-flex align-items-center justify-content-between">
          <h2 className="font-display h5 fw-bold text-white mb-0">Live Order Feed</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Pipeline Ref</th>
                <th>Client</th>
                <th>Monetary Valuation</th>
                <th>Fulfillment Matrix</th>
                <th className="pe-4 text-end">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map(order => (
                <tr key={order.id}>
                  <td className="ps-4">
                    <span className="text-amber fw-bold small">#{order.id.slice(0, 8)}</span>
                  </td>
                  <td className="text-white small">
                     {order.userEmail || order.shippingAddress?.name || 'Guest'}
                  </td>
                  <td className="text-white fw-bold small">
                    ₹{(order.totalAmount || order.totalPrice || 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`text-uppercase font-sans mx-0 ${STATUS_COLORS[order.status] || 'badge bg-secondary opacity-50'}`} style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-platinum small opacity-75 pe-4 text-end">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' }) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
