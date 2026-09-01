import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../art/tokens";

export interface AvatarProps {
  color: string;
  /** Squashes and stretches while true, per the art-direction motion rules. */
  isMoving?: boolean;
}

// Not covered by the art-direction skill's material section (that only
// specifies architecture: wood and brass), so a plain matte default.
const BODY_ROUGHNESS = 0.6;
const BODY_METALNESS = 0;

/**
 * A blob avatar: rounded capsule body, stub arms and feet, simple eyes.
 * Reusable for the player and every NPC — pass a colour and go.
 */
export function Avatar({ color, isMoving = false }: AvatarProps) {
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!bodyRef.current) return;
    if (isMoving) {
      const t = state.clock.elapsedTime * 9;
      const squash = 1 + Math.sin(t) * 0.08;
      const inverse = 1 / Math.sqrt(squash);
      bodyRef.current.scale.set(inverse, squash, inverse);
    } else {
      bodyRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    }
  });

  return (
    <group>
      <group ref={bodyRef} position={[0, 0.45, 0]}>
        {/* body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.32, 0.35, 4, 12]} />
          <meshStandardMaterial
            color={color}
            roughness={BODY_ROUGHNESS}
            metalness={BODY_METALNESS}
          />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.12, 0.15, 0.3]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={COLORS.void} roughness={0.4} />
        </mesh>
        <mesh position={[0.12, 0.15, 0.3]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={COLORS.void} roughness={0.4} />
        </mesh>
        {/* stub arms */}
        <mesh position={[-0.38, -0.05, 0]} rotation={[0, 0, Math.PI / 10]}>
          <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
          <meshStandardMaterial
            color={color}
            roughness={BODY_ROUGHNESS}
            metalness={BODY_METALNESS}
          />
        </mesh>
        <mesh position={[0.38, -0.05, 0]} rotation={[0, 0, -Math.PI / 10]}>
          <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
          <meshStandardMaterial
            color={color}
            roughness={BODY_ROUGHNESS}
            metalness={BODY_METALNESS}
          />
        </mesh>
      </group>
      {/* stub feet, outside the squash/stretch group so they stay planted */}
      <mesh position={[-0.14, 0.08, 0.05]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={BODY_ROUGHNESS}
          metalness={BODY_METALNESS}
        />
      </mesh>
      <mesh position={[0.14, 0.08, 0.05]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={BODY_ROUGHNESS}
          metalness={BODY_METALNESS}
        />
      </mesh>
    </group>
  );
}
