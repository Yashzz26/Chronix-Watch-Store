import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCamera, 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlineMapPin, 
  HiOutlineDevicePhoneMobile,
  HiOutlineLockClosed,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineArrowLeftOnRectangle
} from 'react-icons/hi2';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, updateProfile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('details');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName: profile?.name?.split(' ').slice(1).join(' ') || '',
    gender: 'Female',
    phone: '',
    email: profile?.email || '',
    address: profile?.address || '',
    password: '••••••••',
    photo: '', 
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const savedPhoto = sessionStorage.getItem('chronix-profile-photo');
    if (savedPhoto) {
      setForm(prev => ({ ...prev, photo: savedPhoto }));
    } else if (profile?.photo) {
      setForm(prev => ({ ...prev, photo: profile.photo }));
    }
  }, [profile?.photo]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Portrait must be under 2MB');
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setForm({ ...form, photo: base64 });
      sessionStorage.setItem('chronix-profile-photo', base64);
      setTimeout(() => setIsUploading(false), 300);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { photo, firstName, lastName, ...rest } = form;
      await updateProfile({ ...rest, name: `${firstName} ${lastName}`.trim() });
      toast.success('Dossier updated successfully');
    } catch (err) {
      toast.error('Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  // --- SUB-COMPONENTS ---

  const MyDetails = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-display h3 mb-5">My details</h2>
      
      {/* Profile Header */}
      <div className="d-flex align-items-center gap-4 mb-5">
         <div className="avatar-wrap position-relative">
            {form.photo ? (
              <img src={form.photo} alt="Profile" className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-t3">
                {isUploading ? <div className="spinner-border spinner-border-sm" /> : <HiOutlineUser size={40} />}
              </div>
            )}
            <input type="file" hidden ref={fileRef} onChange={handlePhoto} />
         </div>
         <div className="flex-grow-1">
            <h4 className="h5 fw-bold m-0 mb-3">{profile?.name || 'Anastasia Grey'}</h4>
            <div className="d-flex gap-3">
               <button className="btn-avatar-action" onClick={() => fileRef.current.click()}>Upload new picture</button>
               <button className="btn-avatar-action text-danger" onClick={() => {
                  setForm({...form, photo: ''});
                  sessionStorage.removeItem('chronix-profile-photo');
               }}>Delete</button>
            </div>
         </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
         <div className="row g-4">
            <div className="col-md-6">
               <div className="form-group">
                  <label className="form-label-profile">First name</label>
                  <input 
                    type="text" 
                    className="form-input-profile" 
                    value={form.firstName} 
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    placeholder="First Name"
                  />
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group">
                  <label className="form-label-profile">Last name</label>
                  <input 
                    type="text" 
                    className="form-input-profile" 
                    value={form.lastName} 
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    placeholder="Last Name"
                  />
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group">
                  <label className="form-label-profile">Gender</label>
                  <div className="position-relative custom-select-parent">
                    <select 
                      className="form-input-profile" 
                      style={{ appearance: 'none', background: '#fff' }}
                      value={form.gender}
                      onChange={e => setForm({...form, gender: e.target.value})}
                    >
                       <option>Female</option>
                       <option>Male</option>
                       <option>Non-binary</option>
                       <option>Prefer not to say</option>
                    </select>
                    <div className="position-absolute end-0 top-50 translate-middle-y me-3 pointer-events-none">
                       <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                    </div>
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group">
                  <label className="form-label-profile">Phone number</label>
                  <div className="position-relative">
                     <input 
                       type="text" 
                       className="form-input-profile" 
                       value={form.phone} 
                       onChange={e => setForm({...form, phone: e.target.value})}
                       placeholder="(+44) 7911 123456"
                     />
                     <HiOutlineDevicePhoneMobile className="position-absolute end-0 top-50 translate-middle-y me-3 text-t3" size={18} />
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group">
                  <label className="form-label-profile">Email address</label>
                  <div className="position-relative">
                     <input 
                       type="email" 
                       className="form-input-profile" 
                       value={form.email} 
                       onChange={e => setForm({...form, email: e.target.value})}
                       placeholder="email@example.com"
                     />
                     <HiOutlineEnvelope className="position-absolute end-0 top-50 translate-middle-y me-3 text-t3" size={18} />
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group">
                  <label className="form-label-profile">Password</label>
                  <div className="position-relative">
                     <input 
                       type="text" 
                       className="form-input-profile" 
                       value={form.password} 
                       readOnly 
                       style={{ letterSpacing: '4px' }}
                     />
                     <HiOutlineLockClosed className="position-absolute end-0 top-50 translate-middle-y me-3 text-t3" size={18} />
                  </div>
               </div>
            </div>
         </div>

         <button type="submit" disabled={saving} className="btn-gold w-100 py-3 mt-5 text-uppercase fw-bold shadow-sm">
            {saving ? 'Synchronizing...' : 'Save my details'}
         </button>
      </form>
    </motion.div>
  );

  const MyWishlist = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-display h3 mb-5">My Wishlist</h2>
      <div className="text-center py-5">
         <HiOutlineHeart size={64} className="text-t3 opacity-25 mb-4" />
         <p className="text-t3 uppercase tracking-widest small">Your curation is currently empty</p>
         <a href="/allcollection" className="btn-outline-gold px-4 py-2 mt-3 d-inline-block text-decoration-none">Explore Collections</a>
      </div>
    </motion.div>
  );

  const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
          });
          const data = await response.json();
          setOrders(data.orders || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      };
      fetchOrders();
    }, []);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display h3 mb-5">My Orders</h2>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-gold" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
             <HiOutlineShoppingBag size={64} className="text-t3 opacity-25 mb-4" />
             <p className="text-t3 uppercase tracking-widest small">No historical acquisitions found</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {orders.map(order => (
              <div key={order.id} className="p-4 rounded-4 border border-border bg-bg-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="small text-t3 font-mono">#{order.id.slice(-8)}</span>
                  <span className="badge bg-gold text-dark lowercase px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.6rem' }}>{order.status}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="m-0 fw-bold">{order.items[0]?.name}</p>
                    <p className="m-0 text-t3 small">{order.items.length} items</p>
                  </div>
                  <div className="text-end">
                    <p className="m-0 fw-bold">₹{order.totalPrice.toLocaleString()}</p>
                    <p className="m-0 text-t3 small">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const MyAddressBook = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-display h3 mb-5">Address Book</h2>
      <div className="p-4 rounded-4 border border-border border-dashed text-center">
         <HiOutlineMapPin size={48} className="text-t3 opacity-25 mb-3" />
         <p className="text-t3 small mb-4">No saved addresses</p>
         <button className="btn-avatar-action">+ Add New Address</button>
      </div>
    </motion.div>
  );

  const menuItems = [
    { id: 'details', label: 'My Details', icon: HiOutlineUser },
    { id: 'wishlist', label: 'My Wishlist', icon: HiOutlineHeart },
    { id: 'orders', label: 'My Orders', icon: HiOutlineShoppingBag },
    { id: 'address', label: 'My Address Book', icon: HiOutlineMapPin },
  ];

  return (
    <div className="profile-page pb-5">
      <style>{`
        .profile-page { background: var(--bg); min-height: 100vh; padding-top: 120px; color: var(--t1); }
        .sidebar { border-right: 0; padding-right: 0; }
        @media (min-width: 992px) {
          .sidebar { border-right: 1px solid var(--border); padding-right: 40px; }
        }
        
        .nav-item-account { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 16px 20px; 
          border-radius: 8px; 
          color: var(--t3); 
          text-decoration: none; 
          transition: var(--transition);
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        .nav-item-account:hover { background: var(--bg-2); color: var(--t1); }
        .nav-item-account.active { background: var(--bg-2); color: var(--t1); font-weight: 700; }
        
        .main-panel { background: #fff; border-radius: 20px; border: 1px solid var(--border); padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); }
        
        .avatar-wrap { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--bg-2); }
        .btn-avatar-action { background: var(--bg-2); border: 1px solid var(--border); padding: 8px 24px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; transition: var(--transition); }
        .btn-avatar-action:hover { background: var(--border); }
        
        .form-label-profile { font-size: 0.75rem; font-weight: 700; color: var(--t3); margin-bottom: 8px; display: block; }
        .form-input-profile { 
          width: 100%; 
          border: 1px solid var(--border); 
          border-radius: 12px; 
          padding: 14px 20px; 
          font-size: 0.95rem; 
          background: #fff; 
          outline: none; 
          transition: var(--transition); 
        }
        .form-input-profile:focus { border-color: var(--gold); background: var(--bg-2); }
      `}</style>

      <div className="container mt-5">
        <div className="row g-5">
          {/* Sidebar */}
          <div className="col-lg-3 sidebar">
             <div className="mb-4 d-flex align-items-center gap-2 small text-t3 uppercase tracking-widest">
                <span>Shipping</span> <span>→</span> <span className="text-t1">Account</span>
             </div>
             <h1 className="font-display h1 mb-5">My account</h1>
             
             <div className="nav-list mb-5">
                {menuItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-item-account w-100 border-0 ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
             </div>

             <div className="mt-auto pt-5 border-top border-border border-opacity-50">
                <button onClick={logout} className="nav-item-account w-100 border-0 text-danger opacity-75 hover:opacity-100">
                   <HiOutlineArrowLeftOnRectangle size={20} />
                   Log out
                </button>
             </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
             <div className="main-panel">
                <AnimatePresence mode="wait">
                   {activeTab === 'details' && <MyDetails key="details" />}
                   {activeTab === 'wishlist' && <MyWishlist key="wishlist" />}
                   {activeTab === 'orders' && <MyOrders key="orders" />}
                   {activeTab === 'address' && <MyAddressBook key="address" />}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
