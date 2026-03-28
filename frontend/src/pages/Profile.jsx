import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  HiOutlineArrowLeftOnRectangle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlineTrash
} from 'react-icons/hi2';
import useAuthStore from '../store/authStore';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'pending': return <HiOutlineClock className="text-warning" />;
    case 'paid':    return <HiOutlineCheckCircle className="text-success" />;
    case 'shipped': return <HiOutlineTruck className="text-info" />;
    case 'delivered': return <HiOutlineCheckCircle className="text-primary" />;
    case 'cancelled': return <HiOutlineXCircle className="text-danger" />;
    default: return <HiOutlineClock className="text-t3" />;
  }
};

export default function Profile() {
  const { profile, updateProfile, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'details');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName: profile?.name?.split(' ').slice(1).join(' ') || '',
    gender: 'Female',
    phone: '',
    email: profile?.email || '',
    address: profile?.address || '',
    password: 'Password123!', 
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
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div className="d-flex justify-content-between align-items-end mb-5 pb-2 border-bottom border-border border-opacity-50">
         <h2 className="font-display h3 m-0">My details</h2>
         <span className="text-t3 small uppercase tracking-widest font-mono opacity-50">Profile Settings</span>
      </div>
      
      {/* Profile Header */}
      <div className="d-flex align-items-center gap-4 mb-5 p-4 rounded-4 bg-bg-2 border border-border">
         <div className="avatar-wrap-lg position-relative shadow-sm border border-white border-4">
            {form.photo ? (
              <img src={form.photo} alt="Profile" className="w-100 h-100 object-fit-cover" />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-t3">
                {isUploading ? <div className="spinner-border spinner-border-sm" /> : <HiOutlineUser size={50} />}
              </div>
            )}
            <input type="file" hidden ref={fileRef} onChange={handlePhoto} />
         </div>
         <div className="flex-grow-1">
            <h4 className="h4 fw-bold m-0 mb-1">{profile?.name || 'Anastasia Grey'}</h4>
            <p className="text-t3 small m-0 mb-3 opacity-75">{profile?.email || 'anastasia@chronix.com'} • Premium Collector</p>
            <div className="d-flex gap-2">
               <button className="btn-pill-soft" onClick={() => fileRef.current.click()}>Upload new picture</button>
               <button className="btn-pill-soft text-danger" onClick={() => {
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
               <div className="form-group-refined">
                  <label className="label-refined">First name</label>
                  <div className="input-wrap-refined">
                    <input 
                      type="text" 
                      className="input-refined" 
                      value={form.firstName} 
                      onChange={e => setForm({...form, firstName: e.target.value})}
                      placeholder="Jane"
                    />
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group-refined">
                  <label className="label-refined">Last name</label>
                  <div className="input-wrap-refined">
                    <input 
                      type="text" 
                      className="input-refined" 
                      value={form.lastName} 
                      onChange={e => setForm({...form, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group-refined">
                  <label className="label-refined">Gender</label>
                  <div className="position-relative input-wrap-refined">
                    <select 
                      className="input-refined pe-5" 
                      style={{ appearance: 'none', background: 'transparent', cursor: 'pointer' }}
                      value={form.gender}
                      onChange={e => setForm({...form, gender: e.target.value})}
                    >
                       <option>Female</option>
                       <option>Male</option>
                       <option>Non-binary</option>
                       <option>Prefer not to say</option>
                    </select>
                    <div className="position-absolute end-0 top-50 translate-middle-y me-4 pointer-events-none" style={{ opacity: 0.4 }}>
                       <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                    </div>
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group-refined">
                  <label className="label-refined">Phone number</label>
                  <div className="input-wrap-refined">
                     <input 
                       type="text" 
                       className="input-refined" 
                       value={form.phone} 
                       onChange={e => setForm({...form, phone: e.target.value})}
                       placeholder="(+44) 7911 123456"
                     />
                     <HiOutlineDevicePhoneMobile className="icon-refined" size={18} />
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group-refined">
                  <label className="label-refined">Email address</label>
                  <div className="input-wrap-refined">
                     <input 
                       type="email" 
                       className="input-refined" 
                       value={form.email} 
                       onChange={e => setForm({...form, email: e.target.value})}
                       placeholder="jane@doe.com"
                     />
                     <HiOutlineEnvelope className="icon-refined" size={18} />
                  </div>
               </div>
            </div>
            <div className="col-md-6">
               <div className="form-group-refined">
                  <label className="label-refined">Password</label>
                  <div className="input-wrap-refined">
                     <input 
                       type={showPassword ? "text" : "password"} 
                       className="input-refined" 
                       value={form.password} 
                       readOnly
                       style={!showPassword ? { letterSpacing: '4px' } : {}}
                     />
                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="icon-refined border-0 bg-transparent p-0 transition-opacity hover-opacity-100"
                       style={{ opacity: 0.5 }}
                     >
                       {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="mt-5 pt-2">
            <button type="submit" disabled={saving} className="btn-gold px-5 py-3 text-uppercase fw-bold shadow-sm rounded-pill transition-transform hover-scale">
               {saving ? 'Synchronizing...' : 'Save my details'}
            </button>
         </div>
      </form>
    </motion.div>
  );

  const MyWishlist = () => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="font-display h3 mb-5 pb-2 border-bottom border-border border-opacity-50">My Wishlist</h2>
      <div className="text-center py-5">
         <HiOutlineHeart size={64} className="text-t3 opacity-25 mb-4" />
         <p className="text-t3 uppercase tracking-widest small">Your curation is currently empty</p>
         <a href="/allcollection" className="btn-pill-soft px-4 py-2 mt-3 d-inline-block text-decoration-none">Explore Collections</a>
      </div>
    </motion.div>
  );

  const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const fetchOrders = async () => {
        if (!auth.currentUser) return;
        try {
          const token = await auth.currentUser.getIdToken();
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) setOrders(data.orders || []);
        } catch (e) { console.error('Dashboard order fetch error:', e); }
        finally { setLoading(false); }
      };
      fetchOrders();
    }, []);

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="d-flex justify-content-between align-items-end mb-5 pb-2 border-bottom border-border border-opacity-50">
          <h2 className="font-display h3 m-0">My orders</h2>
          <span className="text-t3 small uppercase tracking-widest font-mono opacity-50">{orders.length} Acquisitions</span>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-gold" style={{ width: '1.5rem', height: '1.5rem' }} /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 chronix-card">
             <HiOutlineShoppingBag size={64} className="text-t3 opacity-25 mb-4" />
             <p className="text-t3 uppercase tracking-widest small">No historical acquisitions found</p>
             <a href="/allcollection" className="btn-pill-soft px-4 mt-3 d-inline-block text-decoration-none">Explore Collections</a>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {orders.map(order => (
              <div key={order.id} className="p-4 rounded-4 border border-border bg-bg-2 hover-shadow transition-all border-opacity-30">
                <div className="d-flex justify-content-between align-items-center mb-4">
                   <div className="d-flex align-items-center gap-3">
                      <span className="small text-t3 font-mono opacity-50 px-3 py-1 bg-white rounded-pill border border-border">Ref: {order.id.slice(-8)}</span>
                      <div className="d-flex align-items-center gap-2 px-2 py-1 rounded-3 bg-white border border-border">
                        <StatusIcon status={order.status} />
                        <span className="text-uppercase tracking-wider fw-bold text-t2" style={{ fontSize: '0.55rem' }}>{order.status}</span>
                      </div>
                   </div>
                   <span className="text-t3 fw-bold font-mono" style={{ fontSize: '0.75rem' }}>₹{order.totalPrice.toLocaleString()}</span>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                   <div className="d-flex gap-2 overflow-hidden">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="bg-white rounded-3 p-1 border border-border" style={{ width: 44, height: 44 }}>
                          <img src={item.imageGallery?.[0]} alt="" className="w-100 h-100 object-fit-contain" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="bg-white rounded-3 border border-border d-flex align-items-center justify-content-center text-t3 small" style={{ width: 44, height: 44 }}>
                          +{order.items.length - 3}
                        </div>
                      )}
                   </div>
                   <div className="text-end">
                      <p className="m-0 text-t3 x-small fw-bold uppercase tracking-widest opacity-50 mb-1">Acquired on</p>
                      <p className="m-0 text-t2 small fw-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const MyAddressBook = () => {
    const [addresses, setAddresses] = useState(profile?.addresses || []);
    const [showForm, setShowForm] = useState(false);
    
    // Sync with profile if it changes
    useEffect(() => {
      if (profile?.addresses) setAddresses(profile.addresses);
    }, [profile?.addresses]);

    const [newAddr, setNewAddr] = useState({ type: 'Home', street: '', city: '', state: '', zip: '', country: 'India' });
    const [savingAddr, setSavingAddr] = useState(false);

    const handleAdd = async (e) => {
      e.preventDefault();
      setSavingAddr(true);
      const updated = [...addresses, { ...newAddr, id: Date.now() }];
      try {
        await updateProfile({ addresses: updated });
        setAddresses(updated);
        setShowForm(false);
        setNewAddr({ type: 'Home', street: '', city: '', state: '', zip: '', country: 'India' });
        toast.success('Address archived successfully');
      } catch (err) { toast.error('Failed to save address'); }
      finally { setSavingAddr(false); }
    };

    const handleDelete = async (id) => {
      const updated = addresses.filter(a => a.id !== id);
      try {
        await updateProfile({ addresses: updated });
        setAddresses(updated);
        toast.success('Address removed');
      } catch (err) { toast.error('Failed to remove address'); }
    };

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="d-flex justify-content-between align-items-end mb-5 pb-2 border-bottom border-border border-opacity-50">
          <h2 className="font-display h3 m-0">Address book</h2>
          {!showForm && <button onClick={() => setShowForm(true)} className="btn-pill-soft">+ Add New</button>}
        </div>

        {showForm ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-4 bg-bg-2 border border-border mb-5">
            <form onSubmit={handleAdd}>
               <div className="row g-3">
                  <div className="col-md-6">
                    <label className="label-refined">Address Tag</label>
                    <select className="input-refined py-2" value={newAddr.type} onChange={e => setNewAddr({...newAddr, type: e.target.value})}>
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="label-refined">Street / Area</label>
                    <input type="text" className="input-refined py-2" required value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})} placeholder="221B Baker St" />
                  </div>
                  <div className="col-md-4">
                    <label className="label-refined">City</label>
                    <input type="text" className="input-refined py-2" required value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} placeholder="London" />
                  </div>
                  <div className="col-md-4">
                    <label className="label-refined">State / ZIP</label>
                    <input type="text" className="input-refined py-2" required value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} placeholder="NW1 6XE" />
                  </div>
                  <div className="col-md-4">
                    <label className="label-refined">Country</label>
                    <input type="text" className="input-refined py-2" required value={newAddr.country} onChange={e => setNewAddr({...newAddr, country: e.target.value})} />
                  </div>
               </div>
               <div className="mt-4 d-flex gap-2">
                  <button type="submit" disabled={savingAddr} className="btn-gold px-4 py-2 small rounded-pill">
                    {savingAddr ? 'Archiving...' : 'Save Address'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-pill-soft px-4 py-2 border-0">Cancel</button>
               </div>
            </form>
          </motion.div>
        ) : null}

        {addresses.length === 0 ? (
          <div className="p-5 rounded-4 border border-border border-dashed text-center bg-bg-2">
             <HiOutlineMapPin size={48} className="text-t3 opacity-25 mb-3" />
             <p className="text-t3 small opacity-75 uppercase tracking-widest">No shipping records found</p>
          </div>
        ) : (
          <div className="row g-4">
            {addresses.map(addr => (
              <div key={addr.id} className="col-md-6">
                <div className="p-4 rounded-4 border border-border bg-white hover-shadow transition-all d-flex justify-content-between">
                  <div>
                    <span className="x-small fw-bold text-gold uppercase tracking-widest d-block mb-2">{addr.type}</span>
                    <p className="m-0 fw-bold h6">{addr.street}</p>
                    <p className="m-0 text-t3 small">{addr.city}, {addr.state}</p>
                    <p className="m-0 text-t3 small opacity-50">{addr.country}</p>
                  </div>
                  <button onClick={() => handleDelete(addr.id)} className="btn-pill-soft p-2 border-0 opacity-50 hover-opacity-100 text-danger" style={{ height: 'fit-content' }}>
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const menuItems = [
    { id: 'details', label: 'My Details', icon: HiOutlineUser },
    { id: 'wishlist', label: 'My Wishlist', icon: HiOutlineHeart },
    { id: 'orders', label: 'My Orders', icon: HiOutlineShoppingBag },
    { id: 'address', label: 'My Address Book', icon: HiOutlineMapPin },
  ];

  return (
    <div className="profile-page pb-5">
      <style>{`
        .profile-page { background: var(--bg); min-height: 100vh; padding-top: 140px; color: var(--t1); }
        
        /* Sidebar Nav */
        .sidebar-card { background: #fff; border-radius: 24px; border: 1px solid var(--border); padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); }
        .nav-item-account { 
          display: flex; 
          align-items: center; 
          gap: 14px; 
          padding: 14px 18px; 
          border-radius: 12px; 
          color: var(--t3); 
          text-decoration: none; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-size: 0.95rem;
          margin-bottom: 8px;
          border: 1px solid transparent;
        }
        .nav-item-account:hover { background: var(--bg-2); color: var(--t1); transform: translateX(5px); }
        .nav-item-account.active { background: var(--bg-2); color: var(--t1); font-weight: 700; border-color: var(--border); }
        
        /* Main Panel */
        .main-panel-card { background: #fff; border-radius: 24px; border: 1px solid var(--border); padding: 48px; box-shadow: 0 12px 60px rgba(0,0,0,0.03); }
        
        /* Avatar Header */
        .avatar-wrap-lg { width: 110px; height: 110px; border-radius: 50%; overflow: hidden; background: var(--bg-2); flex-shrink: 0; }
        .btn-pill-soft { background: var(--bg-1); border: 1px solid var(--border); padding: 8px 20px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; transition: var(--transition); text-transform: uppercase; letter-spacing: 1px; color: var(--t2); }
        .btn-pill-soft:hover { background: var(--t1); color: #fff; border-color: var(--t1); }
        .btn-pill-soft.text-danger:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
        
        /* Form Elements */
        .form-group-refined { margin-bottom: 12px; }
        .label-refined { font-size: 0.7rem; font-weight: 800; color: var(--t3); margin-bottom: 10px; display: block; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; padding-left: 4px; }
        .input-wrap-refined { position: relative; }
        .input-refined { 
          width: 100%; 
          border: 1px solid var(--border); 
          border-radius: 14px; 
          padding: 16px 20px; 
          font-size: 1rem; 
          background: #fff; 
          outline: none; 
          transition: all 0.3s ease; 
          color: var(--t1);
          font-weight: 500;
        }
        .input-refined:focus { border-color: var(--gold); background: var(--bg-2); box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.05); }
        .input-refined::placeholder { color: var(--t3); opacity: 0.3; }
        .icon-refined { position: absolute; end: 20px; top: 50%; transform: translateY(-50%); color: var(--t3); opacity: 0.3; }
        
        .hover-shadow:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; translate: 0 -2px; }
        .hover-scale:hover { transform: scale(1.02); }
      `}</style>

      <div className="container">
        <div className="row g-5">
          {/* Sidebar */}
          <div className="col-lg-4 col-xl-3">
             <div className="sidebar-card">
                <div className="mb-4 d-flex align-items-center gap-2 small text-t3 uppercase tracking-widest opacity-50 px-2" style={{ fontSize: '0.65rem' }}>
                   <span>Home</span> <span>/</span> <span className="text-t1 opacity-100">Account</span>
                </div>
                <h1 className="font-display h2 mb-5 px-2">Member <br />Dashboard</h1>
                
                <div className="nav-list mb-5">
                   {menuItems.map(item => (
                     <button 
                       key={item.id} 
                       onClick={() => {
                         setActiveTab(item.id);
                         setSearchParams({ tab: item.id });
                       }}
                       className={`nav-item-account w-100 border-0 ${activeTab === item.id ? 'active' : ''}`}
                     >
                       <item.icon size={20} style={{ opacity: activeTab === item.id ? 1 : 0.5 }} />
                       {item.label}
                     </button>
                   ))}
                </div>

                <div className="pt-4 border-top border-border">
                   <button onClick={logout} className="nav-item-account w-100 border-0 text-danger opacity-75 hover:opacity-100" style={{ background: 'transparent' }}>
                      <HiOutlineArrowLeftOnRectangle size={20} />
                      Log out
                   </button>
                </div>
             </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-8 col-xl-9">
             <div className="main-panel-card">
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
