export default function SkeletonCard() {
  return (
    <div className="chronix-card h-100 d-flex flex-column" style={{ background: '#080808' }}>
      <div className="bg-s2 position-relative overflow-hidden" style={{ aspectRatio: '1/1', background: '#161616' }}>
        <div className="position-absolute h-100 w-100" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.05), transparent)', animation: 'shimmer 2s infinite', left: 0, top: 0, transform: 'translateX(-100%)' }} />
      </div>
      <div className="p-4 flex-grow-1 d-flex flex-column">
        <div className="mb-2" style={{ height: '8px', width: '40px', background: '#1e1e1e', borderRadius: '2px' }} />
        <div className="mb-3" style={{ height: '20px', width: '80%', background: '#1e1e1e', borderRadius: '4px' }} />
        <div className="mt-auto" style={{ height: '24px', width: '100px', background: '#1e1e1e', borderRadius: '4px' }} />
        <div className="mt-4 d-flex gap-2">
          <div className="flex-grow-1" style={{ height: '40px', background: '#111', borderRadius: '4px' }} />
          <div style={{ height: '40px', width: '40px', background: '#111', borderRadius: '4px' }} />
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
