// <Spoon> + <Drop>: the small glowing teaspoon that tips one bright drop into
// the brain on each week landing. A graphic (no text). World px; the spoon's
// local origin is its LIP, so tipping (rotate about the lip) keeps the pour
// point fixed. Light from the upper left, gold halo.
import React from "react";
import { C } from "../../../theme/colors";

type V2 = { x: number; y: number };

// Handle: tapered quadratic centreline from the bowl back to an oval end.
const HANDLE = (() => {
  const p0 = { x: -36, y: -1 };
  const p1 = { x: -66, y: -12 };
  const p2 = { x: -104, y: -38 };
  const N = 18;
  const at = (t: number): V2 => ({
    x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
    y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
  });
  const sm = (a: number, b: number, v: number) => {
    const u = Math.max(0, Math.min(1, (v - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = at(Math.max(0, t - 0.01));
    const b = at(Math.min(1, t + 0.01));
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = { x: -(b.y - a.y) / l, y: (b.x - a.x) / l };
    const w = 2.1 + 0.6 * t + 3.4 * sm(0.6, 0.95, t) - 1.6 * sm(0.97, 1, t);
    const c = at(t);
    L.push({ x: c.x + n.x * w, y: c.y + n.y * w });
    R.push({ x: c.x - n.x * w, y: c.y - n.y * w });
  }
  const f = (p: V2) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  const end = at(1);
  return `M${L.map(f).join(" L")} Q${f({ x: end.x - 5, y: end.y - 5 })} ${f(R[N])} L${R.reverse().map(f).join(" L")} Z`;
})();

const BOWL = { cx: -19, cy: 0, rx: 19.5, ry: 11.5 };

type SpoonProps = { x: number; y: number; angle: number; fill: number; slosh: number; opacity: number; scale: number; glow: number };

export const Spoon: React.FC<SpoonProps> = ({ x, y, angle, fill, slosh, opacity, scale, glow }) => {
  if (opacity <= 0.001) return null;
  const id = (n: string) => `c13-sp-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const lf = Math.pow(Math.max(0, fill), 0.6);
  const shape = (paint: string) => (
    <>
      <path d={HANDLE} fill={paint} />
      <ellipse cx={BOWL.cx} cy={BOWL.cy} rx={BOWL.rx} ry={BOWL.ry} fill={paint} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`} opacity={opacity}>
      <defs>
        <linearGradient id={id("metal")} gradientUnits="userSpaceOnUse" x1={-50} y1={-30} x2={-30} y2={14}>
          <stop offset={0} stopColor={C.gold} />
          <stop offset={0.4} stopColor={C.gold} />
          <stop offset={0.75} stopColor={C.peach} />
          <stop offset={1} stopColor={C.skinShade} />
        </linearGradient>
        <radialGradient id={id("hollow")} gradientUnits="userSpaceOnUse" cx={-14} cy={0} r={18}>
          <stop offset={0} stopColor={C.gold} />
          <stop offset={1} stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id={id("liquid")} gradientUnits="userSpaceOnUse" cx={-20} cy={-4} r={14}>
          <stop offset={0} stopColor={C.text} />
          <stop offset={0.45} stopColor={C.gold} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0.85} />
        </radialGradient>
        <filter id={id("halo")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={2} />
        </filter>
      </defs>
      <g filter={url("halo")} opacity={0.4 + 0.3 * glow}>
        {shape(C.gold)}
      </g>
      {shape(url("metal"))}
      {/* the hollow of the bowl, seen a little from above */}
      <ellipse cx={-19.5} cy={-2.2} rx={15.8} ry={7.4} fill={url("hollow")} />
      {lf > 0.01 && (
        <ellipse cx={-19 + slosh * 4} cy={-2.6} rx={13.4 * lf} ry={5.9 * lf} fill={url("liquid")} filter={url("soft")} />
      )}
      {/* speculars: bowl rim + handle ridge */}
      <path d="M-34,-4 Q-27,-11 -14,-10.5" fill="none" stroke={C.text} strokeOpacity={0.85} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M-44,-5 Q-68,-15 -98,-36" fill="none" stroke={C.text} strokeOpacity={0.5} strokeWidth={1.1} strokeLinecap="round" />
      <path d="M-30,8.6 Q-18,12.6 -6,8" fill="none" stroke={C.wombDeep} strokeOpacity={0.35} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );
};

// One bright drop (teardrop, tail up), world px.
export type DropState = { x: number; y: number; r: number; stretch: number; alpha: number };

export const Drop: React.FC<{ d: DropState | null }> = ({ d }) => {
  if (!d || d.alpha <= 0.001) return null;
  const r = d.r;
  const tail = r * (1.4 + 1.2 * d.stretch);
  const path = `M0,${-tail} C${r * 0.45},${-tail * 0.55} ${r},${-r * 0.45} ${r},0 A${r},${r} 0 1 1 ${-r},0 C${-r},${-r * 0.45} ${-r * 0.45},${-tail * 0.55} 0,${-tail} Z`;
  return (
    <g transform={`translate(${d.x} ${d.y})`} opacity={d.alpha}>
      <defs>
        <radialGradient id="c13-drop-g" cx="0.4" cy="0.62" r="0.6">
          <stop offset={0} stopColor={C.text} />
          <stop offset={0.5} stopColor={C.gold} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0.9} />
        </radialGradient>
        <filter id="c13-drop-h" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation={r * 0.9} />
        </filter>
      </defs>
      <circle cx={0} cy={-r * 0.2} r={r * 1.9} fill={C.gold} opacity={0.55} filter="url(#c13-drop-h)" />
      <path d={path} fill="url(#c13-drop-g)" />
      <ellipse cx={-r * 0.35} cy={-r * 0.25} rx={r * 0.28} ry={r * 0.4} fill={C.text} opacity={0.85} />
    </g>
  );
};
