import { useId } from 'react';

/**
 * 4-candle birthday cake - same artwork as the installed app icon.
 * Drawn in `currentColor`; the tier lines and flame cores are cut out
 * (transparent), so it works on any background.
 */
export function CakeIcon({ className = '', size = 24 }) {
  const maskId = `cake-mask-${useId().replace(/:/g, '')}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="100" height="100" fill="black"/>
          <path d="M9 56 A41 8 0 0 1 91 56 L91 88 A41 7 0 0 1 9 88 Z" fill="white"/>
          <path d="M9 62.5 A41 7.5 0 0 0 91 62.5" fill="none" stroke="black" strokeWidth="1.8"/>
          <path d="M20 33 A30 5.5 0 0 1 80 33 L80 54 A30 6 0 0 1 20 54 Z" fill="white" stroke="black" strokeWidth="2.6"/>
          <path d="M20 36 A30 5.5 0 0 0 80 36" fill="none" stroke="black" strokeWidth="1.6"/>
          <rect x="29.2" y="14" width="4.4" height="19" fill="white"/>
          <rect x="41.8" y="14" width="4.4" height="19" fill="white"/>
          <rect x="54.3" y="14" width="4.4" height="19" fill="white"/>
          <rect x="66.9" y="14" width="4.4" height="19" fill="white"/>
          <path d="M31.4 4.5 C34.2 7.5 34.4 10.6 31.4 11.6 C28.4 10.6 28.6 7.5 31.4 4.5 Z" fill="white"/>
          <path d="M44 4.5 C46.8 7.5 47 10.6 44 11.6 C41 10.6 41.2 7.5 44 4.5 Z" fill="white"/>
          <path d="M56.5 4.5 C59.3 7.5 59.5 10.6 56.5 11.6 C53.5 10.6 53.7 7.5 56.5 4.5 Z" fill="white"/>
          <path d="M69.1 4.5 C71.9 7.5 72.1 10.6 69.1 11.6 C66.1 10.6 66.3 7.5 69.1 4.5 Z" fill="white"/>
          <ellipse cx="31.4" cy="9.4" rx="0.9" ry="1.5" fill="black"/><ellipse cx="44" cy="9.4" rx="0.9" ry="1.5" fill="black"/><ellipse cx="56.5" cy="9.4" rx="0.9" ry="1.5" fill="black"/><ellipse cx="69.1" cy="9.4" rx="0.9" ry="1.5" fill="black"/>
        </mask>
      </defs>
      <rect width="100" height="100" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

export default CakeIcon;
