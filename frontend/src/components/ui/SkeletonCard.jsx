export default function SkeletonCard() {
  return (
    <div className="home-arrival-card home-arrival-card--loading">
      <div className="home-arrival-card__action" />
      <div className="home-arrival-card__img" />
      <div className="skeleton-line" />
      <div className="skeleton-line small" />
      <div className="skeleton-line tiny" />
    </div>
  );
}

