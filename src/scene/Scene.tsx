import { Canvas } from "@react-three/fiber";
import { COLORS } from "../art/tokens";
import { BarLights } from "./lighting/BarLights";
import { Bar } from "./Bar";

// Classic isometric position: equal offsets on X/Y/Z look at the origin
// from ~35.264° above horizontal, at a 45° turn — the standard isometric
// angle. No rotation, no zoom in v1, per the art-direction skill.
const CAMERA_POSITION: [number, number, number] = [10, 10, 10];
const CAMERA_ZOOM = 60;

/**
 * Fixed orthographic isometric camera. Canvas's `orthographic` mode
 * creates and maintains the default camera's frustum from the canvas's
 * pixel size automatically, so this reuses r3f's existing resize
 * handling rather than adding a new one.
 */
export function Scene() {
  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: CAMERA_POSITION, zoom: CAMERA_ZOOM, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      style={{ width: "100%", height: "100vh" }}
    >
      <color attach="background" args={[COLORS.void]} />
      <fog attach="fog" args={[COLORS.void, 15, 32]} />
      <BarLights />
      <Bar />
    </Canvas>
  );
}
