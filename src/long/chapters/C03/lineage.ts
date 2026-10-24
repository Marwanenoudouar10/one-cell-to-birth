import { random } from "remotion";
import { GENS, TILT, pitchAt, yawAt } from "./timeline";
import { LAYOUT } from "./beats";
import { V3, add3, len3, mul3, norm3, rot, sub3, unrot } from "./geometry";

// (Adapted from the teaser's Scene2.) The family tree of the embryo, computed
// once. STAGES[g] holds the 2^g cells after g divisions, each with its packed
// target position inside the zona. Radii shrink so the cluster stays the size
// of the zygote: it splits, it does not grow.
export type LCell = {
  p: V3; // target position, cluster-local 3D (px)
  r: number;
  parent: number;
  birth: number; // frame its furrow completed
  start: number; // frame its own furrow starts (Infinity = never divides)
  brk: number; // frame its own furrow completes
};

export const R_STAGE = [150, 92, 82, 67, 53, 43, 35];
const ZONA_IN = 168;

// Repel to a minimum spacing, pull gently to the centre (a compact ball, no
// hollow core) and stay inside the zona.
const relax = (ps: V3[], r: number, fill = false) => {
  const minD = r * 1.74;
  const lim = ZONA_IN - r * 0.92;
  for (let it = 0; it < 140; it++) {
    for (let i = 0; i < ps.length; i++) ps[i] = mul3(ps[i], 0.985);
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const d = sub3(ps[j], ps[i]);
        const l = len3(d);
        if (l >= minD) continue;
        const n: V3 = l > 1e-6 ? mul3(d, 1 / l) : [1, 0, 0];
        const push = (minD - l) * 0.3;
        ps[i] = sub3(ps[i], mul3(n, push));
        ps[j] = add3(ps[j], mul3(n, push));
      }
    }
    for (let i = 0; i < ps.length; i++) {
      const l = len3(ps[i]);
      if (l > lim) ps[i] = mul3(ps[i], lim / l);
    }
  }
  if (!fill) return;
  // Late stages fill the zona edge to edge (a round mulberry pressed against
  // the shell), so "same size, smaller cells" reads at a glance. The outer
  // layer is eased out onto the limit sphere; inner gaps read as deeper cells.
  for (let i = 0; i < ps.length; i++) {
    const l = len3(ps[i]);
    if (l < 1e-6) continue;
    const t = Math.min(1, l / (lim * 0.8));
    const target = l + (lim - l) * t * t * 0.85;
    ps[i] = mul3(ps[i], target / l);
  }
};

// Split direction: tangential and roughly in the image plane around the
// division (view angle at the frozen LAYOUT frame, END contract), so every
// division reads clearly on screen.
const splitAxis = (p: V3, g: number, i: number): V3 => {
  const f = LAYOUT.split[g - 3];
  const yaw = yawAt(f);
  const pitch = pitchAt(f);
  const v = rot(p, yaw, pitch);
  const rl = Math.hypot(v[0], v[1]);
  const base = rl > 15 ? Math.atan2(v[0], -v[1]) : random(`c03ax${g}-${i}`) * Math.PI;
  const a = base + (random(`c03aj${g}-${i}`) - 0.5) * 1.1;
  const tilt = (random(`c03az${g}-${i}`) - 0.5) * 0.5;
  return norm3(unrot([Math.cos(a), Math.sin(a), tilt], yaw, pitch));
};

const build = (): LCell[][] => {
  const cell = (p: V3, r: number, parent: number): LCell => ({
    p,
    r,
    parent,
    birth: -999,
    start: Infinity,
    brk: Infinity,
  });
  const stages: LCell[][] = [[cell([0, 0, 0], R_STAGE[0], -1)]];
  // Early stages are staged in VIEW space at (about) their beat, then mapped
  // back to the tumbling cluster frame, so the camera sees them at their
  // clearest. The frames are the frozen LAYOUT seeds (END contract).
  const atView = (v: V3, f: number) => unrot(v, yawAt(f), pitchAt(f));
  // 2-cell: side by side along the zygote's (tilted) stretch axis, a touch of
  // depth. Only this stage uses TILT: 4..64 are laid out independently.
  const f2 = LAYOUT.two;
  const t2 = (TILT * Math.PI) / 180;
  const two: V3 = [72 * Math.cos(t2) + 4 * Math.sin(t2), 72 * Math.sin(t2) - 4 * Math.cos(t2), 14];
  stages.push([cell(atView(two, f2), R_STAGE[1], 0), cell(atView(mul3(two, -1), f2), R_STAGE[1], 0)]);
  // 4-cell: a tetrahedron seen down its square axis: four cells in a diamond,
  // one diagonal pair in front (the two second divisions are perpendicular).
  const f4 = LAYOUT.four;
  const q = 60;
  const c = 30;
  stages.push([
    cell(atView([q, -q, c], f4), R_STAGE[2], 0),
    cell(atView([q, q, -c], f4), R_STAGE[2], 0),
    cell(atView([-q, q, c], f4), R_STAGE[2], 1),
    cell(atView([-q, -q, -c], f4), R_STAGE[2], 1),
  ]);
  // 8 .. 64: split each cell, then let the packing settle inside the zona.
  for (let g = 3; g <= 6; g++) {
    const prev = stages[g - 1];
    const r = R_STAGE[g];
    const ps: V3[] = [];
    prev.forEach((pc, i) => {
      const ax = splitAxis(pc.p, g, i);
      ps.push(add3(pc.p, mul3(ax, r * 0.62)), sub3(pc.p, mul3(ax, r * 0.62)));
    });
    relax(ps, r, g >= 5);
    stages.push(ps.map((p, k) => cell(p, r, k >> 1)));
  }
  // Timing: each division starts in its generation window (not in step),
  // but never before the cell itself was born.
  for (let g = 1; g <= 6; g++) {
    const G = GENS[g - 1];
    stages[g - 1].forEach((pc, i) => {
      const jit = Math.round(random(`c03jt${g}-${i}`) * G.jitter);
      pc.start = Math.max(G.start + jit, pc.birth + 1);
      pc.brk = pc.start + G.dur;
      stages[g][2 * i].birth = pc.brk;
      stages[g][2 * i + 1].birth = pc.brk;
    });
  }
  return stages;
};

export const STAGES = build();
export const LAST = STAGES.length - 1;
