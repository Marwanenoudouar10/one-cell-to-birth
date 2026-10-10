// C09 · Fetus (W10 -> W11 -> W12), 9.5 s, enters by focus pull from C08.
// "Week ten: every major organ is in place. The embryo becomes a fetus.
//  Week twelve: fingers, toes, a face."
// Reuses the teaser's Scene4 look (sac world, gold rings, face sweep) with the
// shared fetus kit at kit week 10.6 -> 12 inside the womb kit's mid look.
//   0.0-0.7  focus pull in on the curled week-10.6 fetus
//   1.3-2.6  six soft organ glows tick on (heart, brain, lungs, liver, kidneys, gut)
//   3.3-4.7  warm level-up band head -> toe, curl 0.7 -> 0.5, gold halo on "fetus"
//   4.9-5.8  cord + placenta fade in (upper-right wall), camera eases wide
//   6.8/7.4/8.0  fingers spread (ring), toes curl (ring), face sweep + lid glint
//   9.0-9.5  END: week-12 fetus in the sac (wide, settled) for C10
// Timing lives in beats.ts; every animated value in timeline.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  AmnioticSac,
  Camera,
  FluidSpecks,
  LightShafts,
  Placenta,
  WOMB_LOOKS,
  WombBackdrop,
  WombLayer,
} from "../../../shared/womb";
import { timeline } from "./timeline";
import { Baby } from "./Baby";
import { MembranePatch } from "./World";
import { ScreenFx } from "./ScreenFx";

const L = WOMB_LOOKS.mid;

export const C09: React.FC = () => {
  const f = useCurrentFrame();
  const t = timeline(f);
  return (
    <AbsoluteFill>
      <Camera zoom={t.zoom} x={t.camFocus.x} y={t.camFocus.y}>
        <WombBackdrop {...L.backdrop} />
        <AmnioticSac {...L.sac} r={t.sacR} seed="c09-sac">
          <LightShafts {...L.shafts} seed="c09-shafts" />
          <FluidSpecks seed="c09-far" />
          {t.placenta > 0.005 && <Placenta {...L.placenta} opacity={t.placenta} />}
          {t.placenta > 0.005 && t.placenta < 0.995 && (
            <MembranePatch at={L.placenta.at} spread={L.placenta.spread} opacity={1 - t.placenta} />
          )}
          <WombLayer blur={t.blur}>
            <Baby t={t} f={f} />
          </WombLayer>
          <FluidSpecks seed="c09-near" layer="near" count={10} />
        </AmnioticSac>
        <FluidSpecks layer="lens" count={5} seed="c09-lens" />
        <ScreenFx t={t} />
      </Camera>
    </AbsoluteFill>
  );
};
