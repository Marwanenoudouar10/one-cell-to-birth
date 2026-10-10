import React from "react";
import { random } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { B } from "./beats";
import { camAt, layerXf, xfAttr } from "./camera";
import { R, captionMask } from "./constants";
import { MESH_H, meshY } from "./corridor";
import { n2 } from "./math";

// Gate 1, cervical mucus: a band of glowing, gently undulating fibres, mostly
// running up the corridor (channels) and cross-linked into a net, with a few
// beaded droplets. Three depths: far (dim, small, soft), mid (the swarm plane,
// where sperm tangle), near (a few thick strands sweeping past the lens).
type Depth = "far" | "mid" | "near";
const CFG = {
  far: { p: 0.62, n: 16, links: 20, beads: 8, core: 1.6, glow: 12, a: 0.5, blur: 3, haze: 0.05 },
  mid: { p: 1, n: 22, links: 46, beads: 20, core: 2.4, glow: 16, a: 0.9, blur: 0.8, haze: 0.07 },
  near: { p: 1.55, n: 5, links: 3, beads: 0, core: 6, glow: 36, a: 0.38, blur: 12, haze: 0 },
} as const;

const strandsFor = (d: Depth) =>
  Array.from({ length: CFG[d].n }, (_, i) => {
    const rnd = (k: string) => random(`c01mesh-${d}${i}-${k}`);
    const n = CFG[d].n;
    const span = d === "near" ? 1500 : 1300;
    return {
      x0: -span / 2 + ((i + 0.2 + rnd("x") * 0.6) / n) * span,
      a1: 18 + rnd("a1") * 26,
      k1: (Math.PI * 2) / (760 + rnd("k1") * 520),
      p1: rnd("p1") * 6.28,
      a2: 2 + rnd("a2") * 5,
      k2: (Math.PI * 2) / (220 + rnd("k2") * 160),
      p2: rnd("p2") * 6.28,
      lo: -MESH_H * (0.7 + rnd("lo") * 0.3),
      hi: MESH_H * (0.7 + rnd("hi") * 0.3),
      w: 0.7 + rnd("w") * 0.6,
    };
  });
type Strand = ReturnType<typeof strandsFor>[number];
const xOf = (s: Strand, y: number, t: number) => s.x0 + s.a1 * Math.sin(s.k1 * y + s.p1 + t) + s.a2 * Math.sin(s.k2 * y + s.p2 - t * 0.7);

const STRANDS = { far: strandsFor("far"), mid: strandsFor("mid"), near: strandsFor("near") };
const LINKS = (["far", "mid", "near"] as Depth[]).reduce(
  (o, d) => {
    o[d] = Array.from({ length: CFG[d].links }, (_, i) => {
      const rnd = (k: string) => random(`c01link-${d}${i}-${k}`);
      return { a: Math.floor(rnd("a") * (CFG[d].n - 1)), y: (rnd("y") - 0.5) * 1.5 * MESH_H, dy: (rnd("dy") - 0.5) * 160, sag: (rnd("s") - 0.5) * 40 };
    });
    return o;
  },
  {} as Record<Depth, { a: number; y: number; dy: number; sag: number }[]>,
);
const BEADS = (["far", "mid", "near"] as Depth[]).reduce(
  (o, d) => {
    o[d] = Array.from({ length: CFG[d].beads }, (_, i) => {
      const rnd = (k: string) => random(`c01bead-${d}${i}-${k}`);
      return { s: Math.floor(rnd("s") * CFG[d].n), y: (rnd("y") - 0.5) * 1.5 * MESH_H, r: 2.5 + rnd("r") * 4 };
    });
    return o;
  },
  {} as Record<Depth, { s: number; y: number; r: number }[]>,
);

