export default function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ aspectRatio: '1/1', background: '#141414',
        borderBottom: '1px solid #1A1A1A', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
          animation: 'shimmer 1.8s infinite',
        }} />
      </div>
      <div style={{ padding: 20 }}>
        {[60, 85, 50].map((w, i) => (
          <div key={i} style={{
            height: i === 1 ? 18 : 12,
            background: '#141414', borderRadius: 4,
            marginBottom: 12, width: `${w}%`,
          }} />
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          <div style={{ height: 38, background: '#141414', borderRadius: 8 }} />
          <div style={{ height: 38, background: '#141414', borderRadius: 8 }} />
        </div>
      </div>
      <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    </div>
  );
}
