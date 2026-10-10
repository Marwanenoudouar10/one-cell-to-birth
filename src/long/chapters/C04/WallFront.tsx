import React from "react";
import { C } from "../../../theme/colors";
import { mix } from "./palette";
import { Pt, smooth, smoothClosed } from "./geometry";
import { WALL } from "./timeline";
import { Ball, ROOTS, lipChord } from "./wallShape";

// The lining in FRONT of the ball (world px). The blanket climbs both sides
// of the ball from the bottom; everything of the ball below the line joining
// its two lips is seen through a translucent rose veil. When the lips meet on
// top the whole ball sits under the veil: buried.

const f1 = (v: number) => v.toFixed(1);

export const Veil: React.FC<{ ball: Ball }> = ({ ball }) => {
  const { x: bx, y: by, r, tau, cover } = ball;
  if (cover <= 0.01) return null;
  const Rp = r + tau;
  const { tipX, tipY, sag, closed } = lipChord(ball);
  const L = bx - Rp - 24;
  const Rt = bx + Rp + 24;
  const chord = `M${f1(bx - tipX)} ${f1(tipY)}Q${f1(bx)} ${f1(tipY + 2 * sag)} ${f1(bx + tipX)} ${f1(tipY)}`;
  const fill = `M${f1(L)} ${f1(tipY)}L${f1(bx - tipX)} ${f1(tipY)}Q${f1(bx)} ${f1(tipY + 2 * sag)} ${f1(bx + tipX)} ${f1(tipY)}L${f1(Rt)} ${f1(tipY)}L${f1(Rt)} ${f1(by + Rp + 40)}L${f1(L)} ${f1(by + Rp + 40)}Z`;
  const top = Math.min(tipY, by - Rp);
  return (
    <g>
      <defs>
        <clipPath id="c04f-disc">
          <circle cx={bx} cy={by} r={Rp - 0.5} />
        </clipPath>
        <linearGradient id="c04f-veil" gradientUnits="userSpaceOnUse" x1={0} y1={tipY - 6} x2={0} y2={by + Rp}>
          <stop offset={0} stopColor={mix(C.womb, C.rose, 0.6)} stopOpacity={0.62} />
          <stop offset={0.3} stopColor={mix(C.womb, C.rose, 0.3)} stopOpacity={0.5} />
          <stop offset={0.7} stopColor={mix(C.womb, C.wombDeep, 0.4)} stopOpacity={0.6} />
          <stop offset={1} stopColor={C.wombDeep} stopOpacity={0.78} />
        </linearGradient>
        <radialGradient id="c04f-top" gradientUnits="userSpaceOnUse" cx={bx} cy={top + Rp * 0.25} r={Rp * 0.9}>
          <stop offset={0} stopColor={C.peach} stopOpacity={0.28} />
          <stop offset={1} stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath="url(#c04f-disc)">
        <path d={fill} fill="url(#c04f-veil)" />
        <path d={fill} fill="url(#c04f-top)" style={{ mixBlendMode: "screen" }} opacity={closed} />
        <g opacity={1 - closed}>
          <path d={chord} fill="none" stroke={C.rose} strokeOpacity={0.5} strokeWidth={40} style={{ filter: "blur(12px)" }} />
          <path d={chord} fill="none" stroke={mix(C.rose, C.peach, 0.6)} strokeOpacity={0.95} strokeWidth={4.5} strokeLinecap="round" />
          <path d={chord} fill="none" stroke={C.text} strokeOpacity={0.3} strokeWidth={1.4} transform="translate(0 -1.5)" />
        </g>
      </g>
    </g>
  );
};

export const ContactGlow: React.FC<{ c: number; x: number; settle: number }> = ({ c, x, settle }) => {
  if (c <= 0.01) return null;
  const o = c * (1 - 0.7 * settle);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <ellipse cx={x} cy={WALL - 14} rx={140 + 420 * c} ry={90 + 250 * c} fill="url(#c04w-contact)" opacity={0.7 * o} />
      <ellipse cx={x} cy={WALL + 26} rx={80 + 110 * c} ry={30 + 30 * c} fill="url(#c04w-contact)" opacity={0.4 * o} />
    </g>
  );
};

// Root-like threads of the outer cells reaching into the wall toward vessels.
export const rootStart = (ball: Ball, a: number): Pt => {
  const t = (a * Math.PI) / 180;
  return [ball.x + Math.cos(t) * (ball.r - 3), ball.y + Math.sin(t) * (ball.r - 3)];
};

