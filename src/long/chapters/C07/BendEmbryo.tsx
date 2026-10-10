// The shared kit's <Embryo> (src/shared/embryo/Embryo.tsx), rendered from the kit's
// own parts, plus two things the kit cannot do yet:
//   pose   bends the C (head/rump/nod/limbs, see pose.ts) - the first move
//   spark  a soft glint running down the spinal cord (the movement is made by
//          spinal circuits, so the signal travels the cord just before the bend)
// With pose = REST and no spark it draws exactly what the kit's <Embryo> draws.
import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { DESIGN, centreOf } from "../../../shared/embryo/anchors";
import { Body, buildBody } from "../../../shared/embryo/body";
import { project } from "../../../shared/embryo/centreline";
import { Cells } from "../../../shared/embryo/Cells";
import { Defs } from "../../../shared/embryo/Defs";
import { Face, headTransform } from "../../../shared/embryo/Face";
import { Heart } from "../../../shared/embryo/Heart";
import { Limb } from "../../../shared/embryo/Limb";
import { Pt, add, ramp } from "../../../shared/embryo/math";
import { Neural } from "../../../shared/embryo/Neural";
import { Blob, HEAD_FEATURES } from "../../../shared/embryo/rig";
import { defaultZip } from "../../../shared/embryo/stage";
import { Pose, REST, posedStage } from "./pose";
import { SpinalSpark } from "./Spark";

type Props = {
  week: number;
  size: number;
  x: number;
  y: number;
  rotate?: number; // deg, like the kit's: folded into the geometry, light stays top-left
  pose?: Pose;
  heartBeat?: number;
  heartGlow?: number;
  spark?: { at: number; amount: number }; // at 0 (neck) .. 1 (tail), amount 0..1
  alive?: number;
  id: string; // SVG id suffix (ids are c07-<id>-...)
  wobble?: { seed: string; offset: number }; // body-wobble noise seed + clock offset (to continue C06's)
};

const LIGHT = { x: -30, y: -56 }; // kit skin-light centre (local coords)
const C6 = centreOf(6);

const Ell: React.FC<{ b: Blob; fill: string; opacity?: number }> = ({ b, fill, opacity }) => (
  <ellipse rx={b.rx} ry={b.ry} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`} fill={fill} opacity={opacity} />
);

// Silhouette = swept tube + round prominences (week >= 5: no germ layers).
const Union: React.FC<{ b: Body; fill: string }> = ({ b, fill }) => (
  <>
    <path d={b.outline} fill={fill} />
    {b.belly.map((e, i) => (
      <Ell key={`v${i}`} b={e} fill={fill} />
    ))}
    {b.blobs.map((e, i) => (
      <Ell key={i} b={e} fill={fill} />
    ))}
  </>
);

export const BendEmbryo: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const rotate = p.rotate ?? 0;
  const st = posedStage(p.week, p.pose ?? REST, rotate);
  const uid = `c07-${p.id}`;
  const wob = p.wobble ?? { seed: uid, offset: 0 };
  const b = buildBody(st, frame + wob.offset, p.alive ?? 1, wob.seed);
  const ctr = centreOf(p.week, rotate); // unposed: the bend never shifts the placement
  const k = p.size / DESIGN;
  const zip = defaultZip(p.week);
  const pulse = p.heartBeat ?? 0;
  const glow = p.heartGlow ?? 0.8 * Math.min(1, pulse);
  const v = (q: Pt) => project(q, 0, st);
  const heart = v(b.rig.heart);
  const light = add(ctr, { x: LIGHT.x - C6.x, y: LIGHT.y - C6.y });
  const cd = v(b.rig.cardiac);
  const head = v(b.rig.head.c);
  const paddle = ramp(st.week, 6, 7);
  const place = `translate(${p.x} ${p.y}) scale(${k}) translate(${-ctr.x} ${-ctr.y})`;
  const limbAt = (l: { root: Pt; dir: number }) => {
    const r = v(l.root);
    return `translate(${r.x} ${r.y}) rotate(${l.dir + st.spin})`;
  };
  const sp = p.spark;
  return (
    <g transform={place}>
      <Defs uid={uid} light={light} heart={heart} germ={0} pulse={pulse} ignite={1} hold={0} clip={<Union b={b} fill="#fff" />} />
      {/* translucent glow the body throws into the fluid */}
      <g filter={`url(#${uid}-halo)`} opacity={0.42 + 0.4 * glow}>
        <Union b={b} fill={C.peach} />
      </g>
      <g filter={`url(#${uid}-rimfx)`}>
        <Union b={b} fill={`url(#${uid}-skin)`} />
        <g clipPath={`url(#${uid}-body)`}>
          {st.vesicles > 0.01 && (
            <g transform={headTransform(b.rig, head, st.spin)} opacity={st.vesicles / 0.55}>
              {HEAD_FEATURES.vesicles.map((e, i) => (
                <Ell key={i} b={e} fill={`url(#${uid}-soft)`} opacity={0.55} />
              ))}
            </g>
          )}
          <path d={b.spine} fill="none" stroke={C.skin} strokeOpacity={0.35 * ramp(st.week, 4.5, 5)} strokeWidth={5} strokeLinecap="round" />
          {sp && sp.amount > 0.01 && <SpinalSpark d={b.spine} at={sp.at} amount={sp.amount} />}
          <Cells b={b} uid={uid} />
          <Neural b={b} zip={zip} uid={uid} />
          <g opacity={st.somiteVis}>
            {b.somites.map((s, i) => (
              <Ell key={i} b={s} fill={`url(#${uid}-somite)`} opacity={s.o * (s.row < 0 ? ramp(st.tilt, 16, 34) : 1)} />
            ))}
          </g>
          {st.liver > 0.01 && (
            <Ell b={{ ...v(b.rig.liver), rot: b.rig.liver.rot + st.spin, rx: b.rig.liver.rx * 0.8, ry: b.rig.liver.ry * 0.75 }} fill={C.womb} opacity={0.22} />
          )}
          {st.heart > 0.01 && (
            <g opacity={st.heart}>
              {/* each beat lights the body from the heart outward */}
              <circle cx={heart.x} cy={heart.y} r={190} fill={`url(#${uid}-spill)`} opacity={Math.min(0.85, 0.1 + 0.55 * glow)} style={{ mixBlendMode: "screen" }} />
              <g transform={`translate(${heart.x} ${heart.y}) scale(${st.bulge}) translate(${-heart.x} ${-heart.y})`}>
                <Heart p={heart} pulse={pulse} ignite={1} hold={0} uid={uid} rot={b.rig.cardiac.rot + st.spin} />
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
