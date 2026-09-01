import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Avatar } from "./Avatar";
import { SpeechBubble } from "./SpeechBubble";
import { COLORS } from "../art/tokens";
import { wanderOffset } from "./wander";

// Temporary until wired to real match state in Phase 1. Placeholder
// pub-voice flavour lines only — not tied to any actual bet, odds or
// match yet. Not Mossy yet either; that's a Phase 1 identity concern
// once betting exists.
const BARTENDER_LINES = [
  "Same again, is it.",
  "We'll have the telly sorted by kick-off. Allegedly.",
  "Mind the step, it's been that way since before me.",
];

const LINE_DURATION_S = 6;

interface BartenderProps {
  basePosition: [number, number];
}

export function Bartender({ basePosition }: BartenderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [lineIndex, setLineIndex] = useState(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    const [ox, oz] = wanderOffset(state.clock.elapsedTime, {
      radius: 0.18,
      speed: 0.5,
      phase: 0,
    });
    groupRef.current.position.set(basePosition[0] + ox, 0, basePosition[1] + oz);

    const cycle = Math.floor(state.clock.elapsedTime / LINE_DURATION_S) % BARTENDER_LINES.length;
    if (cycle !== lineIndex) setLineIndex(cycle);
  });

  return (
    <group ref={groupRef}>
      <Avatar color={COLORS.cream} isMoving />
      <Html center position={[0, 1.1, 0]} style={{ pointerEvents: "none" }}>
        {/* lineIndex is `cycle % BARTENDER_LINES.length`, always in range */}
        <SpeechBubble text={BARTENDER_LINES[lineIndex]!} />
      </Html>
    </group>
  );
}
