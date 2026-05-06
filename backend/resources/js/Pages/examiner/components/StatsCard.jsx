import React, { useEffect, useMemo, useState } from 'react';
import './StatsCard.css';

const StatsCard = ({ icon, value = 0, label, trend, color = '#0ea5e9' }) => {
  const numericValue = useMemo(() => Number(value) || 0, [value]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let raf = 0;
    const duration = 700;
    const start = performance.now();

    const tick = (t) => {
      const progress = Math.min(1, (t - start) / duration);
      setCounter(Math.round(numericValue * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [numericValue]);

  return (
    <article className="examiner-card stats-card" style={{ borderLeftColor: color }}>
      <div className="stats-card-top">
        <div className="stats-icon" style={{ background: `${color}22` }}>{icon}</div>
        {trend && <span className={`stats-trend ${trend.startsWith('-') ? 'down' : 'up'}`}>{trend}</span>}
      </div>
      <h3>{typeof value === 'string' && value.includes('%') ? value : counter}</h3>
      <p>{label}</p>
    </article>
  );
};

export default StatsCard;
