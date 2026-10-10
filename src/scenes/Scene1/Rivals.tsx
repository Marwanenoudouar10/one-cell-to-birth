import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, tween } from "../../lib/ease";
import { warp } from "./camera";
import { B, END, HEAD, RING_V, ZONA } from "./constants";
import { LANE, laneAt } from "./lane";
import { add, keys, len, mul, norm } from "./math";
import { SpermShape } from "./Sperm";
import { packDim } from "./swarmMotion";

// The leading pack: a handful of sperm swimming the winner's lane beside it.
// Level with (some ahead of) the winner at "millions", they tire, get
// overtaken and stall in the corona, then the zona reaction throws them off.
const F = B.fertilise;
const SIDES = [-1, 1, -1, 1, 1, -1];

const RIVALS = SIDES.map((sg, i) => {
  const rnd = (k: string) => random(`s1r${i}-${k}`);
  const stall = 105 + rnd("s") * 85;
  const toGo = keys(
    [B.raceStart - 10, B.raceStart, B.millions, B.millions + 18, B.millions + 32, B.oneWins - 4, F],
    [
      LANE + 90 + rnd("a") * 80,
      LANE + rnd("b") * 60,
      600 + (rnd("m") - 0.6) * 110,
      372 + (rnd("n") - 0.5) * 50,
      258 + rnd("q") * 40,
      stall + 26,
      stall,
    ],
  );
  const side = sg * (34 + rnd("o") * 62);
  const at = (f: number) => laneAt(toGo(f), side * (1 + 0.35 * tween(f, B.millions + 20, B.oneWins)));
  const dHit = len(at(F).pos);
  return {
    key: `s1r${i}`,
    at,
    size: HEAD * (0.94 + rnd("z") * 0.1),
    omega: 0.66 + rnd("w") * 0.26,
    phi: rnd("p") * Math.PI * 2,
    fHit: F + Math.max(0, dHit - ZONA) / RING_V,
    push: 90 + rnd("u") * 70,
    spin: (rnd("sp") - 0.5) * 1.2,
  };
});

export const Rivals: React.FC<{ frame: number }> = ({ frame }) => {
  const T = warp(frame);
  const tired = tween(frame, B.millions + 22, B.oneWins, [0, 1], EASE.inOut);
  const dim = packDim(frame) * (1 - tween(frame, F + 4, END - 6, [0, 1], EASE.inOut));
  return (
    <g>
      {RIVALS.map((r) => {
        const fr = Math.min(frame, r.fHit);
        const { pos: p, tan } = r.at(fr);
        const w = noise2D(`${r.key}w`, T * 0.02, 0) * 12;
        let pos = add(p, { x: -tan.y * w, y: tan.x * w });
        pos = add(pos, mul(tan, noise2D(`${r.key}j`, T * 0.07, 1) * 8 * tired));
        let ang = Math.atan2(tan.y, tan.x) + noise2D(`${r.key}a`, T * 0.04, 2) * (0.1 + 0.16 * tired);
        const hit = tween(frame, r.fHit, r.fHit + 24, [0, 1], EASE.out);
        if (hit > 0) {
          pos = add(pos, mul(norm(pos), r.push * hit));
          ang += r.spin * hit;
        }
        const op = dim * (1 - tween(frame, r.fHit + 2, r.fHit + 22, [0, 1], EASE.in));
        if (op < 0.01) return null;
        return (
          <SpermShape
            key={r.key}
            prefix="s1-mid-"
            x={pos.x}
            y={pos.y}
            ang={(ang * 180) / Math.PI}
            size={r.size}
            phase={r.omega * T + r.phi}
            amp={(0.95 - 0.3 * tired) * (1 - 0.6 * hit)}
            op={0.92 * op}
            thick={1.6}
            glow={0.65}
          />
        );
      })}
    </g>
  );
};
