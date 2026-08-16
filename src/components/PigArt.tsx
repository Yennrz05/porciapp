interface PigArtProps {
  size?: number;
  tone?: number;
}

const PALETTES = [
  { body: '#fbcfe8', head: '#f9a8d4', dark: '#be185d' },
  { body: '#f9a8d4', head: '#f472b6', dark: '#be185d' },
  { body: '#f472b6', head: '#ec4899', dark: '#9d174d' },
  { body: '#ec4899', head: '#db2777', dark: '#831843' },
  { body: '#db2777', head: '#be185d', dark: '#6b0f2a' },
];

export function PigArt({ size = 120, tone = 0 }: PigArtProps) {
  const c = PALETTES[Math.min(PALETTES.length - 1, Math.max(0, tone))];
  const height = Math.round(size * (100 / 120));
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 120 100"
      role="img"
      aria-label="Cochinillo"
      className="pig-art"
    >
      {/* Colita */}
      <path
        d="M97 72 q16 -4 12 -18 q-2 -8 5 -6"
        fill="none"
        stroke={c.dark}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Cuerpo */}
      <ellipse cx="68" cy="70" rx="33" ry="24" fill={c.body} stroke={c.dark} strokeWidth="2.5" />
      {/* Patas */}
      <rect x="46" y="88" width="10" height="11" rx="4.5" fill={c.head} stroke={c.dark} strokeWidth="2" />
      <rect x="62" y="89" width="10" height="10" rx="4.5" fill={c.head} stroke={c.dark} strokeWidth="2" />
      <rect x="79" y="88" width="10" height="11" rx="4.5" fill={c.head} stroke={c.dark} strokeWidth="2" />
      <rect x="92" y="87" width="9" height="10" rx="4.5" fill={c.head} stroke={c.dark} strokeWidth="2" />
      {/* Cabeza */}
      <circle cx="36" cy="56" r="22" fill={c.head} stroke={c.dark} strokeWidth="2.5" />
      {/* Orejas */}
      <path d="M16 42 L8 22 L31 35 Z" fill={c.head} stroke={c.dark} strokeWidth="2" strokeLinejoin="round" />
      <path d="M42 41 L50 21 L58 39 Z" fill={c.head} stroke={c.dark} strokeWidth="2" strokeLinejoin="round" />
      {/* Ojo */}
      <circle cx="29" cy="50" r="3" fill="#1f2937" />
      {/* Mejilla */}
      <circle cx="46" cy="62" r="3.6" fill="#fda4af" opacity="0.75" />
      {/* Hocico */}
      <ellipse cx="17" cy="62" rx="10" ry="7.5" fill="#fb7185" stroke={c.dark} strokeWidth="2" />
      <circle cx="14" cy="62" r="1.8" fill="#7f1d1d" />
      <circle cx="21" cy="62" r="1.8" fill="#7f1d1d" />
    </svg>
  );
}
