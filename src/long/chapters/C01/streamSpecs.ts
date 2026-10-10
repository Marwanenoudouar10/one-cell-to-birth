import { random } from "remotion";
import { B } from "./beats";
import { camAt, toLayer } from "./camera";
import { LAYER, LayerId } from "./constants";
import { MESH_H, gateY, lowerSurf, meshY } from "./corridor";
import { Vec, bezLen, clamp, lerp, v } from "./math";
import { Fate, How, StreamSpec, alivePos } from "./stream";

// Builds the travelling swarm once (deterministic). Each layer gets a fate mix;
// the frame a sperm drops out is found by stepping until its gate reaches it.
const firstFrame = (from: number, to: number, hit: (f: number) => boolean, fallback: number) => {
  for (let f = from; f <= to; f++) if (hit(f)) return f;
  return fallback;
};

type Rnd = (k: string) => number;
type Place = { slot: Vec; p0: Vec; drift: number };

const spec = (layer: LayerId, key: string, rnd: Rnd, fate: Fate, pl: Place): StreamSpec => {
  const L = LAYER[layer];
  const dist = Math.hypot(pl.slot.x - pl.p0.x, pl.slot.y - pl.p0.y);
  const r = rnd("how");
  const how: How = r < 0.5 ? "tangle" : r < 0.8 ? "bounce" : "fade";
  return {
    key,
    layer,
    p: L.p,
    size: L.size * (0.88 + rnd("sz") * 0.24),
    thick: L.thick,
    omega: 0.6 + rnd("om") * 0.32,
    phi: rnd("ph") * Math.PI * 2,
    amp: 0.85 + rnd("am") * 0.3,
    p0: pl.p0,
    p1: v(lerp(pl.p0.x, pl.slot.x, 0.35) + (rnd("cx") - 0.5) * 160, lerp(pl.p0.y, pl.slot.y, 0.6)),
    slot: pl.slot,
    t0: B.raceStart + rnd("t0") * 4,
    tArr: B.raceStart + 26 + 34 * clamp(dist / 1700, 0, 1.6) + rnd("ta") * 14,
    drift: pl.drift,
    wander: (layer === "far" ? 10 : 14) + rnd("w") * (layer === "far" ? 8 : 16),
    fate,
    how,
    fFail: 1e9,
    side: Math.sign(pl.slot.x || 1),
    spin: (rnd("sp") < 0.5 ? -1 : 1) * (1.6 + rnd("sq") * 1.1),
    gx: null,
    fPass: 1e9,
  };
};

// When does this sperm drop out?
const withFail = (s: StreamSpec, rnd: Rnd): StreamSpec => {
  const at = (f: number) => alivePos(s, f);
  if (s.fate === "mesh") {
    const off = (rnd("mo") - 0.5) * 1.5 * MESH_H;
    const f = firstFrame(B.raceStart + 10, B.womb + 20, (g) => meshY(g, s.p) + off * s.p >= at(g).y, B.mesh);
    return { ...s, fFail: f };
  }
  if (s.fate === "womb") return { ...s, fFail: B.womb - 16 + rnd("wf") * 32 };
  if (s.fate === "gate") {
    const hit = (g: number) => {
      const a = at(g);
      return gateY(g, s.p) + lowerSurf(Math.abs(a.x)) * s.p >= a.y;
    };
    return { ...s, fFail: firstFrame(B.mesh, B.rest + 25, hit, B.gate + 8) };
  }
  if (s.fate === "survive") {
    const fPass = firstFrame(B.womb, B.rest + 30, (g) => gateY(g) >= at(g).y, B.gate);
    return { ...s, fPass, gx: (rnd("gx") - 0.5) * 110 };
  }
  return s;
};

// Mid layer (the egg plane), slots in egg-plane units. Nothing rides above
// y 240, so the swarm never sits on the distant egg.
const midPlace = (fate: Fate, rnd: Rnd): Place => {
  let x = (rnd("x") - 0.5) * 940;
  const y =
    fate === "survive"
      ? 250 + rnd("y") * 380
      : fate === "gate"
        ? 290 + rnd("y") * 400
        : fate === "womb"
          ? 270 + rnd("y") ** 1.5 * 760 // kept above the captions, so the veer reads
          : 260 + rnd("y") ** 0.9 * 1000;
  if (fate === "gate") x = Math.sign(x || 1) * (175 + Math.abs(x) * 0.62);
  if (fate === "survive") x *= 0.9;
  const c = camAt(B.raceStart);
  const sy = 1990 + rnd("sy") ** 1.2 * 650;
  const p0 = v(clamp(x * 0.7 + (rnd("x0") - 0.5) * 300, -560, 560), (sy - c.ey) / c.z);
  const drift = fate === "survive" ? -rnd("dr") * 0.45 : (rnd("dr") - 0.5) * 0.9;
  return { slot: v(x, y), p0, drift };
};

