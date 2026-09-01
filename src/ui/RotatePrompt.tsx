import type { CSSProperties } from "react";
import { COLORS, FONT_BODY } from "../art/tokens";
import { useOrientation } from "./useOrientation";

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 24,
  padding: 24,
  background: COLORS.background,
  color: COLORS.textPrimary,
  fontFamily: FONT_BODY,
  textAlign: "center",
};

const copyStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
};

/**
 * Full-screen block on a portrait viewport. Sits on top of the scene and UI,
 * so it also intercepts pointer events from reaching them. See
 * docs/RESPONSIVE.md.
 */
export function RotatePrompt() {
  const orientation = useOrientation();

  if (orientation !== "portrait") {
    return null;
  }

  return (
    <div style={overlayStyle} role="alert" aria-live="assertive">
      <RotateIcon />
      <p style={copyStyle}>Turn your phone sideways to play.</p>
    </div>
  );
}

function RotateIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="8"
        width="24"
        height="40"
        rx="4"
        stroke={COLORS.textPrimary}
        strokeWidth="3"
      />
      <path
        d="M46 40a18 18 0 1 1 -6 -26"
        stroke={COLORS.gold}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M40 10l6 4l-4 6"
        stroke={COLORS.gold}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
