import { COLORS } from "../art/tokens";

interface TableProps {
  position: [number, number];
}

const STOOL_COUNT = 3;
const STOOL_RADIUS = 0.85;
const WOOD = { roughness: 0.85, metalness: 0.05 } as const;

export function Table({ position: [x, z] }: TableProps) {
  return (
    <group position={[x, 0, z]}>
      {/* pedestal */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.7, 12]} />
        <meshStandardMaterial color={COLORS.stout} {...WOOD} />
      </mesh>
      {/* tabletop */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 24]} />
        <meshStandardMaterial color={COLORS.mahogany} {...WOOD} />
      </mesh>
      {Array.from({ length: STOOL_COUNT }, (_, i) => {
        const angle = (i / STOOL_COUNT) * Math.PI * 2;
        const sx = Math.cos(angle) * STOOL_RADIUS;
        const sz = Math.sin(angle) * STOOL_RADIUS;
        return (
          <group key={i} position={[sx, 0, sz]}>
            <mesh castShadow position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.44, 8]} />
              <meshStandardMaterial color={COLORS.stout} {...WOOD} />
            </mesh>
            <mesh castShadow position={[0, 0.46, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
              <meshStandardMaterial color={COLORS.mahogany} {...WOOD} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
