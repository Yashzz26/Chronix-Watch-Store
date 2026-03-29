import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HiOutlineTrash, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Reviews = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
      const revs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const enrichedRevs = await Promise.all(revs.map(async (r) => {
        try {
          const pDoc = await getDoc(doc(db, 'products', r.productId));
          return { ...r, productName: pDoc.exists() ? pDoc.data().name : 'Unknown Piece' };
        } catch {
          return { ...r, productName: 'Archived Piece' };
        }
      }));
      return enrichedRevs;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDoc(doc(db, 'reviews', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews']);
      toast.success('Review removed');
    },
    onError: () => toast.error('Delete failed')
  });

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
      <div className="spinner-border" style={{ color: '#D97706' }} />
    </div>
  );

  const LIMIT = 70;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#111827', marginBottom: '4px' }}>Reviews</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Monitor patron feedback and timepiece appraisals.</p>
      </div>

      <div className="glass overflow-hidden">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Patron', 'Timepiece', 'Rating', 'Review', 'Date', 'Actions'].map(h => (
                  <th key={h} className="ps-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => {
                const isExpanded = expandedId === r.id;
                const isLong = (r.comment || '').length > LIMIT;
                const displayComment = isExpanded || !isLong
                  ? r.comment
                  : `${r.comment.slice(0, LIMIT)}…`;

                return (
                  <tr key={r.id} className="review-row">
                    <td className="ps-4">
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{r.userName}</p>
                      <p style={{ fontSize: '10px', fontFamily: 'DM Mono, monospace', color: '#D1D5DB', margin: 0 }}>
                        REV-{r.id.slice(0, 8).toUpperCase()}
                      </p>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {r.productName}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {[...Array(5)].map((_, i) => (
                          <HiStar
                            key={i}
                            size={16}
                            style={{ color: i < r.rating ? '#F59E0B' : '#E5E7EB', fill: i < r.rating ? '#F59E0B' : '#E5E7EB' }}
                          />
                        ))}
                        <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: 4 }}>({r.rating})</span>
                      </div>
                    </td>
                    <td style={{ minWidth: '200px', maxWidth: '300px' }}>
                      <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 2px', fontStyle: 'italic' }}>
                        "{displayComment}"
                      </p>
                      {isLong && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : r.id)}
                          style={{ border: 'none', background: 'transparent', color: '#D97706', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          {isExpanded ? '← Less' : 'Read more →'}
                        </button>
                      )}
                    </td>
                    <td style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      {r.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                    </td>
                    <td className="pe-4 text-end">
                      <button
                        onClick={() => { if (window.confirm('Remove this review?')) deleteMutation.mutate(r.id); }}
                        title="Delete"
                        style={{ width: 34, height: 34, border: 'none', background: '#F3F4F6', color: '#6B7280', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; }}
                      >
                        <HiOutlineTrash size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#D1D5DB', fontStyle: 'italic', fontSize: '14px' }}>
              No reviews submitted yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Reviews;
