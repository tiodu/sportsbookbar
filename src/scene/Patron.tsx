import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Avatar } from "./Avatar";
import { SpeechBubble } from "./SpeechBubble";
import { wanderOffset } from "./wander";

const LINE_DURATION_S = 7;

interface PatronProps {
  basePosition: [number, number];
  color: string;
  /** Desyncs this patron's wander and line-cycling from the others. */
  phase: number;
  lines: readonly string[];
}

export function Patron({ basePosition, color, phase, lines }: PatronProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [lineIndex, setLineIndex] = useState(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const [ox, oz] = wanderOffset(state.clock.elapsedTime, {
      radius: 0.4,
      speed: 0.35,
      phase,
    });
    groupRef.current.position.set(basePosition[0] + ox, 0, basePosition[1] + oz);

    const cycle =
      Math.floor((state.clock.elapsedTime + phase * 3) / LINE_DURATION_S) % lines.length;
    if (cycle !== lineIndex) setLineIndex(cycle);
  });

  return (
    <group ref={groupRef}>
      <Avatar color={color} isMoving />
      <Html center position={[0, 1.1, 0]} style={{ pointerEvents: "none" }}>
        {/* lineIndex is `cycle % lines.length`, always in range */}
        <SpeechBubble text={lines[lineIndex]!} />
      </Html>
    </group>
  );
}
