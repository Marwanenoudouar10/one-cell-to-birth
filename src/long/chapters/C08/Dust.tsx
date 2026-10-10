// "Sculpting" dust (world space, screen blend): as the web between each pair
// of fingers recedes from tip to base, and as the tail tip draws back into the
// rump, the retreating edge glows gold and sheds fine gold dust that drifts up
// and away. Particles are born ON the edge at their own frame, so they stay
// put in the world while the hand turns. Deterministic (remotion `random`).
import React from "react";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { Pt, add, mul, rot } from "../../../shared/embryo/math";
import { BEATS } from "./beats";
import { valleyAngle, valleyR } from "./Hand";
import { Pose, handToWorld, poseAt } from "./kit";
import { tailGeo } from "./tail";

const D0 = BEATS.dissolve;
const DUR = BEATS.dissolveEnd - BEATS.dissolve - 7;
const ORDER = [5, 0, 3, 7]; // valley start offsets (frames): middle gaps open first
const NO_FLEX = [0, 0, 0, 0, 0];

export const frontAt = (f: number, j: number) => tween(f, D0 + ORDER[j], D0 + ORDER[j] + DUR, [0, 1], EASE.inOut);
export const fronts = (f: number) => [0, 1, 2, 3].map((j) => frontAt(f, j));
export const tailCut = (f: number) => tween(f, D0 + 2, BEATS.dissolveEnd + 3, [0, 1], EASE.inOut);

const cache = new Map<number, Pose>();
const poseCached = (f: number) => {
  const k = Math.round(f);
  let p = cache.get(k);
  if (!p) {
    if (cache.size > 300) cache.clear();
    p = poseAt(k);
    cache.set(k, p);
  }
  return p;
};

const valleyPt = (p: Pose, j: number, t: number, da = 0, dr = 0): Pt =>
  handToWorld(p, rot({ x: valleyR(j, t) + dr, y: 0 }, valleyAngle(j, NO_FLEX) + da));

type Grain = { fs: number; at: Pt; v: Pt; life: number; r: number; warm: boolean };

const HAND_GRAINS: { j: number; u: number; s: string }[] = [];
for (let j = 0; j < 4; j++) for (let m = 0; m < 13; m++) HAND_GRAINS.push({ j, u: (m + random(`c08-du${j}-${m}`)) / 13, s: `c08-d${j}-${m}` });
const TAIL_GRAINS = Array.from({ length: 16 }, (_, m) => ({ u: (m + random(`c08-tu${m}`)) / 16, s: `c08-t${m}` }));

const handGrain = (g: (typeof HAND_GRAINS)[number]): Grain => {
  const fs = D0 + ORDER[g.j] + g.u * DUR;
  const p = poseCached(fs);
  const at = valleyPt(p, g.j, frontAt(fs, g.j), (random(`${g.s}a`) - 0.5) * 12, (random(`${g.s}r`) - 0.5) * 0.12);
  const dir = p.hand.ang + valleyAngle(g.j, NO_FLEX) + (random(`${g.s}v`) - 0.5) * 70;
  const sp = 0.23 + 0.48 * random(`${g.s}s`);
  return { fs, at, v: rot({ x: sp, y: 0 }, dir), life: 20 + 16 * random(`${g.s}l`), r: 1.5 + 1.3 * random(`${g.s}z`), warm: random(`${g.s}c`) > 0.3 };
};

const tailGrain = (g: (typeof TAIL_GRAINS)[number]): Grain => {
  const fs = D0 + 2 + g.u * (BEATS.dissolveEnd + 1 - D0);
  const p = poseCached(fs);
  const tg = tailGeo(p, 1, tailCut(fs));
  const at = add(p.toWorld(tg.tip), { x: (random(`${g.s}x`) - 0.5) * 4, y: (random(`${g.s}y`) - 0.5) * 4 });
  const a = (Math.atan2(tg.tip.y - tg.base.y, tg.tip.x - tg.base.x) * 180) / Math.PI + (random(`${g.s}v`) - 0.5) * 80;
  const sp = 0.2 + 0.42 * random(`${g.s}s`);
  return { fs, at, v: rot({ x: sp, y: 0 }, a), life: 20 + 16 * random(`${g.s}l`), r: 1.4 + 1.2 * random(`${g.s}z`), warm: random(`${g.s}c`) > 0.3 };
};

// built once per render process (they only depend on the timeline)
let GRAINS: Grain[] | null = null;
const grains = () => (GRAINS ??= [...HAND_GRAINS.map(handGrain), ...TAIL_GRAINS.map(tailGrain)]);

const Mote: React.FC<{ g: Grain; f: number; i: number }> = ({ g, f, i }) => {
  const age = f - g.fs;
  if (age < 0 || age > g.life) return null;
  const k = age / g.life;
  const o = tween(age, 0, 3, [0, 1]) * Math.pow(1 - k, 1.4) * (0.7 + 0.3 * Math.sin(age * 0.6 + i));
  const drift = add(mul(g.v, age * (1 - 0.35 * k)), { x: Math.sin(age * 0.12 + i) * 1.7, y: -0.16 * age - 0.003 * age * age });
  const p = add(g.at, drift);
  return (
    <g opacity={o}>
      <circle cx={p.x} cy={p.y} r={g.r * 3.2} fill={C.gold} opacity={0.2} />
      <circle cx={p.x} cy={p.y} r={g.r} fill={g.warm ? C.gold : C.text} />
    </g>
  );
};

const Spot: React.FC<{ at: Pt; r: number; o: number }> = ({ at, r, o }) =>
  o > 0.01 ? <circle cx={at.x} cy={at.y} r={r} fill="url(#c08-dust-spot)" opacity={o} /> : null;

export const Dust: React.FC<{ f: number; pose: Pose }> = ({ f, pose }) => {
  if (f < D0 - 2 || f > BEATS.dissolveEnd + 45) return null;
  const tg = tailGeo(pose, 1, tailCut(f));
  const tc = tailCut(f);
  return (
    <g>
      <defs>
        <radialGradient id="c08-dust-spot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.text} stopOpacity={0.9} />
          <stop offset="0.3" stopColor={C.gold} stopOpacity={0.6} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {[0, 1, 2, 3].map((j) => {
        const t = frontAt(f, j);
        return <Spot key={j} at={valleyPt(pose, j, t)} r={pose.hand.R * 0.5} o={Math.sin(Math.PI * t) * 0.9} />;
      })}
      <Spot at={pose.toWorld(tg.tip)} r={13} o={Math.sin(Math.PI * tc) * 0.95} />
      {grains().map((g, i) => (
        <Mote key={i} g={g} f={f} i={i} />
      ))}
    </g>
  );
};
