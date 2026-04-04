/**
 * Empowered Vote Design Tokens
 * Single source of truth for the EV design system.
 * Synced to Penpot via /sync-design-tokens
 *
 * WCAG AA compliance notes:
 *   Brand colors have limited contrast on white backgrounds.
 *   Use the `accessibleText` map below for body-text alternatives
 *   that pass AA (4.5:1) while staying on-brand.
 *
 *   Brand color        | On white | AA-safe text alternative
 *   ─────────────────  | ──────── | ────────────────────────
 *   Coral   #FF5740    |  3.14:1  | coral-700  #E61B00  (4.64:1)
 *   Muted Blue #00657C |  6.66:1  | (already AA — use directly)
 *   Light Blue #59B0C4 |  2.49:1  | skyblue-700 #327E8F (4.65:1)
 *   Yellow  #FED12E    |  1.46:1  | yellow-900  #7B640E (5.72:1)
 *
 *   Coral is AA for large text only (>=18px bold or >=24px).
 *   Yellow and Light Blue should never be used as text on white.
 */

// ──────────────────────────────────────────────
// Color Scales (050–950 per hue)
// ──────────────────────────────────────────────

export const colorScales = {
  coral: {
    '050': '#FAF6F5', '100': '#F6E6E4', '200': '#F2C6C0', '300': '#F2988C',
    '400': '#F66855', '500': '#FF5740', '600': '#FF2B0F', '700': '#E61B00',
    '800': '#B31D09', '900': '#8E1F10', '950': '#6C1E13',
  },
  teal: {
    // Smoothed scale — original 400→500 had a ~45 lightness jump.
    // 400 now bridges the light wash into the deep brand muted-blue.
    '050': '#F5F9FA', '100': '#E4F3F6', '200': '#C0E8F2', '300': '#7DD4E8',
    '400': '#3AABB8', '500': '#00657C', '600': '#005366', '700': '#003E4D',
    '800': '#03303A', '900': '#05262E', '950': '#051A1E',
  },
  skyblue: {
    '050': '#F6F8F8', '100': '#E9F0F1', '200': '#CDE0E5', '300': '#A7CFD8',
    '400': '#7FBECC', '500': '#59B0C4', '600': '#3A9BB0', '700': '#327E8F',
    '800': '#2B616E', '900': '#264C55', '950': '#1E383D',
  },
  yellow: {
    '050': '#FAF9F5', '100': '#F6F2E4', '200': '#F1E7C0', '300': '#F2DC8D',
    '400': '#F5D356', '500': '#FED12E', '600': '#FAC400', '700': '#D0A301',
    '800': '#9F7F09', '900': '#7B640E', '950': '#5B4B10',
  },
  gray: {
    '050': '#F7F7F8', '100': '#EBEDEF', '200': '#D3D7DE', '300': '#B3BBCC',
    '400': '#8F9EBC', '500': '#6B7280', '600': '#535964', '700': '#41454E',
    '800': '#2F3237', '900': '#212326', '950': '#131416',
  },
};

// ──────────────────────────────────────────────
// Tier Colors (teal-scale shade variation)
// ──────────────────────────────────────────────

export const tierColors = {
  federal: {
    bg:     colorScales.teal['100'],   // #E4F3F6
    accent: colorScales.teal['700'],   // #003E4D
    text:   colorScales.teal['700'],   // #003E4D — 7.5:1 on white, AA
  },
  state: {
    bg:     colorScales.teal['050'],   // #F5F9FA
    accent: colorScales.teal['500'],   // #00657C
    text:   colorScales.teal['500'],   // #00657C — 6.66:1 on white, AA
  },
  local: {
    bg:     colorScales.teal['050'],   // #F5F9FA
    accent: colorScales.teal['200'],   // #C0E8F2 — decorative only
    text:   colorScales.teal['600'],   // #005366 — 8.1:1 on white, AA
  },
};

// ──────────────────────────────────────────────
// Brand Colors (flat references for convenience)
// Canonical values — DO NOT change without updating all apps.
// ──────────────────────────────────────────────

