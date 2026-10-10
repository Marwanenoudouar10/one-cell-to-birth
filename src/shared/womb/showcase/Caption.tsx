// Showcase-only stand-in caption in the house style (to judge CaptionShade).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { DISPLAY } from "../../../theme/fonts";
import { CAPTION_Y } from "../../../theme/layout";
import { EASE, tween } from "../../../lib/ease";

export const Caption: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const f = useCurrentFrame();
  const p = tween(f, at, at + 12, [0, 1], EASE.out);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: CAPTION_Y,
          left: 90,
          right: 90,
          transform: `translateY(calc(-50% + ${(1 - p) * 26}px))`,
          opacity: p,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1.12,
          letterSpacing: -1.5,
          textWrap: "balance",
          color: C.text,
          textShadow: "0 6px 30px rgba(0,0,0,0.55)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
