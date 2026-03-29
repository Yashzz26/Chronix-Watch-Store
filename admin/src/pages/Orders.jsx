import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineX, HiOutlineEye, HiOutlineSearch, HiOutlineTruck, 
  HiOutlineCheckCircle, HiOutlineTrash, HiOutlineDotsVertical,
  HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineLightningBolt,
  HiOutlineStar, HiOutlineClipboardCopy
} from 'react-icons/hi';

const TABS = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const STATUS_MAP = {
  pending:   { label: 'Pending',   bg: '#FFFBEB', tc: '#D97706', border: '#FEF3C7' },
  paid:      { label: 'Paid',      bg: '#F0FDF4', tc: '#166534', border: '#DCFCE7' },
  shipped:   { label: 'Shipped',    bg: '#EFF6FF', tc: '#1D4ED8', border: '#DBEAFE' },
  delivered: { label: 'Delivered',  bg: '#F0FDF4', tc: '#15803D', border: '#DCFCE7' },
  cancelled: { label: 'Cancelled',  bg: '#FEF2F2', tc: '#991B1B', border: '#FEE2E2' },
};

const canTransition = (from, to) => {
  if (from === to) return false;
  if (from === 'delivered' || from === 'cancelled') return false; 
  const flow = ['pending', 'paid', 'shipped', 'delivered'];
  const fromIdx = flow.indexOf(from);
  const toIdx = flow.indexOf(to);
  if (to === 'cancelled') return true; 
  return toIdx > fromIdx; 
};

// --- Sub-components ---

const AnalyticsCard = ({ label, value, icon: Icon, color }) => (
  <div style={{ background: 'white', padding: '24px', borderRadius: '18px', flex: 1, border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '12px' }}>
        <Icon size={22} />
      </div>
    </div>
    <p style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>{label}</p>
    <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#111827', margin: '4px 0 0' }}>{value}</h3>
  </div>
);

