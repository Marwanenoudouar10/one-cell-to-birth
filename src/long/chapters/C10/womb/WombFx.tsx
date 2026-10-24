// Screen-space finishing for the womb shot (ignores the camera), continuing C09's END:
//   spotlight  womb-rose MULTIPLY round what the narration names: C09's face spotlight
//              fading out under the fade, then the mouth + hand for the thumb (non-focal
//              skin dims ~40%; a dark normal overlay would grey the skin)
//   top shade  same-hue multiply under the week tracker, tied to the crown in the close-up
//   captions   kit CaptionShade 1 (tracker band 0.5) + a 0.5 multiply, as C09 hands over
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../../../theme/colors";
import { CaptionShade } from "../../../../shared/womb";
import { WombTL } from "./timeline";

const px = (n: number) => `${n.toFixed(0)}px`;

export const WombFx: React.FC<{ t: WombTL }> = ({ t }) => {
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
      <CaptionShade strength={1} top={0.5 * (1 - 0.6 * Math.min(1, top))} />
      <CaptionShade strength={0.5} mode="multiply" />
    </>
  );
};
