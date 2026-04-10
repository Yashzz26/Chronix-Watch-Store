export default function SkeletonCard() {
  return (
    <>
      <style>{`
        .skeleton-card {
          border: 1px solid var(--border, #E0DED9);
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          height: 100%;
        }
        .skeleton-card__img {
          aspect-ratio: 1/1;
          background: linear-gradient(90deg, var(--bg-1, #F5F3EF) 25%, #EDEAE4 50%, var(--bg-1, #F5F3EF) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }
        .skeleton-card__body {
          padding: 20px;
        }
        .skeleton-line {
          height: 12px;
          background: linear-gradient(90deg, var(--bg-1, #F5F3EF) 25%, #EDEAE4 50%, var(--bg-1, #F5F3EF) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
          margin-bottom: 10px;
        }
        .skeleton-line--xs { width: 30%; height: 8px; }
        .skeleton-line--sm { width: 50%; }
        .skeleton-line--md { width: 75%; }
        .skeleton-line--lg { width: 100%; height: 14px; }
        .skeleton-line--price { width: 35%; height: 16px; margin-top: 16px; }
        .skeleton-stars {
          display: flex;
          gap: 3px;
          margin-bottom: 10px;
        }
        .skeleton-star {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          background: linear-gradient(90deg, var(--bg-1, #F5F3EF) 25%, #EDEAE4 50%, var(--bg-1, #F5F3EF) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="skeleton-card">
        <div className="skeleton-card__img" />
        <div className="skeleton-card__body">
          <div className="skeleton-line skeleton-line--xs" />
          <div className="skeleton-line skeleton-line--lg" />
          <div className="skeleton-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="skeleton-star" />
            ))}
          </div>
          <div className="skeleton-line skeleton-line--price" />
        </div>
      </div>
    </>
  );
}

/**
 * SkeletonOrderCard — skeleton for the orders page.
 */
export function SkeletonOrderCard() {
  return (
    <>
      <style>{`
        .skeleton-order {
          border: 1px solid var(--border, #E0DED9);
          background: #fff;
          border-radius: 20px;
          padding: 30px 40px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .skeleton-order__img {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: linear-gradient(90deg, var(--bg-1, #F5F3EF) 25%, #EDEAE4 50%, var(--bg-1, #F5F3EF) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .skeleton-order__body { flex: 1; }
      `}</style>
      <div className="skeleton-order">
        <div className="skeleton-order__img" />
        <div className="skeleton-order__body">
          <div className="skeleton-line skeleton-line--lg" style={{ marginBottom: 8 }} />
          <div className="skeleton-line skeleton-line--sm" style={{ marginBottom: 6 }} />
          <div className="skeleton-line skeleton-line--xs" />
        </div>
        <div style={{ width: 100 }}>
          <div className="skeleton-line skeleton-line--price" style={{ marginTop: 0 }} />
        </div>
      </div>
    </>
  );
}
