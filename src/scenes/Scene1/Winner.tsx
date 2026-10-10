import React from "react";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../lib/ease";
import { warp } from "./camera";
import { B, CDIR, R, ZONA } from "./constants";
import { LANE, SIZE, laneAt } from "./lane";
import { Vec, add, clamp, keys, mul } from "./math";
import { SpermShape } from "./Sperm";

// The one that wins. Same body as the rest, a touch brighter, with a thin
// gold rim light that switches on as it breaks away from the pack.

// Distance to go, keyed to the beats: level with its rivals at "millions",
// surges past them, eases into the slow-mo creep, touches at "fertilise".
const toGo = keys(
  [B.raceStart - 10, B.raceStart, B.millions, B.millions + 26, B.oneWins - 6, B.oneWins, B.oneWins + 12, B.fertilise],
  [LANE + 90, LANE, 600, 270, 80, 50, 14, 0],
);

export type WinnerState = { pos: Vec; ang: number; headOp: number; tailOp: number; amp: number };

export const winnerAt = (f: number): WinnerState => {
  const D = toGo(f);
  const { pos: p, tan } = laneAt(D);
  const free = clamp(D / 420);
  const wob = noise2D("s1win", warp(f) * 0.02, 0) * 16 * free;
  let pos = add(p, { x: -tan.y * wob, y: tan.x * wob });
  // after contact: the head sinks through the zona and fuses with the membrane
  const pen = tween(f, B.fertilise, B.fertilise + 16, [0, 1], EASE.inOut);
  pos = add(pos, mul(CDIR, -pen * (ZONA - R + SIZE * 0.55)));
  const ang = Math.atan2(tan.y, tan.x) + noise2D("s1wina", warp(f) * 0.04, 2) * 0.08 * free;
  return {
    pos,
    ang: (ang * 180) / Math.PI,
    headOp: 1 - tween(f, B.fertilise + 10, B.fertilise + 22, [0, 1], EASE.in),
    tailOp: 1 - tween(f, B.fertilise + 2, B.fertilise + 18, [0, 1], EASE.inOut),
    amp: 1 - tween(f, B.fertilise, B.fertilise + 12, [0, 0.7], EASE.out),
  };
};

// The gold light switches on as it starts to pull ahead.
export const rimAt = (f: number) => tween(f, B.millions + 8, B.millions + 30, [0, 1], EASE.inOut);

export const Winner: React.FC<{ frame: number }> = ({ frame }) => {
  const s = winnerAt(frame);
  if (s.headOp <= 0.01 && s.tailOp <= 0.01) return null;
  const rim = rimAt(frame);
  const a = (s.ang * Math.PI) / 180;
  const hx = s.pos.x + Math.cos(a) * SIZE * 0.5;
  const hy = s.pos.y + Math.sin(a) * SIZE * 0.5;
  // a wide, soft gold aura so the winner reads at phone size
  const aura = rim * s.headOp * (1 - 0.5 * tween(frame, B.fertilise - 2, B.fertilise + 4));
  return (
    <g>
      {aura > 0.01 && <circle cx={hx} cy={hy} r={SIZE * 6.5} fill="url(#s1-mid-gold)" opacity={0.42 * aura} />}
      <SpermShape
        prefix="s1-mid-"
        x={s.pos.x}
        y={s.pos.y}
        ang={s.ang}
        size={SIZE}
        phase={0.9 * warp(frame) + 1.3}
        amp={s.amp}
        op={1}
        thick={1.75}
        glow={0.9}
        rim={rim}
        headOp={s.headOp}
        tailOp={s.tailOp}
      />
    </g>
  );
};