const farPlace = (rnd: Rnd): Place => {
  const p = LAYER.far.p;
  const sx = 40 + rnd("x") * 1000;
  const sy = Math.abs(sx - 540) < 240 ? 840 + rnd("y") * 860 : 560 + rnd("y") * 1140;
  const slot = toLayer(B.cruise, p, sx, sy);
  const p0 = toLayer(B.raceStart, p, clamp(sx + (rnd("x0") - 0.5) * 260, 0, 1080), 1980 + rnd("sy") ** 1.3 * 600);
  return { slot, p0, drift: (rnd("dr") - 0.5) * 0.6 };
};

const mix = (n: number, parts: [Fate, number][]): Fate[] => {
  const out: Fate[] = [];
  for (const [fate, k] of parts) for (let i = 0; i < Math.round(n * k); i++) out.push(fate);
  while (out.length < n) out.push(parts[0][0]);
  return out.slice(0, n);
};

const build = (layer: LayerId, fates: Fate[], place: (fate: Fate, rnd: Rnd) => Place) =>
  fates.map((fate, i) => {
    const key = `c01${layer[0]}${i}`;
    const rnd: Rnd = (k) => random(`${key}-${k}`);
    return withFail(spec(layer, key, rnd, fate, place(fate, rnd)), rnd);
  });

export const N_SURVIVORS = 24;
const MID_FATES = mix(96, [
  ["survive", N_SURVIVORS / 96],
  ["mesh", 38 / 96],
  ["womb", 20 / 96],
  ["gate", 14 / 96],
]);
const FAR_FATES = mix(104, [
  ["mesh", 0.58],
  ["womb", 0.28],
  ["gate", 0.14],
]);

const MID = build("mid", MID_FATES, midPlace);
export const SURVIVOR_STREAMS = MID.filter((s) => s.fate === "survive");
// the winner rides at the front-left, close to its line through the throat
export const WINNER_STREAM: StreamSpec = (() => {
  const key = "c01win";
  const rnd: Rnd = (k) => random(`${key}-${k}`);
  const s = spec("mid", key, rnd, "survive", { slot: v(-170, 330), p0: v(-90, 1460), drift: -0.15 });
  return { ...withFail(s, rnd), gx: -18, omega: 0.9, phi: 1.3, amp: 1, size: LAYER.mid.size * 1.1, thick: 1.75 };
})();

// Near layer: two big hooks cut through the upper frame in the first second
// (Scene1's), a few overtake past the lens, a few get caught by near strands.
const HOOKS = [
  { pts: [v(-210, 1420), v(420, 1080), v(1400, 600)], k: 1.45 },
  { pts: [v(420, 2120), v(300, 1240), v(-320, 460)], k: 1.4 },
];
const nearSpecs = (): StreamSpec[] => {
  const p = LAYER.near.p;
  const out: StreamSpec[] = [];
  HOOKS.forEach((h, i) => {
    const key = `c01h${i}`;
    const rnd: Rnd = (k) => random(`${key}-${k}`);
    const [a, b, c] = h.pts.map((q) => toLayer(B.raceStart, p, q.x, q.y));
    const s = spec("near", key, rnd, "exit", { slot: c, p0: a, drift: 0 });
    const tArr = B.raceStart + (2.4 * bezLen(a, b, c)) / 34;
    out.push({ ...s, p1: b, t0: B.raceStart - 2, tArr, size: s.size * h.k, thick: s.thick * 1.3, wander: 10 });
  });
  for (let i = 0; i < 10; i++) {
    const key = `c01n${i}`;
    const rnd: Rnd = (k) => random(`${key}-${k}`);
    const left = i % 2 === 0;
    const caught = i >= 6;
    const sx = caught ? (left ? 50 + rnd("x") * 170 : 860 + rnd("x") * 170) : left ? -420 : 1500;
    const sy = caught ? 880 + rnd("y") * 360 : 120 + rnd("y") * 700;
    const slot = toLayer(B.cruise, p, sx, sy);
    const p0 = toLayer(B.raceStart, p, left ? 60 + rnd("x0") * 380 : 640 + rnd("x0") * 380, 2040 + rnd("y0") * 520);
    const s = spec("near", key, rnd, caught ? "mesh" : "exit", { slot, p0, drift: 0 });
    const tArr = caught ? s.tArr : B.raceStart + 40 + rnd("t") * 50;
    out.push(withFail({ ...s, tArr, how: "tangle", wander: 20 }, rnd));
  }
  return out;
};

export const STREAM: Record<LayerId, StreamSpec[]> = {
  far: build("far", FAR_FATES, (_f, rnd) => farPlace(rnd)),
  mid: MID.filter((s) => s.fate !== "survive"),
  near: nearSpecs(),
};
