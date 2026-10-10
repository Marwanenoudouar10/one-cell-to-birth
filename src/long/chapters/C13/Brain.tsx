// <Brain>: the stylised glowing brain, drawn in fetus HEAD-LOCAL units (wrap
// it in the head transform). Key light upper-left, warm gold rim lower-right.
//   scale   growth about BRAIN_C (0.86 at 28 wk .. 1 = fills the skull)
//   depth   0..1 how deep the primary grooves read
//   fold    0..1 secondary + tertiary grooves draw in, the rim crinkles
//   insula  0..1 how open the Sylvian fissure floor still is
//   glow    0..1 halo, flash 0..1 gold impact flash, impacts = drop ages (frames)
//   mx      the kit frame's mirror sign: head-local x is flipped on screen when
//           -1, so every light position is flipped back (key light stays upper-left)
import React from "react";
import { C } from "../../../theme/colors";
import { BRAINSTEM, BRAIN_C, CEREBELLUM, DROP_AT, FOLIA, Groove, cerebrumPath, groovePath, insulaPath } from "./brainShape";
import { PRIMARY_S, SECONDARY_S, TERTIARY } from "./folds";
import { Sampled, ribbon } from "./ribbon";

export type BrainProps = {
  uid: string;
  scale: number;
  depth: number;
  fold: number;
  insula: number;
  glow: number;
  flash: number;
  impacts: number[];
  mx: 1 | -1;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

// One groove as tapered ribbons: soft shadow, deep core, lit far wall
// (light from the upper left), so it reads as a soft valley, not a crack.
const Crease: React.FC<{ g: Sampled; w: number; reveal: number; mx: number; alpha?: number }> = ({ g, w, reveal, mx, alpha = 1 }) => {
  if (reveal <= 0.002) return null;
  return (
    <g opacity={alpha}>
      <path d={ribbon(g, w * 2.2, reveal)} fill={C.wombDeep} opacity={0.28} />
      <path d={ribbon(g, w, reveal)} fill={C.womb} />
      <path d={ribbon(g, w * 0.5, reveal)} fill={C.wombDeep} opacity={0.8} />
      <path d={ribbon(g, w * 0.42, reveal, mx * w * 0.5, w * 0.68)} fill={C.peach} opacity={0.55} />
    </g>
  );
};

// Gold light racing along a groove after a drop lands.
const Glint: React.FC<{ d: string; u: number; w: number }> = ({ d, u, w }) => {
  if (u <= 0 || u >= 1) return null;
  const a = 0.22;
  return (
    <g fill="none" strokeLinecap="round" opacity={Math.sin(Math.PI * u)}>
      <path d={d} pathLength={1} strokeDasharray={`${a} 3`} strokeDashoffset={a - u * (1 + a)} stroke={C.gold} strokeOpacity={0.35} strokeWidth={w * 3.2} />
      <path d={d} pathLength={1} strokeDasharray={`${a * 0.7} 3`} strokeDashoffset={a * 0.85 - u * (1 + a)} stroke={C.text} strokeOpacity={0.8} strokeWidth={w * 0.45} />
    </g>
  );
};

export const Brain: React.FC<BrainProps> = ({ uid, scale, depth, fold, insula, glow, flash, impacts, mx }) => {
  const lx = (x: number) => BRAIN_C.x + mx * (x - BRAIN_C.x); // light-space x
  const cbx = (x: number) => CEREBELLUM.cx + mx * (x - CEREBELLUM.cx);
  const id = (n: string) => `c13-${uid}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const outline = cerebrumPath(fold);
  const cb = CEREBELLUM;
  const cbT = `translate(${cb.cx} ${cb.cy}) rotate(${cb.rot})`;
  const tf = `translate(${BRAIN_C.x} ${BRAIN_C.y}) scale(${scale}) translate(${-BRAIN_C.x} ${-BRAIN_C.y})`;
  const pw = 0.5 + 0.5 * depth;
  const secRev = (g: Groove) => smoothstep((fold - g.order * 0.1) / 0.42);
  return (
    <g transform={tf}>
      <defs>
        <radialGradient id={id("body")} gradientUnits="userSpaceOnUse" cx={lx(-34)} cy={-74} r={170} fx={lx(-44)} fy={-84}>
          <stop offset={0} stopColor={C.skin} />
          <stop offset={0.22} stopColor={C.peach} />
          <stop offset={0.55} stopColor={C.rose} />
          <stop offset={0.86} stopColor={C.womb} />
          <stop offset={1} stopColor={C.wombDeep} />
        </radialGradient>
        <radialGradient id={id("cb")} gradientUnits="userSpaceOnUse" cx={cbx(-80)} cy={30} r={44}>
          <stop offset={0} stopColor={C.peach} />
          <stop offset={0.45} stopColor={C.rose} />
          <stop offset={1} stopColor={C.womb} />
        </radialGradient>
        <linearGradient id={id("bs")} gradientUnits="userSpaceOnUse" x1={lx(-60)} y1={30} x2={lx(-24)} y2={100}>
          <stop offset={0} stopColor={C.rose} />
          <stop offset={0.5} stopColor={C.womb} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0.6} />
        </linearGradient>
        <linearGradient id={id("rim")} gradientUnits="userSpaceOnUse" x1={lx(-40)} y1={-80} x2={lx(70)} y2={40}>
          <stop offset={0.45} stopColor={C.gold} stopOpacity={0} />
          <stop offset={1} stopColor={C.gold} stopOpacity={1} />
        </linearGradient>
        <radialGradient id={id("flash")} gradientUnits="userSpaceOnUse" cx={DROP_AT.x} cy={DROP_AT.y} r={150}>
          <stop offset={0} stopColor={C.text} stopOpacity={0.9} />
          <stop offset={0.25} stopColor={C.gold} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <clipPath id={id("clip")}>
          <path d={outline} />
        </clipPath>
        <clipPath id={id("cbclip")}>
          <ellipse cx={0} cy={0} rx={cb.rx} ry={cb.ry} transform={cbT} />
        </clipPath>
        <filter id={id("halo")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={13} />
        </filter>
        <filter id={id("soft")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={2.4} />
        </filter>
        <filter id={id("spec")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>

      {/* halo the brain throws into the translucent head */}
      <g filter={url("halo")}>
        <path d={outline} fill={C.rose} opacity={0.35 + 0.35 * glow} />
        <path d={outline} fill={C.gold} opacity={0.5 * flash} />
      </g>

      {/* brainstem + cerebellum (behind the cerebrum) */}
      <path d={BRAINSTEM} fill={url("bs")} />
      <path d={BRAINSTEM} fill="none" stroke={C.rose} strokeOpacity={0.35} strokeWidth={2} transform={`translate(${-2 * mx} -1)`} />
      <ellipse cx={0} cy={0} rx={cb.rx} ry={cb.ry} transform={cbT} fill={url("cb")} />
      <g clipPath={url("cbclip")}>
        <g transform={cbT}>
          {FOLIA.map((d, i) => (
            <React.Fragment key={i}>
              <path d={d} fill="none" stroke={C.womb} strokeOpacity={0.85} strokeWidth={2.2} strokeLinecap="round" />
              <path d={d} fill="none" stroke={C.peach} strokeOpacity={0.55} strokeWidth={0.9} transform={`translate(${0.8 * mx} 1.3)`} />
            </React.Fragment>
          ))}
        </g>
      </g>

      {/* cerebrum */}
      <path d={outline} fill={url("body")} />
      <g clipPath={url("clip")}>
        {/* ambient occlusion along the edge, deeper lower-right */}
        <path d={outline} fill="none" stroke={C.wombDeep} strokeOpacity={0.55} strokeWidth={16} filter={url("soft")} transform={`translate(${2 * mx} 3)`} />
        {/* insula: the still-open floor of the side fissure */}
        <path d={insulaPath(insula)} fill={C.wombDeep} opacity={0.42 + 0.2 * insula} filter={url("soft")} />
        <path d={insulaPath(insula)} fill={C.womb} opacity={0.45 * insula} transform={`translate(${1.5 * mx} 2)`} />
        {PRIMARY_S.map((g, i) => (
          <Crease key={`p${i}`} g={g.sm} w={g.w * pw} reveal={1} mx={mx} />
        ))}
        {SECONDARY_S.map((g, i) => (
          <Crease key={`s${i}`} g={g.sm} w={g.w * (0.55 + 0.45 * secRev(g))} reveal={secRev(g)} mx={mx} />
        ))}
        {TERTIARY.map((q, i) => (
          <Crease key={`t${i}`} g={q.g} w={q.w} reveal={smoothstep((fold - 0.3 - q.order * 0.42) / 0.3)} alpha={0.92} mx={mx} />
        ))}
        {/* drop impacts: gold ring + light running along the grooves */}
        {impacts.map((age, k) => {
          const u = clamp01(age / 26);
          const r = 8 + 170 * (1 - Math.pow(1 - u, 2.2));
          const band = 14 + 22 * u;
          const R = r + band;
          const a = 0.8 * Math.pow(1 - u, 1.3);
          return (
            <g key={`i${k}`}>
              {/* soft wave of light rolling out from where the drop landed */}
              <radialGradient id={id(`wave${k}`)} gradientUnits="userSpaceOnUse" cx={DROP_AT.x} cy={DROP_AT.y} r={R}>
                <stop offset={Math.max(0, (r - band) / R)} stopColor={C.gold} stopOpacity={0} />
                <stop offset={r / R} stopColor={C.gold} stopOpacity={a} />
                <stop offset={1} stopColor={C.gold} stopOpacity={0} />
              </radialGradient>
              <circle cx={DROP_AT.x} cy={DROP_AT.y} r={R} fill={url(`wave${k}`)} />
              {PRIMARY_S.map((g, i) => (
                <Glint key={i} d={groovePath(g)} u={(age - 2 - i * 1.5) / 20} w={g.w} />
              ))}
            </g>
          );
        })}
        <rect x={-130} y={-130} width={260} height={200} fill={url("flash")} opacity={0.55 * flash} />
        {/* key-light sheen + warm rim */}
        <ellipse cx={lx(-42)} cy={-84} rx={44} ry={13} transform={`rotate(${-20 * mx} ${lx(-42)} -84)`} fill={C.text} opacity={0.2} filter={url("spec")} />
        <ellipse cx={lx(58)} cy={-80} rx={16} ry={6} transform={`rotate(${32 * mx} ${lx(58)} -80)`} fill={C.text} opacity={0.14} filter={url("spec")} />
        <path d={outline} fill="none" stroke={url("rim")} strokeWidth={7} opacity={0.65 + 0.3 * glow} filter={url("soft")} />
      </g>
      <path d={outline} fill="none" stroke={C.peach} strokeOpacity={0.35} strokeWidth={1.2} />
    </g>
  );
};
