// The hero hand, in HAND-LOCAL units: origin = palm centre, +x = along the
// fingers, 1 = palm radius. Drawn inside the embryo's rim-light group, so the
// kit's light recipe (top-left rim, warm bounce edge) wraps it for free.
// What identifies a week-8 hand: five short digit rays fanning from the palm, joined
// by a thinner, rosier web that reaches almost to their rounded tips (shallow notches);
// by week 9 the web has receded to the knuckles and the stubby fingers stand free.
// No nails yet (they form from ~week 10). Digits are tapered capsules (no bulbous tip
// pads: those read as a frog's foot at phone size).
//   front per-gap web progress 0 webbed .. 1 free (the web edge recedes tip -> base)
//   rays  0..1 the five finger rays brighten (the "webbed" beat)
//   flex  per-finger 0..1 curl
import React from "react";
import { C } from "../../../theme/colors";
import { Pt, add, lerp, mul, norm, perp, rot, sub } from "../../../shared/embryo/math";

const SPREAD = 82;
const BASE = 0.3;
export const TIP = [1.22, 1.47, 1.55, 1.45, 1.27]; // fingertip cap centres, thumb first (short, stubby)
const FW = [0.21, 0.205, 0.2, 0.19, 0.18]; // half widths at the base (tips taper to 0.82x)
// while webbed the web runs tip to tip (a paddle with a scalloped rim): it meets each
// digit just past its cap centre, so only the rounded tips bulge out
const WEB_AT = 0.08;
const NOTCH = 0.12; // shallow scallop between two rays while webbed
const FREE_R = 0.86; // web edge once free: a small web at the knuckles only
const CURL = 0.4; // how much a fully flexed finger foreshortens

const polar = (r: number, deg: number): Pt => rot({ x: r, y: 0 }, deg);
const f3 = (q: Pt) => `${q.x.toFixed(3)} ${q.y.toFixed(3)}`;

export const fingerAngle = (i: number, flex = 0) => ((i / 4 - 0.5) * SPREAD + (i === 0 ? -10 : 0)) * (1 - 0.1 * flex);

export const fingerTip = (i: number, flex = 0): Pt => polar(BASE + (TIP[i] - BASE) * (1 - CURL * flex), fingerAngle(i, flex));

export const valleyAngle = (j: number, flex: number[]) => (fingerAngle(j, flex[j]) + fingerAngle(j + 1, flex[j + 1])) / 2;

// the web edge between fingers j and j+1: where it meets digit k, and in the notch (valley)
const webAt = (k: number, t: number) => lerp(TIP[k] + WEB_AT, FREE_R, t);
export const valleyR = (j: number, t: number) => (webAt(j, t) + webAt(j + 1, t)) / 2 - NOTCH * (1 - t);

// ray segment (hand-local) for the glow layer
export const rayEnds = (i: number): [Pt, Pt] => [polar(0.45, fingerAngle(i)), polar(TIP[i] - 0.08, fingerAngle(i))];

// a tapered capsule from base b to tip t (half widths wb, wt), round at both ends
const digit = (b: Pt, t: Pt, wb: number, wt: number) => {
  const n = perp(norm(sub(t, b)));
  const p = (q: Pt, k: number) => add(q, mul(n, k));
  return `M ${f3(p(b, wb))} L ${f3(p(t, wt))} A ${wt} ${wt} 0 0 0 ${f3(p(t, -wt))} L ${f3(p(b, -wb))} A ${wb} ${wb} 0 0 0 ${f3(p(b, wb))} Z`;
};

export type HandState = { front: number[]; rays: number; flex: number[]; ang: number; uid: string };

