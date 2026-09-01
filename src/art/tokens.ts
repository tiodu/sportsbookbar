/**
 * Design tokens: color palette and type families.
 * Generated from .claude/skills/art-direction/SKILL.md — that file is the
 * source of truth. Changing a value here means updating that skill in the
 * same commit. No colour or font enters the codebase that isn't declared
 * here first (see CLAUDE.md non-negotiable #4).
 *
 * Fonts are loaded via src/art/fonts.css (Google Fonts @import), which
 * must be imported once at the app root alongside these constants.
 */

export const COLORS = {
  // Warm side — architecture, furniture, characters, signage. 90% of what
  // you see. Straight from the art-direction palette table.
  void: "#0D0906", // background, fog, outside the room
  stout: "#17100B", // deepest wood, trim, skirting
  oak: "#2F1C10", // floor
  mahogany: "#3B2418", // counter, tables, doors
  brass: "#B3803F", // foot rail, taps, fittings, hardware
  lamp: "#FFB35C", // point light colour. Never a surface colour.
  cream: "#F5E9D6", // body text, pint heads, bartender blob
  shamrock: "#1D4D33", // rug, pub sign field. Used sparingly.
  gold: "#E9C46A", // signage lettering, headings, win states

  // Cool side — screens only. cool colours never touch wood.
  crt: "#35E0D6", // telly glow, neon trim, live indicators, odds
  arcade: "#D63BFF", // the casino machine, and nothing else
  alert: "#E07050", // errors, insufficient balance

  // Added per the room's needs, following the art-direction skill's
  // "Lighting rig" section (values given there, not in the Palette table)
  // and filling one genuine gap: the palette table assigns no colour to
  // walls, only to floor/counter/trim.
  barLamp: "#FF9D3D", // the bar lamp's point light colour. Never a surface colour.
  ambient: "#59422B", // ambient light colour
  plaster: "#4F3A28", // wall plaster. Warm and muted, between mahogany and brass.
} as const;

export type ColorToken = keyof typeof COLORS;

/** Display / headline font: pub signage, headings. Large sizes only, never below 20px. */
export const FONT_DISPLAY = "'Bevan', serif";

/** Body / UI font: bet slip, buttons, NPC dialogue. */
export const FONT_BODY = "'Karla', sans-serif";

/** Data font: scoreboards, timers, odds, league table. Broadcast condensed. */
export const FONT_CONDENSED = "'Barlow Condensed', sans-serif";

export const FONTS = {
  display: FONT_DISPLAY,
  body: FONT_BODY,
  condensed: FONT_CONDENSED,
} as const;

export type FontToken = keyof typeof FONTS;
