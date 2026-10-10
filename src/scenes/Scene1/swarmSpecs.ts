import { random } from "remotion";
import { camAt, toLayer, warp } from "./camera";
import { B, HEAD, RING_V, ZONA } from "./constants";
import { add, bezLen, clamp, len, lerp, polar, v } from "./math";
import { LayerId, SOFT, Spec, core, ramp, rampInv } from "./swarmMotion";

// Depth layers: far = tiny, dim, blurred; mid = the egg plane; near = big, sharp.
export const LAYER = {
  far: { p: 0.55, count: 75, size: HEAD * 0.5, thick: 2.2, alpha: 0.58 },
  mid: { p: 1, count: 56, size: HEAD, thick: 1.6, alpha: 0.92 },
  near: { p: 1.7, count: 18, size: HEAD * 2.1, thick: 1.1, alpha: 1 },
} as const;

const DEG = Math.PI / 180;
const CONTACT_DEG = 118;
const FINALISTS = 15;
// the egg centre at the fertilise beat, expressed in a parallax layer
const eggIn = (p: number) => {
  const c = camAt(B.fertilise);
  return toLayer(B.fertilise, p, c.ex, c.ey);
};

const base = (layer: LayerId, key: string, rnd: (k: string) => number) => ({
  key,
  layer,
  t0: B.raceStart,
  omega: 0.6 + rnd("om") * 0.32,
  phi: rnd("ph") * Math.PI * 2,
  amp: 0.85 + rnd("am") * 0.3,
  side: rnd("sd") < 0.5 ? -1 : 1,
  turn: 0.6 + rnd("tu") * 0.9,
  spin: (rnd("sp") - 0.5) * 1.4,
  size: LAYER[layer].size * (0.88 + rnd("sz") * 0.24),
  thick: LAYER[layer].thick,
});

const finish = (s: Omit<Spec, "len" | "v" | "fHit">, arriveT: number, extra = 0): Spec => {
  const L = bezLen(s.p0, s.p1, s.p2);
  const vel = clamp((L - extra) / ramp(arriveT - s.t0), 6, 26);
  return { ...s, len: L, v: vel, fHit: 1e9 };
};

const midSpecs = (): Spec[] => {
  const bottom = toLayer(B.raceStart, 1, 540, 1920).y;
  const out: Spec[] = [];
  for (let i = 0; i < LAYER.mid.count; i++) {
    const key = `s1m${i}`;
    const rnd = (k: string) => random(`${key}-${k}`);
    const b = base("mid", key, rnd);
    if (i < FINALISTS) {
      // Finalists: reach the corona and crowd around it, never touching the zona.
      let th = lerp(-28, 208, (i + 0.15 + rnd("t") * 0.7) / FINALISTS) + (rnd("tj") - 0.5) * 10;
      if (Math.abs(th - CONTACT_DEG) < 22) th = CONTACT_DEG + Math.sign(th - CONTACT_DEG || 1) * 24;
      const d = 168 + rnd("d") ** 1.6 * 110;
      const p2 = polar(d, th * DEG);
      const p1 = add(p2, polar(360 + rnd("l") * 220, (th + (rnd("o") - 0.5) * 70) * DEG));
      const sideX = Math.sign(p2.x || 1);
      const p0 = v(sideX * (120 + rnd("x") * 420), bottom + 30 + rnd("y") ** 1.5 * 460);
      const s = { ...b, final: true, p0, p1, p2, wander: 10 + rnd("w") * 8, pushFrom: v(0, 0), push: 110 + rnd("pu") * 120 };
      out.push(finish(s, B.oneWins - 32 + rnd("ta") * 30, SOFT));
    } else {
      // The ones that fall behind: lose pace at a staggered time, veer, fade.
      const t = rnd("ta");
      const arrive = lerp(B.millions - 16, B.oneWins + 4, t);
      const p2 = v(b.side * (150 + rnd("x2") * 470), lerp(1000, 300, t) + (rnd("y2") - 0.5) * 220);
      const p1 = v(p2.x - b.side * (80 + rnd("cx") * 220), p2.y + 280 + rnd("cy") * 300);
      const p0 = v(clamp(p2.x * 0.75 + (rnd("x") - 0.5) * 520, -580, 580), bottom + 60 + rnd("y") ** 1.3 * 760);
      const s = { ...b, final: false, p0, p1, p2, wander: 14 + rnd("w") * 14, pushFrom: v(0, 0), push: 90 + rnd("pu") * 90 };
      out.push(finish(s, arrive));
    }
  }
  // The zona shockwave reaches each sperm when it passes its distance.
  return out.map((s) => {
    const d = len(core(s, warp(B.fertilise)).pos);
    return { ...s, fHit: B.fertilise + Math.max(0, d - ZONA) / RING_V };
  });
};

