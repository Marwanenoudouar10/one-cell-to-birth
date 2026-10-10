import React from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { DESIGN, centreOf } from "./anchors";
import { Body, buildBody } from "./body";
import { project } from "./centreline";
import { Defs } from "./Defs";
import { Face, headTransform } from "./Face";
import { Heart } from "./Heart";
import { Limb } from "./Limb";
import { Neural } from "./Neural";
import { Cells } from "./Cells";
import { Pt, add, ramp } from "./math";
import { Blob, HEAD_FEATURES } from "./rig";
import { defaultZip, stageFor } from "./stage";

export type EmbryoProps = {
  week: number; // 3 .. 8.99, continuous
  size?: number; // px, ~ figure height (default 280)
  zip?: number; // neural tube closure 0..1 (default follows the week)
  heartBeat?: number; // beat pulse 0..1 (first beat may go to ~1.7), e.g. heartbeatPulse()
  heartGlow?: number; // slower glow envelope 0..1 (default 0.8 * heartBeat)
  heartLit?: number; // 0 dormant heart .. 1 lit (default 1)
  hold?: number; // Scene3's anticipation squeeze before the first beat (default 0)
  x?: number; // placement of the visual centre (default 0, 0)
  y?: number;
  rotate?: number; // deg, applied to the geometry so the top-left light stays fixed
  alive?: number; // 0 still .. 1 organic wobble (default 1)
  frame?: number; // wobble clock (default useCurrentFrame())
  id?: string; // unique suffix when several embryos share one <svg>
};

const LIGHT = { x: -30, y: -56 }; // Scene3 skin-light centre (local coords)
const C6 = centreOf(6);

