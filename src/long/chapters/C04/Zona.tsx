import React from "react";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { Pt, lerp, openPath } from "./geometry";
import { B, EXIT, HOLE_R, R0, ZR, crumple, gapHalf, shellFade, thin } from "./timeline";

// The zona pellucida (zona-local px; it stays where the morula was). The same
// glassy shell Scene1/Scene2 show: a translucent band from the cell edge out to
// r 175.5 with a bright outer edge. It stretches thin as the ball swells, a
// small opening appears, its lips give as the ball squeezes out, then the empty
// shell crumples and fades.
const HIGHLIGHT: [number, number] = [196, 284];
const TINT: [number, number] = [20, 70];
const EXIT_DEG = (EXIT * 180) / Math.PI;

// C03 Zona.tsx's arc (degrees).
const svgArc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [Math.cos((a * Math.PI) / 180) * r, Math.sin((a * Math.PI) / 180) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
};

export const Zona: React.FC<{ f: number }> = ({ f }) => {
  const fade = shellFade(f);
  if (fade <= 0.01) return null;
  const th = thin(f);
  const rin = lerp(R0 * 0.988, 169, th);
  const rout = lerp(ZR, 180, th);
  const mid = (rin + rout) / 2;
  const cr = crumple(f);
  const gap = gapHalf(f);
  // The lips are dragged outward while the ball forces through, then recoil.
  const flare = 26 * tween(f, B.squeeze, B.squeeze + 8, [0, 1], EASE.out) * (1 - tween(f, B.free - 3, B.free + 9, [0, 1], EASE.inOut));
  const disp = (aDeg: number) => {
    const a = (aDeg * Math.PI) / 180;
    const da = angDiff(aDeg, EXIT_DEG);
    let dr = flare * Math.exp(-((da / (gap + 16)) ** 2));
    dr += cr * (8 * noise2D("c04z", Math.cos(a) * 1.7, Math.sin(a) * 1.7 + f * 0.03) + 4 * noise2D("c04z2", aDeg / 21, f * 0.06));
    return dr;
  };
  const sample = (r: number, s0: number, s1: number) => {
    const n = Math.max(2, Math.ceil((s1 - s0) / 3));
    const pts: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const ad = s0 + ((s1 - s0) * i) / n;
      const a = (ad * Math.PI) / 180;
      const rr = r + disp(ad);
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    return openPath(pts);
  };
  const lo = EXIT_DEG + gap;
  const hi = EXIT_DEG + 360 - gap;
  // The part of [a0, a1] that lies on the shell (outside the opening).
  const arc = (r: number, a0: number, a1: number): string => {
    if (gap <= 0.3) return sample(r, a0, a1);
    let d = "";
    for (const k of [-360, 0, 360]) {
      const s0 = Math.max(a0 + k, lo);
      const s1 = Math.min(a1 + k, hi);
      if (s1 - s0 > 0.5) d += sample(r, s0, s1);
    }
    return d;
  };
  const ring = (r: number) => (gap <= 0.3 ? `${sample(r, 0, 360)}Z` : sample(r, lo, hi));
  const whole = ring(mid);
  const edge = ring(rout);
  const s0 = rin / rout;
  // Collapse: squash, shrink a little and tilt as it is left behind.
  const sx = 1 + 0.05 * cr;
  const sy = 1 - 0.17 * cr;
  const tilt = -7 * cr;
  const pop = tween(f, B.free - 3, B.free, [0, 1], EASE.out) * (1 - tween(f, B.free, B.free + 12, [0, 1], EASE.out));
  // Untouched shell: C03's exact markup (true circles and arcs), so the fade
  // from C03 has no anti-aliasing seams on the thin outer edge.
  const pristine = th < 0.0005 && gap <= 0.3 && cr < 0.0005 && flare < 0.01;
  const hx = Math.cos(EXIT) * (HOLE_R + 6);
  const hy = Math.sin(EXIT) * (HOLE_R + 6);
  return (
    <g opacity={fade}>
      <defs>
        <radialGradient id="c04z-band" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={rout}>
          <stop offset={s0} stopColor={C.gold} stopOpacity={0} />
          <stop offset={s0 + (1 - s0) * 0.226} stopColor={C.gold} stopOpacity={0.12} />
          <stop offset={s0 + (1 - s0) * 0.55} stopColor={C.text} stopOpacity={0.16} />
          <stop offset={1} stopColor={C.text} stopOpacity={0.42} />
        </radialGradient>
        <radialGradient id="c04z-pop">
          <stop offset={0} stopColor={C.text} stopOpacity={0.9} />
          <stop offset={0.3} stopColor={C.gold} stopOpacity={0.45} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {pristine ? (
        <g>
          <circle r={(rin + rout) / 2} fill="none" stroke="url(#c04z-band)" strokeWidth={rout - rin} />
          <circle r={rout} fill="none" stroke={C.text} strokeOpacity={0.45} strokeWidth={1.65} />
          <path d={svgArc(rout - 3.6, HIGHLIGHT[0], HIGHLIGHT[1])} fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={3.6} strokeLinecap="round" />
          <path d={svgArc(rout - 3.6, TINT[0], TINT[1])} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2.7} strokeLinecap="round" />
        </g>
      ) : (
      <g transform={`rotate(${tilt.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`} style={{ filter: cr > 0.02 ? `blur(${(cr * 2.5).toFixed(2)}px)` : undefined }}>
        <path d={whole} fill="none" stroke="url(#c04z-band)" strokeWidth={rout - rin} strokeLinecap="round" />
        <path d={edge} fill="none" stroke={C.text} strokeOpacity={0.45} strokeWidth={1.65} strokeLinecap="round" />
        <path d={arc(rout - 3.6, HIGHLIGHT[0], HIGHLIGHT[1])} fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={3.6} strokeLinecap="round" />
        <path d={arc(rout - 3.6, TINT[0], TINT[1])} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={2.7} strokeLinecap="round" />
      </g>
      )}
      {pop > 0.01 && <circle cx={hx} cy={hy} r={40 + 50 * pop} fill="url(#c04z-pop)" opacity={pop * 0.8} />}
    </g>
  );
};
