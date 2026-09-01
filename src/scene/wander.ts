export interface WanderConfig {
  radius: number;
  speed: number;
  phase: number;
}

/**
 * Deterministic idle wander: a small Lissajous drift around a base
 * position, driven by elapsed clock time rather than any RNG — this
 * checkpoint doesn't need randomness for NPC motion, per CLAUDE.md
 * non-negotiable #2 (all randomness goes through src/sim/rng.ts).
 * `phase` desyncs multiple NPCs so they don't move in lockstep.
 */
export function wanderOffset(
  elapsed: number,
  { radius, speed, phase }: WanderConfig,
): [number, number] {
  const t = elapsed * speed + phase;
  const x = Math.cos(t * 0.7) * radius;
  const z = Math.sin(t) * radius;
  return [x, z];
}
