// <Cord from to slack twist pulse />: the umbilical cord, a pearly translucent
// tube with one vein + two arteries spiralling inside, swaying in the fluid.
//   from     {x,y} world px at the baby's belly (navel)
//   to       {x,y} world px at the placenta. Omitted inside an <AmnioticSac>
//            that has a <Placenta> child = that placenta's insertion point
//            (otherwise pass it: placentaPort(sacShape, at, size)).
//   slack    0 taut (near straight) .. 1 a deep lazy arc (default 0.5)
//   side     1 | -1 which way the arc bows (default 1 = left of from->to)
//   twist    helix density of the inner vessels (default 1; 0 = none)
//   pulse    0..1 brightness of blood pulses travelling placenta -> baby on
//            each heartbeat (default 0.6; 0 = off)
//   bpm      pulse rate (default 140, a fetal heart)
//   width    tube width px (default 16; week 8 ~ 10, term ~ 24)
//   sway     0..2 drift in the fluid (default 1)
//   opacity, depth, blur   layer controls (depth 1 = sac plane)
//   seed     noise seed when two cords are on screen
// <CordShape> is the raw SVG <g> (same props + frame) for your own layers,
// e.g. to draw the cord between two body parts of your fetus.
import React from "react";
import { noise2D } from "@remotion/noise";
import { useCurrentFrame } from "remotion";
import { C } from "../../theme/colors";
import { FPS } from "../../theme/layout";
import { WombLayer } from "./Camera";
import { Pt, add, dist, mul, smooth, sub, useUid } from "./geom";
import { placentaPort } from "./Placenta";
import { useSac } from "./sacContext";

export type CordProps = {
  from: Pt;
  to?: Pt;
  slack?: number;
  side?: 1 | -1;
  twist?: number;
  pulse?: number;
  bpm?: number;
  width?: number;
  sway?: number;
  opacity?: number;
  depth?: number;
  blur?: number;
  seed?: string;
};

const bez = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => {
  const u = 1 - t;
  return add(add(mul(a, u * u * u), mul(b, 3 * u * u * t)), add(mul(c, 3 * u * t * t), mul(d, t * t * t)));
};

const TRAVEL = 24; // frames a pulse takes from placenta to belly

export const CordShape: React.FC<Required<Omit<CordProps, "opacity" | "depth" | "blur">> & { frame: number }> = ({
  from,
  to,
  slack,
  side,
  twist,
  pulse,
  bpm,
  width: w,
  sway,
  seed,
  frame: f,
}) => {
  const id = useUid("cord");
  const span = dist(from, to) || 1;
  const v = mul(sub(to, from), 1 / span);
  const nrm = { x: -v.y * side, y: v.x * side };
  const sw = (k: string) => noise2D(`${seed}${k}`, f * 0.012, 0) * span * 0.06 * sway;
  const c1 = add(add(from, mul(v, span * 0.22)), { x: nrm.x * span * slack * 0.75 + sw("1x"), y: nrm.y * span * slack * 0.75 + sw("1y") });
  const c2 = add(add(from, mul(v, span * 0.8)), { x: nrm.x * span * slack * 0.55 + sw("2x"), y: nrm.y * span * slack * 0.55 + sw("2y") });
  const d = `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
  const N = 48;
  const samples = Array.from({ length: N + 1 }, (_, i) => bez(from, c1, c2, to, i / N));
  const helix = (phase: number, amp: number) =>
    smooth(
      samples.map((p, i) => {
        const tg = sub(samples[Math.min(N, i + 1)], samples[Math.max(0, i - 1)]);
        const l = Math.hypot(tg.x, tg.y) || 1;
        const s = Math.sin((i / N) * span * 0.11 * twist + phase - f * 0.06);
        return add(p, mul({ x: -tg.y / l, y: tg.x / l }, s * w * amp));
      }),
      false,
    );
  // blood pulses: one per beat, travelling from the placenta to the belly
  const period = (60 / bpm) * FPS;
  const beads: { pos: number; a: number }[] = [];
  if (pulse > 0.01) {
    for (let k = Math.floor((f - TRAVEL) / period); k <= Math.floor(f / period); k++) {
      const u = (f - k * period) / TRAVEL;
      if (u >= 0 && u <= 1) beads.push({ pos: 1 - u, a: pulse * Math.sin(Math.PI * u) });
    }
  }
  return (
    <g strokeLinecap="round" fill="none">
      <defs>
        <filter id={`${id}-sh`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={w * 0.45} />
        </filter>
      </defs>
      <path d={d} stroke={C.wombDeep} strokeOpacity={0.5} strokeWidth={w * 1.6} filter={`url(#${id}-sh)`} />
      <path d={d} stroke={C.skinShade} strokeWidth={w * 1.1} />
      <path d={d} stroke={C.skin} strokeWidth={w * 0.78} />
      {twist > 0.01 && (
        <>
          <path d={helix(0, 0.24)} stroke={C.heart} strokeOpacity={0.45} strokeWidth={w * 0.26} />
          <path d={helix((2 * Math.PI) / 3, 0.26)} stroke={C.womb} strokeOpacity={0.5} strokeWidth={w * 0.17} />
          <path d={helix((4 * Math.PI) / 3, 0.26)} stroke={C.womb} strokeOpacity={0.5} strokeWidth={w * 0.17} />
        </>
      )}
      {beads.map((b, i) => (
        <g key={i} opacity={b.a}>
          <path d={d} pathLength={1} strokeDasharray="0.1 2" strokeDashoffset={-(b.pos - 0.05)} stroke={C.heart} strokeWidth={w * 1.3} filter={`url(#${id}-sh)`} />
          <path d={d} pathLength={1} strokeDasharray="0.05 2" strokeDashoffset={-(b.pos - 0.025)} stroke={C.rose} strokeWidth={w * 0.5} />
        </g>
      ))}
      <path d={d} transform={`translate(${-w * 0.14} ${-w * 0.16})`} stroke={C.text} strokeOpacity={0.4} strokeWidth={w * 0.16} />
    </g>
  );
};

export const Cord: React.FC<CordProps> = ({
  from,
  to,
  slack = 0.5,
  side = 1,
  twist = 1,
  pulse = 0.6,
  bpm = 140,
  width = 16,
  sway = 1,
  opacity = 1,
  depth = 1,
  blur = 0,
  seed = "wb-cord",
}) => {
  const frame = useCurrentFrame();
  const sac = useSac();
  const pl = sac?.placentas[0];
  const end = to ?? (sac && pl ? placentaPort(sac.shape, pl.at, pl.size) : { x: from.x + 200, y: from.y - 200 });
  return (
    <WombLayer opacity={opacity} depth={depth} blur={blur}>
      <CordShape from={from} to={end} slack={slack} side={side} twist={twist} pulse={pulse} bpm={bpm} width={width} sway={sway} seed={seed} frame={frame} />
    </WombLayer>
  );
};
