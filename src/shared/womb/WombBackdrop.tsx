// <WombBackdrop />: the uterine world around the sac, in parallax depth planes.
// Put it FIRST inside <Camera>. It paints a full opaque base, so every womb
// chapter looks the same whatever sits underneath.
//   warmth    0..1  0 = dark plum-wine cavity (weeks 6-20, Scene3/4 look),
//                   1 = glowing warm rose womb (week 40, Scene5 look)
//   depth     0..1.5 how deep the cavity feels: crevice + vignette darkness
//                   (default 1)
//   parallax  0..1.5 strength of depth-plane parallax vs the sac plane
//                   (default 1: tissue masses at depth 0.45, folds at 0.75;
//                   0 = everything moves with the sac)
//   folds     0..1  concentric fold rings hugging the cavity: 0 = only soft
//                   tissue masses (early), 1 = crisp week-40 folds. Low
//                   values are also softer (blurrier).
//   cx,cy,r   cavity the folds wrap around: use the sac's centre and a
//             radius ~ sac r + 0..40 (default 540, 860, 400)
//   aspect, pear  same shape controls as <AmnioticSac>
//   breathe   0..2 slow wall breathing (default 1)
//   opaque    paint the base gradient (default true)
//   seed
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../theme/colors";
import { WombLayer } from "./Camera";
import { Folds } from "./Folds";
import { SacShape, useUid } from "./geom";

export type WombBackdropProps = {
  warmth?: number;
  depth?: number;
  parallax?: number;
  folds?: number;
  cx?: number;
  cy?: number;
  r?: number;
  aspect?: number;
  pear?: number;
  breathe?: number;
  opaque?: boolean;
  seed?: string;
};

// Big soft tissue masses (offsets from the cavity centre) and dark creases.
const MASSES = [
  { x: -420, y: -440, rx: 380, ry: 270, rot: 30, deep: false, o: 0.5 },
  { x: 440, y: -390, rx: 360, ry: 250, rot: -35, deep: false, o: 0.42 },
  { x: -550, y: 60, rx: 260, ry: 420, rot: 0, deep: false, o: 0.36 },
  { x: 550, y: 100, rx: 260, ry: 440, rot: 0, deep: false, o: 0.36 },
  { x: -340, y: 570, rx: 400, ry: 220, rot: -20, deep: true, o: 0.55 },
  { x: 360, y: 580, rx: 400, ry: 220, rot: 20, deep: true, o: 0.55 },
  { x: 0, y: -530, rx: 420, ry: 150, rot: 0, deep: true, o: 0.5 },
];
const CREASES = [
  "M-480,-240 C-320,-300 -210,-340 -120,-390",
  "M480,-170 C340,-250 250,-300 150,-360",
  "M-450,380 C-330,320 -240,270 -160,240",
  "M450,390 C330,330 250,290 160,250",
];

const Masses: React.FC<{ s: Required<SacShape>; f: number; warmth: number; depth: number; seed: string }> = ({ s, f, warmth, depth, seed }) => {
  const id = useUid("mass");
  const k = s.r / 360;
  return (
    <g>
      <defs>
        {MASSES.map((m, i) => (
          <radialGradient key={i} id={`${id}-${i}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={m.deep ? C.womb : C.rose} stopOpacity={m.o * (0.42 + 0.25 * warmth)} />
            <stop offset="0.5" stopColor={m.deep ? C.wombDeep : C.womb} stopOpacity={m.o * 0.65} />
            <stop offset="1" stopColor={m.deep ? C.wombDeep : C.womb} stopOpacity={0} />
          </radialGradient>
        ))}
        <filter id={`${id}-crease`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation={20} />
        </filter>
        <radialGradient id={`${id}-cav`} gradientUnits="userSpaceOnUse" cx={s.cx} cy={s.cy} r={s.r + 260}>
          <stop offset="0" stopColor={warmth > 0.5 ? C.womb : C.wombDeep} stopOpacity={0.5 + 0.3 * warmth} />
          <stop offset={s.r / (s.r + 260)} stopColor={C.womb} stopOpacity={0.55 + 0.3 * warmth} />
          <stop offset="1" stopColor={C.wombDeep} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={s.cx} cy={s.cy} r={s.r + 260} fill={`url(#${id}-cav)`} />
      {MASSES.map((m, i) => {
        const t = f * 0.006;
        const dx = noise2D(`${seed}mx`, t, i) * 18;
        const dy = noise2D(`${seed}my`, i, t) * 18;
        const b = 1 + noise2D(`${seed}ms`, t, i * 3) * 0.04;
        return (
          <ellipse
            key={i}
            rx={m.rx * b}
            ry={m.ry * b}
            transform={`translate(${s.cx + m.x * k + dx} ${s.cy + m.y * k + dy}) rotate(${m.rot})`}
            fill={`url(#${id}-${i})`}
          />
        );
      })}
      <g transform={`translate(${s.cx} ${s.cy}) scale(${k})`} filter={`url(#${id}-crease)`}>
        {CREASES.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={C.bg0} strokeOpacity={0.5 * depth} strokeWidth={34} strokeLinecap="round" />
        ))}
      </g>
    </g>
  );
};

export const WombBackdrop: React.FC<WombBackdropProps> = ({
  warmth = 0.3,
  depth = 1,
  parallax = 1,
  folds = 0.5,
  cx = 540,
  cy = 860,
  r = 400,
  aspect = 1,
  pear = 0,
  breathe = 1,
  opaque = true,
  seed = "wb-bd",
}) => {
  const f = useCurrentFrame();
  const s: Required<SacShape> = { cx, cy, r, aspect, pear };
  const d = (base: number) => Math.max(0, 1 - (1 - base) * parallax);
  const w = Math.max(0, Math.min(1, warmth));
  return (
    <>
      {opaque && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(120% 80% at 50% 45%, ${C.bg2} 0%, ${C.bg0} 72%)`,
          }}
        >
          <AbsoluteFill style={{ opacity: 0.35 + 0.4 * w, background: `radial-gradient(90% 60% at 50% 45%, ${C.wombDeep} 0%, transparent 70%)` }} />
          <AbsoluteFill style={{ opacity: w * 0.9, background: `radial-gradient(110% 75% at 50% 45%, ${C.womb}aa 0%, ${C.wombDeep} 45%, ${C.bg2} 80%)` }} />
        </AbsoluteFill>
      )}
      <WombLayer depth={d(0.45)}>
        <Masses s={s} f={f} warmth={w} depth={depth} seed={seed} />
      </WombLayer>
      {folds > 0.01 && (
        <WombLayer depth={d(0.75)} blur={2 + 16 * (1 - folds)} opacity={Math.min(1, folds * 1.15)}>
          <Folds shape={s} frame={f} warmth={w} depth={depth} breathe={breathe} seed={seed} />
        </WombLayer>
      )}
      {depth > 0.01 && (
        <AbsoluteFill
          style={{
            opacity: Math.min(1, 0.55 * depth),
            background: `radial-gradient(100% 70% at 50% 45%, transparent 45%, ${C.bg0}cc 100%)`,
          }}
        />
      )}
    </>
  );
};
