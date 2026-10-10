// The shared embryo kit's <Embryo>, recomposed for C08 from the kit's own parts (the
// same recipe as C07's BendEmbryo at rest, so frame 0 matches C07's END): same body,
// defs, face, heart, neural tube and lighting, but the near arm ends in OUR hand
// (webbing that dissolves, fingers that flex) and a little tail tip pokes out from
// under the rump. Everything sits inside the kit's rim-light filter group, so it is
// lit exactly like the rest of the body.
import React from "react";
import { C } from "../../../theme/colors";
import { centreOf } from "../../../shared/embryo/anchors";
import { Body } from "../../../shared/embryo/body";
import { project } from "../../../shared/embryo/centreline";
import { Defs } from "../../../shared/embryo/Defs";
import { Face, headTransform } from "../../../shared/embryo/Face";
import { Heart } from "../../../shared/embryo/Heart";
import { Limb } from "../../../shared/embryo/Limb";
import { Neural } from "../../../shared/embryo/Neural";
import { Pt, add, ramp } from "../../../shared/embryo/math";
import { Blob, HEAD_FEATURES } from "../../../shared/embryo/rig";
import { defaultZip } from "../../../shared/embryo/stage";
import { Arm } from "./Arm";
import { HandState } from "./Hand";
import { Pose, UID, EMB } from "./kit";
import { TailGeo } from "./tail";

const LIGHT = { x: -30, y: -56 }; // kit skin-light centre (Scene3 local coords)
const C6 = centreOf(6);

const Ell: React.FC<{ b: Blob; fill: string; opacity?: number }> = ({ b, fill, opacity }) => (
  <ellipse rx={b.rx} ry={b.ry} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`} fill={fill} opacity={opacity} />
);

const Union: React.FC<{ b: Body; fill: string; tail?: string }> = ({ b, fill, tail }) => (
  <>
    {tail && <path d={tail} fill={fill} />}
    <path d={b.outline} fill={fill} />
    {b.belly.map((e, i) => (
      <Ell key={`v${i}`} b={e} fill={fill} />
    ))}
    {b.blobs.map((e, i) => (
      <Ell key={i} b={e} fill={fill} />
    ))}
  </>
);

type Props = {
  pose: Pose;
  heartBeat: number;
  heartGlow: number;
  hand: Omit<HandState, "uid" | "ang">;
  handMix: number; // 0 = the kit's plate (C07's END) .. 1 = our hand
  tail: TailGeo; // the little tail, design coords
};

export const KitEmbryo: React.FC<Props> = ({ pose, heartBeat, heartGlow, hand, handMix, tail }) => {
  const { st, body: b, ctr, k } = pose;
  const uid = UID;
  const v = (q: Pt) => project(q, 0, st);
  const heart = v(b.rig.heart);
  const light = add(ctr, { x: LIGHT.x - C6.x, y: LIGHT.y - C6.y });
  const cd = v(b.rig.cardiac);
  const head = v(b.rig.head.c);
  const paddle = ramp(st.week, 6, 7);
  const back = ramp(st.tilt, 16, 34);
  const glow = heartGlow;
  const place = `translate(${EMB.x} ${EMB.y}) scale(${k}) translate(${-ctr.x} ${-ctr.y})`;
  const limbAt = (l: { root: Pt; dir: number }) => {
    const r = v(l.root);
    return `translate(${r.x} ${r.y}) rotate(${l.dir + st.spin})`;
  };
  return (
    <g transform={place}>
      <Defs uid={uid} light={light} heart={heart} germ={0} pulse={heartBeat} ignite={1} hold={0} clip={<Union b={b} fill="#fff" />} />
      {/* translucent glow the body throws into the fluid */}
      <g filter={`url(#${uid}-halo)`} opacity={0.42 + 0.4 * glow}>
        <Union b={b} fill={C.peach} tail={tail.d} />
      </g>
      <g filter={`url(#${uid}-rimfx)`}>
        <Union b={b} fill={`url(#${uid}-skin)`} tail={tail.d} />
        {/* the spine's last somites run on into the tail */}
        {tail.beads.map((e, i) => (
          <Ell key={`t${i}`} b={e} fill={`url(#${uid}-somite)`} opacity={e.o * Math.max(0.5, st.somiteVis)} />
        ))}
        <g clipPath={`url(#${uid}-body)`}>
          {st.vesicles > 0.01 && (
            <g transform={headTransform(b.rig, head, st.spin)} opacity={st.vesicles / 0.55}>
              {HEAD_FEATURES.vesicles.map((e, i) => (
                <Ell key={i} b={e} fill={`url(#${uid}-soft)`} opacity={0.55} />
              ))}
            </g>
          )}
          <path d={b.spine} fill="none" stroke={C.skin} strokeOpacity={0.35 * ramp(st.week, 4.5, 5)} strokeWidth={5} strokeLinecap="round" />
          <Neural b={b} zip={defaultZip(st.week)} uid={uid} />
          <g opacity={st.somiteVis}>
            {b.somites.map((s, i) => (
              <Ell key={i} b={s} fill={`url(#${uid}-somite)`} opacity={s.o * (s.row < 0 ? back : 1)} />
            ))}
          </g>
          <Ell b={{ ...v(b.rig.liver), rot: b.rig.liver.rot + st.spin, rx: b.rig.liver.rx * 0.8, ry: b.rig.liver.ry * 0.75 }} fill={C.womb} opacity={0.22} />
          <g opacity={st.heart}>
            {/* each beat lights the body from the heart outward */}
            <circle cx={heart.x} cy={heart.y} r={190} fill={`url(#${uid}-spill)`} opacity={Math.min(0.85, 0.1 + 0.55 * glow)} style={{ mixBlendMode: "screen" }} />
            <g transform={`translate(${heart.x} ${heart.y}) scale(${st.bulge}) translate(${-heart.x} ${-heart.y})`}>
              <Heart p={heart} pulse={heartBeat} ignite={1} hold={0} uid={uid} rot={b.rig.cardiac.rot + st.spin} />
            </g>
          </g>
        </g>
        <ellipse
          cx={cd.x - 14 * st.bulge}
          cy={cd.y - 16 * st.bulge}
          rx={17 * st.bulge}
          ry={9 * st.bulge}
          transform={`rotate(-35 ${cd.x - 14 * st.bulge} ${cd.y - 16 * st.bulge})`}
          fill={`url(#${uid}-soft)`}
          opacity={0.55 * ramp(st.bulge, 0.3, 0.9)}
        />
        <g transform={limbAt(b.rig.arm)}>
          <Arm L={st.arm} uid={uid} paddle={paddle} hand={{ ...hand, uid, ang: pose.hand.ang }} local={pose.local} mix={handMix} />
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
