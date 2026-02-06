/**
 * Empowered Vote Design Tokens
 * Shared color palette, typography, and spacing values
 */

export const colors = {
  // Primary brand colors
  evTeal: '#00657c',
  evTealDark: '#004d5c',
  evTealLight: '#59b0c4',
  evCoral: '#ff5740',
  evYellow: '#fed12e',
  evYellowLight: '#fef3c7',
  evYellowDark: '#eab308',

  // Background colors
  bgLight: '#f0f8fa',
  bgWhite: '#ffffff',

  // Text colors
  textPrimary: '#00657c',
  textSecondary: '#4a5568',
  textMuted: '#718096',
  textWhite: '#ffffff',

  // Border colors
  borderLight: '#e2ebef',
  borderMedium: '#c9cfd1',

  // State colors
  error: '#ef4444',
  success: '#22c55e',
};

export const fonts = {
  primary: "'Manrope', sans-serif",
  fallback: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
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

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '-8px -8px 40px 0px rgba(144, 144, 144, 0.1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};
