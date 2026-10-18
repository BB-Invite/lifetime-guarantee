/**
 * Soft sketch-style cover illustrations for each promise theme.
 * Warm rose / cream strokes to sit on dark romantic quiz banners.
 */
window.QUIZ_COVERS = {
  home: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-home" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b2a2e"/>
      <stop offset="100%" stop-color="#8e4a55"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-home)"/>
  <g fill="none" stroke="#f3d6c9" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.92">
    <path class="draw" d="M70 118 V62 l50-28 50 28 v56"/>
    <path class="draw" d="M95 118 V82 h50 v36"/>
    <circle class="pulse" cx="132" cy="100" r="2.2" fill="#f3d6c9" stroke="none"/>
    <path class="draw float" d="M210 95c0-14 12-22 24-22s22 10 22 22c0 18-22 34-22 34s-24-16-24-34z"/>
    <path class="draw" d="M246 78c8-10 22-10 28 2"/>
    <path class="draw" d="M268 55c-4 8-2 16 6 20"/>
  </g>
</svg>`,

  cafe: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-cafe" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2a221c"/>
      <stop offset="100%" stop-color="#a67c52"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-cafe)"/>
  <g fill="none" stroke="#f5e0c8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <ellipse class="draw" cx="130" cy="98" rx="38" ry="10"/>
    <path class="draw" d="M100 98 v-28 h60 v28"/>
    <path class="draw" d="M112 70c0-18 12-30 28-30s26 12 26 30"/>
    <path class="steam" d="M128 58c2-8-2-12 0-18"/>
    <path class="steam" d="M140 56c2-8-1-14 1-20"/>
    <path class="steam" d="M152 58c1-7-2-11 0-17"/>
    <circle class="draw" cx="240" cy="70" r="18"/>
    <path class="draw" d="M222 88c6 16 30 16 36 0"/>
    <path class="draw" d="M258 70c8 0 14 6 14 14"/>
  </g>
</svg>`,

  table: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-table" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f2a24"/>
      <stop offset="100%" stop-color="#6b8f71"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-table)"/>
  <g fill="none" stroke="#dce8d4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path class="draw" d="M70 100 h220"/>
    <path class="draw" d="M90 100 v20 M250 100 v20"/>
    <rect class="draw" x="120" y="62" width="50" height="28" rx="4"/>
    <rect class="draw" x="190" y="62" width="50" height="28" rx="4"/>
    <path class="draw" d="M145 48c0-10 8-16 15-16s14 6 14 16"/>
    <path class="draw" d="M215 48c0-10 8-16 15-16s14 6 14 16"/>
    <path class="float" d="M170 40c4-6 12-6 16 0"/>
  </g>
</svg>`,

  dusk: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-dusk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#8b5a6b"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-dusk)"/>
  <g fill="none" stroke="#f0d0dc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle class="pulse" cx="280" cy="40" r="14" fill="#f0d0dc" fill-opacity="0.15" stroke="#f0d0dc"/>
    <path class="draw" d="M90 110c10-34 30-52 55-52s44 18 55 52"/>
    <circle class="draw" cx="120" cy="58" r="14"/>
    <circle class="draw" cx="170" cy="58" r="14"/>
    <path class="draw" d="M134 58c4 6 12 6 16 0"/>
    <path class="float" d="M210 70c8-12 24-12 32 0-8 12-24 12-32 0z" fill="#f0d0dc" fill-opacity="0.12"/>
  </g>
</svg>`,

  bookstore: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-book" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2c241b"/>
      <stop offset="100%" stop-color="#b08968"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-book)"/>
  <g fill="none" stroke="#f5e6d3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path class="draw" d="M80 110 V45 h28 v65"/>
    <path class="draw" d="M112 110 V55 h24 v55"/>
    <path class="draw" d="M140 110 V40 h30 v70"/>
    <path class="draw" d="M200 95c0-28 18-46 40-46s38 18 38 46"/>
    <path class="draw" d="M210 95 h56"/>
    <path class="float" d="M240 42c0-8 6-14 12-14s12 6 12 14c0 10-12 18-12 18s-12-8-12-18z"/>
  </g>
