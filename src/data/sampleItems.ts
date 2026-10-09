// Sample items that users can test with a single click
export interface SampleItem {
  id: string;
  name: string;
  category: 'plastic' | 'vegetable' | 'glass' | 'metal';
  description: string;
  weightGrams: number;
  badge: string;
  notes: string;
  // High quality SVG data uri representing realistic items
  dataUri: string;
}

// Generate stylized SVG previews for instant one-click testing
function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

export const SAMPLE_ITEMS: SampleItem[] = [
  {
    id: 'carrot_tops',
    name: 'Carrot Tops & Kitchen Scraps',
    category: 'vegetable',
    description: 'Fresh carrot green crowns, fibrous ends, and peelings.',
    weightGrams: 140,
    badge: 'Organic / Vegetable',
    notes: 'Freshly chopped organic carrot green tops and trimmings with root ends.',
    dataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
        <rect width="400" height="300" fill="#f4f0ea"/>
        <circle cx="200" cy="150" r="110" fill="#e8ded1" opacity="0.6"/>
        <!-- Carrot tops foliage -->
        <g stroke="#2d6a4f" stroke-width="4" stroke-linecap="round" fill="none">
          <path d="M 200 120 C 180 70, 140 50, 110 60"/>
          <path d="M 200 120 C 190 60, 170 30, 150 20"/>
          <path d="M 200 120 C 210 50, 230 30, 250 25"/>
          <path d="M 200 120 C 220 70, 260 55, 290 65"/>
          <path d="M 170 70 C 150 60, 140 40, 135 30" stroke="#40916c" stroke-width="3"/>
          <path d="M 230 70 C 250 60, 260 40, 270 35" stroke="#40916c" stroke-width="3"/>
          <path d="M 195 80 C 185 60, 175 45, 170 35" stroke="#52b788" stroke-width="3"/>
        </g>
        <!-- Carrot root body -->
        <polygon points="175,120 225,120 200,240" fill="#f77f00"/>
        <polygon points="178,125 222,125 200,230" fill="#ea580c"/>
        <ellipse cx="200" cy="120" rx="25" ry="8" fill="#c2410c"/>
        <path d="M 185 140 Q 195 143 210 140" stroke="#c2410c" stroke-width="2" fill="none"/>
        <path d="M 188 170 Q 197 173 207 170" stroke="#c2410c" stroke-width="2" fill="none"/>
        <path d="M 192 200 Q 198 202 204 200" stroke="#c2410c" stroke-width="2" fill="none"/>
        <!-- Peel trimmings scattered -->
        <path d="M 120 180 Q 135 170 150 190" stroke="#f97316" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M 250 170 Q 270 190 285 180" stroke="#fb923c" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M 230 210 Q 250 220 260 205" stroke="#ea580c" stroke-width="5" stroke-linecap="round" fill="none"/>
        <text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2d6a4f" text-anchor="middle">Carrot Greens &amp; Scraps (Organic)</text>
      </svg>
    `),
  },
  {
    id: 'pet_water_bottle',
    name: 'PET Plastic Water Bottle (#1)',
    category: 'plastic',
    description: 'Clear transparent 500ml beverage bottle with twist cap.',
    weightGrams: 28,
    badge: 'Plastic #1 (PET)',
    notes: 'Clear polyethylene terephthalate 500ml drinking water bottle with blue polypropylene cap.',
    dataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
        <rect width="400" height="300" fill="#f0f7f9"/>
        <ellipse cx="200" cy="235" rx="70" ry="12" fill="#d1e3ea" opacity="0.6"/>
        <!-- Blue cap -->
        <rect x="185" y="45" width="30" height="16" rx="3" fill="#0284c7"/>
        <line x1="188" y1="45" x2="188" y2="61" stroke="#0369a1" stroke-width="2"/>
        <line x1="195" y1="45" x2="195" y2="61" stroke="#0369a1" stroke-width="2"/>
        <line x1="205" y1="45" x2="205" y2="61" stroke="#0369a1" stroke-width="2"/>
        <line x1="212" y1="45" x2="212" y2="61" stroke="#0369a1" stroke-width="2"/>
        <!-- Neck -->
        <rect x="190" y="61" width="20" height="12" fill="#bae6fd" opacity="0.8"/>
        <!-- Bottle body -->
        <path d="M 190 73 C 170 85, 165 105, 165 125 L 165 215 C 165 225, 175 230, 200 230 C 225 230, 235 225, 235 215 L 235 125 C 235 105, 230 85, 210 73 Z" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2.5" opacity="0.9"/>
        <!-- Grip ridges -->
        <path d="M 166 140 C 180 145, 220 145, 234 140" stroke="#38bdf8" stroke-width="2" fill="none"/>
        <path d="M 166 155 C 180 160, 220 160, 234 155" stroke="#38bdf8" stroke-width="2" fill="none"/>
        <path d="M 166 170 C 180 175, 220 175, 234 170" stroke="#38bdf8" stroke-width="2" fill="none"/>
        <!-- Plastic Resin badge symbol -->
        <polygon points="200,185 210,202 190,202" fill="none" stroke="#0284c7" stroke-width="2"/>
        <text x="200" y="200" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0284c7" text-anchor="middle">1</text>
        <text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0284c7" text-anchor="middle">PET #1 Beverage Bottle</text>
      </svg>
    `),
  },
  {
    id: 'hdpe_milk_jug',
    name: 'HDPE Milk / Detergent Jug (#2)',
    category: 'plastic',
    description: 'Opaque durable rigid high-density polyethylene container.',
    weightGrams: 55,
    badge: 'Plastic #2 (HDPE)',
    notes: 'Rigid opaque high-density polyethylene HDPE #2 plastic gallon jug with side handle.',
    dataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
        <rect width="400" height="300" fill="#f8fafc"/>
        <ellipse cx="195" cy="245" rx="80" ry="14" fill="#cbd5e1" opacity="0.5"/>
        <!-- Jug body -->
        <path d="M 165 75 L 140 100 L 135 220 C 135 235, 145 240, 195 240 C 245 240, 255 235, 255 220 L 250 100 L 195 75 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3"/>
        <!-- Handle cutout -->
        <path d="M 215 105 L 235 115 L 235 175 L 215 160 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2.5"/>
        <!-- Cap -->
        <rect x="165" y="55" width="25" height="20" rx="3" fill="#e11d48"/>
        <!-- Resin badge -->
        <polygon points="175,150 187,170 163,170" fill="none" stroke="#475569" stroke-width="2"/>
        <text x="175" y="167" font-family="sans-serif" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">2</text>
        <text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="#475569" text-anchor="middle">HDPE #2 Rigid Milk Jug</text>
      </svg>
    `),
  },
  {
    id: 'onion_skins',
    name: 'Onion Skins & Garlic Peels',
    category: 'vegetable',
    description: 'Dry papery allium skins rich in quercetin and pigments.',
    weightGrams: 60,
    badge: 'Organic / Scraps',
    notes: 'Dry brown onion papery peels, outer skins, and root ends.',
    dataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
        <rect width="400" height="300" fill="#fffbeb"/>
        <!-- Yellow onion body & peels -->
        <ellipse cx="200" cy="160" rx="60" ry="70" fill="#d97706"/>
        <path d="M 200 90 Q 220 120 220 160 Q 220 210 200 230" stroke="#b45309" stroke-width="2.5" fill="none"/>
        <path d="M 200 90 Q 180 120 180 160 Q 180 210 200 230" stroke="#b45309" stroke-width="2.5" fill="none"/>
        <!-- Root tuft -->
        <path d="M 195 230 L 190 245 M 200 230 L 200 248 M 205 230 L 210 245" stroke="#92400e" stroke-width="3"/>
        <!-- Curled papery peel pieces -->
        <path d="M 125 180 Q 140 140 160 170 Q 145 195 125 180 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
        <path d="M 240 160 Q 275 140 280 180 Q 255 190 240 160 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <path d="M 170 215 Q 185 240 215 235" stroke="#d97706" stroke-width="4" stroke-linecap="round" fill="none"/>
        <text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="#92400e" text-anchor="middle">Onion Skins &amp; Garlic Peels</text>
      </svg>
    `),
  },
  {
    id: 'glass_jar',
    name: 'Reusable Glass Mason Jar',
    category: 'glass',
    description: '100% infinitely recyclable and food-safe pantry container.',
    weightGrams: 310,
    badge: 'Reusable Glass',
    notes: 'Clear glass preserve jar with screw threading, reusable indefinitely.',
    dataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
        <rect width="400" height="300" fill="#f8fafc"/>
        <ellipse cx="200" cy="235" rx="55" ry="12" fill="#cbd5e1" opacity="0.6"/>
        <!-- Metal lid ring -->
        <rect x="160" y="65" width="80" height="15" rx="3" fill="#d4af37" stroke="#b8972e" stroke-width="1.5"/>
        <!-- Jar body -->
        <rect x="150" y="80" width="100" height="145" rx="14" fill="#f0fdf4" stroke="#86efac" stroke-width="3" opacity="0.85"/>
        <line x1="165" y1="100" x2="165" y2="210" stroke="#bbf7d0" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="200" cy="150" rx="25" ry="18" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,3"/>
        <text x="200" y="154" font-family="sans-serif" font-size="10" font-weight="bold" fill="#16a34a" text-anchor="middle">REUSE</text>
        <text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="#15803d" text-anchor="middle">Infinite Life Glass Container</text>
      </svg>
    `),
  },
  {
    id: 'aluminum_can',
    name: 'Aluminum Soda Can',
    category: 'metal',
    description: 'Highest carbon savings per kg of any household recyclable.',
    weightGrams: 16,
    badge: 'Metal (Aluminum)',
    notes: '330ml aluminum beverage can, cleaned and empty.',
    dataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
        <rect width="400" height="300" fill="#fdf2f8"/>
        <ellipse cx="200" cy="235" rx="45" ry="10" fill="#e2e8f0" opacity="0.7"/>
        <!-- Can body -->
        <path d="M 165 80 C 165 72, 235 72, 235 80 L 235 220 C 235 228, 165 228, 165 220 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2.5"/>
        <ellipse cx="200" cy="80" rx="35" ry="8" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
        <!-- Pull tab -->
        <ellipse cx="200" cy="80" rx="12" ry="4" fill="#94a3b8"/>
        <circle cx="196" cy="80" r="3" fill="#64748b"/>
        <!-- Can artwork stripe -->
        <path d="M 166 110 L 234 130 L 234 180 L 166 160 Z" fill="#ef4444" opacity="0.85"/>
        <text x="200" y="152" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">ECO SODA</text>
        <text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="#be123c" text-anchor="middle">95% Energy Saving Aluminum</text>
      </svg>
    `),
  },
];
