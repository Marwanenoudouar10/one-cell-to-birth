import React from "react";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../../lib/ease";
import { B } from "./beats";
import { warp } from "./camera";
import { CDIR, R, ZONA } from "./constants";
import { LANE, SIZE, laneAt } from "./lane";
import { Vec, add, clamp, inc, keys, mul } from "./math";
import { SpermShape } from "./Sperm";
import { WINNER_SV, prePose } from "./survivors";

// The one that gets in. It rides the stream, rests on the wall and lights up
// like the others (a beat after the three rivals: not the first, not the
// fastest), then swims its lane. On "Only" its thin gold rim switches on as it
// edges ahead in slow motion; on "gets" its head touches the zona, glows and
// slips through; on "in" it fuses with the membrane.
const W = WINNER_SV;
const toGo = keys(inc([W.fDepart, B.oneOut - 6, B.oneOut, B.oneOut + 12, B.touch]), [LANE, 160, 85, 22, 0]);

export type WinnerState = { pos: Vec; ang: number; headOp: number; tailOp: number; amp: number; lit: number; clock: number };

const lerpAng = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

export const winnerAt = (f: number): WinnerState => {
  const pre = prePose(W, f);
  const base = { headOp: 1, tailOp: 1, lit: pre.lit, clock: pre.clock };
  if (f <= W.fDepart) return { ...base, pos: pre.pos, ang: (pre.ang * 180) / Math.PI, amp: pre.amp };
  const D = toGo(f);
  const { pos: p, tan } = laneAt(D);
  const free = clamp(D / 420) * tween(f, W.fDepart, W.fDepart + 10);
  const wob = noise2D("c01win", warp(f) * 0.02, 0) * 16 * free;
  let pos = add(p, { x: -tan.y * wob, y: tan.x * wob });
  // through the zona (touch -> fuse), then into the membrane
  const pen = tween(f, B.touch, B.fuse, [0, 1], EASE.inOut) * (ZONA - R) + tween(f, B.fuse, B.fuse + 14, [0, 1], EASE.inOut) * SIZE * 0.55;
  pos = add(pos, mul(CDIR, -pen));
  let ang = lerpAng(pre.ang, Math.atan2(tan.y, tan.x), tween(f, W.fDepart, W.fDepart + 8, [0, 1], EASE.inOut));
  ang += noise2D("c01wina", warp(f) * 0.04, 2) * 0.08 * free;
  const calm = 1 - tween(f, W.fDepart + 14, B.oneOut + 6) * 0.3;
  return {
    pos,
    ang: (ang * 180) / Math.PI,
    headOp: 1 - tween(f, B.fuse + 6, B.fuse + 18, [0, 1], EASE.in),
    tailOp: 1 - tween(f, B.fuse, B.fuse + 16, [0, 1], EASE.inOut),
    amp: pre.amp * calm * (1 - tween(f, B.touch, B.fuse + 10, [0, 0.7], EASE.out)),
    lit: pre.lit,
    clock: pre.clock,
  };
};

// The gold rim light switches on as it edges ahead; the head glows at contact.
export const rimAt = (f: number) => tween(f, B.oneOut - 10, B.oneOut + 6, [0, 1], EASE.inOut);
export const touchGlow = (f: number) =>
  tween(f, B.touch - 3, B.touch + 2) * (1 - tween(f, B.fuse + 2, B.fuse + 12, [0, 1], EASE.inOut));

export const winnerHead = (f: number) => {
  const s = winnerAt(f);
  const a = (s.ang * Math.PI) / 180;
  return { x: s.pos.x + Math.cos(a) * 5, y: s.pos.y + Math.sin(a) * 5 };
};

export const Winner: React.FC<{ frame: number }> = ({ frame }) => {
  const s = winnerAt(frame);
  if (s.headOp <= 0.01 && s.tailOp <= 0.01) return null;
  const rim = rimAt(frame);
  const glow = touchGlow(frame);
  const a = (s.ang * Math.PI) / 180;
  const hx = s.pos.x + Math.cos(a) * SIZE * 0.5;
  const hy = s.pos.y + Math.sin(a) * SIZE * 0.5;
  // a wide, soft gold aura so the winner reads at phone size
  const aura = Math.max(rim, glow) * s.headOp * (1 - 0.5 * tween(frame, B.fuse - 2, B.fuse + 4));
  return (
    <g>
      {aura > 0.01 && <circle cx={hx} cy={hy} r={SIZE * (7.5 + 2 * glow)} fill="url(#c01-mid-gold)" opacity={(0.5 + 0.3 * glow) * aura} />}
      <SpermShape
        prefix="c01-mid-"
        x={s.pos.x}
        y={s.pos.y}
        ang={s.ang}
        size={SIZE}
        phase={0.9 * s.clock + 1.3}
        amp={s.amp}
        op={1}
        thick={1.75}
        glow={0.9}
        rim={rim}
        lit={Math.max(s.lit * (1 - rim * 0.6), glow)}
        headOp={s.headOp}
        tailOp={s.tailOp}
      />
    </g>
  );
};
