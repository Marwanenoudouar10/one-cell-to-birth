// Copied from src/scenes/Scene5/womb/BirthLight.tsx (CaptionScrim): a wide warm
// multiply shadow behind the caption lines for the bright, warm grip shot.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../../../theme/colors";

export const CaptionScrim: React.FC<{ strength: number }> = ({ strength }) => {
  if (strength <= 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: strength,
        mixBlendMode: "multiply",
        background: [
          `radial-gradient(ellipse 600px 190px at 540px 1430px, ${C.wombDeep}5c 0%, ${C.wombDeep}40 50%, ${C.wombDeep}00 100%)`,
          `radial-gradient(ellipse 940px 360px at 540px 1430px, ${C.womb} 0%, ${C.womb}f2 36%, ${C.womb}b3 60%, ${C.womb}4d 80%, ${C.womb}00 100%)`,
        ].join(", "),
      }}
    />
  );
};