export const colors = {
  // Primary brand (locked)
  evCoral:      '#FF5740',   // 3.14:1 on white — large text / UI only
  evMutedBlue:  '#00657C',   // 6.66:1 on white — AA body text safe
  evLightBlue:  '#59B0C4',   // 2.49:1 on white — decorative / dark bg only
  evYellow:     '#FED12E',   // 1.46:1 on white — accent / dark bg only
  evYellowLight:'#FEF3C7',
  evYellowDark: '#D0A301',
  black:        '#1C1C1C',
  white:        '#FFFFFF',

  // Legacy aliases (deprecated — use evMutedBlue / evLightBlue instead)
  evTeal:      '#00657C',
  evTealDark:  '#003E4D',
  evTealLight: '#59B0C4',

  // Backgrounds
  bgLight: '#F0F8FA',
  bgWhite: '#FFFFFF',

  // Text
  textPrimary:   '#00657C',   // Muted Blue — 6.66:1 on white ✓ AA
  textSecondary: '#4A5568',   // ~6.0:1 on white ✓ AA
  textMuted:     '#718096',   // ~4.6:1 on white ✓ AA
  textWhite:     '#FFFFFF',

  // Borders
  borderLight:  '#E2EBEF',
  borderMedium: '#C9CFD1',

  // State
  error:        '#EF4444',
  errorLight:   '#FEF2F2',
  success:      '#22C55E',
  successLight: '#F0FDF4',
  warning:      '#F59E0B',
  warningLight: '#FFFBEB',
  info:         '#3A9BB0',
  infoLight:    '#F5F9FA',
};

// ──────────────────────────────────────────────
// AA-Safe Text Colors (per brand hue)
// Use these when a brand color must appear as readable text.
// Each passes WCAG AA (4.5:1+) on white and bgLight.
// ──────────────────────────────────────────────

export const accessibleText = {
  coral:    '#E61B00',   // coral-700,    4.64:1 on white
  teal:     '#00657C',   // teal-500 (brand muted blue), 6.66:1
  skyblue:  '#327E8F',   // skyblue-700,  4.65:1 on white
  yellow:   '#7B640E',   // yellow-900,   5.72:1 on white
};

// ──────────────────────────────────────────────
// Pillar Themes
// ──────────────────────────────────────────────

export const pillars = {
  inform:  {
    name: 'Inform', accent: 'yellow',
    color: '#FED12E', dark: '#D0A301', light: '#FAF9F5',
    textColor: '#7B640E', // AA-safe text — yellow-900
    darkMode: { color: '#FED12E', dark: '#FEE88A', textOnAccent: '#1C1C1C' },
  },
  empower: {
    name: 'Empower', accent: 'coral',
    color: '#FF5740', dark: '#E61B00', light: '#FAF6F5',
    textColor: '#E61B00', // AA-safe text — coral-700
    darkMode: { color: '#FF5740', dark: '#F66855', textOnAccent: '#FFFFFF' },
  },
  connect: {
    name: 'Connect', accent: 'teal',
    color: '#00657C', dark: '#003E4D', light: '#F5F9FA',
    textColor: '#00657C', // Already AA — muted blue
    darkMode: { color: '#3A9BB0', dark: '#59B0C4', textOnAccent: '#FFFFFF' },
  },
};

// ──────────────────────────────────────────────
// Semantic Tokens (Light / Dark)
// All text-on-background pairings verified AA (4.5:1+).
// ──────────────────────────────────────────────

