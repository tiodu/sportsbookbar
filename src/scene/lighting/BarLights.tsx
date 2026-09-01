import { COLORS } from "../../art/tokens";

// The art-direction skill's intensities (main 1.05, bar lamp 0.9, snug 0.85,
// screen spill 0.55, ambient 0.95) are the documented ratios between the
// lights, explicitly called "the baseline, tuned in scene" in that skill.
// three.js (since we're on a version with no legacy-lighting toggle) treats
// light intensity as physical units — candela for a point light, falling
// off with distance-squared — so those baseline numbers, taken literally,
// read as near-black once actually placed in a room with these dimensions.
// This is that in-scene tuning: same colours, positions and ratios, scaled
// up so the room is actually visible.
const POINT_LIGHT_SCALE = 150;
const AMBIENT_INTENSITY = 3;

/**
 * The lighting rig: three warm point lights plus one cool screen-spill
 * light, at the positions and colours specified in
 * .claude/skills/art-direction/SKILL.md. Only the main pendant casts a
 * shadow — one shadow caster only, for budget.
 */
export function BarLights() {
  return (
    <>
      <ambientLight color={COLORS.ambient} intensity={AMBIENT_INTENSITY} />

      {/* Main pendant */}
      <pointLight
        color={COLORS.lamp}
        position={[0, 5.5, 1.5]}
        intensity={1.05 * POINT_LIGHT_SCALE}
        distance={30}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Bar lamp */}
      <pointLight
        color={COLORS.barLamp}
        position={[-5.5, 3.9, -1.5]}
        intensity={0.9 * POINT_LIGHT_SCALE}
        distance={12}
      />

      {/* Snug lamp */}
      <pointLight
        color={COLORS.lamp}
        position={[4, 3.9, 1]}
        intensity={0.85 * POINT_LIGHT_SCALE}
        distance={12}
      />

      {/* Screen spill */}
      <pointLight
        color={COLORS.crt}
        position={[1.5, 2.8, -5.3]}
        intensity={0.55 * POINT_LIGHT_SCALE}
        distance={9}
      />
    </>
  );
}
