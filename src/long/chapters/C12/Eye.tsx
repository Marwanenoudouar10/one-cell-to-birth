// The macro eye, drawn in the kit's head-local units over the EyePatch.
// `detail` 0 = looks exactly like the kit's closed eye (thick lid line, no
// lashes), 1 = close-up detail (fine seam, soft lashes, lid dome light).
// Open, it is dark, glossy and neutral, with a warm amber catch-light.
import React from "react";
import { random } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { EyeGeo, eyeGeo } from "./eyeShape";
import { P2 } from "./rig";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm = (v: P2) => {
  const l = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / l, y: v.y / l };
};
const f2 = (v: number) => v.toFixed(2);
const GT = 0.32; // glint streak length, fraction of the seam

export type EyeLook = {
  open: number; // 0 sealed .. 1 open
  detail: number; // LOD 0..1
  seam: number; // glow of the sealed seam 0..1
  glint: number; // -1 = none, else 0..1 travel along the seam
  rose: number; // dim rose-red light from behind (reflections) 0..1
  stir: number; // lashes tremble a little as the lids wake 0..1
  frame: number;
};

// soft, fine fetal lashes: they point down-forward when shut, up-forward open
const Lashes: React.FC<{ e: EyeGeo; open: number; amt: number; stir: number; frame: number }> = ({ e, open, amt, stir, frame }) => {
  if (amt < 0.01) return null;
  const N = 17;
  const upper = Array.from({ length: N }, (_, i) => {
    const t = 0.14 + (0.8 * i) / (N - 1) + 0.02 * (random(`c12-lt${i}`) - 0.5);
    const b = e.upperAt(t);
    const T = e.upperTan(t);
    const down = { x: -T.y, y: T.x };
    const up = { x: T.y, y: -T.x };
    const jit = 0.25 * (random(`c12-lj${i}`) - 0.5) + 0.35 * stir * noise2D(`c12-ls${i}`, frame * 0.18, i);
    const dc = norm({ x: down.x + (0.55 + jit) * T.x, y: down.y + (0.55 + jit) * T.y });
    const dO = norm({ x: up.x + (0.65 + jit) * T.x, y: up.y + (0.65 + jit) * T.y });
    const d = norm({ x: lerp(dc.x, dO.x, open), y: lerp(dc.y, dO.y, open) });
    const len = (1.0 + 1.1 * Math.sin(Math.PI * Math.min(1, t * 1.1))) * (0.7 + 0.5 * random(`c12-lash${i}`));
    const c = { x: b.x + d.x * len * 0.55 + T.x * len * 0.1, y: b.y + d.y * len * 0.55 + T.y * len * 0.1 };
    const tip = { x: b.x + d.x * len + T.x * len * 0.45, y: b.y + d.y * len + T.y * len * 0.45 };
    return { d: `M${f2(b.x)},${f2(b.y)} Q${f2(c.x)},${f2(c.y)} ${f2(tip.x)},${f2(tip.y)}`, o: 0.24 + 0.18 * random(`c12-lashO${i}`) };
  });
  const lower = Array.from({ length: 7 }, (_, i) => {
    const t = 0.3 + 0.09 * i;
    const b = e.lowerAt(t);
    const len = 0.7 + 0.5 * random(`c12-ll${i}`);
    return `M${f2(b.x)},${f2(b.y + 0.3)} q${f2(0.35 * len)},${f2(0.6 * len)} ${f2(0.6 * len)},${f2(1.0 * len)}`;
  });
  return (
    <g fill="none" stroke={C.wombDeep} strokeLinecap="round" opacity={amt}>
      {upper.map((l, i) => (
        <path key={i} d={l.d} strokeWidth={0.2} strokeOpacity={l.o} />
      ))}
      {lower.map((d, i) => (
        <path key={`l${i}`} d={d} strokeWidth={0.18} strokeOpacity={0.12 * open} />
      ))}
    </g>
  );
};