export const Mesh: React.FC<{ depth: Depth; frame: number }> = ({ depth, frame }) => {
  const c = CFG[depth];
  const L = layerXf(frame, c.p);
  const cy = meshY(frame, c.p);
  const h = MESH_H * c.p;
  const top = -L.oy / L.zL;
  const bottom = (HEIGHT - L.oy) / L.zL;
  if (cy + h * 1.1 < top || cy - h * 1.1 > bottom) return null;
  const t = frame * 0.035;
  // fades in once the climb starts, so frame 0 stays Scene1's opening
  const on = tween(frame, B.push - 10, B.push + 12, [0, 1], EASE.inOut);
  if (on <= 0.01) return null;
  // a soft swell of light as the swarm hits it
  const pulse = 1 + 0.35 * tween(frame, B.mesh - 8, B.mesh, [0, 1], EASE.inOut) * (1 - tween(frame, B.mesh, B.mesh + 20, [0, 1], EASE.inOut));
  const id = `c01-mesh-${depth}`;
  // the egg is far beyond the mesh: fibres thin out over it (a soft clearing)
  // but still cross it faintly, so they read as passing in front
  const cam = camAt(frame);
  const hole = R * cam.z;
  const strands = STRANDS[depth];
  const path = (s: Strand) => {
    const pts: string[] = [];
    for (let k = 0; k <= 16; k++) {
      const y = s.lo + ((s.hi - s.lo) * k) / 16;
      pts.push(`${n2(xOf(s, y, t))},${n2(y)}`);
    }
    return `M${pts.join("L")}`;
  };
  const links = LINKS[depth].map((l) => {
    const a = strands[l.a];
    const b = strands[l.a + 1];
    const x0 = xOf(a, l.y, t);
    const x1 = xOf(b, l.y + l.dy, t);
    return `M${n2(x0)} ${n2(l.y)}Q${n2((x0 + x1) / 2)} ${n2(l.y + l.dy / 2 + l.sag)} ${n2(x1)} ${n2(l.y + l.dy)}`;
  });
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", filter: `blur(${c.blur}px)`, opacity: on * Math.min(1, c.a * pulse), ...captionMask }}>
      <defs>
        {[
          ["core", C.peach, 0.62],
          ["glow", C.rose, 0.15],
          ["haze", C.rose, 1],
        ].map(([k, col, a]) => (
          <linearGradient key={k as string} id={`${id}-${k}`} gradientUnits="userSpaceOnUse" x1={0} y1={-MESH_H} x2={0} y2={MESH_H}>
            <stop offset="0" stopColor={col as string} stopOpacity={0} />
            <stop offset="0.25" stopColor={col as string} stopOpacity={a as number} />
            <stop offset="0.75" stopColor={col as string} stopOpacity={a as number} />
            <stop offset="1" stopColor={col as string} stopOpacity={0} />
          </linearGradient>
        ))}
        <radialGradient id={`${id}-holeg`} gradientUnits="userSpaceOnUse" cx={cam.ex} cy={cam.ey} r={hole * 3.2}>
          <stop offset="0" stopColor="#fff" stopOpacity={0.28} />
          <stop offset="0.42" stopColor="#fff" stopOpacity={0.3} />
          <stop offset="0.75" stopColor="#fff" stopOpacity={0.7} />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <mask id={`${id}-hole`} maskUnits="userSpaceOnUse" x={0} y={0} width={WIDTH} height={HEIGHT}>
          <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-holeg)`} />
        </mask>
        <radialGradient id={`${id}-bead`}>
          <stop offset="0" stopColor={C.text} stopOpacity={0.9} />
          <stop offset="0.45" stopColor={C.peach} stopOpacity={0.35} />
          <stop offset="1" stopColor={C.peach} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g mask={`url(#${id}-hole)`}>
        <g transform={xfAttr(L)}>
          <g transform={`translate(0 ${n2(cy)}) scale(${c.p})`} fill="none" strokeLinecap="round">
            {/* the gel itself: a faint translucent band the fibres hang in */}
            {c.haze > 0 && <rect x={-900} y={-MESH_H} width={1800} height={MESH_H * 2} fill={`url(#${id}-haze)`} opacity={c.haze} />}
            {strands.map((s, i) => (
              <path key={`g${i}`} d={path(s)} stroke={`url(#${id}-glow)`} strokeWidth={c.glow * s.w} />
            ))}
            {links.map((d, i) => (
              <path key={`lg${i}`} d={d} stroke={`url(#${id}-glow)`} strokeWidth={c.glow * 0.7} />
            ))}
            {strands.map((s, i) => (
              <path key={`c${i}`} d={path(s)} stroke={`url(#${id}-core)`} strokeWidth={c.core * s.w} />
            ))}
            {links.map((d, i) => (
              <path key={`lc${i}`} d={d} stroke={`url(#${id}-core)`} strokeWidth={c.core * 0.7} />
            ))}
            {BEADS[depth].map((b, i) => (
              <circle key={`b${i}`} cx={n2(xOf(strands[b.s], b.y, t))} cy={n2(b.y)} r={b.r * 2.4} fill={`url(#${id}-bead)`} />
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
};