// Organic thread from p0 toward p1, drawn up to t1: a gentle bow plus a
// travelling S-wiggle, so no two read as straight "legs".
const thread = (p0: Pt, p1: Pt, bend: number, wig: number, ph: number, t1: number, n: number): Pt[] => {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (t1 * i) / n;
    const o = bend * 4 * t * (1 - t) + wig * Math.sin(t * Math.PI * 2.2 + ph) * t * (1 - 0.6 * t);
    out.push([p0[0] + dx * t + nx * o, p0[1] + dy * t + ny * o]);
  }
  return out;
};

// Tapered outline around a centreline (rounded tip): thick base, fine tip.
const taper = (pts: Pt[], w0: number, w1: number) => {
  const n = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / l;
    const ny = (b[0] - a[0]) / l;
    const w = (w0 + (w1 - w0) * (i / (n - 1)) ** 0.7) / 2;
    left.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    right.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return smoothClosed([...left, ...right.reverse()]);
};

type Branch = { pts: Pt[]; w: number };

// One root and its side branches (branches sprout once the tip has passed).
const rootShapes = (p0: Pt, to: Pt, w: number, g: number, i: number, f: number): Branch[] => {
  const s = i % 2 ? 1 : -1;
  const main = thread(p0, to, s * 14, 6, i * 1.9 + f * 0.04, g, 22);
  const out: Branch[] = [{ pts: main, w: w * (0.45 + 0.55 * g) }];
  const full = thread(p0, to, s * 14, 6, i * 1.9 + f * 0.04, 1, 22);
  const len = Math.hypot(to[0] - p0[0], to[1] - p0[1]);
  [
    [0.38, -s, 0.42],
    [0.66, s, 0.3],
  ].forEach(([at, side, k]) => {
    const gc = smooth((g - at) / (1 - at));
    if (gc <= 0.01) return;
    const j = Math.round(at * 22);
    const [x0, y0] = full[j];
    const a = Math.atan2(full[j + 1][1] - y0, full[j + 1][0] - x0) + side * 0.62;
    const end: Pt = [x0 + Math.cos(a) * len * k, y0 + Math.sin(a) * len * k];
    out.push({ pts: thread([x0, y0], end, side * 6, 3, i + at * 7 + f * 0.05, gc, 12), w: w * 0.45 * (1 - at * 0.5) });
  });
  return out;
};

// Roots read as living tissue reaching out of the ball's shell (same rose
// family, a darker edge for form, a soft light glow), never as white cracks.
export const Roots: React.FC<{ ball: Ball; grow: number[]; f: number }> = ({ ball, grow, f }) => {
  const core = mix(C.rose, C.peach, 0.3);
  const edge = mix(C.womb, C.wombDeep, 0.35);
  const all = ROOTS.map((rt, i) => {
    const g = grow[i] ?? 0;
    if (g <= 0.01) return null;
    const shapes = rootShapes(rootStart(ball, rt.a), rt.to, rt.w, g, i, f);
    const hit = rt.vessel >= -1 ? smooth((g - 0.86) / 0.14) : 0;
    const end = shapes[0].pts[shapes[0].pts.length - 1];
    return { i, g, hit, end, d: shapes.map((b) => taper(b.pts, b.w, 1.2)) };
  });
  return (
    <g>
      <g style={{ mixBlendMode: "screen" }}>
        {all.map((r) =>
          r ? (
            <g key={r.i} opacity={Math.min(1, r.g * 3)}>
              {r.hit > 0.01 && <circle cx={r.end[0]} cy={r.end[1]} r={14 + 22 * r.hit} fill="url(#c04w-contact)" opacity={0.55 * r.hit} />}
              {r.d.map((d, k) => (
                <path key={k} d={d} fill={C.rose} opacity={0.28} style={{ filter: "blur(5px)" }} />
              ))}
            </g>
          ) : null,
        )}
      </g>
      {all.map((r) =>
        r ? (
          <g key={r.i} opacity={Math.min(1, r.g * 3)}>
            {r.d.map((d, k) => (
              <path key={k} d={d} fill={core} fillOpacity={0.72} stroke={edge} strokeOpacity={0.4} strokeWidth={1.4} />
            ))}
          </g>
        ) : null,
      )}
    </g>
  );
};