export const semanticTokens = {
  light: {
    layerBase:   { background: '#F7F7F8', text: '#535964', icon: '#535964', border: '#D3D7DE' },  // 6.58:1
    layerOne:    { background: '#EBEDEF', text: '#41454E', icon: '#41454E', border: '#D3D7DE' },  // 7.23:1
    layerTwo:    { background: '#D3D7DE', text: '#2F3237', icon: '#2F3237', border: '#B3BBCC' },  // 7.60:1
    heading:     { text: '#2F3237' },  // 12.02:1 on gray-050
    divider:     '#D3D7DE',
    link:        { default: '#00657C', hovered: '#003E4D', focused: '#003E4D', pressed: '#003E4D' },
    input:       { background: '#F7F7F8', text: '#41454E', border: '#41454E', icon: '#6B7280' },  // text bumped from gray-500 to gray-700 for AA
    buttonPrimary: {
      background: { default: '#005366', hovered: '#003E4D', pressed: '#03303A', focused: '#005366', disabled: '#D3D7DE' },
      text:       { default: '#FFFFFF', disabled: '#8F9EBC' },
    },
    buttonSecondary: {
      background: { default: '#F7F7F8', hovered: '#EBEDEF', pressed: '#D3D7DE', focused: '#EBEDEF', disabled: '#F7F7F8' },
      text:       { default: '#003E4D', disabled: '#8F9EBC' },
      border:     { default: '#003E4D', disabled: '#D3D7DE' },
    },
    // Feedback states
    badge:   { background: '#EBEDEF', text: '#41454E', border: '#D3D7DE' },
    tooltip: { background: '#2F3237', text: '#EBEDEF' },
    overlay: 'rgba(19, 20, 22, 0.5)',
    skeleton: { from: '#EBEDEF', to: '#D3D7DE' },
  },
  dark: {
    layerBase:   { background: '#131416', text: '#B3BBCC', icon: '#B3BBCC', border: '#41454E' },  // 9.56:1 ✓ AAA
    layerOne:    { background: '#2F3237', text: '#D3D7DE', icon: '#D3D7DE', border: '#41454E' },  // 8.91:1 ✓ AAA
    layerTwo:    { background: '#41454E', text: '#EBEDEF', icon: '#EBEDEF', border: '#535964' },   // 8.18:1 ✓ AAA
    heading:     { text: '#EBEDEF' },  // 15.70:1 on layerBase ✓ AAA
    divider:     '#41454E',
    link:        { default: '#59B0C4', hovered: '#7FBECC', focused: '#7FBECC', pressed: '#3A9BB0' },  // 7.40:1 on layerBase ✓ AAA
    input:       { background: '#1E2024', text: '#D3D7DE', border: '#6B7280', icon: '#B3BBCC' },     // border bumped to gray-500 for 3.37:1 UI ✓
    buttonPrimary: {
      // Darkened from skyblue to teal for white-text AA compliance
      background: { default: '#005366', hovered: '#327E8F', pressed: '#003E4D', focused: '#005366', disabled: '#2F3237' },
      text:       { default: '#FFFFFF', disabled: '#535964' },  // 8.64:1 / 4.65:1 / 11.69:1 ✓ AA+
    },
    buttonSecondary: {
      background: { default: '#131416', hovered: '#2F3237', pressed: '#41454E', focused: '#2F3237', disabled: '#131416' },
      text:       { default: '#59B0C4', disabled: '#535964' },  // 7.40:1 ✓ AAA
      border:     { default: '#59B0C4', disabled: '#41454E' },
    },
    // Feedback states
    badge:   { background: '#41454E', text: '#EBEDEF', border: '#535964' },
    tooltip: { background: '#EBEDEF', text: '#2F3237' },
    overlay: 'rgba(19, 20, 22, 0.75)',
    skeleton: { from: '#2F3237', to: '#41454E' },
  },
};

// ──────────────────────────────────────────────
// Data Visualization Palette
// ──────────────────────────────────────────────

// 10 hues derived from the EV brand palette.
// Core 4 (teal, sky blue, coral, yellow) + 6 harmonious neighbors.
// Each has 5 shades: [100-light, 300, 400, base-500, 700-dark]
export const dataVizPalette = [
  { name: 'Teal',       base: '#00657C', shades: ['#C0E8F2', '#55D9F6', '#3AABB8', '#00657C', '#003E4D'] },
  { name: 'Sky Blue',   base: '#59B0C4', shades: ['#CDE0E5', '#A7CFD8', '#7FBECC', '#59B0C4', '#327E8F'] },
  { name: 'Ocean',      base: '#2563A0', shades: ['#CDDCED', '#7BADD4', '#4D8FC2', '#2563A0', '#193F68'] },
  { name: 'Coral',      base: '#FF5740', shades: ['#F6E6E4', '#F2988C', '#F66855', '#FF5740', '#B31D09'] },
  { name: 'Terracotta', base: '#C2674A', shades: ['#F0DCD4', '#D9A48E', '#CF8568', '#C2674A', '#7A3D2C'] },
  { name: 'Yellow',     base: '#FED12E', shades: ['#F6F2E4', '#F2DC8D', '#F5D356', '#FED12E', '#9F7F09'] },
  { name: 'Honey',      base: '#D4940B', shades: ['#F5EACE', '#E8C563', '#DCA930', '#D4940B', '#805A06'] },
  { name: 'Sage',       base: '#5A9A6E', shades: ['#D4E8DA', '#9ACBAA', '#74B589', '#5A9A6E', '#376043'] },
  { name: 'Dusk',       base: '#7C6B9E', shades: ['#E4DFF0', '#B5A8CF', '#9788B8', '#7C6B9E', '#4D4263'] },
  { name: 'Stone',      base: '#6B7280', shades: ['#EBEDEF', '#B3BBCC', '#8F9EBC', '#6B7280', '#41454E'] },
];

// ──────────────────────────────────────────────
// Typography
// ──────────────────────────────────────────────

