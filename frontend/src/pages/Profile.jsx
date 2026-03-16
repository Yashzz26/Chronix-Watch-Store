import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCamera, HiOutlineBadgeCheck } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, updateProfile, user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    address: profile?.address || '',
    photo: profile?.photo || null,
  });

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) return toast.error('File too large (>1MB)');
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = e => {
    e.preventDefault();
    updateProfile(formData);
    toast.success('Profile updated');
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' }}>
      <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.4rem',
        fontWeight: 400, color: '#F0EDE8', marginBottom: 40 }}>
        Personal Profile
      </h1>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 40 }}>
        <form onSubmit={handleSave}>
          {/* Avatar Section */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: '#080808', border: '2px solid #1A1A1A',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {formData.photo ? (
                  <img src={formData.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 600 }}>
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <label style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: '50%',
                background: '#D4AF37', color: '#080808',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '3px solid #0F0F0F'
              }}>
                <HiOutlineCamera size={18} />
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
            <p style={{ color: '#F0EDE8', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {user?.username} <HiOutlineBadgeCheck style={{ color: '#D4AF37' }} />
            </p>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Full Name</label>
              <input className="input" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="How shall we address you?" />
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Email Address</label>
              <input className="input" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="For delivery updates" />
            </div>
            <div>
              <label className="section-label" style={{ display: 'block', marginBottom: 8 }}>Shipping Address</label>
              <textarea className="input" value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                rows={3} style={{ resize: 'none' }}
                placeholder="Where should your timepieces be delivered?" />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
