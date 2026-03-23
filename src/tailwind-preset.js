/**
 * Empowered Vote Tailwind CSS Preset
 * Import in any app's tailwind config or CSS:
 *
 * Tailwind v4 (CSS):
 *   @import "@chrisandrewsedu/ev-ui/tailwind-preset";
 *
 * Tailwind v3 (config):
 *   presets: [require('@chrisandrewsedu/ev-ui/tailwind-preset')]
 */

import {
  colorScales, colors, fontSizes, fonts, spacing, borderRadius, breakpoints,
  shadows, duration, easing, zIndex, opacity,
} from './tokens.js';

// Flatten color scales for Tailwind: ev-coral-500, ev-teal-050, etc.
const flatColors = {};
for (const [hue, shades] of Object.entries(colorScales)) {
  for (const [step, value] of Object.entries(shades)) {
    flatColors[`ev-${hue}-${step}`] = value;
  }
}

export default {
  theme: {
    extend: {
      colors: {
        ...flatColors,
        'ev-coral': colors.evCoral,
        'ev-muted-blue': colors.evMutedBlue,
        'ev-light-blue': colors.evLightBlue,
        'ev-yellow': colors.evYellow,
        'ev-yellow-light': colors.evYellowLight,
        'ev-yellow-dark': colors.evYellowDark,
        // Legacy aliases
        'ev-teal': colors.evTeal,
        'ev-teal-dark': colors.evTealDark,
        'ev-black': colors.black,
        'ev-bg-light': colors.bgLight,
        // State colors
        'ev-error': colors.error,
        'ev-error-light': colors.errorLight,
        'ev-success': colors.success,
        'ev-success-light': colors.successLight,
        'ev-warning': colors.warning,
        'ev-warning-light': colors.warningLight,
        'ev-info': colors.info,
        'ev-info-light': colors.infoLight,
      },
      fontFamily: {
        manrope: [fonts.primary],
      },
      fontSize: fontSizes,
      spacing,
      borderRadius,
      screens: breakpoints,
      boxShadow: shadows,
      zIndex,
      opacity,
      transitionDuration: duration,
      transitionTimingFunction: easing,
      animation: {
        'fade-in':    'ev-fade-in 200ms cubic-bezier(0, 0, 0.2, 1)',
        'fade-out':   'ev-fade-out 150ms cubic-bezier(0.4, 0, 1, 1)',
        'slide-up':   'ev-slide-up 350ms cubic-bezier(0, 0, 0.2, 1)',
        'slide-down': 'ev-slide-down 350ms cubic-bezier(0, 0, 0.2, 1)',
        'scale-in':   'ev-scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'skeleton':   'ev-skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        'ev-fade-in':    { from: { opacity: '0' }, to: { opacity: '1' } },
        'ev-fade-out':   { from: { opacity: '1' }, to: { opacity: '0' } },
        'ev-slide-up':   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'ev-slide-down': { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'ev-scale-in':   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'ev-skeleton':   { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
      },
    },
  },
};
