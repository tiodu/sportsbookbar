import { create } from "zustand";
import { COLORS } from "../art/tokens";
import { mulberry32, pick } from "../sim/rng";

export interface FloorPoint {
  x: number;
  z: number;
}

// Colours a player blob may spawn as. Excludes lamp/barLamp/ambient (light-
// only tokens, never a surface colour), cream (reserved for the bartender
// blob), and the screen-only cool tokens (crt, arcade, alert).
const PLAYER_COLORS = [
  COLORS.gold,
  COLORS.shamrock,
  COLORS.brass,
  COLORS.mahogany,
  COLORS.oak,
  COLORS.stout,
] as const;

function randomPlayerColor(): string {
  // Cosmetic spawn variety, not sim state, so it doesn't need to be
  // reproducible the way a match does — seeded by the clock rather than a
  // fixed value. Still goes through src/sim/rng.ts, never Math.random(),
  // per CLAUDE.md non-negotiable #2.
  const rng = mulberry32(Date.now() ^ 0x9e3779b9);
  return pick(rng, PLAYER_COLORS);
}

interface PlayerState {
  color: string;
  position: FloorPoint;
  target: FloorPoint | null;
  setTarget: (target: FloorPoint) => void;
  setPosition: (position: FloorPoint) => void;
  arrive: () => void;
}

export const usePlayer = create<PlayerState>((set) => ({
  color: randomPlayerColor(),
  position: { x: 0, z: 4 },
  target: null,
  setTarget: (target) => set({ target }),
  setPosition: (position) => set({ position }),
  arrive: () => set({ target: null }),
}));
