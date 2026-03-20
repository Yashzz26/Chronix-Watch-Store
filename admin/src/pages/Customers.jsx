import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const { data: customerOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.uid],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const snapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', selectedCustomer.uid), orderBy('createdAt', 'desc')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!selectedCustomer
  });

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (isLoading) return <div className="p-10 text-center text-platinum opacity-50">Retrieving Client Database...</div>;

  return (
    <div className="p-4 p-md-5">
      <div className="mb-5 text-center text-sm-start">
        <h1 className="font-display fw-bold text-white mb-1">Customers</h1>
        <p className="text-platinum small">Directory of Chronix patrons and their lifecycle data.</p>
      </div>

      <div className="glass overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Patron', 'Email', 'Contact', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="ps-4 text-uppercase small fw-bold tracking-widest text-platinum" style={{ fontSize: '0.7rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-amber bg-opacity-10 border border-amber border-opacity-20 rounded-circle d-flex align-items-center justify-content-center text-amber fw-bold shadow-sm" style={{ width: '40px', height: '40px', fontSize: '13px' }}>
                        {c.photo ? <img src={c.photo} className="w-100 h-100 rounded-circle object-fit-cover" alt="" /> : getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-white fw-bold mb-0 small">{c.name || 'Anonymous User'}</p>
                        <p className="text-platinum opacity-25 font-monospace mb-0" style={{ fontSize: '9px' }}>{c.uid?.slice(0, 12)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-platinum small">{c.email}</td>
                  <td className="text-platinum small">{c.phone || '—'}</td>
                  <td>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 text-uppercase" style={{ fontSize: '9px' }}>Active</span>
                  </td>
                  <td className="text-platinum x-small">
                    {c.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                  </td>
                  <td className="pe-4">
                    <button onClick={() => setSelectedCustomer(c)} className="btn btn-link text-amber fw-bold text-decoration-none text-uppercase small p-0 tracking-widest" style={{ fontSize: '11px' }}>
                      Profile Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <div className="modal show d-block p-0" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
             <motion.div 
               initial={{ x: '100%' }} 
               animate={{ x: 0 }} 
               exit={{ x: '100%' }} 
               transition={{ type: 'spring', damping: 30, stiffness: 300 }} 
               className="ms-auto h-100 bg-obsidian-800 border-start border-white-5 shadow-2xl d-flex flex-column"
               style={{ maxWidth: '550px', width: '100%' }}
             >
                <div className="p-4 p-md-5 border-bottom border-white-5 d-flex align-items-center justify-content-between bg-obsidian-900">
                  <h3 className="font-display h3 fw-bold text-white mb-0">Patron Dossier</h3>
                  <button onClick={() => setSelectedCustomer(null)} className="btn-close btn-close-white opacity-50 shadow-none border-0" aria-label="Close"></button>
                </div>
                
                <div className="flex-grow-1 overflow-y-auto p-4 p-md-5">
                   <div className="text-center mb-5">
                      <div className="d-inline-block p-1 bg-amber bg-opacity-10 border-2 border-amber border-opacity-20 rounded-circle mb-4 shadow-lg shadow-amber-glow">
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-amber fw-bold overflow-hidden" style={{ width: '110px', height: '110px', fontSize: '36px', background: 'var(--color-obsidian-800)' }}>
                          {selectedCustomer.photo ? <img src={selectedCustomer.photo} className="w-100 h-100 object-fit-cover" alt="" /> : getInitials(selectedCustomer.name)}
                        </div>
                      </div>
                      <h4 className="font-display h2 fw-bold text-white mb-1">{selectedCustomer.name}</h4>
                      <p className="text-platinum italic small opacity-75">{selectedCustomer.email}</p>
                   </div>

                   <div className="row g-3 mb-5 text-center">
                      <div className="col-6">
                        <div className="glass p-4 rounded-4 shadow-sm h-100">
                           <p className="text-platinum text-uppercase small fw-bold tracking-widest opacity-50 mb-2" style={{ fontSize: '9px' }}>Total Orders</p>
                           <p className="h3 fw-bold text-amber mb-0">{customerOrders.length}</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="glass p-4 rounded-4 shadow-sm h-100">
                           <p className="text-platinum text-uppercase small fw-bold tracking-widest opacity-50 mb-2" style={{ fontSize: '9px' }}>Lifetime Value</p>
                           <p className="h3 fw-bold text-amber mb-0">₹{customerOrders.reduce((s,o) => s + (o.totalAmount || 0), 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="d-flex align-items-center justify-content-between mb-4 mt-5">
                        <h5 className="text-uppercase small fw-bold text-amber tracking-widest mb-0" style={{ fontSize: '10px' }}>Acquisition History</h5>
                      </div>
                      <div className="d-flex flex-column gap-3">
                         {ordersLoading ? (
                            <div className="text-center py-5 animate-pulse text-platinum opacity-50 small">Scanning Ledger...</div>
                         ) : (
                            customerOrders.length === 0 ? (
                               <div className="text-center py-5 glass rounded-4 opacity-25">
                                 <p className="small italic mb-0">No prior acquisitions registered.</p>
                               </div>
                            ) : (
                            customerOrders.map(o => (
                              <div key={o.id} className="bg-white bg-opacity-5 p-4 rounded-4 border border-white-5 d-flex align-items-center justify-content-between shadow-sm transition-all hover-glow">
                                 <div>
                                    <p className="text-white font-monospace fw-bold small text-uppercase mb-1">{o.id.slice(-8)}</p>
                                    <p className="text-platinum opacity-50 x-small mb-0">{o.createdAt?.toDate?.()?.toLocaleDateString()}</p>
                                 </div>
                                 <div className="text-end">
                                    <p className="text-white fw-bold mb-1">₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                                    <span className={`badge rounded-pill text-uppercase border-0 ${o.status === 'delivered' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`} style={{ fontSize: '8px' }}>{o.status}</span>
                                 </div>
                              </div>
                            ))
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .x-small { font-size: 11px; }
        .hover-glow:hover { transform: translateY(-2px); border-color: rgba(245, 166, 35, 0.2) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important; }
      `}</style>
    </div>
  );
};

export default Customers;
