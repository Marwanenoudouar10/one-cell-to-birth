import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { CaptionShade } from "../../../shared/womb";
import { CellLayer } from "./CellLayer";
import { Granules } from "./Handoff";
import { HandoffSpecks, handOp } from "./HandoffSpecks";
import { HeroNuclei } from "./HeroNuclei";
import { ClusterGlow, CoreFill, Motes } from "./Atmos";
import { TubeWalls } from "./TubeWalls";
import { Trace, traceHead } from "./Trace";
import { Zona } from "./Zona";
import { buildPrims } from "./prims";
import { CX, CY, breathAt, driftAt, exitOp, stretchAt, stretchXf, tiltAt, unStretch, wallsOp, warmth } from "./timeline";

// C03 "Split without growing" (W02). One cell becomes two, four, eight, a
// quick sixteen; a hold proves the zona ring has not grown; the cascade ends
// in a mulberry-like morula of much smaller cells. The tube's cilia carry the
// cluster along in the background. The hero never changes on-screen size
// (no camera push: that would read as growth).
// START = C02 END: sculpted zygote at (540, 860), core r150 stretched 6% along
// x, zona r175.5, granules, two pronuclei pressed together, gold glow.
// END = the 64-cell morula inside the same-size zona at (540, 860).
// Back to front: tube walls (far) · motes · glow · cells · nuclei · zona ·
// trace · motes (near) · tube walls (near) · caption shade.
export const C03: React.FC = () => {
  const f = useCurrentFrame();
  const { prims, hero } = buildPrims(f);
  const br = breathAt(f);
  const el = stretchAt(f);
  const tl = tiltAt(f);
  const d = driftAt(f);
  const ex = exitOp(f);
  const head = traceHead(f);
  const mo = (wallsOp(f) * 0.6 + 0.4 * (1 - handOp(f))) * ex;
  return (
    <AbsoluteFill>
      <HandoffSpecks f={f} near={false} />
      <TubeWalls f={f} near={false} />
      <AbsoluteFill>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Motes f={f} near={false} op={mo} />
          <g transform={`translate(${(CX + d.x).toFixed(2)} ${(CY + d.y).toFixed(2)}) scale(${br.toFixed(5)})`}>
            <g opacity={ex}>
              <ClusterGlow />
            </g>
            <g transform={stretchXf(f)}>
              <CoreFill f={f} />
              <CellLayer prims={prims} warm={warmth(f)} un={unStretch(f)} />
            </g>
            <Granules f={f} el={el} tilt={tl} />
            <HeroNuclei f={f} hero={hero} el={el} tilt={tl} />
            <Zona glint={head.glint} glintAng={head.ang} exit={ex} />
          </g>
          <g transform={`translate(${(CX + d.x).toFixed(2)} ${(CY + d.y).toFixed(2)})`}>
            <Trace f={f} />
          </g>
          <Motes f={f} near op={mo} />
        </svg>
      </AbsoluteFill>
      <TubeWalls f={f} near />
      <HandoffSpecks f={f} near />
      <CaptionShade strength={0.7} />
    </AbsoluteFill>
  );
};
