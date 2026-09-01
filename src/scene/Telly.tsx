import { Html } from "@react-three/drei";
import { COLORS, FONT_CONDENSED } from "../art/tokens";

interface TellyProps {
  position: [number, number, number];
}

/**
 * Wall-mounted screen placeholder. No content yet — this becomes the
 * canvas-texture-driven live telly in Phase 1 (see docs/ARCHITECTURE.md).
 * Screens are emissive and unlit, and are the one place a cool colour
 * (crt) is allowed to appear.
 */
export function Telly({ position }: TellyProps) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[2.6, 1.5]} />
        <meshBasicMaterial color={COLORS.void} />
      </mesh>
      <Html center style={{ pointerEvents: "none" }}>
        <div
          style={{
            fontFamily: FONT_CONDENSED,
            color: COLORS.crt,
            opacity: 0.55,
            fontSize: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Coming soon
        </div>
      </Html>
    </group>
  );
}