const farSpecs = (): Spec[] => {
  const p = LAYER.far.p;
  return Array.from({ length: LAYER.far.count }, (_, i) => {
    const key = `s1f${i}`;
    const rnd = (k: string) => random(`${key}-${k}`);
    const b = base("far", key, rnd);
    const t = rnd("ta");
    const arrive = lerp(52, B.oneWins + 8, t);
    const p0 = toLayer(B.raceStart, p, rnd("sx") * 1080, 1760 + rnd("sy") ** 1.3 * 680);
    const p2 = toLayer(arrive, p, 540 + (rnd("dx") - 0.5) * 900, lerp(1250, 520, t) + (rnd("dy") - 0.5) * 260);
    const p1 = v(lerp(p0.x, p2.x, 0.4) + (rnd("cx") - 0.5) * 240, lerp(p0.y, p2.y, 0.55));
    const egg = eggIn(p);
    const s = { ...b, final: false, p0, p1, p2, wander: 10, pushFrom: egg, push: 50 };
    return { ...finish(s, arrive), fHit: B.fertilise + 1 + rnd("h") * 8 };
  });
};

const NEAR_V = 25; // cruise cap for the nearest swimmers (under finish()'s clamp)

const nearSpecs = (): Spec[] => {
  const p = LAYER.near.p;
  return Array.from({ length: LAYER.near.count }, (_, i) => {
    const key = `s1n${i}`;
    const rnd = (k: string) => random(`${key}-${k}`);
    const b = base("near", key, rnd);
    const left = i % 2 === 0;
    const sx = left ? 20 + rnd("sx") * 420 : 640 + rnd("sx") * 420;
    const want = lerp(38, 100, rnd("ta"));
    const dx = left ? -40 + rnd("dx") * 300 : 820 + rnd("dx") * 300;
    const dy = 330 + rnd("dy") * 800;
    const p0 = toLayer(B.raceStart, p, sx, 1800 + rnd("sy") * 560);
    const p2 = toLayer(want, p, dx, dy);
    const p1 = v(lerp(p0.x, p2.x, 0.3), lerp(p0.y, p2.y, 0.6));
    // long paths take a little longer rather than outrunning the camera
    const arrive = Math.max(want, B.raceStart + rampInv(bezLen(p0, p1, p2) / NEAR_V));
    const egg = eggIn(p);
    const s = { ...b, final: false, p0, p1, p2, wander: 22, pushFrom: egg, push: 60, side: left ? -1 : 1 };
    return { ...finish(s, arrive), fHit: B.fertilise + 2 };
  });
};

// The hook: two big near-layer swimmers that cut through the upper frame in
// the first second, so the opening moves from frame 1, clear of the platform
// UI strip at the bottom. Screen-space paths [start, bend, exit] (both exit
// off-frame, below and beside the egg); speeds stay under finish()'s clamp.
const HOOKS = [
  { t0: B.raceStart - 8, v: 25, pts: [v(-190, 1400), v(420, 1080), v(1300, 660)] },
  { t0: B.raceStart - 8, v: 23, pts: [v(400, 2060), v(300, 1240), v(-200, 520)] },
];

const hookSpecs = (): Spec[] => {
  const p = LAYER.near.p;
  return HOOKS.map((h, i) => {
    const key = `s1h${i}`;
    const rnd = (k: string) => random(`${key}-${k}`);
    const [p0, p1, p2] = h.pts.map((q) => toLayer(B.raceStart, p, q.x, q.y));
    const b = base("near", key, rnd);
    // a touch bigger than the rest: right past the lens
    const s = { ...b, size: b.size * 1.45, thick: b.thick * 1.3, t0: h.t0, final: false, p0, p1, p2, wander: 12, pushFrom: eggIn(p), push: 60 };
    return { ...s, len: bezLen(p0, p1, p2), v: h.v, fHit: B.fertilise + 2 };
  });
};

export const SPECS: Record<LayerId, Spec[]> = {
  far: farSpecs(),
  mid: midSpecs(),
  near: [...nearSpecs(), ...hookSpecs()],
};
