import { usePlayer } from "../store/usePlayer";
import { COLORS } from "../art/tokens";
import { Table } from "./Table";
import { Telly } from "./Telly";
import { Bartender } from "./Bartender";
import { Patron } from "./Patron";
import { CasinoMachine } from "./CasinoMachine";
import { Player } from "./Player";

const WOOD = { roughness: 0.85, metalness: 0.05 } as const;
const BRASS = { roughness: 0.35, metalness: 0.7 } as const;

// Temporary until wired to real match state in Phase 1. Placeholder
// pub-voice flavour lines only — not tied to any actual bet, odds or
// match yet.
const PATRON_LINES: readonly (readonly string[])[] = [
  [
    "Grand stretch in the evenings.",
    "This stool's got my name on it. Not literally. Yet.",
    "I'll have what he's regretting.",
  ],
  [
    "Quiet one tonight.",
    "Careful with that door, it bites.",
    "I've been coming here since it was somewhere else.",
  ],
  [
    "Is the big screen working yet?",
    "I'll just have the one. Historically inaccurate, but I'll have the one.",
    "Whoever's playing, I hope it's soon.",
  ],
];

const PATRON_COLORS = [COLORS.gold, COLORS.shamrock, COLORS.brass] as const;

const TABLE_POSITIONS: [number, number][] = [
  [-4, 1.5],
  [-1, 4],
  [3, 3.5],
];

/** The room. Floor, walls, counter, tables, screen placeholder, door,
 * cabinet — plus everyone standing in it. */
export function Bar() {
  const setTarget = usePlayer((s) => s.setTarget);

  return (
    <group>
      {/* Floor — click or tap to walk there */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          setTarget({ x: event.point.x, z: event.point.z });
        }}
      >
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color={COLORS.oak} {...WOOD} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -6]} receiveShadow>
        <planeGeometry args={[16, 4]} />
        <meshStandardMaterial color={COLORS.plaster} {...WOOD} />
      </mesh>

      {/* Side wall */}
      <mesh position={[-8, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color={COLORS.plaster} {...WOOD} />
      </mesh>

      {/* Skirting */}
      <mesh position={[0, 0.075, -5.95]}>
        <boxGeometry args={[16, 0.15, 0.05]} />
        <meshStandardMaterial color={COLORS.stout} {...WOOD} />
      </mesh>
      <mesh position={[-7.95, 0.075, 0]}>
        <boxGeometry args={[0.05, 0.15, 12]} />
        <meshStandardMaterial color={COLORS.stout} {...WOOD} />
      </mesh>

      {/* Bar counter, with a brass foot rail */}
      <group position={[4.5, 0, -4.2]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[5, 1, 0.8]} />
          <meshStandardMaterial color={COLORS.mahogany} {...WOOD} />
        </mesh>
        {/* counter top — glossier than the rest of the wood, per the
            "nothing is glossy except brass and the counter top" rule */}
        <mesh castShadow position={[0, 1.04, 0]}>
          <boxGeometry args={[5.3, 0.08, 1]} />
          <meshStandardMaterial color={COLORS.mahogany} roughness={0.25} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.15, 0.35]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 5, 8]} />
          <meshStandardMaterial color={COLORS.brass} {...BRASS} />
        </mesh>
      </group>

      {/* Toilets door */}
      <group position={[-6, 1.1, -5.92]}>
        <mesh castShadow>
          <boxGeometry args={[1, 2.2, 0.08]} />
          <meshStandardMaterial color={COLORS.mahogany} {...WOOD} />
        </mesh>
        <mesh position={[0.35, 0, 0.06]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={COLORS.brass} {...BRASS} />
        </mesh>
      </group>

      {/* Casino machine stand-in */}
      <CasinoMachine position={[-7.2, 0, -5]} />

      {/* Wall-mounted screen placeholder */}
      <Telly position={[4.5, 2.6, -5.85]} />

      {/* Tables */}
      {TABLE_POSITIONS.map((pos, i) => (
        <Table key={i} position={pos} />
      ))}

      {/* NPCs */}
      <Bartender basePosition={[4.5, -5.5]} />
      {TABLE_POSITIONS.map((pos, i) => (
        // i ranges over TABLE_POSITIONS, which is the same length as
        // PATRON_COLORS and PATRON_LINES, so both indices are always in range.
        <Patron
          key={i}
          basePosition={pos}
          color={PATRON_COLORS[i]!}
          phase={i * 2.1}
          lines={PATRON_LINES[i]!}
        />
      ))}

      {/* Player */}
      <Player />
    </group>
  );
}