const PriorityBadge = ({ type }) => {
  const cfg = type === 'VIP' 
    ? { label: 'VIP', bg: '#FFF7ED', tc: '#C2410C', bc: '#FFedd5', icon: HiOutlineStar }
    : { label: 'HIGH', bg: '#FEF2F2', tc: '#B91C1C', bc: '#FEE2E2', icon: HiOutlineClock };
  const Icon = cfg.icon;
  return (
    <span style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', 
      borderRadius: '6px', fontSize: '10px', fontWeight: 800, background: cfg.bg, color: cfg.tc, border: `1px solid ${cfg.bc}`
    }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const dropdownRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiCall('patch', `/api/orders/admin/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Status synchronized');
      setOpenDropdownId(null);
    },
    onError: () => toast.error('Transition failed')
  });

  const bulkStatusMutation = useMutation({
    mutationFn: (status) => Promise.all(
      Array.from(selectedIds).map(id => apiCall('patch', `/api/orders/admin/${id}/status`, { status }))
    ),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success(`Updated ${selectedIds.size} orders`);
      setSelectedIds(new Set());
    },
    onError: () => toast.error('Bulk update partial failure')
  });

  const filteredOrders = orders.filter(o => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const searchLow = debouncedSearch.toLowerCase();
    const contact = (o.address?.fullName || o.shippingAddress?.name || '').toLowerCase();
    const matchesSearch = 
      (o.orderDisplayId || '').toLowerCase().includes(searchLow) || 
      o.id.toLowerCase().includes(searchLow) || 
      contact.includes(searchLow);
    return matchesTab && matchesSearch;
  });

  const analytics = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    revenue: orders.reduce((acc, o) => acc + (o.totalAmount || o.totalPrice || 0), 0),
    avg: orders.length ? orders.reduce((acc, o) => acc + (o.totalAmount || o.totalPrice || 0), 0) / orders.length : 0
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh', background: '#F9FAFB' }}>
      <div className="d-flex flex-column align-items-center gap-3">
        <div className="spinner-border text-gold" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
        <p style={{ fontWeight: 700, fontSize: '14px', color: '#6B7280', letterSpacing: '0.05em' }}>SYNCING OPERATIONS...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 40px', background: '#F9FAFB', minHeight: '100vh' }}>
      <style>{`
        /* SAAS CARDS REVOLUTION */
        .orders-container { display: flex; flex-direction: column; gap: 12px; }
        
        .order-card-grid {
          display: grid;
          grid-template-columns: 40px 140px 1fr 160px 180px 140px 130px;
          gap: 16px; align-items: center;
          background: #FFFFFF; padding: 18px 24px; border-radius: 16px;
          border: 1px solid #F1F5F9; transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(17, 24, 39, 0.02);
          position: relative;
        }
        .order-card-grid:hover {
          box-shadow: 0 10px 25px rgba(17, 24, 39, 0.05);
          border-color: #E2E8F0;
          z-index: 10;
        }
        .order-card-grid.active-dropdown { z-index: 99999 !important; border-color: #E2E8F0; }

        .quick-actions { opacity: 0; transition: all 0.2s; visibility: hidden; }
        .order-card-grid:hover .quick-actions { opacity: 1; visibility: visible; }
        
        .copy-trigger {
          all: unset; padding: 2px 8px; border-radius: 6px; background: #FDE68A; 
          color: #92400E; font-size: 10px; font-weight: 900; cursor: pointer;
          opacity: 0; transition: all 0.2s; visibility: hidden;
        }
        .order-card-grid:hover .copy-trigger { opacity: 1; visibility: visible; }
        .copy-trigger:hover { background: #FCD34D; }
        
        .view-btn {
          background: #F3F4F6; color: #4B5563; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 10px; border: none;
          transition: all 0.2s;
        }
        .view-btn:hover { background: #E5E7EB; color: #111827; }

        .status-wrapper { position: relative !important; }
        .status-chip { 
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; 
          border-radius: 999px; font-size: 13px; font-weight: 700; 
          border: 1.5px solid transparent; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .status-chip .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

        .status-menu {
          all: unset; position: absolute !important; top: calc(100% + 8px) !important; left: 0 !important; 
          z-index: 999999 !important;
          background: #FFFFFF !important; border-radius: 16px !important; padding: 10px !important;
          box-shadow: 0 15px 45px rgba(0,0,0,0.12) !important; width: 220px !important; 
          border: 1px solid #E5E7EB !important; display: flex !important; flex-direction: column !important;
          animation: floatIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes floatIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .menu-item {
          display: flex !important; align-items: center !important; gap: 10px !important; width: 100% !important; 
          border: none !important; background: transparent !important; padding: 12px 14px !important; 
          border-radius: 12px !important; font-size: 14px !important; cursor: pointer !important; 
          transition: all 0.2s !important; color: #374151 !important; font-weight: 600 !important;
        }
        .menu-item:hover:not(:disabled) { background: #F9FAFB !important; color: #111827 !important; }
        .menu-item.active { background: #F3F4F6 !important; color: #111827 !important; }

        .analytics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 40px; }
        
        .bulk-bar {
          position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
          background: rgba(17, 24, 39, 0.95); backdrop-filter: blur(12px); 
          color: white; padding: 14px 32px; border-radius: 20px;
          display: flex; align-items: center; gap: 32px; z-index: 999999;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); 
          border: 1px solid rgba(255,255,255,0.1);
        }

        .tab-pill { padding: 8px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; transition: all 0.2s; }
        .tab-pill.active { background: #111827 !important; color: #FFFFFF !important; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

        @media (max-width: 1200px) {
          .order-card-grid {
            grid-template-columns: 40px 1fr 1fr;
            gap: 20px;
          }
          .analytics-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .order-card-grid { grid-template-columns: 1fr; }
          .analytics-grid { grid-template-columns: 1fr; }
          .bulk-bar { width: 90%; flex-wrap: wrap; gap: 16px; bottom: 20px; }
        }
      `}</style>

      {/* Hero Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 900, fontSize: '2.4rem', color: '#111827', margin: 0, letterSpacing: '-0.04em' }}>
              Orders Overview
            </h1>
            <a href="/migration" style={{ fontSize: '11px', fontWeight: 900, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none', background: 'rgba(217, 119, 6, 0.1)', padding: '4px 12px', borderRadius: '8px' }}>Normalize IDs</a>
          </div>
          <p className="m-0" style={{ fontSize: '15px', color: '#6B7280', fontWeight: 600 }}>Manage and track customer orders</p>
        </div>
        
        <div style={{ position: 'relative', width: '340px' }}>
          <HiOutlineSearch className="position-absolute translate-middle-y" style={{ left: '20px', top: '50%', color: '#9CA3AF' }} />
          <input 
            type="text" 
            placeholder="Search by ID or Name..." 
            className="form-control"
            style={{ 
              paddingLeft: '52px', borderRadius: '16px', border: '1.5px solid #E2E8F0',
              fontSize: '14px', height: '56px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Analytics Row */}
      <div className="analytics-grid">
        <AnalyticsCard label="Active Orders" value={analytics.total} icon={HiOutlineTruck} color="#6366F1" />
        <AnalyticsCard label="Pending Orders" value={analytics.pending} icon={HiOutlineClock} color="#F59E0B" />
        <AnalyticsCard label="Total Revenue" value={`₹${analytics.revenue.toLocaleString('en-IN')}`} icon={HiOutlineCurrencyRupee} color="#10B981" />
        <AnalyticsCard label="Avg Order Value" value={`₹${Math.round(analytics.avg).toLocaleString('en-IN')}`} icon={HiOutlineStar} color="#EC4899" />
      </div>

      <div className="d-flex align-items-center gap-2 mb-4">
        {TABS.map(tab => {
          const count = orders.filter(o => tab === 'all' || o.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn btn-sm tab-pill ${isActive ? 'active' : ''}`}
              style={{
                background: isActive ? '#111827' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#6B7280',
                border: isActive ? 'none' : '1px solid #E5E7EB',
                fontWeight: 600
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{tab}</span>
              <span style={{ 
                marginLeft: '6px', opacity: 0.6, fontSize: '11px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* GRID REVOLUTION */}
      <div className="orders-container">
        {/* Header Row */}
        <div className="order-card-grid" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0 24px', height: '32px' }}>
          <div className="ps-0" style={{ width: '40px' }}>
            <input 
              type="checkbox" 
              checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
              onChange={(e) => {
                if (e.target.checked) setSelectedIds(new Set(filteredOrders.map(o => o.id)));
                else setSelectedIds(new Set());
              }}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em' }}>Order ID</p>
          <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em' }}>Customer</p>
          <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em' }}>Order Details</p>
          <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em' }}>Order Status</p>
          <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em' }}>Order Date</p>
          <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</p>
        </div>

        {filteredOrders.map(o => {
          const statusCfg = STATUS_MAP[o.status || 'pending'] || STATUS_MAP.pending;
          const isVIP = (o.totalAmount || o.totalPrice) > 20000;
          const isHighPriority = o.status === 'pending' && (new Date() - new Date(o.createdAt)) > 172800000; // 48h
          
          return (
            <motion.div 
              layout
              key={o.id} 
              className={`order-card-grid ${openDropdownId === o.id ? 'active-dropdown' : ''}`}
              onClick={() => setSelectedOrder(o)}
              style={{ cursor: 'pointer' }}
            >
              <div onClick={e => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(o.id)}
                  onChange={() => toggleSelect(o.id)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div className="d-flex align-items-center gap-3">
                <div 
                  className="d-flex align-items-center gap-2"
                  style={{ fontWeight: 800, color: '#D97706', fontSize: '13px', fontFamily: 'DM Mono, monospace' }}
                >
                  #{o.orderDisplayId || o.id.slice(-8).toUpperCase()}
                  <button 
                    className="copy-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(o.orderDisplayId || o.id);
                      toast('Copied to Ledger', { icon: '📋', style: { borderRadius: '12px', background: '#111827', color: '#fff', fontSize: '12px', fontWeight: 800 } });
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className="d-flex gap-1">
                  {isVIP && <PriorityBadge type="VIP" />}
                  {isHighPriority && <PriorityBadge type="HIGH" />}
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                  {(o.address?.fullName || o.shippingAddress?.name || 'G')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 1px', fontSize: '14px' }}>
                    {o.address?.fullName || o.shippingAddress?.name || 'Guest Customer'}
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0, fontWeight: 500 }}>
                    {o.address?.phone || o.shippingAddress?.email || ''}
                  </p>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 800, color: '#111827', fontSize: '15px' }}>
                  ₹{(o.totalAmount || o.totalPrice || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 700 }}>
                  {o.items?.length || 0} {o.items?.length === 1 ? 'item' : 'items'}
                </div>
              </div>

              <div className="status-wrapper" onClick={e => e.stopPropagation()}>
                <button 
                  className="status-chip"
                  style={{ background: statusCfg.bg, color: statusCfg.tc, borderColor: statusCfg.border }}
                  onClick={() => setOpenDropdownId(openDropdownId === o.id ? null : o.id)}
                >
                  <span className="dot" />
                  {statusCfg.label}
                </button>

                <AnimatePresence>
                  {openDropdownId === o.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="status-menu"
                    >
                      <p style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', padding: '8px 14px 4px', margin: 0, letterSpacing: '0.05em' }}>Order Status</p>
                      {Object.entries(STATUS_MAP).map(([val, cfg]) => {
                        const disabled = !canTransition(o.status || 'pending', val);
                        const isActive = (o.status || 'pending') === val;
                        return (
                          <button
                            key={val}
                            disabled={disabled}
                            className={`menu-item ${isActive ? 'active' : ''}`}
                            onClick={() => statusMutation.mutate({ id: o.id, status: val })}
                            style={{ opacity: disabled ? 0.3 : 1 }}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.tc }} />
                            <span>{cfg.label}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <div style={{ color: '#111827', fontSize: '14px', fontWeight: 700 }}>
                  {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) ||
                    (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date N/A')}
                </div>
              </div>

              <div className="text-end pe-0">
                <div className="quick-actions">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                    className="view-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div style={{ padding: '120px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '2px dashed #E2E8F0' }}>
            <div style={{ background: '#F8FAFC', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 24px' }}>
              <HiOutlineTruck size={40} style={{ color: '#94A3B8' }} />
            </div>
            <h3 style={{ fontWeight: 800, color: '#111827' }}>No matching manifests found.</h3>
            <p style={{ color: '#64748B', maxWidth: '400px', margin: '12px auto' }}>We couldn't find any orders matching your current alignment. Try resetting your filters.</p>
            <button onClick={() => { setSearchTerm(''); setActiveTab('all'); }} className="btn btn-dark mt-3" style={{ borderRadius: '12px', fontWeight: 700, padding: '12px 24px' }}>Reset Operations</button>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar (UPGRADED) */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            className="bulk-bar"
          >
            <div className="d-flex align-items-center border-end border-light pe-4 me-2">
              <span style={{ fontSize: '14px', fontWeight: 900, background: '#D97706', color: 'white', padding: '4px 12px', borderRadius: '10px', marginRight: '16px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)' }}>
                {selectedIds.size}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>Manifests Selected</span>
            </div>
            
            <div className="d-flex align-items-center gap-3">
               <button 
                 onClick={() => bulkStatusMutation.mutate('shipped')}
                 className="btn btn-sm text-white d-flex align-items-center gap-2" 
                 style={{ fontSize: '13px', fontWeight: 800, background: 'rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '12px', transition: '0.2s' }}
                 onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                 onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
               >
                 <HiOutlineTruck size={18} /> Mark Shipped
               </button>
               <button 
                 onClick={() => bulkStatusMutation.mutate('delivered')}
                 className="btn btn-sm text-white d-flex align-items-center gap-2"
                 style={{ fontSize: '13px', fontWeight: 800, background: 'rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '12px' }}
                 onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                 onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
               >
                 <HiOutlineCheckCircle size={18} /> Mark Delivered
               </button>
               <button 
                 onClick={() => setSelectedIds(new Set())}
                 className="btn btn-sm" 
                 style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 700 }}
               >
                 Deselect
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-In Drawer Details */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', right: 0, top: 0, bottom: 0, width: '480px',
                background: '#FFFFFF', zIndex: 9999, padding: '40px',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.1)'
              }}
            >
               <div className="d-flex align-items-center justify-content-between mb-5">
                  <div>
                    <h3 style={{ fontWeight: 800, color: '#111827', margin: 0, fontSize: '1.4rem' }}>Document Registry</h3>
                    <p style={{ fontFamily: 'DM Mono, monospace', color: '#D97706', fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
                      REFID: {selectedOrder.id.toUpperCase()}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: '#F3F4F6', color: '#6B7280', padding: '10px', borderRadius: '12px' }}>
                    <HiOutlineX size={20} />
                  </button>
               </div>

               <div className="scrollbar-hide" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
                  
                  {/* Status Timeline */}
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Delivery Progress</p>
                    <div className="d-flex justify-content-between position-relative px-2">
                      <div style={{ position: 'absolute', top: '10px', left: '20px', right: '20px', height: '2px', background: '#F1F5F9', zIndex: 0 }} />
                      {['pending', 'paid', 'shipped', 'delivered'].map((step, idx) => {
                        const flow = ['pending', 'paid', 'shipped', 'delivered'];
                        const currentIdx = flow.indexOf(selectedOrder.status);
                        const isCompleted = currentIdx >= idx;
                        const isActive = currentIdx === idx;
                        return (
                          <div key={step} className="d-flex flex-column align-items-center gap-2" style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ 
                              width: '22px', height: '22px', borderRadius: '50%', 
                              background: isCompleted ? '#10B981' : '#FFFFFF',
                              border: isCompleted ? 'none' : '2px solid #E2E8F0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: isActive ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                            }}>
                              {isCompleted && <HiOutlineCheckCircle color="white" size={14} />}
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: isCompleted ? '#111827' : '#94A3B8' }}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Shipping Address</p>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                      <p style={{ fontWeight: 800, color: '#111827', marginBottom: '8px', fontSize: '16px' }}>
                        {selectedOrder.address?.fullName || selectedOrder.shippingAddress?.name}
                      </p>
                      <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                        {selectedOrder.address?.address || selectedOrder.shippingAddress?.address}<br />
                        {selectedOrder.address?.city || selectedOrder.shippingAddress?.city}, {selectedOrder.address?.state || selectedOrder.shippingAddress?.state} {selectedOrder.address?.zip || selectedOrder.shippingAddress?.zip}
                      </p>
                      <div style={{ marginTop: '20px', pt: '20px', borderTop: '1px solid #E2E8F0', color: '#1E293B', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#94A3B8' }}>COMMUNICATION:</span> {selectedOrder.address?.phone || selectedOrder.shippingAddress?.email}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Financial Summary</p>
                    <div style={{ background: '#111827', color: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                      <div className="d-flex justify-content-between mb-4">
                         <span style={{ opacity: 0.5, fontSize: '13px', fontWeight: 600 }}>Order Status</span>
                         <span style={{ background: '#D97706', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {selectedOrder.status}
                         </span>
                      </div>
                      <div className="d-flex justify-content-between mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                         <span style={{ opacity: 0.5, fontSize: '13px', fontWeight: 600 }}>Invoice Reference</span>
                         <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em' }}>{selectedOrder.invoiceId || 'PENDING GENERATION'}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                         <span style={{ fontWeight: 700, fontSize: '15px' }}>Final Settlement</span>
                         <span style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em' }}>₹{(selectedOrder.totalAmount || selectedOrder.totalPrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Purchased Items</p>
                    <div className="d-flex flex-column gap-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-4 p-3" style={{ background: 'white', border: '1.5px solid #F1F5F9', borderRadius: '16px', transition: '0.2s' }}>
                          <div style={{ position: 'relative' }}>
                            <img src={item.imageGallery?.[0] || item.image} style={{ width: 70, height: 70, objectFit: 'contain', borderRadius: '12px', background: '#F8FAFC', padding: '8px' }} alt="" />
                            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#111827', color: 'white', fontSize: '10px', fontWeight: 900, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.qty}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>{item.name}</p>
                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>SKU: CHX-00{idx+1} • ₹{(item.dealPrice || item.price)?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
