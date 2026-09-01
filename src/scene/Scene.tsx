import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import type * as THREE from "three";
import { COLORS } from "../art/tokens";
import { BarLights } from "./lighting/BarLights";
import { Bar } from "./Bar";
import { CameraFit } from "./CameraFit";

// Classic isometric position: equal offsets on X/Y/Z look at the origin
// from ~35.264° above horizontal, at a 45° turn — the standard isometric
// angle. No rotation, no zoom in v1, per the art-direction skill. The
// zoom given here is just the pre-fit starting value; CameraFit
// overrides it as soon as the room's bounding box is measured.
const CAMERA_POSITION: [number, number, number] = [10, 10, 10];
const INITIAL_ZOOM = 60;

/**
 * Fixed orthographic isometric camera. Canvas's `orthographic` mode
 * creates and maintains the default camera's frustum from the canvas's
 * pixel size automatically, and CameraFit rides that same reactive
 * sizing to keep the room's zoom fit to the viewport on every resize.
 */
export function Scene() {
  const fixedContentRef = useRef<THREE.Group>(null);

  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: CAMERA_POSITION, zoom: INITIAL_ZOOM, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      style={{ width: "100%", height: "100vh" }}
    >
      <color attach="background" args={[COLORS.void]} />
      <fog attach="fog" args={[COLORS.void, 15, 32]} />
      <BarLights />
      <Bar ref={fixedContentRef} />
      <CameraFit contentRef={fixedContentRef} />
    </Canvas>
  );
}
