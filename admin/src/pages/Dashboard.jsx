import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import StatCard from '../components/StatCard';
import { HiOutlineCurrencyRupee, HiOutlineShoppingCart, HiOutlineUsers, HiOutlineShoppingBag } from 'react-icons/hi';

const STATUS_COLORS = {
  pending: 'badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25',
  paid: 'badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25',
  shipped: 'badge bg-info bg-opacity-10 text-info border border-info border-opacity-25',
  delivered: 'badge bg-success bg-opacity-10 text-success border border-success border-opacity-25',
  cancelled: 'badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25',
};

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [ordersSnap, usersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
        getDocs(collection(db, 'products')),
      ]);

      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const paidOrders = orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status));
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: usersSnap.size,
        totalProducts: productsSnap.size,
        recentOrders: orders
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 8),
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center h-100 min-vh-50" style={{ height: '300px' }}>
      <div className="spinner-border text-amber" role="status" />
    </div>
  );

  return (
    <div className="p-4 p-md-5">
      <div className="mb-5">
        <h1 className="font-display fw-bold text-white mb-1">Dashboard</h1>
        <p className="text-platinum small">Welcome back. Here's what's happening.</p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Revenue" value={stats?.totalRevenue} prefix="₹" icon={HiOutlineCurrencyRupee} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Total Orders" value={stats?.totalOrders} icon={HiOutlineShoppingCart} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Customers" value={stats?.totalCustomers} icon={HiOutlineUsers} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard title="Products" value={stats?.totalProducts} icon={HiOutlineShoppingBag} />
        </div>
      </div>

      <div className="glass overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-bottom border-white-5 d-flex align-items-center justify-content-between">
          <h2 className="font-display h5 fw-semibold text-white mb-0">Recent Orders</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map(order => (
                <tr key={order.id}>
                  <td className="ps-4">
                    <span className="text-amber font-monospace small">{order.id.slice(0, 8)}...</span>
                  </td>
                  <td className="text-white small">
                     {order.shippingAddress?.name || 'N/A'}
                  </td>
                  <td className="text-white fw-semibold small">
                    ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`text-uppercase ${STATUS_COLORS[order.status] || 'badge bg-secondary opacity-50'}`} style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-platinum small opacity-75 pe-4">
                    {order.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
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
