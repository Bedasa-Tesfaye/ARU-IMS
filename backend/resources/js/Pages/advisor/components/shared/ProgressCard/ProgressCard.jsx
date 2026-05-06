import React, { useEffect, useRef, useState } from 'react';
import './ProgressCard.css';

export function AnimatedStat({ value, label, hint }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = fromRef.current;
    const dur = 650;
    let frame;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      const next = Math.round(from + (target - from) * eased);
      setN(next);
      if (p < 1) frame = requestAnimationFrame(tick);
      else {
        setN(target);
        fromRef.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return (
    <div className="adv-stat adv-stat-animated">
      <strong>{n}</strong>
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function EngagementGauge({ score }) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  return (
    <div className="adv-gauge" style={{ '--pct': `${pct}%` }} title={`Engagement ${pct}`}>
      <span>{pct}</span>
    </div>
  );
}
