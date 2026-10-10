import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Camera, WOMB_LOOKS, WombBackdrop } from "../../../shared/womb";
import { LONG_START, LONG_TOTAL } from "../../chapters";
import { BackgroundLong } from "../../overlays/BackgroundLong";
import { C05_END, C05_HANDOFF } from "./beats";
import type { Cam } from "./camera";

// See C05_END in beats.ts for the numbers this redraws.
const L = WOMB_LOOKS.early;

// C05's world redrawn on C05's own clock (its frame C05_HANDOFF = our frame 0),
// under our camera. It gives way to Scene3's womb as the sac resolves: vis 1 -> 0.
export const C05World: React.FC<{ cam: Cam; vis: number }> = ({ cam, vis }) => (
  <AbsoluteFill style={{ opacity: C05_END.backdrop.opacity * vis }}>
    <Sequence from={-C05_HANDOFF} layout="none">
      <Camera zoom={cam.scale} x={cam.fx} y={cam.fy} rot={cam.rot} drift={0} seed="c05cam">
        <WombBackdrop
          {...L.backdrop}
          warmth={C05_END.backdrop.warmth}
          folds={C05_END.backdrop.folds}
          r={C05_END.backdrop.r}
          seed="c05wall"
        />
      </Camera>
    </Sequence>
  </AbsoluteFill>
);

// fade() keeps C05 opaque underneath while we fade in on top, so any translucent
// layer of C05's END (its 35% backdrop, caption shade, halos) would show through
// ours and vanish at the cut (measured: a -7/255 step over the whole art region
// at our frame 15). Painting the film's own background under our first frames
// makes the entry a true opaque crossfade. It is pixel-identical to the
// background the film draws below us, so dropping it after the overlap is invisible.
export const EntryBase: React.FC = () => (
  <Sequence from={-LONG_START.C06} layout="none">
    <BackgroundLong totalFrames={LONG_TOTAL} />
  </Sequence>
);
