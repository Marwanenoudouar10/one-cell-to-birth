// The womb shot (0 .. ~6.1 s): C09's END world rebuilt with the same numbers (mid look,
// sac r 375, placenta at -38 deg, frozen wall, same seeds), running on C09's clock
// (a <Sequence from={-285}>) so the kit's drift, cord sway and specks continue it. The
// fetus grows 12 -> 17 wk under a silent X-ray, sucks its thumb, then the hand opens and
// the camera dives into one fingertip (handed to the macro shot).
import React from "react";
import { AbsoluteFill, Freeze, Sequence } from "remotion";
import { C } from "../../../../theme/colors";
import { Fetus } from "../../../../shared/fetus";
import {
  AmnioticSac, Camera, CordShape, FluidSpecks, LightShafts, Placenta, WOMB_LOOKS, WombBackdrop, WombLayer, WombLook,
  placentaPort,
} from "../../../../shared/womb";
import { C09_CLOCK } from "../beats";
import { WombTL } from "./timeline";
import { WombFx } from "./WombFx";
import { Xray } from "./Xray";

// C09's END look: mid with the sac at r 375
const L: WombLook = { ...WOMB_LOOKS.mid, sac: { ...WOMB_LOOKS.mid.sac, r: 375 } };
const PORT = placentaPort({ cx: L.sac.cx, cy: L.sac.cy, r: L.sac.r }, L.placenta.at, L.placenta.size);

// the sucks: a soft rose swell at the cheek, a warm touch where the thumb meets the lips
const Suck: React.FC<{ t: WombTL }> = ({ t }) => {
  const { a, r } = t;
  const k = r.suck;
  const hr = a.headRadius;
  const lips = { x: a.mouth.x * 0.7 + a.thumbTip.x * 0.3, y: a.mouth.y * 0.7 + a.thumbTip.y * 0.3 };
  if (r.contact < 0.003) return null;
  return (
    <g>
      <defs>
        <radialGradient id="c10-suck-cheek">
          <stop offset={0} stopColor={C.rose} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c10-suck-lips">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.55} />
          <stop offset={0.5} stopColor={C.peach} stopOpacity={0.25} />
          <stop offset={1} stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={a.cheek.x} cy={a.cheek.y} rx={hr * 0.3 * (1 + 0.14 * k)} ry={hr * 0.24 * (1 + 0.14 * k)}
        fill="url(#c10-suck-cheek)" opacity={r.contact * (0.2 + 0.8 * k)} />
      {/* small and tight on the contact: a wide one read as a breath puff in front of the face */}
      <circle cx={lips.x} cy={lips.y} r={hr * 0.15} fill="url(#c10-suck-lips)" opacity={r.contact * (0.3 + 0.3 * k)} style={{ mixBlendMode: "screen" }} />
    </g>
  );
};

export const WombShot: React.FC<{ t: WombTL }> = ({ t }) => {
  if (t.opacity <= 0.001) return null;
  const { r, a, cam } = t;
  const g = (fLocal: number) => fLocal + C09_CLOCK;
  const k = r.size / 470;
  return (
    // a constant filter (blur 0 -> 12 px on the dive) so blend isolation never toggles
    <AbsoluteFill style={{ opacity: t.opacity, filter: `blur(${t.blur.toFixed(2)}px)` }}>
      <Sequence from={-C09_CLOCK} layout="none">
        <Camera zoom={cam.zoom} x={cam.x} y={cam.y} drift={0.2} seed="c09cam">
          <AbsoluteFill>
            <Freeze frame={C09_CLOCK}>
              <WombBackdrop {...L.backdrop} breathe={0} opaque={false} seed="s3" />
            </Freeze>
          </AbsoluteFill>
          <AmnioticSac {...L.sac} seed="c09-sac">
            <LightShafts intensity={L.shafts.intensity} seed="c09-shafts" />
            <FluidSpecks seed="c09-far" />
            <Placenta {...L.placenta} opacity={1} />
            <WombLayer>
              <g transform={`translate(${r.at.x} ${r.at.y})`}>
                <Fetus
                  uid="c10"
                  week={r.week}
                  size={r.size}
                  pose={r.pose}
                  heartbeat={t.hb}
                  rim={0.75}
                  bloom={0}
                  cord={
                    <CordShape from={a.navel} to={{ x: PORT.x - r.at.x, y: PORT.y - r.at.y }} slack={0.85} side={1} twist={1}
                      pulse={0.5} bpm={155} width={14 * k + 1} sway={0.8} seed="c09-cord" frame={g(t.f)} />
                  }
                />
                <Xray week={r.week} size={r.size} pose={r.pose} amount={t.xray} oss={t.oss} scan={t.scan} />
                <Suck t={t} />
              </g>
            </WombLayer>
          </AmnioticSac>
          <FluidSpecks layer="lens" count={5} seed="c09-lens" />
          <WombFx t={t} />
        </Camera>
      </Sequence>
    </AbsoluteFill>
  );
};