export const EyeDefs: React.FC = () => (
  <defs>
    {[0.6, 1.5, 3, 6.5].map((sd, i) => (
      <filter key={i} id={`c12-soft${["1", "2", "3", "6"][i]}`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={sd} />
      </filter>
    ))}
    <radialGradient id="c12-ball" cx="0.62" cy="0.45" r="0.6">
      <stop offset={0} stopColor={C.bg2} />
      <stop offset={0.55} stopColor={C.bg1} />
      <stop offset={1} stopColor={C.bg0} />
    </radialGradient>
    {/* dark, neutral slate iris (facts: keep it dark and neutral, never coloured) */}
    <radialGradient id="c12-iris" cx="0.4" cy="0.34" r="0.72">
      <stop offset={0} stopColor={C.bg2} />
      <stop offset={0.5} stopColor={C.bg1} />
      <stop offset={1} stopColor={C.bg0} />
    </radialGradient>
  </defs>
);

export const Eye: React.FC<{ eye: P2; look: EyeLook; opacity: number }> = ({ eye, look, opacity }) => {
  if (opacity <= 0.002) return null;
  const { open, detail: dt, seam, glint, rose, stir, frame } = look;
  const e = eyeGeo(eye, open, dt);
  const { x: ex, y: ey } = eye;
  const ir = e.iris;
  const shut = 1 - open;
  const arc = (r: number, a0: number, a1: number) => {
    const p = (a: number) => `${f2(ir.x + r * Math.cos((a * Math.PI) / 180))},${f2(ir.y + r * Math.sin((a * Math.PI) / 180))}`;
    return `M${p(a0)} A${r},${r} 0 0 1 ${p(a1)}`;
  };
  return (
    <g opacity={opacity}>
      {/* socket recess (kit values at detail 0) */}
      <ellipse cx={ex + 0.5 * dt} cy={ey + 0.5 * dt} rx={lerp(17, 20, dt)} ry={lerp(11, 14, dt)} fill={C.skinShade} opacity={lerp(0.5, 0.42, dt)} filter="url(#c12-soft6)" />
      {/* the closed lid is a little dome catching the key light */}
      <ellipse cx={ex - 2} cy={ey - 0.4} rx={11.5} ry={4.8} fill={C.skin} opacity={0.55 * shut * dt} filter="url(#c12-soft2)" />
      <path d={e.lower} transform="translate(0 1.8)" fill="none" stroke={C.skinShade} strokeOpacity={0.26 * dt} strokeWidth={2.6} filter="url(#c12-soft2)" />

      {/* the eye itself, seen through the parting lids */}
      {open > 0.004 && (
        <g>
          <clipPath id="c12-aperture">
            <path d={e.aperture} />
          </clipPath>
          <g clipPath="url(#c12-aperture)">
            <rect x={ex - 15} y={ey - 16} width={30} height={30} fill="url(#c12-ball)" />
            <ellipse cx={ex - 10} cy={ey + 1.2} rx={5} ry={4} fill={C.cell} opacity={0.08} filter="url(#c12-soft1)" />
            <circle cx={ir.x} cy={ir.y} r={e.irisR} fill="url(#c12-iris)" />
            <circle cx={ir.x} cy={ir.y} r={e.irisR - 0.45} fill="none" stroke={C.bg0} strokeOpacity={0.75} strokeWidth={1} />
            <circle cx={ir.x} cy={ir.y} r={5.4} fill="none" stroke={C.cell} strokeOpacity={0.07} strokeWidth={2.2} filter="url(#c12-soft1)" />
            <circle cx={ir.x + 0.3} cy={ir.y + 0.2} r={3.4} fill={C.bg0} opacity={0.88} />
            {/* lid shadow on the eyeball, then the gloss */}
            <path d={e.upper} fill="none" stroke={C.bg0} strokeOpacity={0.6} strokeWidth={6} filter="url(#c12-soft2)" />
            <path d={arc(6.4, 195, 268)} fill="none" stroke={C.text} strokeOpacity={0.15} strokeWidth={1.5} strokeLinecap="round" filter="url(#c12-soft1)" />
            <ellipse cx={ex + 1.5} cy={ey + 4.6} rx={5} ry={1.1} fill={C.rose} opacity={0.1 + 0.32 * rose} filter="url(#c12-soft1)" />
            {/* warm amber catch-light: the glowing wall reflected as a soft curved
                window on the wet cornea (a streak, never a dot: rule 11) */}
            <path d={arc(5.4, 298, 350)} fill="none" stroke={C.gold} strokeOpacity={0.2 + 0.15 * rose} strokeWidth={2.4} strokeLinecap="round" filter="url(#c12-soft1)" />
            <path d={arc(5.4, 304, 344)} fill="none" stroke={C.gold} strokeOpacity={0.5 + 0.2 * rose} strokeWidth={0.75} strokeLinecap="round" />
            <path d={arc(5.5, 312, 334)} fill="none" stroke={C.text} strokeOpacity={0.4} strokeWidth={0.35} strokeLinecap="round" />
            <path d={e.lower} transform="translate(0 -0.35)" fill="none" stroke={C.rose} strokeOpacity={0.55} strokeWidth={1.1} filter="url(#c12-soft1)" />
            <path d={e.lower} transform="translate(0 -0.75)" fill="none" stroke={C.text} strokeOpacity={0.28} strokeWidth={0.4} />
          </g>
          {/* inner corner (tear duct), soft rose */}
          <ellipse cx={e.front.x - 1.7} cy={e.front.y + 0.3} rx={1.9} ry={1.25} fill={C.rose} opacity={0.5 * Math.min(1, open * 3)} filter="url(#c12-soft1)" />
        </g>
      )}

      {/* lid lines: the upper edge is the seam when shut */}
      <path d={e.upper} fill="none" stroke={C.wombDeep} strokeOpacity={lerp(0.8, lerp(0.7, 0.6, open), dt)} strokeWidth={lerp(2.8, lerp(0.7, 0.75, open), dt)} strokeLinecap="round" />
      <path d={e.upper} transform="translate(0 -0.9)" fill="none" stroke={C.skin} strokeOpacity={0.45 * open * dt} strokeWidth={0.55} strokeLinecap="round" />
      <path d={e.lower} transform="translate(0 0.5)" fill="none" stroke={C.skin} strokeOpacity={0.55 * open * dt} strokeWidth={0.7} strokeLinecap="round" />
      <path d={e.lower} transform="translate(0 2.6)" fill="none" stroke={C.skin} strokeOpacity={0.3 * open * dt} strokeWidth={2.6} filter="url(#c12-soft2)" />
      <path d={e.crease} fill="none" stroke={C.skinShade} strokeOpacity={0.38 * open * dt} strokeWidth={1.5} strokeLinecap="round" filter="url(#c12-soft1)" />
      <path d={e.crease} transform="translate(0.6 3.4)" fill="none" stroke={C.skin} strokeOpacity={0.4 * open * dt} strokeWidth={3} strokeLinecap="round" filter="url(#c12-soft2)" />
      {/* the kit's lid highlight, softened into a lit lid fold up close */}
      {(() => {
        const d = `M${ex - 9},${lerp(ey - 5, ey - 13, open)} Q${ex},${lerp(ey + 1, ey - 8, open)} ${ex + 9},${lerp(ey - 3, ey - 11, open)}`;
        return (
          <>
            <path d={d} fill="none" stroke={C.skin} strokeOpacity={0.7 * (1 - dt)} strokeWidth={2} strokeLinecap="round" />
            <path d={d} transform={`translate(0 ${-2 * dt})`} fill="none" stroke={C.skin} strokeOpacity={0.5 * dt} strokeWidth={3.2} strokeLinecap="round"
              filter="url(#c12-soft2)" />
          </>
        );
      })()}
      <circle cx={e.back.x - 0.6} cy={e.back.y} r={1.3} fill={C.skinShade} opacity={0.35 * open * dt} filter="url(#c12-soft1)" />
      <Lashes e={e} open={open} amt={dt} stir={stir} frame={frame} />

      {/* the sealed seam glows faintly (the glint from C09) */}
      {seam * shut > 0.01 && (
        <g>
          <path d={e.upper} fill="none" stroke={C.gold} strokeOpacity={0.5 * seam * shut * shut} strokeWidth={2.2} filter="url(#c12-soft1)" />
          <path d={e.upper} fill="none" stroke={C.gold} strokeOpacity={0.7 * seam * shut} strokeWidth={0.3} strokeLinecap="round" />
        </g>
      )}
      {/* the glint runs along the seam, outer -> inner corner, as a short streak
          (C09's LidGlint; a round spark on the eye would read as a catch-light) */}
      {glint >= 0 && glint <= 1 && (
        <g fill="none" strokeLinecap="round" opacity={Math.min(1, 2.2 * Math.sin(Math.PI * glint))}>
          <path d={e.upper} pathLength={1} stroke={C.gold} strokeWidth={2} strokeDasharray={`${GT} 3`}
            strokeDashoffset={-(glint * (1 + GT) - GT)} opacity={0.7} filter="url(#c12-soft2)" />
          <path d={e.upper} pathLength={1} stroke={C.text} strokeWidth={0.45} strokeDasharray={`${GT} 3`}
            strokeDashoffset={-(glint * (1 + GT) - GT)} opacity={0.95} />
        </g>
      )}
    </g>
  );
};
