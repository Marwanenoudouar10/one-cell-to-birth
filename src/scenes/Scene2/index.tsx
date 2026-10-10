import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../../theme/layout";
import { tween } from "../../lib/ease";
import { smooth } from "./geometry";
import { CellLayer } from "./CellLayer";
import { Zona } from "./Zona";
import { ContactGlow, Invasion, TissueBack, TissueDefs, TissueFront, TissueNear } from "./Tissue";
import { Bloom, CaptionShade, Cavity, ClusterGlow, CoreFill, Specks, WarmWash } from "./Atmos";
import { EggLight, ZygoteMatch } from "./Handoff";
import {
  BLASTO_R, CX, CY, HATCH, TISSUE_Y, blastoY, breathAt, camera, contact, reveal, ringRadius, wrap,
} from "./timeline";

// Scene2 — "One cell becomes two… four… hundreds."
// Zygote -> cleavage (2, 4, 8 ... 64) -> morula -> blastocyst -> hatching ->
// camera cranes down to the womb wall -> implantation in a warm rose glow.
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const { camY, s } = camera(f);
  const by = blastoY(f);
  const camEnd = camera(10_000).camY;
  // One breath for cell and shell, in phase with Scene1's last frames.
  const breath = breathAt(f);
  const zonaY = f < HATCH.crack ? by : blastoY(HATCH.crack);
  const zonaBreath = breathAt(Math.min(f, HATCH.crack));
  const rv = reveal(f);
  const w = { t: wrap(f), R: BLASTO_R, bx: CX };
  const c = contact(f);
  const byLocal = by - TISSUE_Y;
  // Parallax of the wall's depth layers relative to the main tissue plane.
  const farDy = (camY - camEnd) * (1 - 0.72);
  const nearDy = (camY - camEnd) * (1 - 1.35);
  const showTissue = rv > 0.005;
  const tissueOp = smooth(rv * 3);
  // Vertical motion blur on the wall while the camera cranes down fast.
  const vel = Math.abs(camera(f + 0.5).camY - camera(f - 0.5).camY);
  const mb = Math.min(10, vel * 0.22);
  const blur = mb > 0.4 ? "url(#s2-mblur)" : undefined;

  return (
    <AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <TissueDefs />
        <defs>
          <filter id="s2-mblur" x="-2%" y="-10%" width="104%" height="120%">
            <feGaussianBlur stdDeviation={`0 ${mb.toFixed(2)}`} />
          </filter>
        </defs>
        <g transform={`translate(${CX} ${CY}) scale(${s.toFixed(5)}) translate(${-CX} ${(-camY).toFixed(2)})`}>
          <Specks f={f} camY={camY} near={false} />
          {showTissue && (
            <g transform={`translate(0 ${TISSUE_Y})`} opacity={tissueOp} filter={blur}>
              <TissueBack f={f} w={w} heat={c} farDy={farDy} farOp={smooth((rv - 0.35) / 0.5)} />
            </g>
          )}
          <g transform={`translate(${CX} ${by.toFixed(2)}) scale(${breath.toFixed(5)})`}>
            <EggLight f={f} />
            <g opacity={tween(f, 10, 44)}>
              <ClusterGlow f={f} />
            </g>
            <Bloom f={f} />
            <CoreFill f={f} />
            <Cavity f={f} />
            <CellLayer f={f} />
            <ZygoteMatch f={f} />
          </g>
          <g transform={`translate(${CX} ${zonaY.toFixed(2)}) scale(${zonaBreath.toFixed(5)})`}>
            <Zona f={f} />
          </g>
          {showTissue && (
            <g transform={`translate(0 ${TISSUE_Y})`} opacity={tissueOp} filter={blur}>
              <TissueFront f={f} w={w} heat={c} by={byLocal} op={0.8} clipR={ringRadius(f) + 9} />
            </g>
          )}
          {/* Screen-blended light stays outside the motion-blur filter: a filter
              isolates its group, which would switch the blend on and off. */}
          {showTissue && (
            <g transform={`translate(0 ${TISSUE_Y})`} opacity={tissueOp}>
              <Invasion g={smooth((w.t - 0.15) / 0.85)} by={byLocal} R={BLASTO_R} f={f} />
              <ContactGlow f={f} c={c} w={w} />
            </g>
          )}
          {showTissue && (
            <g transform={`translate(0 ${TISSUE_Y})`} opacity={tissueOp} filter={blur}>
              <TissueNear f={f} dy={nearDy} op={rv} />
            </g>
          )}
          <Specks f={f} camY={camY} near />
        </g>
        <WarmWash f={f} />
        <CaptionShade o={smooth(rv * 2.4)} />
      </svg>
    </AbsoluteFill>
  );
};
