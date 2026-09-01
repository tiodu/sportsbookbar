import { useEffect, useState } from "react";

export type Orientation = "portrait" | "landscape";

function readOrientation(): Orientation {
  if (typeof window === "undefined") {
    return "landscape";
  }
  return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
}

/**
 * Tracks viewport orientation via a media query, with a resize listener as a
 * fallback for browsers/WebViews that don't fire the media query's change
 * event reliably. See docs/RESPONSIVE.md.
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(readOrientation);

  useEffect(() => {
    const update = () => setOrientation(readOrientation());
    update();

    const mediaQuery = window.matchMedia("(orientation: portrait)");
    mediaQuery.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return orientation;
}
