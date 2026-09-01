import { useFrame } from "@react-three/fiber";
import { Avatar } from "./Avatar";
import { usePlayer } from "../store/usePlayer";

const MOVE_SPEED = 3; // world units per second

/**
 * The player blob. Position and movement target live in
 * src/store/usePlayer.ts, not local component state, so other views can
 * read them later. Moves in a straight line toward `target` when set.
 */
export function Player() {
  const color = usePlayer((s) => s.color);
  const position = usePlayer((s) => s.position);
  const target = usePlayer((s) => s.target);
  const setPosition = usePlayer((s) => s.setPosition);
  const arrive = usePlayer((s) => s.arrive);

  useFrame((_, delta) => {
    if (!target) return;

    const dx = target.x - position.x;
    const dz = target.z - position.z;
    const dist = Math.hypot(dx, dz);
    const step = MOVE_SPEED * delta;

    if (dist <= step) {
      setPosition(target);
      arrive();
    } else {
      setPosition({
        x: position.x + (dx / dist) * step,
        z: position.z + (dz / dist) * step,
      });
    }
  });

  return (
    <group position={[position.x, 0, position.z]}>
      <Avatar color={color} isMoving={target !== null} />
    </group>
  );
}