export const Hand: React.FC<HandState> = ({ front, rays, flex, ang, uid }) => {
  const id = `${uid}-hand`;
  const light = rot({ x: -0.6, y: -0.75 }, -ang); // screen top-left, in hand coords
  const free = front.reduce((a, b) => a + b, 0) / front.length;
  const veil = 1 - free; // webbed look strength
  const fingers = [0, 1, 2, 3, 4].map((i) => {
    const a = fingerAngle(i, flex[i]);
    const b = polar(BASE, a);
    const t = fingerTip(i, flex[i]);
    const w = FW[i];
    return { a, b, t, w, d: digit(b, t, w, w * 0.82) };
  });
  // one web membrane per gap: from inside the palm out along both rays to the web edge,
  // dipping into a shallow notch between them
  const webs = [0, 1, 2, 3].map((j) => {
    const a0 = fingers[j].a;
    const a1 = fingers[j + 1].a;
    // the web follows a curling digit (its tip pulls in)
    const p0 = polar(Math.min(webAt(j, front[j]), Math.hypot(fingers[j].t.x, fingers[j].t.y) + WEB_AT), a0);
    const p1 = polar(Math.min(webAt(j + 1, front[j]), Math.hypot(fingers[j + 1].t.x, fingers[j + 1].t.y) + WEB_AT), a1);
    // quadratic control so the curve's midpoint sits exactly in the notch
    const m = polar(valleyR(j, front[j]), (a0 + a1) / 2);
    const c = sub(mul(m, 2), mul(add(p0, p1), 0.5));
    return `M ${f3(polar(0.45, a0))} L ${f3(p0)} Q ${f3(c)} ${f3(p1)} L ${f3(polar(0.45, a1))} Z`;
  });
  const sh = mul(light, -0.1); // contact shadow offset (away from the light)
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-skin`} gradientUnits="userSpaceOnUse" cx={light.x} cy={light.y} r={2.6}>
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.5" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <filter id={`${id}-sh`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={0.07} />
        </filter>
      </defs>
      {/* contact shadow of the fingers on the body below: shows in the gaps once free */}
      <g transform={`translate(${sh.x} ${sh.y})`} filter={`url(#${id}-sh)`} opacity={0.55}>
        {fingers.map((g, i) => (
          <path key={i} d={g.d} fill={C.wombDeep} />
        ))}
      </g>
      <ellipse cx={-0.2} cy={0} rx={0.86} ry={0.74} fill={`url(#${id}-skin)`} />
      {/* the web: thinner, rosier tissue between the rays */}
      {webs.map((d, j) => (
        <g key={`w${j}`}>
          <path d={d} fill={`url(#${id}-skin)`} />
          <path d={d} fill={C.rose} opacity={0.3 * (1 - front[j])} />
        </g>
      ))}
      {fingers.map((g, i) => (
        <g key={i}>
          <path d={g.d} fill={`url(#${id}-skin)`} />
          {/* the curl: the far half of the digit turns away from the light */}
          <path d={digit(add(g.b, mul(sub(g.t, g.b), 0.55)), g.t, g.w * 0.9, g.w * 0.82)} fill={C.skinShade} opacity={0.4 * flex[i]} />
        </g>
      ))}
      {/* five finger rays: raised ridges catching the key light */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p0 = polar(0.5, fingers[i].a);
        const p1 = add(fingers[i].t, mul(norm(sub(fingers[i].t, fingers[i].b)), -0.06));
        const hl = rot({ x: 0, y: -0.06 }, fingers[i].a);
        return (
          <line key={`r${i}`} x1={p0.x + hl.x} y1={p0.y + hl.y} x2={p1.x + hl.x} y2={p1.y + hl.y} stroke={C.text} strokeWidth={0.07} strokeLinecap="round" opacity={(0.18 + 0.22 * rays) * (0.5 + 0.5 * veil)} />
        );
      })}
      {/* key-light sheen on the back of the hand + knuckle crease once free */}
      <ellipse cx={light.x * 0.3 + 0.25} cy={light.y * 0.3} rx={0.62} ry={0.22} transform={`rotate(${-ang - 35} ${light.x * 0.3 + 0.25} ${light.y * 0.3})`} fill={C.text} opacity={0.08} />
      {[1, 2, 3, 4].map((i) => {
        const c = polar(0.78, fingers[i].a);
        const n = rot({ x: 0, y: FW[i] * 0.75 }, fingers[i].a);
        return <line key={`k${i}`} x1={c.x - n.x} y1={c.y - n.y} x2={c.x + n.x} y2={c.y + n.y} stroke={C.skinShade} strokeWidth={0.05} strokeLinecap="round" opacity={0.45 * free} />;
      })}
    </g>
  );
};
