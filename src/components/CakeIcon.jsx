
export function CakeIcon({ className = '', size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottom Tier */}
      <rect x="15" y="55" width="70" height="28" rx="6" />
      {/* Top Tier */}
      <rect x="25" y="30" width="50" height="25" rx="5" />
      {/* Left Candle */}
      <rect x="37" y="16" width="3" height="14" rx="1" />
      {/* Center Candle */}
      <rect x="48.5" y="12" width="3" height="18" rx="1" />
      {/* Right Candle */}
      <rect x="60" y="16" width="3" height="14" rx="1" />
      {/* Left Flame */}
      <path d="M38.5,8 C39.5,8 40,10 40,11.5 C40,13 39.3,13.5 38.5,13.5 C37.7,13.5 37,13 37,11.5 C37,10 37.5,8 38.5,8 Z" />
      {/* Center Flame */}
      <path d="M50,3 C51.3,3 52,5.5 52,7.5 C52,9.5 51.1,10 50,10 C48.9,10 48,9.5 48,7.5 C48,5.5 48.7,3 50,3 Z" />
      {/* Right Flame */}
      <path d="M61.5,8 C62.5,8 63,10 63,11.5 C63,13 62.3,13.5 61.5,13.5 C60.7,13.5 60,13 60,11.5 C60,10 60.5,8 61.5,8 Z" />
    </svg>
  );
}

export default CakeIcon;
