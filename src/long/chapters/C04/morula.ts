import { random } from "remotion";
import { CAV, ROLL0, pitchAt, yawAt } from "./timeline";
import { project, rot, rot2 } from "./geometry";
import { CELL_R as R3, MORULA3 } from "./c03";

// The 64-cell morula C03 ends on (cluster-local 3D px, packed inside the
// zona, copied from C03 so the fade is seamless), and the hollow-ball layout
// its cells flow to (adapted from the teaser's Scene2 blasto.ts): a ring of
// 40 flat outer cells (trophectoderm) around the fluid cavity, plus the
// inner knot (inner cell mass) of 24 round cells pressed against one side.
export const N_CELLS = MORULA3.length;
export const CELL_R = R3;
export const MORULA = MORULA3;

// --- hollow-ball layout (slot frame: knot at the bottom; the whole layout is
// then turned by rollAt(f)) -----------------------------------------------
export const N_RING = 40;
const RING0 = 146; // ring radius the slots are designed at
const TE_A = 17; // trophectoderm half-length (tangential): flat cells
const TE_B = 7; // half-thickness (radial)
const ICM_R = 16;
export const ICM_INNER = RING0 - TE_B - ICM_R * 0.55;
export const ICM_LENS = { y: RING0 * 0.995, r: RING0 * 0.66 };

export type Slot = { ring: boolean; ang: number; inset: number; r: number; t?: number; delay: number };

const ringAng = (j: number) => -Math.PI + ((j + 0.5) / N_RING) * Math.PI * 2;
// Living cells, not beads: each flat outer cell gets a little seeded play in
// its spot, length and thickness.
const ringJit = (j: number) => ((random(`c04rj${j}`) - 0.5) * 0.45 * Math.PI * 2) / N_RING;

// Knot cells relaxed inside a lens (the cap of the cavity at the bottom).
const icmSlots = (n: number) => {
  const inner = ICM_INNER;
  const lc = ICM_LENS;
  const inside = (x: number, y: number) => Math.hypot(x, y) <= inner && Math.hypot(x, y - lc.y) <= lc.r;
  const ps: [number, number][] = [];
  for (let i = 0; ps.length < n && i < 4000; i++) {
    const x = (random(`c04ix${i}`) - 0.5) * 2 * lc.r;
    const y = RING0 * 0.2 + random(`c04iy${i}`) * RING0 * 0.8;
    if (inside(x, y)) ps.push([x, y]);
  }
  const minD = ICM_R * 1.5;
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < ps.length; i++) {
      ps[i][1] += 0.08;
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
      const dy = p[1] - lc.y;
      const m = Math.hypot(p[0], dy);
      if (m > lc.r) {
        p[0] = (p[0] * lc.r) / m;
        p[1] = lc.y + (dy * lc.r) / m;
      }
    }
  }
  return ps.map(([x, y], i) => ({ ang: Math.atan2(y, x), inset: RING0 - Math.hypot(x, y), r: ICM_R * (0.92 + 0.16 * random(`c04ir${i}`)) }));
};

const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};

// Outermost cells (as seen in the tumble pose of frame LAYOUT_SEED) become the
// ring; the rest gather into the knot. Positions are compared in the slot frame.
// LAYOUT_SEED is a seed, not a timing: which cell takes which slot sets the
// END frame C05 is matched to (draw order, wobble seeds, nuclei), so it stays
// pinned to the pose it was signed off with (B.cavity before the 2026-10 voice
// retime) whenever the cavity beat moves. Cost of the 22 f tumble since then:
// mean travel 56 -> 61 px.
const LAYOUT_SEED = 12;
const assign = (): Slot[] => {
  const f0 = LAYOUT_SEED;
  const cells = MORULA.map((p, i) => {
    const v = project(rot(p, yawAt(f0), pitchAt(f0)));
    const [x, y] = rot2(v.x, v.y, -ROLL0);
    return { i, x, y, rad: Math.hypot(x, y), ang: Math.atan2(y, x) };
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
    const j = (k + best) % N_RING;
    slots[c.i] = {
      ring: true,
      ang: ringAng(j) + ringJit(j),
      inset: (random(`c04ri${j}`) - 0.5) * 2.4,
      r: TE_A * (0.86 + 0.28 * random(`c04ra${j}`)),
      t: TE_B * (0.85 + 0.3 * random(`c04rt${j}`)),
      delay: 1.5 + random(`c04rd${c.i}`) * 3.5,
    };
  });
  const icmS = icmSlots(cells.length - N_RING).sort(
    (a, b) => (RING0 - a.inset) * Math.cos(a.ang) - (RING0 - b.inset) * Math.cos(b.ang),
  );
  icm.forEach((c, k) => {
    const s = icmS[k];
    slots[c.i] = { ring: false, ang: s.ang, inset: s.inset, r: s.r, delay: random(`c04id${c.i}`) * CAV.stagger * 0.6 };
  });
  return slots;
};

export const SLOTS = assign();

// Where a slot sits (slot frame) for ring radius R, and its shape.
export const slotGeom = (s: Slot, R: number) => {
  const k = R / RING0;
  const d = R - s.inset * k;
  return {
    x: Math.cos(s.ang) * d,
    y: Math.sin(s.ang) * d,
    a: s.ring ? s.r * k : s.r,
    b: s.ring ? (s.t ?? TE_B) : s.r,
    ang: s.ang + Math.PI / 2,
  };
};

// Outline points of the knot's soft shared body (lens cap), slot frame.
export const icmBodyPts = (R: number, n = 40): [number, number][] => {
  const k = R / RING0;
  const a = ICM_INNER * k;
  const ly = ICM_LENS.y * k;
  const lr = ICM_LENS.r * k;
  const y = (a * a - lr * lr + ly * ly) / (2 * ly);
  const x = Math.sqrt(Math.max(0, a * a - y * y));
  const out: [number, number][] = [];
  // Lower arc (ring side, radius a) from right to left, then the lens arc back.
  const a0 = Math.atan2(y, x);
  const a1 = Math.atan2(y, -x);
  for (let i = 0; i <= n / 2; i++) {
    const t = a0 + ((a1 - a0) * i) / (n / 2);
    out.push([Math.cos(t) * a, Math.sin(t) * a]);
  }
  const b0 = Math.atan2(y - ly, -x) + Math.PI * 2;
  const b1 = Math.atan2(y - ly, x) + Math.PI * 2;
  for (let i = 1; i < n / 2; i++) {
    const t = b0 + ((b1 - b0) * i) / (n / 2);
    out.push([Math.cos(t) * lr, ly + Math.sin(t) * lr]);
  }
  return out;
};
