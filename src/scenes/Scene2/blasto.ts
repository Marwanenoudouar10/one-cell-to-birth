import { random } from "remotion";
import { CAV, pitchAt, yawAt } from "./timeline";
import { LAST, STAGES } from "./lineage";
import { project, rot } from "./geometry";

// Blastocyst layout: a ring of flat trophectoderm cells around the fluid
// cavity, plus the inner cell mass (ICM) clumped on the side facing the womb
// wall (down) — the embryonic pole implants first.
export const N_RING = 36;
const R0 = 146; // ring radius the slots are designed at
const TE_A = 17; // trophectoderm half-length (tangential) — flat cells
const TE_B = 7; // trophectoderm half-thickness (radial)
const ICM_R = 15;

export type Slot = { ring: boolean; ang: number; inset: number; r: number; delay: number };

const ringAng = (j: number) => -Math.PI + ((j + 0.5) / N_RING) * Math.PI * 2;

// ICM: cells relaxed inside a lens (the cap of the cavity facing down), so the
// clump reads as one soft rounded mound pressed against the wall.
export const ICM_INNER = R0 - TE_B - ICM_R * 0.55;
export const ICM_LENS = { y: R0 * 0.995, r: R0 * 0.74 };
const icmSlots = (n: number) => {
  const inner = ICM_INNER;
  const lc = { x: 0, y: ICM_LENS.y, r: ICM_LENS.r };
  const inside = (x: number, y: number) => Math.hypot(x, y) <= inner && Math.hypot(x - lc.x, y - lc.y) <= lc.r;
  const ps: [number, number][] = [];
  for (let i = 0; ps.length < n && i < 4000; i++) {
    const x = (random(`ix${i}`) - 0.5) * 2 * lc.r;
    const y = R0 * 0.2 + random(`iy${i}`) * R0 * 0.8;
    if (inside(x, y)) ps.push([x, y]);
  }
  const minD = ICM_R * 1.5;
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < ps.length; i++) {
      ps[i][1] += 0.08; // a light settle toward the embryonic pole
      for (let j = i + 1; j < ps.length; j++) {
        const dx = ps[j][0] - ps[i][0];
        const dy = ps[j][1] - ps[i][1];
        const l = Math.hypot(dx, dy) || 1e-3;
        if (l >= minD) continue;
        const push = (minD - l) * 0.3;
        ps[i][0] -= (dx / l) * push;
        ps[i][1] -= (dy / l) * push;
        ps[j][0] += (dx / l) * push;
        ps[j][1] += (dy / l) * push;
      }
    }
    for (const p of ps) {
      const l = Math.hypot(p[0], p[1]);
      if (l > inner) {
        p[0] *= inner / l;
        p[1] *= inner / l;
      }
      const dx = p[0] - lc.x;
      const dy = p[1] - lc.y;
      const m = Math.hypot(dx, dy);
      if (m > lc.r) {
        p[0] = lc.x + (dx * lc.r) / m;
        p[1] = lc.y + (dy * lc.r) / m;
      }
    }
  }
  return ps.map(([x, y], i) => ({
    ang: Math.atan2(y, x),
    inset: R0 - Math.hypot(x, y),
    r: ICM_R * (0.92 + 0.16 * random(`ir${i}`)),
  }));
};

const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};

const assign = (): Slot[] => {
  const f0 = CAV.start;
  const cells = STAGES[LAST].map((c, i) => {
    const v = project(rot(c.p, yawAt(f0), pitchAt(f0)));
    return { i, x: v.x, y: v.y, rad: Math.hypot(v.x, v.y), ang: Math.atan2(v.y, v.x) };
  });
  const byRad = [...cells].sort((a, b) => b.rad - a.rad);
  const ring = byRad.slice(0, N_RING).sort((a, b) => a.ang - b.ang);
  const icm = byRad.slice(N_RING).sort((a, b) => a.x - b.x);
  let best = 0;
  let bestCost = Infinity;
  for (let o = 0; o < N_RING; o++) {
    let cost = 0;
    ring.forEach((c, k) => {
      cost += angDiff(c.ang, ringAng((k + o) % N_RING)) ** 2;
    });
    if (cost < bestCost) {
      bestCost = cost;
      best = o;
    }
  }
  const slots: Slot[] = new Array(cells.length);
  ring.forEach((c, k) => {
    slots[c.i] = { ring: true, ang: ringAng((k + best) % N_RING), inset: 0, r: TE_A, delay: 1.5 + random(`rd${c.i}`) * 3.5 };
  });
  const icmS = icmSlots(cells.length - N_RING).sort((a, b) => (R0 - a.inset) * Math.cos(a.ang) - (R0 - b.inset) * Math.cos(b.ang));
  icm.forEach((c, k) => {
    const s = icmS[k];
    slots[c.i] = { ring: false, ang: s.ang, inset: s.inset, r: s.r, delay: random(`id${c.i}`) * CAV.stagger * 0.6 };
  });
  return slots;
};

export const SLOTS = assign();

// Where a slot sits for a given ring radius R, and its shape.
export const slotGeom = (s: Slot, R: number) => {
  const k = R / R0;
  const d = R - s.inset * k;
  return {
    x: Math.cos(s.ang) * d,
    y: Math.sin(s.ang) * d,
    a: s.ring ? TE_A * k : s.r,
    b: s.ring ? TE_B : s.r,
    ang: s.ang + Math.PI / 2,
  };
};

// Outline of the ICM mound (lens cap inside the trophectoderm), for its soft
// shared body. Scales with the ring like the ICM slots do.
export const icmBodyPath = (R: number) => {
  const k = R / R0;
  const a = ICM_INNER * k;
  const ly = ICM_LENS.y * k;
  const lr = ICM_LENS.r * k;
  const y = (a * a - lr * lr + ly * ly) / (2 * ly);
  const x = Math.sqrt(Math.max(0, a * a - y * y));
  const f = (v: number) => v.toFixed(1);
  return `M${f(-x)} ${f(y)}A${f(lr)} ${f(lr)} 0 0 1 ${f(x)} ${f(y)}A${f(a)} ${f(a)} 0 0 1 ${f(-x)} ${f(y)}Z`;
};
