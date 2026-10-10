import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HERO, HEIGHT, WIDTH } from "../../theme/layout";
import { SvgDefs } from "../../lib/SvgDefs";
import { Filters } from "./Filters";
import { fromFrame, frameCss, len, mul, toFrame } from "./geom";
import { buildBody } from "./rig";
import { IMPACT, timeline } from "./timeline";
import { Impact, membranePath, membraneR } from "./membrane";
import { Fetus } from "./Fetus";
import { Cord } from "./Cord";
import { SacBack, SacFront } from "./Sac";
import { Placenta, placentaInsertion } from "./Placenta";
import { Specks, WombFolds } from "./Womb";
import { FaceSweep, Ring, Sparkles } from "./Highlights";
import { KickFx } from "./KickFx";
import { camera } from "./camera";
import { Bokeh, Overlays } from "./Overlays";

// Scene 4 - "Week twelve: fingers, toes, a face. Week twenty: the first kick."
// A rigged week-12 fetus floats in its sac; the camera racks to the hand, the
// toes and the face, then the body springs to week-20 proportions while the
// camera pulls back, and a kick sends ripples through the sac and womb wall.

// Where the foot will strike the wall (same deterministic maths as the scene).
const IMPACT_ANGLE = (() => {
  const t = timeline(IMPACT + 1);
  const b = buildBody(t.pose);
  const far = b.foot.reach.map((q) => toFrame(t.fetus, q)).sort((p, q) => len(q) - len(p))[0];
  return Math.atan2(far.y, far.x);
})();

const CAP_FADE = [1170, 1290]; // screen y: kick FX fade out above the captions
const svgStyle: React.CSSProperties = { position: "absolute", left: 0, top: 0, overflow: "visible" };

export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const tl = timeline(f);
  const b = buildBody(tl.pose);
  const fr = tl.fetus;
  const { W, focus, spot: focusScreen } = camera(tl, b);
  const cam = (par: number) => {
    const z = Math.pow(tl.zoom, par);
    return `translate(${HERO.cx + tl.shake.x * par} ${HERO.cy + tl.shake.y * par}) scale(${z}) translate(${-focus.x * par} ${-focus.y * par})`;
  };

  // the living membrane: pushed by the foot, rings after the impact
  const R = tl.sacR;
  const reach = Math.max(...b.foot.reach.map((q) => len(W(q)))) + 22 * fr.s;
  const k: Impact = { angle: IMPACT_ANGLE, push: Math.max(0, reach - R), t: f - IMPACT };
  const sacD = membranePath(R, f, k);
  const at = mul({ x: Math.cos(IMPACT_ANGLE), y: Math.sin(IMPACT_ANGLE) }, membraneR(IMPACT_ANGLE, R, f, k));

  // cord runs from the belly to the placenta, expressed in fetus-local space
  const cordEnd = fromFrame(fr, placentaInsertion(R));
  const s = b.mHead;
  const flash = f >= IMPACT ? Math.exp(-(f - IMPACT) / 6) : 0;

  return (
    <AbsoluteFill>
      {/* far + near womb folds (parallax depth) */}
      <svg width={WIDTH} height={HEIGHT} style={svgStyle}>
        <SvgDefs />
        <Filters />
        <g transform={cam(0.45)}>
          <WombFolds R={R} f={f} layer={0} />
        </g>
        <g transform={cam(0.75)}>
          <WombFolds R={R} f={f} layer={1} />
        </g>
        <g transform={cam(1)}>
          <SacBack d={sacD} R={R} f={f} />
          <Placenta R={R} f={f} />
          <g transform={`translate(${-focus.x * 0.12} ${-focus.y * 0.12})`}>
            <Specks R={R} f={f} front={false} />
          </g>
        </g>
      </svg>

      {/* the fetus (focus pull on arrival) + gold highlights */}
      <svg width={WIDTH} height={HEIGHT} style={{ ...svgStyle, filter: tl.blur > 0.05 ? `blur(${tl.blur}px)` : undefined }}>
        <g transform={cam(1)}>
          <g transform={frameCss(fr)}>
            <Fetus
              b={b}
              translucency={tl.translucency}
              rim={0.75}
              bloom={tl.bloom}
              cord={<Cord from={b.belly} to={cordEnd} f={f} w={14 + 3 * s} />}
            />
            <Ring c={b.hand.center} r={50 + 14 * tl.m} p={tl.ringHand > 0 ? Math.min(1, tl.ringHand * 1.4) : 0} alpha={tl.ringHand} />
            <Sparkles pts={b.hand.tips} p={tl.ringHand} alpha={tl.ringHand} size={9} />
            <Ring c={b.foot.center} r={52 + 14 * tl.m} p={tl.ringFoot > 0 ? Math.min(1, tl.ringFoot * 1.4) : 0} alpha={tl.ringFoot} />
            <Sparkles pts={b.foot.toePts} p={tl.ringFoot} alpha={tl.ringFoot} size={8} />
            <FaceSweep profile={b.profile} head={b.head} eye={b.eye} p={tl.sweep} glow={tl.faceGlow} />
          </g>
        </g>
      </svg>

      {/* fluid specks in front, membrane edge, kick shockwaves */}
      <svg width={WIDTH} height={HEIGHT} style={svgStyle}>
        <defs>
          {/* screen-space fade so no kick ring ever crosses the caption zone */}
          <linearGradient id="s4-capFadeG" gradientUnits="userSpaceOnUse" x1={0} y1={CAP_FADE[0]} x2={0} y2={CAP_FADE[1]}>
            <stop offset={0} stopColor="white" />
            <stop offset={1} stopColor="black" />
          </linearGradient>
          <mask id="s4-capFade" maskUnits="userSpaceOnUse" x={-200} y={-200} width={WIDTH + 400} height={HEIGHT + 400}>
            <rect x={-200} y={-200} width={WIDTH + 400} height={HEIGHT + 400} fill="url(#s4-capFadeG)" />
          </mask>
        </defs>
        <g transform={cam(1)}>
          <g transform={`translate(${focus.x * 0.12} ${focus.y * 0.12})`}>
            <Specks R={R} f={f} front />
          </g>
          <SacFront d={sacD} R={R} flash={flash} />
        </g>
        <g mask="url(#s4-capFade)">
          <g transform={cam(1)}>
            <KickFx k={k} at={at} R={R} f={f} sacD={sacD} />
          </g>
        </g>
        <g transform={cam(1.5)}>
          <Bokeh f={f} />
        </g>
      </svg>

      <Overlays spot={focusScreen} spotAmt={tl.wSum} flash={flash} />
    </AbsoluteFill>
  );
};
