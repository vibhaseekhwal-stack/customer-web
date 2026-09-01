// Shared design tokens across every page — extracted once from the Stitch
// output so every screen (including the ones built by hand to match) stays
// visually consistent without repeating this block per file.
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'on-tertiary-fixed': '#181c1d',
        'on-primary-fixed': '#00210b',
        surface: '#faf9f5',
        'inverse-surface': '#30312e',
        secondary: '#7f5600',
        'primary-fixed-dim': '#64de87',
        'primary-fixed': '#81fba1',
        'on-background': '#1b1c1a',
        'primary-container': '#1f8449',
        'on-error': '#ffffff',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-secondary-fixed-variant': '#604100',
        primary: '#1b7340',
        'primary-dark': '#124d2a',
        // Warm CTA/urgency accent, deliberately separate from the brand
        // green — ADD buttons, sale/low-stock badges. Never used for
        // order-status semantics (those stay on their own palette).
        accent: '#e8622c',
        'accent-dark': '#c94d1c',
        'on-accent': '#ffffff',
        paper: '#f7f8f4',
        ink: '#1b1f1c',
        'ink-soft': '#5b6960',
        'on-secondary-fixed': '#281800',
        'surface-bright': '#faf9f5',
        'on-secondary-container': '#6b4800',
        'surface-dim': '#dbdad6',
        'error-container': '#ffdad6',
        tertiary: '#585d5d',
        outline: '#6e7a6d',
        'inverse-primary': '#64de87',
        'tertiary-fixed': '#dfe3e3',
        'surface-container': '#efeeea',
        background: '#faf9f5',
        'on-surface-variant': '#3e4a3e',
        'surface-variant': '#e3e2df',
        'surface-container-low': '#f5f4f0',
        'on-surface': '#1b1c1a',
        'on-tertiary-container': '#f9fdfd',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#717575',
        'tertiary-fixed-dim': '#c3c7c7',
        'surface-container-lowest': '#ffffff',
        'on-primary-container': '#f7fff3',
        'on-tertiary-fixed-variant': '#434848',
        'on-error-container': '#93000a',
        'secondary-container': '#fdb327',
        'outline-variant': '#bdcabb',
        'secondary-fixed-dim': '#ffba40',
        'surface-container-highest': '#e3e2df',
        'surface-container-high': '#e9e8e4',
        'secondary-fixed': '#ffddae',
        'surface-tint': '#006d34',
        'inverse-on-surface': '#f2f1ed',
        'on-primary-fixed-variant': '#005225',
        error: '#ba1a1a',
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
      spacing: {
        base: '4px',
        'container-margin': '16px',
        xl: '32px',
        'tap-target': '48px',
        sm: '8px',
        lg: '24px',
        gutter: '12px',
        xs: '4px',
        md: '16px',
      },
      fontFamily: {
        'body-sm': ['Karla', 'sans-serif'],
        'display-lg': ['Baloo 2', 'sans-serif'],
        'body-md': ['Karla', 'sans-serif'],
        'label-lg': ['Karla', 'sans-serif'],
        'body-lg': ['Karla', 'sans-serif'],
        'headline-md': ['Baloo 2', 'sans-serif'],
        'headline-sm': ['Baloo 2', 'sans-serif'],
        'price-lg': ['Baloo 2', 'sans-serif'],
        'price-sm': ['Baloo 2', 'sans-serif'],
      },
      fontSize: {
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '26px', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'price-lg': ['20px', { lineHeight: '24px', fontWeight: '700' }],
        'price-sm': ['14px', { lineHeight: '18px', fontWeight: '700' }],
      },
    },
  },
};

// Category → {icon, tint, fg} used wherever a product has no real photo
// (Product.imageUrl) yet. Keyed by category slug. A distinct tinted tile
// per category — instead of one generic icon repeated for every product —
// is what actually makes the catalog read as curated rather than templated.
const CATEGORY_STYLES = {
  'dairy-eggs': { icon: 'egg', tint: '#e3f0fb', fg: '#1c4c8c' },
  'fresh-vegetables-fruits': { icon: 'nutrition', tint: '#eaf6df', fg: '#3d7a1f' },
  'grains-pulses': { icon: 'grain', tint: '#faf1dd', fg: '#8a5a00' },
  'snacks': { icon: 'lunch_dining', tint: '#fde9df', fg: '#c94d1c' },
  'beverages': { icon: 'local_cafe', tint: '#ede3fb', fg: '#5b2a9c' },
  'bakery': { icon: 'bakery_dining', tint: '#fbe9e0', fg: '#a3591e' },
  'personal-care': { icon: 'spa', tint: '#e3f6f1', fg: '#0f6b58' },
  'household': { icon: 'cleaning_services', tint: '#e9edf5', fg: '#3a4a78' },
  DEFAULT: { icon: 'nutrition', tint: '#f0f2ec', fg: '#5b6960' },
};

function getCategoryStyle(categorySlugOrName) {
  const key = (categorySlugOrName || '').toLowerCase().trim();
  return CATEGORY_STYLES[key] || CATEGORY_STYLES.DEFAULT;
}

// Product.imageUrl is a relative path (e.g. "/uploads/products/x.png") since
// the backend doesn't know its own public URL — resolve it against the API
// origin here, since the frontend and backend are served from different
// origins/ports and a bare relative path would resolve against this page's
// own origin instead.
function resolveImageUrl(url) {
  if (!url) return url;
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
}
