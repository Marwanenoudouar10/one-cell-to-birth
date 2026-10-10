// The womb shot (0 .. ~7 s): the C09 world (mid look, placenta upper right),
// the fetus growing 13 -> 17 wk, the silent X-ray, the thumb-suck, then a
// push toward one fingertip that hands over to the macro shot.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../../theme/colors";
import { heartbeat } from "../../../../lib/ease";
import { Fetus } from "../../../../shared/fetus";
import {
  AmnioticSac, Camera, CaptionShade, CordShape, FluidSpecks, LightShafts, Placenta, WOMB_LOOKS,
  WombBackdrop, WombLayer, placentaPort,
} from "../../../../shared/womb";
import { sub } from "../geom";
import { SAC_AT, WombTL } from "./timeline";
import { Xray } from "./Xray";

const L = WOMB_LOOKS.mid;

// soft rhythmic cheek pulse while it sucks (subtle: a warm glow + tiny swell)
const Cheek: React.FC<{ at: { x: number; y: number }; r: number; k: number }> = ({ at, r, k }) =>
  k < 0.01 ? null : (
    <g>
      <defs>
        <radialGradient id="c10-cheek">
          <stop offset={0} stopColor={C.rose} stopOpacity={0.55} />
          <stop offset={1} stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={at.x} cy={at.y} rx={r * (1 + 0.16 * k)} ry={r * 0.8 * (1 + 0.16 * k)} fill="url(#c10-cheek)" opacity={0.15 + 0.85 * k} />
    </g>
  );

export const WombShot: React.FC<{ t: WombTL }> = ({ t }) => {
  const f = useCurrentFrame();
  if (t.opacity <= 0.001) return null;
  const sac = { cx: SAC_AT.x, cy: SAC_AT.y, r: t.sacR, aspect: L.sac.aspect, pear: L.sac.pear };
  const port = placentaPort(sac, L.placenta.at, L.placenta.size);
  const hb = heartbeat(f, 150);
  const a = t.a;
  return (
    <AbsoluteFill style={{ opacity: t.opacity, filter: t.blur > 0.05 ? `blur(${t.blur.toFixed(2)}px)` : undefined }}>
      <Camera zoom={t.zoom} x={t.look.x} y={t.look.y} seed="c10-cam">
        <WombBackdrop {...L.backdrop} r={t.sacR + 40} seed="c10-bd" />
        <AmnioticSac {...L.sac} r={t.sacR} seed="c10-sac">
          <LightShafts {...L.shafts} seed="c10-shafts" />
          <FluidSpecks seed="c10-far" />
          <Placenta {...L.placenta} />
          <WombLayer>
            <g transform={`translate(${t.at.x.toFixed(2)} ${t.at.y.toFixed(2)})`}>
              <Fetus
                uid="c10"
                week={t.week}
                size={t.size}
                pose={t.pose}
                heartbeat={hb * 0.6}
                cord={
                  <CordShape
                    from={a.navel} to={sub(port, t.at)} slack={0.5} side={1} twist={1} pulse={0.5} bpm={150}
                    width={L.cordWidth} sway={1} seed="c10-cord" frame={f}
                  />
                }
              />
              <Xray week={t.week} size={t.size} pose={t.pose} amount={t.xray} oss={t.oss} scan={t.scan} />
              <Cheek at={a.cheek} r={a.headRadius * 0.24} k={t.suck} />
            </g>
          </WombLayer>
          <FluidSpecks seed="c10-near" layer="near" count={10} />
        </AmnioticSac>
        <FluidSpecks layer="lens" count={5} seed="c10-lens" />
        <CaptionShade top={0.75} />
      </Camera>
    </AbsoluteFill>
  );
};
