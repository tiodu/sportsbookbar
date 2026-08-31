import { Canvas } from "@react-three/fiber";

export function Scene() {
  return (
    <Canvas style={{ width: "100%", height: "100vh" }} camera={{ position: [0, 1.5, 5], fov: 50 }}>
      <color attach="background" args={["#0a0a0f"]} />
      <ambientLight intensity={0.5} />
    </Canvas>
  );
}
