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
      toast.success('Review removed from registry');
    },
    onError: () => toast.error('Access Denied')
  });

  if (isLoading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
      <div className="spinner-border text-amber" role="status" />
    </div>
  );

  const COMMENT_LIMIT = 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 p-md-5"
    >
      <div className="mb-5">
        <h1 className="font-display fw-bold text-white mb-1">Reviews</h1>
        <p className="text-platinum small">Monitor patron feedback and timepiece appraisals.</p>
      </div>

      <div className="glass overflow-hidden border border-white-5">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Patron', 'Timepiece', 'Rating', 'Critique', 'Date', 'Actions'].map(h => (
                  <th key={h} className="ps-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => {
                const isExpanded = expandedId === r.id;
                const isLong = (r.comment || '').length > COMMENT_LIMIT;
                const displayComment = isExpanded || !isLong
                  ? r.comment
                  : `${r.comment.slice(0, COMMENT_LIMIT)}…`;

                return (
                  <tr key={r.id} className="review-row">
                    <td className="ps-4">
                      <p className="text-white fw-bold mb-0 small">{r.userName}</p>
                      <p className="text-platinum opacity-25 font-mono mb-0" style={{ fontSize: '9px' }}>
                        REV-{r.id.slice(0, 8).toUpperCase()}
                      </p>
                    </td>
                    <td>
                      <span className="text-amber fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
                        {r.productName}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <HiStar
                            key={i}
                            size={16}
                            style={{
                              color: i < r.rating ? '#F5A623' : 'rgba(255,255,255,0.1)',
                              fill: i < r.rating ? '#F5A623' : 'transparent',
                            }}
                          />
                        ))}
                        <span className="text-platinum ms-1 x-small opacity-60">({r.rating}/5)</span>
                      </div>
                    </td>
                    <td style={{ minWidth: '220px', maxWidth: '320px' }}>
                      <p className="text-platinum small mb-0 opacity-75 fst-italic">
                        "{displayComment}"
                      </p>
                      {isLong && (
                        <button
                          className="btn btn-link p-0 border-0 shadow-none text-amber x-small mt-1"
                          style={{ fontSize: '11px', textDecoration: 'none' }}
                          onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        >
                          {isExpanded ? '← Read less' : 'Read more →'}
                        </button>
                      )}
                    </td>
                    <td className="text-platinum x-small">
                      {r.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'N/A'}
                    </td>
                    <td className="pe-4 text-end">
                      <button
                        onClick={() => {
                          if (window.confirm('Remove this review from the registry?')) {
                            deleteMutation.mutate(r.id);
                          }
                        }}
                        className="btn btn-sm border-0 shadow-none transition-all p-2 rounded-2"
                        title="Delete review"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#8B8FA8' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.color = '#8B8FA8';
                        }}
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div className="p-5 text-center text-platinum opacity-25 fst-italic small">
              No official appraisals submitted yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Reviews;
