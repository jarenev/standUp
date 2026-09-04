export default function Coin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="coinG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#coinG)" />
      <circle cx="12" cy="12" r="7.4" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" />
      <text
        x="12"
        y="16.2"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="900"
        fill="#3b1d02"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        G
      </text>
    </svg>
  );
}
