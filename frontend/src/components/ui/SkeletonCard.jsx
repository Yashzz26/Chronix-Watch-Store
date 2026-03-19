export default function SkeletonCard() {
  return (
    <div className="chronix-card h-100 overflow-hidden d-flex flex-column opacity-50" style={{ minHeight: 400 }}>
      <div className="bg-s2 position-relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <div className="position-absolute h-100 w-100 bg-gradient-to-r from-transparent via-t3-5 to-transparent animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(90,86,82,0.1), transparent)', animation: 'shimmer 2s infinite', left: '-100%' }} />
      </div>
      <div className="p-4 pt-4">
        <div className="bg-s3 rounded mb-2" style={{ height: 10, width: 60 }} />
        <div className="bg-s3 rounded mb-3" style={{ height: 20, width: '75%' }} />
        <div className="bg-s3 rounded mb-4" style={{ height: 16, width: 80 }} />
        <div className="d-flex gap-2">
          <div className="bg-s3 rounded-3 flex-grow-1" style={{ height: 40 }} />
          <div className="bg-s3 rounded-3" style={{ height: 40, width: 40 }} />
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
