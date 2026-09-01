import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Extra breathing room beyond the room's exact bounding box, so Html
// overlays anchored near its edges (chat bubbles, the telly's "coming
// soon" label) don't clip even though they aren't part of the geometry
// the box is computed from.
const FIT_MARGIN = 1.15;

// Sanity bounds around the computed fit, not requirements of their own.
// MIN_ZOOM stops the room from being zoomed out into illegibility (the
// telly has to stay readable per the demo script) on a pathological
// aspect ratio; MAX_ZOOM stops it from looking absurdly zoomed-in on a
// tiny bounding box or huge canvas. Neither should bind for realistic
// laptop or phone aspect ratios — the fit itself handles those.
const MIN_ZOOM = 25;
const MAX_ZOOM = 120;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface CameraFitProps {
  /** Ref to the group containing the room's fixed content — floor,
   * walls, counter, tables, screen. NPCs and the player are
   * deliberately excluded: they move, and shouldn't perturb the fit. */
  contentRef: RefObject<THREE.Group>;
}

/**
 * Fits the fixed orthographic camera's frustum to the room's static
 * content, so nothing is ever cropped regardless of viewport aspect
 * ratio. The content's extent is measured once, in the camera's own
 * fixed right/up axes (so it accounts for the isometric angle exactly,
 * not just a naive world-space width/height); only the zoom is
 * recomputed on resize, reusing r3f's existing resize handling via
 * useThree's reactive size rather than a new resize listener.
 */
export function CameraFit({ contentRef }: CameraFitProps) {
  const camera = useThree((state) => state.camera) as THREE.OrthographicCamera;
  const size = useThree((state) => state.size);
  const requiredWorldSize = useRef<{ width: number; height: number } | null>(null);

  // Measure the room once: project the 8 corners of its bounding box
  // into camera space (right = local x, up = local y for a camera with
  // no roll) and take the largest extent on each axis. That's exactly
  // the orthographic half-width/half-height needed to contain it.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    content.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const viewMatrix = camera.matrixWorld.clone().invert();

    const box = new THREE.Box3().setFromObject(content);
    const corner = new THREE.Vector3();
    let maxAbsX = 0;
    let maxAbsY = 0;

    for (let i = 0; i < 8; i++) {
      corner
        .set(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        )
        .applyMatrix4(viewMatrix);
      maxAbsX = Math.max(maxAbsX, Math.abs(corner.x));
      maxAbsY = Math.max(maxAbsY, Math.abs(corner.y));
    }

    requiredWorldSize.current = {
      width: maxAbsX * 2 * FIT_MARGIN,
      height: maxAbsY * 2 * FIT_MARGIN,
    };
  }, [camera, contentRef]);

  // Re-fit the zoom on every resize, reusing the cached measurement above.
  useLayoutEffect(() => {
    const required = requiredWorldSize.current;
    if (!required) return;

    // The tighter of the two per-axis fits wins, so both dimensions are
    // guaranteed to fit — the other axis just gets slack (letterboxing).
    const fitZoomX = size.width / required.width;
    const fitZoomY = size.height / required.height;
    camera.zoom = clamp(Math.min(fitZoomX, fitZoomY), MIN_ZOOM, MAX_ZOOM);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}