</svg>`,

  nook: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-nook" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e2430"/>
      <stop offset="100%" stop-color="#8fa3b8"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-nook)"/>
  <g fill="none" stroke="#dce6f0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path class="draw" d="M70 110 h120"/>
    <path class="draw" d="M90 110 V70 c0-18 14-30 35-30s35 12 35 30 v40"/>
    <circle class="pulse" cx="125" cy="48" r="3" fill="#dce6f0" stroke="none"/>
    <path class="draw" d="M220 100c20-8 40-8 60 0"/>
    <path class="draw" d="M235 100 V62"/>
    <path class="draw" d="M265 100 V55"/>
    <path class="steam" d="M250 50c2-10-3-14 0-22"/>
    <circle class="draw" cx="250" cy="55" r="12"/>
  </g>
</svg>`,

  "cafe-warm": `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-cw" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3a2218"/>
      <stop offset="100%" stop-color="#d4a373"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-cw)"/>
  <g fill="none" stroke="#ffe8d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle class="draw" cx="120" cy="58" r="16"/>
    <circle class="draw" cx="170" cy="58" r="16"/>
    <path class="draw" d="M100 90c8 22 36 28 55 10 14 20 42 14 52-8"/>
    <path class="draw" d="M136 62c6 8 14 8 20 0"/>
    <path class="float" d="M250 75c10-16 30-16 40 0-10 16-30 16-40 0z" fill="#ffe8d0" fill-opacity="0.12"/>
    <path class="draw" d="M270 48c6-10 18-10 24 2"/>
  </g>
</svg>`,

  family: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-fam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2b2118"/>
      <stop offset="100%" stop-color="#c4a484"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-fam)"/>
  <g fill="none" stroke="#f7eadc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path class="draw" d="M80 115 h200"/>
    <circle class="draw" cx="130" cy="55" r="12"/>
    <circle class="draw" cx="175" cy="52" r="12"/>
    <circle class="draw" cx="220" cy="55" r="12"/>
    <path class="draw" d="M110 115 V78 c0-12 8-18 20-18h0"/>
    <path class="draw" d="M155 115 V74 c0-12 8-18 20-18"/>
    <path class="draw" d="M200 115 V78 c0-12 8-18 20-18"/>
    <path class="float" d="M280 50c0-8 6-14 12-14s12 6 12 14c0 10-12 18-12 18s-12-8-12-18z"/>
  </g>
</svg>`,

  struggle: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-str" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f1a24"/>
      <stop offset="100%" stop-color="#9b7b8e"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-str)"/>
  <g fill="none" stroke="#ecd8e4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle class="draw" cx="140" cy="55" r="16"/>
    <circle class="draw" cx="200" cy="55" r="16"/>
    <path class="draw" d="M115 100c10 18 40 22 55 4 12 20 42 16 55-4"/>
    <path class="draw" d="M156 58c8 6 18 6 26 0"/>
    <path class="float" d="M270 68c6-10 18-10 24 0"/>
    <path class="pulse" d="M282 48c0-6 4-10 8-10s8 4 8 10c0 8-8 14-8 14s-8-6-8-14z" fill="#ecd8e4" fill-opacity="0.15"/>
  </g>
</svg>`,

  seasons: `
<svg class="cover-svg" viewBox="0 0 360 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g-sea" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a2e1a"/>
      <stop offset="55%" stop-color="#c9a66b"/>
      <stop offset="100%" stop-color="#8b4513"/>
    </linearGradient>
  </defs>
  <rect width="360" height="140" fill="url(#g-sea)"/>
  <g fill="none" stroke="#f5ecd8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path class="draw" d="M60 115c40-10 70-40 90-70"/>
    <path class="draw" d="M150 45c8 0 14 8 12 16"/>
    <circle class="draw" cx="200" cy="70" r="14"/>
    <circle class="draw" cx="240" cy="70" r="14"/>
    <path class="draw" d="M185 100c8 16 30 18 42 2 10 16 32 14 42-2"/>
    <path class="float" d="M290 40c8-4 16 2 14 10"/>
    <path class="float" d="M310 55c6-8 16-4 14 6"/>
    <path class="draw" d="M214 72c6 6 14 6 20 0"/>
  </g>
</svg>`,
};
