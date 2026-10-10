// Geometry of the salt grain: a slightly irregular cube (halite) with one
// chipped corner, rotated in 3D and projected orthographically to screen px.
// Axes: x right, y down, z toward the camera.
import { random } from "remotion";

type V3 = [number, number, number];
export type P2 = [number, number];

const CHIP = 0.15; // how deep the chipped corner is cut (half-edge units)
// the top-front-right corner (1, -1, 1) is chipped: three new points on its edges
const KX: V3 = [1 - CHIP, -1, 1];
const KY: V3 = [1, -1 + CHIP, 1];
const KZ: V3 = [1, -1, 1 - CHIP];

// faces as vertex loops (the chip replaces K on the three faces that meet there)
export const FACES: { id: string; n: V3; v: V3[] }[] = [
  { id: "right", n: [1, 0, 0], v: [[1, -1, -1], KZ, KY, [1, 1, 1], [1, 1, -1]] },
  { id: "left", n: [-1, 0, 0], v: [[-1, -1, 1], [-1, -1, -1], [-1, 1, -1], [-1, 1, 1]] },
  { id: "top", n: [0, -1, 0], v: [[-1, -1, -1], [-1, -1, 1], KX, KZ, [1, -1, -1]] },
  { id: "bottom", n: [0, 1, 0], v: [[-1, 1, 1], [-1, 1, -1], [1, 1, -1], [1, 1, 1]] },
  { id: "front", n: [0, 0, 1], v: [[-1, -1, 1], KX, KY, [1, 1, 1], [-1, 1, 1]] },
  { id: "back", n: [0, 0, -1], v: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]] },
  { id: "chip", n: [0.577, -0.577, 0.577], v: [KX, KY, KZ] },
];

// a real grain is never a perfect die: slightly off-square proportions plus a
// small fixed per-vertex irregularity
const ASPECT: V3 = [1.05, 0.95, 1.0];
const jitter = (p: V3): V3 => {
  const key = p.map((c) => c.toFixed(2)).join(",");
  const j = (k: string) => (random(`c00-salt-${key}-${k}`) - 0.5) * 0.12;
  return [p[0] * ASPECT[0] + j("x"), p[1] * ASPECT[1] + j("y"), p[2] * ASPECT[2] + j("z")];
};

const rotate = (p: V3, yaw: number, pitch: number, roll: number): V3 => {
  const [cy, sy] = [Math.cos(yaw), Math.sin(yaw)];
  const [cp, sp] = [Math.cos(pitch), Math.sin(pitch)];
  const [cr, sr] = [Math.cos(roll), Math.sin(roll)];
  // yaw about y, then pitch about x, then roll about z
  const x1 = p[0] * cy + p[2] * sy;
  const z1 = -p[0] * sy + p[2] * cy;
  const y2 = p[1] * cp - z1 * sp;
  const z2 = p[1] * sp + z1 * cp;
  return [x1 * cr - y2 * sr, x1 * sr + y2 * cr, z2];
};

export type Face = { id: string; pts: P2[]; d: string; nz: number; lit: number; c: P2 };
export type Cube = { faces: Face[]; front: Face[]; back: Face[]; outline: string; corners: Record<string, P2> };

const LIGHT: V3 = (() => {
  const l: V3 = [-0.45, -0.8, 0.55];
  const m = Math.hypot(...l);
  return [l[0] / m, l[1] / m, l[2] / m];
})();

const path = (pts: P2[]) => `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}Z`;

// Project the grain: centre (cx, cy), edge length e (px), angles in degrees.
export const projectCube = (cx: number, cy: number, e: number, yawD: number, pitchD: number, rollD: number): Cube => {
  const [yaw, pitch, roll] = [yawD, pitchD, rollD].map((a) => (a * Math.PI) / 180);
  const h = e / 2;
  const faces = FACES.map((f) => {
    const n = rotate(f.n, yaw, pitch, roll);
    const pts = f.v.map((v) => {
      const r = rotate(jitter(v), yaw, pitch, roll);
      return [cx + r[0] * h, cy + r[1] * h] as P2;
    });
    const c: P2 = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
    const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    return { id: f.id, pts, d: path(pts), nz: n[2], lit, c };
  });
  const front = faces.filter((f) => f.nz > 0.02);
  const back = faces.filter((f) => f.nz <= 0.02);
  const corner = (v: V3): P2 => {
    const r = rotate(jitter(v), yaw, pitch, roll);
    return [cx + r[0] * h, cy + r[1] * h];
  };
  return {
    faces,
    front,
    back,
    outline: front.map((f) => f.d).join(" "),
    corners: { chip: corner(KX), tl: corner([-1, -1, 1]), bl: corner([-1, 1, 1]), br: corner([1, 1, 1]) },
  };
};
