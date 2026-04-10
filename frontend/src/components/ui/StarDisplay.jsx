import React from 'react';

/**
 * StarDisplay — renders filled/half/empty stars for a given rating.
 * Uses pure CSS, no icon library dependency.
 *
 * Props:
 *   rating      — number (0-5)
 *   count       — number of reviews (optional, shows "(count)")
 *   size        — CSS font-size (default: '0.75rem')
 *   showEmpty   — show empty styling for 0 reviews (default: true)
 */
export default function StarDisplay({ rating = 0, count = 0, size = '0.75rem', showEmpty = true }) {
  if (!count && !showEmpty) return null;

  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating - fullStars >= 0.3 && safeRating - fullStars < 0.8;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <>
      <style>{`
        .star-display {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          line-height: 1;
        }
        .star-display__star {
          color: #D4AF37;
          font-size: ${size};
          letter-spacing: -1px;
        }
        .star-display__star--empty {
          color: #D5D0C8;
        }
        .star-display__count {
          font-size: calc(${size} * 0.85);
          color: var(--t3, #888);
          font-weight: 600;
          margin-left: 4px;
        }
        .star-display__avg {
          font-size: calc(${size} * 0.85);
          color: var(--t2, #555);
          font-weight: 700;
          margin-left: 3px;
        }
      `}</style>
      <span className="star-display">
        {Array.from({ length: fullStars }, (_, i) => (
          <span key={`f${i}`} className="star-display__star">★</span>
        ))}
        {hasHalf && <span className="star-display__star" style={{ opacity: 0.6 }}>★</span>}
        {Array.from({ length: emptyStars }, (_, i) => (
          <span key={`e${i}`} className="star-display__star star-display__star--empty">★</span>
        ))}
        {count > 0 && (
          <>
            <span className="star-display__avg">{safeRating.toFixed(1)}</span>
            <span className="star-display__count">({count})</span>
          </>
        )}
      </span>
    </>
  );
}
