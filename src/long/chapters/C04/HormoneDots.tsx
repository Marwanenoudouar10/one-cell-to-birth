import React from "react";
import { random, spring } from "remotion";
import { C } from "../../../theme/colors";
import { FPS } from "../../../theme/layout";
import { EASE, tween } from "../../../lib/ease";
import { mix } from "./palette";
import { B, CX, CY, ballPos, ballR, camera } from "./timeline";
import { Pt, bez, clamp01 } from "./geometry";
import { LINE_AT, Y0 } from "./TestStrip";

// The hormone under the strip (screen px): gold glow dots, the same tint as
// the particles the outer cells release, doubling 1 -> 2 -> 4 -> 8 (each
// dot splits in two, like the cells did). Then they stream up into the result
// window, where the second line soaks in. Slight seeded offsets in height and
// size, so the row never reads as a ruler.
const GENS = [B.dot1, B.dot2, B.dot4, B.dot8];
const SP = 58;
const ROW_Y = Y0 + 128;
const SPLIT = { damping: 12, stiffness: 170, mass: 0.6 };

// Slot j of 8 (final row), and its parent slots in the 4-, 2- and 1-dot rows.
const xAt = (n: number, j: number) => (j - (n - 1) / 2) * SP;
const jit = (n: number, j: number) => ({
  y: (random(`c04d-y${n}-${j}`) - 0.5) * 12,
  s: 0.88 + random(`c04d-s${n}-${j}`) * 0.24,
});

const slot = (n: number, j: number): Pt => [540 + xAt(n, j), ROW_Y + jit(n, j).y];

// The first dot is the message itself: it rises out of the buried ball's
// outer cells, up through the lining, and settles under the strip on "hormone".
const RISE = 14;
const riseFrom = (f: number): Pt => {
  const c = camera(f);
  const [bx, by] = ballPos(f);
  return [CX + (bx - c.x) * c.s, CY + (by - ballR(f) * 0.94 - c.y) * c.s];
};
const rise = (f: number, to: Pt): Pt => {
  const p0 = riseFrom(B.dot1 - RISE);
  const u = EASE.inOut(clamp01((f - (B.dot1 - RISE)) / RISE));
  return bez(p0, [p0[0] - 6, p0[1] - 70], [to[0] + 14, to[1] + 60], to, u);
};

export const dotsOp = (f: number) => tween(f, B.dot1 - RISE - 1, B.dot1 - RISE + 5, [0, 1], EASE.out);

export const HormoneDots: React.FC<{ f: number }> = ({ f }) => {
  let g = -1;
  GENS.forEach((t, i) => {
    if (f >= t) g = i;
  });
  if (g < 0 && f >= B.dot1 - RISE - 1) g = 0;
  if (g < 0) return null;
  const n = 2 ** g;
  const t0 = GENS[g];
  const v = spring({ frame: f - t0, fps: FPS, config: SPLIT });
  const pulse = tween(f, t0, t0 + 3, [0, 1], EASE.out) * (1 - tween(f, t0 + 3, t0 + 16, [0, 1], EASE.inOut));
  // Flight into the window: centre dots first, rising then curling in.
  const fly = (j: number, p0: Pt, u: number): Pt => {
    const side = j < n / 2 ? -1 : 1;
    return bez(p0, [p0[0], p0[1] - 56], [LINE_AT[0] + side * 46, LINE_AT[1] + 34], LINE_AT, u);
  };
  const dots = Array.from({ length: n }, (_, j) => {
    const to = slot(n, j);
    const from = g === 0 ? to : slot(n / 2, j >> 1);
    const bob = 2.2 * Math.sin(f * 0.09 + j * 1.3);
    const p0: Pt = [from[0] + (to[0] - from[0]) * v, from[1] + (to[1] - from[1]) * v + bob];
    let p = p0;
    let tail: Pt[] = [];
    let sc = jit(n, j).s;
    let o = 1;
    if (f < B.dot1) {
      const end: Pt = [to[0], to[1] + bob];
      p = rise(f, end);
      tail = [1, 2, 3, 4].map((q) => rise(f - q * 0.9, end));
      sc *= 0.8 + 0.2 * clamp01((f - (B.dot1 - RISE)) / RISE);
    }
    if (g === 3) {
      const t0 = B.absorb + Math.abs(j - 3.5) * 1.5;
      const u = EASE.inOut(clamp01((f - t0) / 10));
      if (u > 0) {
        p = fly(j, p0, u);
        // Comet tail: a few fading beads a moment behind along the same path.
        tail = [1, 2, 3, 4].map((q) => fly(j, p0, EASE.inOut(clamp01((f - q * 0.8 - t0) / 10))));
        sc *= 1 - 0.5 * u;
        o = 1 - clamp01((u - 0.8) / 0.2);
      }
    }
    return { p, tail, sc, o };
  });
  return (
    <g opacity={dotsOp(f)}>
      <defs>
        <radialGradient id="c04d-dot">
          <stop offset={0} stopColor={C.text} stopOpacity={1} />
          <stop offset={0.22} stopColor={C.gold} stopOpacity={0.85} />
          <stop offset={0.5} stopColor={C.gold} stopOpacity={0.25} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {dots.map((d, j) =>
        d.o > 0.01
          ? d.tail.map((t, q) => (
              <circle key={`t${j}-${q}`} cx={t[0]} cy={t[1]} r={(10 - q * 1.8) * d.sc} fill={C.gold} opacity={(0.42 - q * 0.09) * d.o} />
            ))
          : null,
      )}
      {dots.map((d, j) =>
        d.o > 0.01 ? (
          <g key={`${g}-${j}`} transform={`translate(${d.p[0].toFixed(1)} ${d.p[1].toFixed(1)}) scale(${d.sc.toFixed(3)})`} opacity={d.o}>
            <circle r={36 + 10 * pulse} fill="url(#c04d-dot)" opacity={0.9} />
            <circle r={11} fill={mix(C.gold, C.text, 0.5)} />
          </g>
        ) : null,
      )}
    </g>
  );
};
