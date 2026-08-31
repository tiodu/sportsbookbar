/**
 * Seeded PRNG for src/sim/. This module is the ONLY source of randomness
 * allowed in the simulation layer — Math.random() is banned (see CLAUDE.md
 * and eslint.config.js). Deterministic seeding makes sim runs reproducible
 * and testable.
 */

export type Rng = () => number;

/**
 * mulberry32: a fast, small, seeded 32-bit PRNG.
 * Returns a function that yields floats in [0, 1), same contract as Math.random().
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;

  return function rng(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns an integer in [min, max] (inclusive) using the given rng. */
export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Returns a float in [min, max) using the given rng. */
export function randFloat(rng: Rng, min: number, max: number): number {
  return rng() * (max - min) + min;
}

/** Picks a random element from a non-empty array using the given rng. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("pick: items must not be empty");
  }
  const index = randInt(rng, 0, items.length - 1);
  return items[index] as T;
}
