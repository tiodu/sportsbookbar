/**
 * Design tokens: color palette and type families.
 * Fonts are loaded via src/art/fonts.css (Google Fonts @import), which
 * must be imported once at the app root alongside these constants.
 */

export const COLORS = {
  background: "#0a0a0f",
  surface: "#16161f",
  surfaceRaised: "#20202b",
  border: "#2e2e3a",

  textPrimary: "#f5f5f7",
  textSecondary: "#9c9ca8",

  felt: "#0f3d2e",
  gold: "#d4af37",

  accent: "#e0263c",
  accentAlt: "#2b8ce6",

  success: "#2fbf71",
  warning: "#f2b705",
  danger: "#e0263c",
} as const;

export type ColorToken = keyof typeof COLORS;

/** Display / headline font: bold, condensed poster lettering. */
export const FONT_DISPLAY = "'Bevan', serif";

/** Body / UI font: neutral, highly legible sans. */
export const FONT_BODY = "'Karla', sans-serif";

/** Numerals, labels, scoreboards: tall condensed sans. */
export const FONT_CONDENSED = "'Barlow Condensed', sans-serif";

export const FONTS = {
  display: FONT_DISPLAY,
  body: FONT_BODY,
  condensed: FONT_CONDENSED,
} as const;

export type FontToken = keyof typeof FONTS;
