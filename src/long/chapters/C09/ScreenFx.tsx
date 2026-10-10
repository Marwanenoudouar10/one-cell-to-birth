// Screen-space finishing for C09 (ignores the camera): a soft spotlight that
// follows whatever the narration names (the organs, then hand, toes, face),
// a calm band under the week tracker on push-ins, and a faint warm lift
// while the level-up glow passes. The kit's <CaptionShade> keeps captions calm.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../../theme/colors";
import { CaptionShade } from "../../../shared/womb";
import { TL } from "./timeline";

export const ScreenFx: React.FC<{ t: TL }> = ({ t }) => {
  const push = Math.max(0, Math.min(1, (t.zoom - 1.02) / 0.25));
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.55 * t.spotAmt,
          background: `radial-gradient(circle at ${t.spot.x}px ${t.spot.y}px, transparent 0px, transparent 170px, ${C.bg0}99 540px, ${C.bg0}dd 940px)`,
        }}
      />
      <AbsoluteFill style={{ pointerEvents: "none", background: C.gold, opacity: 0.045 * t.bandA + 0.05 * t.halo, mixBlendMode: "screen" }} />
      <CaptionShade strength={1} top={0.85 * push} />
    </>
  );
};
