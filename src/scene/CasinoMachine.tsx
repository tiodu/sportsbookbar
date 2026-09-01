import { COLORS } from "../art/tokens";

interface CasinoMachineProps {
  position: [number, number, number];
}

/**
 * Placeholder cabinet standing in for the casino machine. The real machine
 * — and its arcade-purple identity ("the casino machine, and nothing
 * else", per the art-direction skill) — is parked (see
 * docs/PARKING-LIST.md), so this stays a plain wooden cabinet for now.
 */
export function CasinoMachine({ position }: CasinoMachineProps) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 1.1, 0.6]} />
        <meshStandardMaterial color={COLORS.stout} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.55, 0.31]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={COLORS.brass} roughness={0.35} metalness={0.7} />
      </mesh>
    </group>
  );
}
