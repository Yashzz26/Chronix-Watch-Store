import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineDevicePhoneMobile,
  HiOutlineLockClosed,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import { auth } from '../lib/firebase';
import useAuthStore from '../store/authStore';
import useWishlistStore from '../store/wishlistStore';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import './profile.css';

const menuItems = [
  { id: 'details', label: 'Account', icon: <HiOutlineUser /> },
  { id: 'orders', label: 'Orders', icon: <HiOutlineShoppingBag /> },
  { id: 'curation', label: 'Wishlist', icon: <HiOutlineHeart /> },
  { id: 'security', label: 'Security', icon: <HiOutlineLockClosed /> }
];

export default function Profile() {
  const { profile, updateProfile, logout } = useAuthStore();
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'details');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName: profile?.name?.split(' ').slice(1).join(' ') || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    address: profile?.address || '',
    city: profile?.city || '',
    postal: profile?.postal || '',
    photo: profile?.photo || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef(null);
  const [locating, setLocating] = useState(false);

  const getMemberYear = () => {
    if (!profile?.createdAt) return new Date().getFullYear();
    if (profile.createdAt?.seconds) {
      return new Date(profile.createdAt.seconds * 1000).getFullYear();
    }
    return new Date(profile.createdAt).getFullYear();
  };

  useEffect(() => {
    setActiveTab(queryTab || 'details');
  }, [queryTab]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm({ ...form, photo: ev.target.result });
      setTimeout(() => setIsUploading(false), 300);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { photo, firstName, lastName, ...rest } = form;
      await updateProfile({ ...rest, name: `${firstName} ${lastName}`.trim(), photo });
      toast.success('Profile saved');
    } catch (err) {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const fillAddressFromGeo = () => {
    if (!navigator.geolocation) {
      toast.error('Location unavailable on this device');
      return;
    }
    const toastId = toast.loading('Detecting location…');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await res.json();
        const lineOne = [
          data.address?.house_number,
          data.address?.road,
          data.address?.suburb
        ].filter(Boolean).join(', ');
        setForm(current => ({
          ...current,
          address: lineOne || current.address,
          city: data.address?.city || data.address?.town || data.address?.village || current.city,
          postal: data.address?.postcode || current.postal
        }));
        toast.success('Address updated from current location', { id: toastId });
      } catch (error) {
        console.error(error);
        toast.error('Could not fetch address', { id: toastId });
      } finally {
        setLocating(false);
      }
    }, () => {
      toast.error('Location permission denied', { id: toastId });
      setLocating(false);
    });
  };

  const MyDetails = () => {
    const stats = [
      { label: 'Phone on file', value: form.phone || 'Add number' },
      { label: 'City', value: form.city || 'Not set' },
      { label: 'Member since', value: getMemberYear() }
    ];

    return (
      <motion.section className="profile-card profile-card--details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="profile-card__header">
          <div>
            <p className="profile-eyebrow">Account</p>
            <h2 className="h3 m-0">Account snapshot</h2>
          </div>
          <span className="profile-chip">
            <HiOutlineShieldCheck size={16} /> Up to date
          </span>
        </div>

        <div className="profile-details__grid">
          <aside className="profile-details__summary">
            <div className="profile-avatar">
              <div className="profile-avatar__image">
                {form.photo ? (
                  <img src={form.photo} alt="Profile" className="w-100 h-100 object-fit-cover" />
                ) : isUploading ? (
                  <div className="spinner-border spinner-border-sm text-gold" />
                ) : (
                  <HiOutlineUser size={36} className="text-t3" />
                )}
              </div>
              <div className="profile-details__meta">
                <h4 className="h5 m-0">{profile?.name || 'Your name'}</h4>
                <p className="text-t3 m-0">{profile?.email || form.email || 'you@email.com'}</p>
              </div>
              <div className="profile-avatar__actions">
                <button type="button" className="btn-chronix-outline x-small" onClick={() => fileRef.current?.click()}>
                  Upload photo
                </button>
                {form.photo && (
                  <button type="button" className="btn-chronix-outline x-small text-danger border-danger" onClick={() => setForm({ ...form, photo: '' })}>
                    Remove
                  </button>
                )}
                <input type="file" hidden ref={fileRef} onChange={handlePhoto} />
              </div>
            </div>
              <div className="profile-details__stats">
                {stats.map((stat) => (
                  <div key={stat.label} className="profile-details__stat">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-chronix-outline x-small mt-3 w-100" onClick={fillAddressFromGeo} disabled={locating}>
                {locating ? 'Locating…' : 'Use current location'}
              </button>
            </aside>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-form__field">
              <label>First name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" />
            </div>
            <div className="profile-form__field">
              <label>Last name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
            </div>
            <div className="profile-form__field">
              <label>Mobile</label>
              <div className="position-relative">
                <HiOutlineDevicePhoneMobile className="position-absolute top-50 start-0 translate-middle-y ms-3 text-t3" />
                <input
                  type="text"
                  className="ps-5"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>
            <div className="profile-form__field">
              <label>Email</label>
              <div className="position-relative">
                <HiOutlineEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-t3" />
                <input type="email" className="ps-5" value={form.email} disabled />
              </div>
            </div>
            <div className="profile-form__field" style={{ gridColumn: '1 / -1' }}>
              <label>Address</label>
              <div className="position-relative">
                <HiOutlineMapPin className="position-absolute top-50 start-0 translate-middle-y ms-3 text-t3" />
                <input
                  type="text"
                  className="ps-5"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Apartment, city, country"
                />
              </div>
            </div>
            <div className="profile-form__field">
              <label>City</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
            </div>
            <div className="profile-form__field">
              <label>Postal code</label>
              <input type="text" value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} placeholder="PIN / ZIP" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" disabled={saving} className="btn-chronix btn-gold">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.section>
    );
  };

  const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchOrders = async () => {
        if (!auth.currentUser) return;
        try {
          const token = await auth.currentUser.getIdToken();
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) setOrders(data.orders || []);
        } catch (e) {
          console.error('Dashboard order fetch error:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);

    const StatusBadge = ({ status }) => {
      const configs = {
        pending: { color: '#B45309', icon: <HiOutlineClock /> },
        paid: { color: '#059669', icon: <HiOutlineCheckCircle /> },
        shipped: { color: '#2563EB', icon: <HiOutlineTruck /> },
        delivered: { color: '#0f8c5a', icon: <HiOutlineCheckCircle /> },
        cancelled: { color: '#DC2626', icon: <HiOutlineXCircle /> }
      };
      const config = configs[status] || configs.pending;
      return (
        <span className="profile-chip" style={{ borderColor: config.color, color: config.color }}>
          {config.icon} {status}
        </span>
      );
    };

    return (
      <motion.section className="profile-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="profile-card__header">
          <div>
            <p className="profile-eyebrow">Orders</p>
            <h2 className="h3 m-0">Recent purchases</h2>
          </div>
          <span className="text-t3">{orders.length} orders</span>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="profile-empty">You have not placed an order yet.</div>
        ) : (
          <div className="profile-orders">
            {orders.map((order) => (
              <div key={order.id} className="profile-orders__item">
                <img src={order.items[0]?.imageGallery?.[0]} alt={order.items[0]?.name} />
                <div className="flex-grow-1">
                  <h4 className="h6 m-0">{order.items[0]?.name}</h4>
                  <small className="text-t3">#{order.id.slice(-8)}</small>
                </div>
                <div>
                  <StatusBadge status={order.status} />
                  <p className="text-t3 small m-0 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="ms-auto text-end">
                  <p className="fw-bold m-0">?{order.totalPrice.toLocaleString('en-IN')}</p>
                  <button className="btn-chronix-outline x-small mt-2" onClick={() => navigate(`/invoice/${order.id}`)}>
                    Download invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    );
  };

  const MyCuration = () => (
    <motion.section className="profile-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="profile-card__header">
        <div>
          <p className="profile-eyebrow">Wishlist</p>
          <h2 className="h3 m-0">Saved pieces</h2>
        </div>
        <span className="text-t3">{wishlistItems.length} items</span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="profile-empty">You have not saved any watches yet.</div>
      ) : (
        <div className="profile-wishlist">
          {wishlistItems.map((item) => (
            <div key={item.id} className="profile-wishlist__card">
              <img src={item.imageGallery?.[0]} alt={item.name} />
              <div className="flex-grow-1">
                <h4 className="h6 m-0">{item.name}</h4>
                <p className="m-0 fw-bold">?{item.price.toLocaleString('en-IN')}</p>
                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn-chronix-outline x-small"
                    onClick={() => {
                      addItem(item);
                      removeFromWishlist(item.id);
                      toast.success('Added to cart');
                    }}
                  >
                    Move to cart
                  </button>
                  <button className="btn-chronix-outline x-small text-danger border-danger" onClick={() => removeFromWishlist(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );

  const SecuritySettings = () => (
    <motion.section className="profile-card profile-security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="profile-card__header" style={{ justifyContent: 'center' }}>
        <div>
          <p className="profile-eyebrow">Security</p>
          <h2 className="h3 m-0">Two-factor protection</h2>
        </div>
      </div>
      <HiOutlineShieldCheck size={64} className="text-gold mb-3" />
      <p className="text-t3">Your profile uses secure sign-in. Request a reset if you suspect suspicious activity.</p>
      <button className="btn-chronix-outline mt-3" onClick={() => toast.success('Security check sent')}>
        Request reset link
      </button>
    </motion.section>
  );

  return (
    <div className="profile">
      <div className="container">
        <div className="profile__layout">
          <aside className="profile-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`profile-nav__button ${activeTab === item.id ? 'profile-nav__button--active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchParams({ tab: item.id });
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <button className="profile-nav__logout" onClick={logout}>
              <HiOutlineArrowLeftOnRectangle className="me-2" /> Sign out
            </button>
          </aside>

          <div>
            <AnimatePresence>
              {activeTab === 'details' && <MyDetails key="details" />}
              {activeTab === 'orders' && <MyOrders key="orders" />}
              {activeTab === 'curation' && <MyCuration key="curation" />}
              {activeTab === 'security' && <SecuritySettings key="security" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