export const fonts = {
  primary: "'Manrope', sans-serif",
  fallback: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const fontSizes = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
};

export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.05em',
};

// Composite text styles — combine size, weight, line-height, and letter-spacing
// into ready-to-spread objects for inline styles: style={{ ...textStyles.displayTitle }}
export const textStyles = {
  displayTitle:  { fontSize: '48px', fontWeight: 800, lineHeight: 1.1,  letterSpacing: '-0.03em' },
  displaySub:    { fontSize: '36px', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' },
  h1:            { fontSize: '30px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' },
  h2:            { fontSize: '24px', fontWeight: 700, lineHeight: 1.3,  letterSpacing: '-0.01em' },
  h3:            { fontSize: '20px', fontWeight: 600, lineHeight: 1.35, letterSpacing: '0' },
  h4:            { fontSize: '18px', fontWeight: 600, lineHeight: 1.4,  letterSpacing: '0' },
  bodyLg:        { fontSize: '18px', fontWeight: 400, lineHeight: 1.6,  letterSpacing: '0' },
  body:          { fontSize: '16px', fontWeight: 400, lineHeight: 1.5,  letterSpacing: '0' },
  bodySm:        { fontSize: '14px', fontWeight: 400, lineHeight: 1.5,  letterSpacing: '0' },
  label:         { fontSize: '14px', fontWeight: 500, lineHeight: 1.4,  letterSpacing: '0.01em' },
  labelSm:       { fontSize: '12px', fontWeight: 500, lineHeight: 1.4,  letterSpacing: '0.02em' },
  caption:       { fontSize: '12px', fontWeight: 400, lineHeight: 1.4,  letterSpacing: '0.01em' },
  overline:      { fontSize: '11px', fontWeight: 700, lineHeight: 1.4,  letterSpacing: '0.08em', textTransform: 'uppercase' },
};

// ──────────────────────────────────────────────
// Spacing (4px base unit)
// ──────────────────────────────────────────────

export const spacing = {
  0: '0',
  '050': '2px',
  1: '4px',
  '150': '6px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};

// ──────────────────────────────────────────────
// Border Radius
// ──────────────────────────────────────────────

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
};

// ──────────────────────────────────────────────
// Shadows & Elevation
// ──────────────────────────────────────────────

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 10px -4px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -6px rgba(0, 0, 0, 0.06)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glowCoral: '0 0 0 3px rgba(255, 87, 64, 0.25)',
  glowTeal:  '0 0 0 3px rgba(0, 101, 124, 0.2)',
  cardHover: '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
  none: 'none',
};

// ──────────────────────────────────────────────
// Motion
// ──────────────────────────────────────────────

export const duration = {
  instant: '50ms',
  fast:    '120ms',   // Micro-interactions: toggles, checkboxes
  normal:  '200ms',   // Buttons, inputs, small transitions
  slow:    '350ms',   // Panels, cards, modals
  slower:  '500ms',   // Page transitions, complex orchestration
};

export const easing = {
  default:    'cubic-bezier(0.2, 0, 0, 1)',       // General-purpose (Material 3 standard)
  enter:      'cubic-bezier(0, 0, 0.2, 1)',        // Elements appearing (decelerate)
  exit:       'cubic-bezier(0.4, 0, 1, 1)',        // Elements leaving (accelerate)
  spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful overshoot — buttons, badges
  linear:     'linear',
};

// ──────────────────────────────────────────────
// Focus Ring
// ──────────────────────────────────────────────

export const focus = {
  ring:      '0 0 0 2px #FFFFFF, 0 0 0 4px #00657C',  // White gap + brand muted blue (6.66:1 on white)
  ringDark:  '0 0 0 2px #131416, 0 0 0 4px #59B0C4',  // Dark gap + light blue (6.84:1 on dark)
  ringCoral: '0 0 0 2px #FFFFFF, 0 0 0 4px #FF5740',  // Coral variant for pillar contexts
  offset:    '2px',
};

// ──────────────────────────────────────────────
// Z-Index Scale
// ──────────────────────────────────────────────

export const zIndex = {
  hide:     -1,
  base:      0,
  dropdown: 10,
  sticky:   20,
  header:   30,
  overlay:  40,
  modal:    50,
  toast:    60,
  tooltip:  70,
};

// ──────────────────────────────────────────────
// Opacity
// ──────────────────────────────────────────────

export const opacity = {
  disabled: 0.4,
  muted:    0.6,
  subtle:   0.8,
  full:     1,
};

// ──────────────────────────────────────────────
// Breakpoints
// ──────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};
