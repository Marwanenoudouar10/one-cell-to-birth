// <CaptionShade />: screen-space (ignores the camera) soft dark band that
// keeps the caption zone y 1300-1560 calm behind white captions, plus an
// optional band under the week tracker (y 100-240). Put it LAST inside
// <Camera> (or anywhere after your art).
//   strength  0..1 caption band (default 1)
//   top       0..1 tracker band (default 0; use ~0.8 when a push-in brings
//             the sac rim / placenta up under the tracker)
//   mode      "dark"     (default) bg0 gradient: for the normal dark womb
//             "multiply" warm womb-rose multiplied in: for BRIGHT shots
//                        (glowing warm sac, birth light) - darkens the light
//                        without turning into a grey or brown slab
//   from, to  caption band screen y (default 1300, 1560)
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../theme/colors";

export type CaptionShadeProps = { strength?: number; top?: number; mode?: "dark" | "multiply"; from?: number; to?: number };

const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

export const CaptionShade: React.FC<CaptionShadeProps> = ({ strength = 1, top = 0, mode = "dark", from = 1300, to = 1560 }) => {
  const mid = (from + to) / 2;
  const half = (to - from) / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {strength > 0.01 && mode === "dark" && (
        <AbsoluteFill
          style={{
            opacity: strength,
            background: `linear-gradient(180deg, transparent 0px, transparent ${from - 150}px, ${C.bg0}${hex(0.5)} ${from + 20}px, ${C.bg0}${hex(0.6)} ${mid}px, ${C.bg0}${hex(0.5)} ${to - 20}px, transparent ${to + 200}px)`,
          }}
        />
      )}
      {strength > 0.01 && mode === "multiply" && (
        <AbsoluteFill
          style={{
            opacity: strength,
            mixBlendMode: "multiply",
            background: `radial-gradient(ellipse 760px ${half + 60}px at 540px ${mid}px, ${C.womb} 0%, ${C.womb}cc 45%, ${C.womb}00 100%)`,
          }}
        />
      )}
      {top > 0.01 && (
        <AbsoluteFill
          style={{
            opacity: top,
            background: `linear-gradient(180deg, ${C.bg0}aa 0px, ${C.bg0}88 210px, transparent 340px)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
