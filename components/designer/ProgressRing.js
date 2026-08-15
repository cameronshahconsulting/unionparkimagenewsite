/** Circular percentage indicator — how far through the expected wait we are. */
export default function ProgressRing({ percent = 0, size = 44, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="progress-ring" role="img" aria-label={`${Math.round(clamped)}% through the expected wait`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(110,139,91,.22)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--sprout)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset .3s linear" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="progress-ring-label">
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
