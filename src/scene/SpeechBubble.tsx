import { COLORS, FONT_BODY } from "../art/tokens";

export function SpeechBubble({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        color: COLORS.cream,
        background: COLORS.stout,
        border: `1px solid ${COLORS.brass}`,
        borderRadius: 6,
        padding: "4px 8px",
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}
