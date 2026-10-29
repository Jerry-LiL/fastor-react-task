export const DEFAULT_DIAL_CODE = '+91';
export const DEFAULT_CITY_ID = 118;

// Fallback values for restaurant fields not provided by the staging API
export const RESTAURANT_DEFAULTS = {
  cuisine: 'Cakes, Pastry, Pastas',
  rating: 4.5,
  popularity: '4.5 Popularity',
  costForTwo: '₹200 Cost for two',
  offers: '4 Offers trending',
  address: 'Connaught Place, New Delhi',
  description:
    'Our delicate vanilla cake shaped like a heart with fresh strawberry filling and delicate frosting, crafted for a delicious celebration. Sourced fresh daily with premium ingredients.',
};

// High quality clean SVG food placeholder as data URI when remote logo fails or returns 404
export const FALLBACK_RESTAURANT_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D3142" />
      <stop offset="100%" stop-color="#1B1D28" />
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#grad)" />
  <circle cx="300" cy="180" r="70" fill="#FF6D6A" opacity="0.15" />
  <path d="M260 210 C260 170 340 170 340 210 Z" fill="#FF6D6A" />
  <circle cx="300" cy="155" r="14" fill="#FF6D6A" />
  <rect x="250" y="218" width="100" height="8" rx="4" fill="#FF8A87" />
  <text x="300" y="270" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="600" letter-spacing="1">FASTOR DINING</text>
  <text x="300" y="295" text-anchor="middle" fill="#9E9E9E" font-family="sans-serif" font-size="14">Delicious Flavours Await</text>
</svg>
`);
