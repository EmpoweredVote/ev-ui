#!/usr/bin/env node

/**
 * Sync EV design tokens to Penpot via MCP
 *
 * Reads tokens.js and pushes color scales, typography, spacing,
 * and theme tokens to the Penpot design system file.
 *
 * Usage: node scripts/sync-penpot-tokens.js
 *
 * Prerequisites:
 *   - Penpot MCP server running (cd penpot/mcp && pnpm run start)
 *   - Plugin connected in Penpot browser tab
 *   - Design system file open in Penpot
 *
 * This script is also invoked by the /sync-design-tokens Claude Code skill.
 */

import {
  colorScales,
  colors,
  accessibleText,
  pillars,
  dataVizPalette,
  fonts,
  fontWeights,
  fontSizes,
  spacing,
  borderRadius,
  letterSpacing,
} from '../src/tokens.js';

// ──────────────────────────────────────────────
// Generate Penpot MCP code payloads
// ──────────────────────────────────────────────

function generateFoundationColorsCode() {
  const lines = [];
  lines.push(`const catalog = penpot.library.local.tokens;`);
  lines.push(`let set = catalog.sets.find(s => s.name === "EV - Foundation Colors");`);
  lines.push(`if (!set) set = catalog.addSet({ name: "EV - Foundation Colors" });`);
  lines.push(`// Clear existing tokens`);
  lines.push(`for (const t of [...set.tokens]) { /* can't remove, just overwrite */ }`);
  lines.push(``);

  // Black and white
  lines.push(`set.addToken({ type: "color", name: "black", value: "${colors.black}" });`);
  lines.push(`set.addToken({ type: "color", name: "white", value: "${colors.white}" });`);

  // Color scales
  for (const [hue, shades] of Object.entries(colorScales)) {
    for (const [step, value] of Object.entries(shades)) {
      lines.push(`set.addToken({ type: "color", name: "${hue}.${step}", value: "${value}" });`);
    }
  }

  lines.push(`return { set: set.name, tokens: set.tokens.length };`);
  return lines.join('\n');
}

function generateThemeCode(themeName, accentHue) {
  const lines = [];
  lines.push(`const catalog = penpot.library.local.tokens;`);
  lines.push(`let set = catalog.sets.find(s => s.name === "${themeName}");`);
  lines.push(`if (!set) set = catalog.addSet({ name: "${themeName}" });`);

  const steps = ['050','100','200','300','400','500','600','700','800','900','950'];
  for (const step of steps) {
    lines.push(`set.addToken({ type: "color", name: "accent.${step}", value: "{${accentHue}.${step}}" });`);
  }
  for (const step of steps) {
    lines.push(`set.addToken({ type: "color", name: "neutral.${step}", value: "{gray.${step}}" });`);
  }

  lines.push(`return { set: set.name, tokens: set.tokens.length };`);
  return lines.join('\n');
}

function generateTypographyCode() {
  const lines = [];
  lines.push(`const catalog = penpot.library.local.tokens;`);
  lines.push(`let set = catalog.sets.find(s => s.name === "EV - Typography");`);
  lines.push(`if (!set) set = catalog.addSet({ name: "EV - Typography" });`);

  // Font sizes
  const sizeMap = {
    'display.title': '48', 'display.subtitle': '36',
    'heading.level-one': '30', 'heading.level-two': '24', 'heading.level-three': '20',
    'body.large': '18', 'body': '16', 'label': '14', 'caption': '12',
  };
  for (const [name, value] of Object.entries(sizeMap)) {
    lines.push(`set.addToken({ type: "fontSizes", name: "${name}", value: "${value}" });`);
  }

  // Font families
  lines.push(`set.addToken({ type: "fontFamilies", name: "primary", value: "Manrope" });`);

  // Font weights
  for (const [name, value] of Object.entries(fontWeights)) {
    lines.push(`set.addToken({ type: "fontWeights", name: "${name}", value: "${value}" });`);
  }

  // Letter spacing
  for (const [name, value] of Object.entries(letterSpacing)) {
    lines.push(`set.addToken({ type: "letterSpacing", name: "${name}", value: "${value}" });`);
  }

  lines.push(`return { set: set.name, tokens: set.tokens.length };`);
  return lines.join('\n');
}

function generateScalesCode() {
  const lines = [];
  lines.push(`const catalog = penpot.library.local.tokens;`);
  lines.push(`let set = catalog.sets.find(s => s.name === "EV - Scales");`);
  lines.push(`if (!set) set = catalog.addSet({ name: "EV - Scales" });`);

  // Spacing
  const spaceMap = {
    'space.none': '0', 'space.050': '2', 'space.100': '4', 'space.150': '6',
    'space.200': '8', 'space.300': '12', 'space.400': '16', 'space.500': '20',
    'space.600': '24', 'space.800': '32', 'space.1000': '40', 'space.1200': '48',
    'space.1600': '64',
  };
  for (const [name, value] of Object.entries(spaceMap)) {
    lines.push(`set.addToken({ type: "spacing", name: "${name}", value: "${value}" });`);
  }

  // Border radius
  for (const [name, value] of Object.entries(borderRadius)) {
    const px = value.replace('px', '');
    lines.push(`set.addToken({ type: "borderRadius", name: "radius.${name}", value: "${px}" });`);
  }

  // Breakpoints
  const bpMap = { sm: '640', md: '768', lg: '1024', xl: '1280' };
  for (const [name, value] of Object.entries(bpMap)) {
    lines.push(`set.addToken({ type: "sizing", name: "breakpoint.${name}", value: "${value}" });`);
  }

  lines.push(`return { set: set.name, tokens: set.tokens.length };`);
  return lines.join('\n');
}

function generateLibraryColorsCode() {
  const lines = [];
  lines.push(`const lib = penpot.library.local;`);
  lines.push(`const existing = lib.colors.map(c => c.name);`);

  const brandColors = [
    ['EV / Coral', colors.evCoral], ['EV / Coral Dark', '#E61B00'],
    ['EV / Muted Blue', colors.evMutedBlue], ['EV / Muted Blue Dark', colors.evTealDark],
    ['EV / Light Blue', colors.evLightBlue], ['EV / Yellow', colors.evYellow],
    ['EV / Yellow Dark', colors.evYellowDark], ['EV / Black', colors.black],
    ['EV / White', colors.white], ['EV / Background Light', colors.bgLight],
  ];

  for (const [name, hex] of brandColors) {
    lines.push(`if (!existing.includes("${name}")) { const c = lib.createColor(); c.name = "${name}"; c.color = "${hex}"; }`);
  }

  lines.push(`return { libraryColors: lib.colors.length };`);
  return lines.join('\n');
}

// ──────────────────────────────────────────────
// Output all payloads as JSON for the sync skill
// ──────────────────────────────────────────────

const syncPayloads = {
  foundationColors: generateFoundationColorsCode(),
  themeDefault: generateThemeCode('EV Theme - Default', 'teal'),
  themeEmpower: generateThemeCode('EV Theme - Empower', 'coral'),
  themeInform: generateThemeCode('EV Theme - Inform', 'yellow'),
  themeConnect: generateThemeCode('EV Theme - Connect', 'skyblue'),
  typography: generateTypographyCode(),
  scales: generateScalesCode(),
  libraryColors: generateLibraryColorsCode(),
};

// Write payloads to stdout as JSON
console.log(JSON.stringify(syncPayloads, null, 2));
