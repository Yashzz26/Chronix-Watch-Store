import { useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { HiOutlineDatabase, HiOutlineRefresh, HiOutlineCheckCircle } from 'react-icons/hi';

const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateDisplayId = () => {
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const Migration = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  const scanOrders = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const pending = orders.filter(o => !o.orderDisplayId);
      setStats({ total: orders.length, pending: pending.length, completed: 0 });
      toast.success(`Scan complete: ${pending.length} orders need mapping.`);
    } catch (err) {
      toast.error('Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const executeMigration = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const pendingDocs = snapshot.docs.filter(d => !d.data().orderDisplayId);
      
      const batch = writeBatch(db);
      pendingDocs.forEach(d => {
        const suffix = generateDisplayId();
        batch.update(doc(db, 'orders', d.id), {
          orderDisplayId: `ORD-${suffix}`,
          invoiceId: `INV-${suffix}`
        });
      });

      await batch.commit();
      setStats(prev => ({ ...prev, pending: 0, completed: pendingDocs.length }));
      toast.success(`Successfully mapped ${pendingDocs.length} orders to Enterprise IDs.`);
    } catch (err) {
      toast.error('Migration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 min-vh-100 bg-obsidian-900 d-flex align-items-center justify-content-center">
      <div className="glass p-5 rounded-4 text-center max-w-600 w-100 border border-white-5">
        <div style={{ background: 'rgba(245, 166, 35, 0.1)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <HiOutlineDatabase size={40} className="text-amber" />
        </div>
        
        <h2 className="font-display fw-bold text-white mb-2">ID Normalization Utility</h2>
        <p className="text-platinum small mb-5 opacity-60">
          Sync legacy Firestore records with the new **Enterprise Order & Invoice ID** system.
        </p>

        <div className="d-flex gap-4 mb-5">
          <div className="flex-grow-1 p-3 rounded-3 bg-white-5 border border-white-5">
            <p className="small text-platinum mb-1 opacity-50">Total Records</p>
            <h4 className="text-white fw-bold mb-0">{stats.total}</h4>
          </div>
          <div className="flex-grow-1 p-3 rounded-3 bg-white-5 border border-white-5">
            <p className="small text-platinum mb-1 opacity-50">Pending Map</p>
            <h4 className="text-amber fw-bold mb-0">{stats.pending}</h4>
          </div>
        </div>
        
        <div className="d-flex flex-column gap-3">
          <button 
            onClick={scanOrders}
            disabled={loading}
            className="btn btn-outline-amber py-3 fw-bold w-100"
          >
            <HiOutlineRefresh className="me-2" /> Scan Operational Data
          </button>
          
          {stats.pending > 0 && (
            <button 
              onClick={executeMigration}
              disabled={loading}
              className="btn btn-amber py-3 fw-bold w-100 shadow-lg"
            >
              <HiOutlineCheckCircle className="me-2" /> Map {stats.pending} Records to ORD Prefix
            </button>
          )}
        </div>

        <div className="mt-5 pt-4 border-top border-white-5">
           <a href="/orders" className="text-amber x-small text-uppercase tracking-widest text-decoration-none fw-bold">Return to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default Migration;