const Ell: React.FC<{ b: Blob; fill: string; opacity?: number }> = ({ b, fill, opacity }) => (
  <ellipse rx={b.rx} ry={b.ry} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`} fill={fill} opacity={opacity} />
);

// Silhouette = swept tube + round prominences. `part` picks what to include:
// "all" (clip, halo, single-colour body), "belly" (ventral organs + full sweep),
// "top" (top-face sweep + head) for the layered disc stages.
const Union: React.FC<{ b: Body; fill: string; part?: "all" | "belly" | "top" }> = ({ b, fill, part = "all" }) => (
  <>
    <path d={part === "top" ? b.layers[3] : b.outline} fill={fill} />
    {part !== "top" && b.belly.map((e, i) => <Ell key={`v${i}`} b={e} fill={fill} />)}
    {part !== "belly" && b.blobs.map((e, i) => <Ell key={i} b={e} fill={fill} />)}
  </>
);

export const Embryo: React.FC<EmbryoProps> = (p) => {
  const now = useCurrentFrame();
  const frame = p.frame ?? now;
  const rotate = p.rotate ?? 0;
  const st = stageFor(p.week, rotate);
  const uid = p.id ? `emb-${p.id}` : "emb";
  const b = buildBody(st, frame, p.alive ?? 1, uid);
  const ctr = centreOf(p.week, rotate);
  const k = (p.size ?? DESIGN) / DESIGN;
  const zip = p.zip ?? defaultZip(p.week);
  const pulse = p.heartBeat ?? 0;
  const glow = p.heartGlow ?? 0.8 * Math.min(1, pulse);
  const ignite = p.heartLit ?? 1;
  const hold = p.hold ?? 0;
  const v = (q: Pt) => project(q, 0, st);
  const heart = v(b.rig.heart);
  const light = add(ctr, { x: LIGHT.x - C6.x, y: LIGHT.y - C6.y });
  const cardiac = b.rig.cardiac;
  const cd = v(cardiac);
  const germ = st.germ;
  const head = v(b.rig.head.c);
  const paddle = ramp(st.week, 6, 7);
  const back = ramp(st.tilt, 16, 34);
  const place = `translate(${p.x ?? 0} ${p.y ?? 0}) scale(${k}) translate(${-ctr.x} ${-ctr.y})`;
  const limbAt = (l: { root: Pt; dir: number }) => {
    const r = v(l.root);
    return `translate(${r.x} ${r.y}) rotate(${l.dir + st.spin})`;
  };
  return (
    <g transform={place}>
      <Defs uid={uid} light={light} heart={heart} germ={germ} pulse={pulse} ignite={ignite} hold={hold} clip={<Union b={b} fill="#fff" />} />
      {/* translucent glow the body throws into the fluid */}
      <g filter={`url(#${uid}-halo)`} opacity={(0.42 + 0.4 * glow) * (1 - 0.45 * germ)}>
        <Union b={b} fill={interpolateColors(germ, [0, 1], [C.peach, C.cellCyan])} />
      </g>
      <g filter={`url(#${uid}-rimfx)`}>
        {germ > 0.001 ? (
          <>
            <Union b={b} fill={`url(#${uid}-endo)`} part="belly" />
            <path d={b.layers[1]} fill={`url(#${uid}-meso)`} />
            <path d={b.layers[2]} fill={`url(#${uid}-ecto)`} />
            <Union b={b} fill={`url(#${uid}-skin)`} part="top" />
          </>
        ) : (
          <Union b={b} fill={`url(#${uid}-skin)`} />
        )}
        <g clipPath={`url(#${uid}-body)`}>
          {st.vesicles > 0.01 && (
            <g transform={headTransform(b.rig, head, st.spin)} opacity={st.vesicles / 0.55}>
              {HEAD_FEATURES.vesicles.map((e, i) => (
                <Ell key={i} b={e} fill={`url(#${uid}-soft)`} opacity={0.55} />
              ))}
            </g>
          )}
          <path d={b.spine} fill="none" stroke={C.skin} strokeOpacity={0.35 * ramp(st.week, 4.5, 5)} strokeWidth={5} strokeLinecap="round" />
          <Cells b={b} uid={uid} />
          <Neural b={b} zip={zip} uid={uid} />
          <g opacity={st.somiteVis}>
            {b.somites.map((s, i) => (
              <Ell key={i} b={s} fill={`url(#${uid}-somite)`} opacity={s.o * (s.row < 0 ? back : 1)} />
            ))}
          </g>
          {st.liver > 0.01 && (
            <Ell b={{ ...v(b.rig.liver), rot: b.rig.liver.rot + st.spin, rx: b.rig.liver.rx * 0.8, ry: b.rig.liver.ry * 0.75 }} fill={C.womb} opacity={0.22} />
          )}
          {st.heart > 0.01 && (
            <g opacity={st.heart}>
              {/* each beat lights the body from the heart outward */}
              <circle
                cx={heart.x}
                cy={heart.y}
                r={190}
                fill={`url(#${uid}-spill)`}
                opacity={Math.min(0.85, 0.1 * ignite + 0.55 * glow)}
                style={{ mixBlendMode: "screen" }}
              />
              <g transform={`translate(${heart.x} ${heart.y}) scale(${st.bulge}) translate(${-heart.x} ${-heart.y})`}>
                <Heart p={heart} pulse={pulse} ignite={ignite} hold={hold} uid={uid} rot={cardiac.rot + st.spin} />
              </g>
            </g>
          )}
        </g>
        {st.bulge > 0.05 && (
          <ellipse
            cx={cd.x - 14 * st.bulge}
            cy={cd.y - 16 * st.bulge}
            rx={17 * st.bulge}
            ry={9 * st.bulge}
            transform={`rotate(-35 ${cd.x - 14 * st.bulge} ${cd.y - 16 * st.bulge})`}
            fill={`url(#${uid}-soft)`}
            opacity={0.55 * ramp(st.bulge, 0.3, 0.9) * ramp(st.week, 4.5, 4.9)}
          />
        )}
        <g transform={limbAt(b.rig.arm)}>
          <Limb L={st.arm} uid={uid} paddle={paddle} />
        </g>
        <g transform={limbAt(b.rig.leg)}>
          <Limb L={st.leg} uid={uid} paddle={paddle} foot />
        </g>
      </g>
      <g transform={headTransform(b.rig, head, st.spin)}>
        <Face st={st} uid={uid} headRot={b.rig.head.rot + st.spin} />
      </g>
    </g>
  );
};
