import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation} from '@tanstack/react-query';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { apiCall } from '../lib/apiHelper';
import { 
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, 
  HiOutlineSearch, HiOutlineFilter, HiOutlineSortAscending 
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';


const Categories = ['Analog', 'Smart Watch', 'Luxury', 'Gifts for Him', 'Gifts for Her', 'Limited Edition'];
const Tabs = ['All', 'Active', 'Out of Stock'];

const Products = () => {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    // Fetch all products without orderBy to avoid hiding docs missing the field
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort client-side: updatedAt desc, then createdAt desc
      allProducts.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
        const timeB = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setProducts(allProducts);
      setIsLoading(false);
    }, err => { console.error(err); setIsLoading(false); });
    return () => unsubscribe();
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id) => apiCall('delete', `/api/products/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDeleteConfirm(null); },
    onError: () => toast.error('Delete failed')
  });

  const toggleSelection = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => selectedIds.size === filteredProducts.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredProducts.map(p => p.id)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const stock = Number(p.stock) || 0;
    const matchesTab = activeTab === 'All' ? true : activeTab === 'Active' ? stock > 0 : stock === 0;
    return matchesSearch && matchesTab;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#111827', marginBottom: '4px' }}>
            Products <span style={{ color: '#9CA3AF', fontSize: '1.2rem' }}>({products.length})</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Manage your timepiece inventory.</p>
        </div>
        <button onClick={() => navigate('/products/new')} className="btn btn-amber d-flex align-items-center gap-2">
          <HiOutlinePlus size={18} /> Add Product
        </button>
      </div>

      <div className="glass overflow-hidden">
        {/* Filter Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="d-flex gap-3">
            {Tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: '12px', fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? '#111827' : '#9CA3AF',
                  padding: '4px 0',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: activeTab === tab ? '2px solid #111827' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="d-flex gap-2 align-items-center">
            <div style={{ position: 'relative' }}>
              <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={15} />
              <input
                type="text"
                placeholder="Search products..."
                style={{
                  height: '40px', paddingLeft: '36px', paddingRight: '12px',
                  border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px',
                  background: '#FFFFFF', color: '#111827', width: '220px', outline: 'none',
                }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#111827'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            <button className="btn btn-sm btn-obsidian" style={{ height: '40px', width: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Filter">
              <HiOutlineFilter size={15} style={{ color: '#6B7280' }} />
            </button>
            <button className="btn btn-sm btn-obsidian" style={{ height: '40px', width: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Sort">
              <HiOutlineSortAscending size={15} style={{ color: '#6B7280' }} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-chronix mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: 40 }} className="ps-4">
                  <input type="checkbox" className="form-check-input cursor-pointer" style={{ borderColor: '#D1D5DB' }}
                    checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length} onChange={toggleAll} />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Stock</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="py-3 px-4">
                    <div className="placeholder-glow"><span className="placeholder col-12 rounded-2" style={{ height: 44, background: '#F3F4F6' }}></span></div>
                  </td></tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5" style={{ color: '#D1D5DB', fontStyle: 'italic', fontSize: '14px' }}>No products found.</td></tr>
              ) : filteredProducts.map(p => (
                <tr key={p.id}>
                  <td className="ps-4">
                    <input type="checkbox" className="form-check-input cursor-pointer" style={{ borderColor: '#D1D5DB' }}
                      checked={selectedIds.has(p.id)} onChange={() => toggleSelection(p.id)} />
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 56, height: 56, borderRadius: '10px', border: '1px solid #E5E7EB', background: '#F9FAFB', padding: 6, flexShrink: 0 }}>
                        <img src={p.imageGallery?.[0] || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.name}</span>
                        {p.isOnDeal && <span style={{ display: 'block', fontSize: '11px', color: '#D97706', fontWeight: 600 }}>★ Deal — ₹{p.dealPrice?.toLocaleString('en-IN')}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#6B7280', fontSize: '13px' }}>{p.category}</td>
                  <td>
                    {p.stock > 0
                      ? <span className="status-badge status-badge-active">Active</span>
                      : <span className="status-badge status-badge-cancelled">Out of Stock</span>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: p.stock > 5 ? '#065F46' : p.stock > 0 ? '#92400E' : '#991B1B' }}>{p.stock}</span>
                    <span style={{ color: '#9CA3AF', fontSize: '13px', marginLeft: 4 }}>units</span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      {[
                        { icon: HiOutlinePencil, title: 'Edit', action: () => navigate(`/products/edit/${p.id}`), hoverBg: '#FEF3C7', hoverColor: '#92400E' },
                        { icon: HiOutlineTrash, title: 'Delete', action: () => setDeleteConfirm(p.id), hoverBg: '#FEE2E2', hoverColor: '#991B1B' },
                      ].map(({ icon: Ico, title, action, hoverBg, hoverColor }) => (
                        <button
                          key={title} onClick={action} title={title}
                          style={{ width: 36, height: 36, border: 'none', background: '#F3F4F6', color: '#6B7280', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; }}
                        >
                          <Ico size={15} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="modal show d-block" style={{ background: 'rgba(17,24,39,0.2)', zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content">
                <div className="modal-body p-5 text-center">
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#991B1B' }}>
                    <HiOutlineTrash size={22} />
                  </div>
                  <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Delete Product?</h5>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>This action cannot be undone.</p>
                  <div className="d-flex gap-2">
                    <button onClick={() => setDeleteConfirm(null)} className="btn btn-obsidian flex-grow-1 py-2">Cancel</button>
                    <button onClick={() => deleteMutation.mutate(deleteConfirm)} style={{ flex: 1, background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Products;
