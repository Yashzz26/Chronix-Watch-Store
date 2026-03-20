import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HiOutlineStar, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Reviews = () => {
  const queryClient = useQueryClient();

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
      toast.success('Critique removed from registry');
    },
    onError: () => toast.error('Access Denied: Admin clearing only')
  });

  if (isLoading) return <div className="p-10 text-center text-platinum opacity-50">Collecting Appraisals...</div>;

  return (
    <div className="p-4 p-md-5">
      <div className="mb-5">
        <h1 className="font-display fw-bold text-white mb-1">Reviews</h1>
        <p className="text-platinum small">Monitor patron feedback and timepiece appraisals.</p>
      </div>

      <div className="glass overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-chronix align-middle mb-0">
            <thead>
              <tr>
                {['Patron', 'Timepiece', 'Rating', 'Critique', 'Date', 'Actions'].map(h => (
                  <th key={h} className="ps-4 text-uppercase small fw-bold tracking-widest text-platinum" style={{ fontSize: '0.7rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} className="group-hover">
                  <td className="ps-4">
                    <p className="text-white fw-bold mb-0 small">{r.userName}</p>
                    <p className="text-platinum opacity-25 font-monospace mb-0" style={{ fontSize: '9px' }}>REV-{r.id.slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td>
                    <span className="text-amber fw-bold text-uppercase tracking-tighter" style={{ fontSize: '10px' }}>{r.productName}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1 text-amber">
                      {[...Array(5)].map((_, i) => (
                        <HiOutlineStar key={i} size={14} className={i < r.rating ? 'fill-amber text-amber' : 'text-white opacity-10'} style={{ fill: i < r.rating ? 'currentColor' : 'none' }} />
                      ))}
                    </div>
                  </td>
                  <td className="max-w-xs overflow-hidden" style={{ minWidth: '200px' }}>
                    <p className="text-platinum small mb-0 opacity-75 fst-italic line-clamp-2">"{r.comment}"</p>
                  </td>
                  <td className="text-platinum x-small">
                    {r.createdAt?.toDate?.()?.toLocaleDateString('en-IN')}
                  </td>
                  <td className="pe-4 text-end">
                    <button 
                       onClick={() => { if(window.confirm('Strike this appraisal from history?')) deleteMutation.mutate(r.id); }}
                       className="btn btn-sm btn-outline-danger border-0 rounded-circle p-2 opacity-50 hover-opacity-100 transition-all shadow-none"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && <div className="p-5 text-center text-platinum opacity-25 italic small">No official appraisals submitted yet.</div>}
        </div>
      </div>
      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .x-small { font-size: 11px; }
        .hover-opacity-100:hover { opacity: 1 !important; background: rgba(220, 53, 69, 0.1) !important; }
      `}</style>
    </div>
  );
};

export default Reviews;
