// Screen-space finishing for C09 (ignores the camera):
//   spotlight  womb-rose MULTIPLY round whatever the narration names (hand, foot, face),
//              so non-focal skin dims ~40% (rule 13: a dark normal overlay greys skin)
//   top shade  the close-ups crop the head under the week tracker (y 100-290): a long
//              same-hue multiply tied to the camera zoom (as C08 hands it over)
//   warm lift  a faint gold screen while the level-up band and halo pass
//   captions   the kit's <CaptionShade> keeps y 1300-1560 calm
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../../theme/colors";
import { CaptionShade } from "../../../shared/womb";
import { TL } from "./timeline";

const px = (n: number) => `${n.toFixed(0)}px`;

export const ScreenFx: React.FC<{ t: TL }> = ({ t }) => {
  const { spot, spotR, spotAmt, top } = t;
  return (
    <>
      {spotAmt > 0.003 && (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            opacity: Math.min(1, spotAmt),
            mixBlendMode: "multiply",
            background: `radial-gradient(circle at ${px(spot.x)} ${px(spot.y)}, ${C.wombDeep}00 0px, ${C.wombDeep}00 ${px(spotR * 1.15)}, ${C.wombDeep}70 ${px(spotR * 2.6)}, ${C.wombDeep}a0 ${px(spotR * 4.2)})`,
          }}
        />
      )}
      {top > 0.003 && (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            opacity: Math.min(1, top),
            mixBlendMode: "multiply",
            background: `linear-gradient(180deg, ${C.wombDeep}f0 0px, ${C.wombDeep}e6 170px, ${C.wombDeep}cc 240px, ${C.wombDeep}a0 300px, ${C.wombDeep}6c 360px, ${C.wombDeep}3a 420px, ${C.wombDeep}14 480px, ${C.wombDeep}00 540px)`,
          }}
        />
      )}
      <AbsoluteFill style={{ pointerEvents: "none", background: C.gold, opacity: 0.04 * t.bandA + 0.05 * t.halo, mixBlendMode: "screen" }} />
      {/* C08's hand-over: tracker band 0.5 * (1 - 0.6 * headShade) */}
      <CaptionShade strength={1} top={0.5 * (1 - 0.6 * Math.min(1, top))} />
      {t.capMul > 0.003 && <CaptionShade strength={t.capMul} mode="multiply" />}
    </>
  );
};
