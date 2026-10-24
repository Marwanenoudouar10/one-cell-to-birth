// Gold focus marks for "fingers, toes, a face" (adapted from the teaser's
// Scene4 highlights), drawn in fetus-local px on top of the body, plus the
// tiny glint that runs along the sealed eyelid (the set-up for C12).
import React from "react";
import { C } from "../../../theme/colors";
import { EASE } from "../../../lib/ease";
import { Pt } from "./timeline";
import { along, smooth } from "./geom";

// A thin gold ring that draws itself on, with a glow and an outward echo.
// `z` = camera zoom: strokes stay a constant width on screen (Scene4's 4.5 / 13 px).
export const Ring: React.FC<{ c: Pt; r: number; p: number; alpha: number; z: number }> = ({ c, r, p, alpha, z }) => {
  if (alpha <= 0.001 || p <= 0) return null;
  const rr = r * (0.82 + 0.18 * EASE.back(Math.min(1, p)));
  const circ = 2 * Math.PI * rr;
  const echo = Math.max(0, (p - 0.55) / 0.45);
  const dash = `${circ * Math.min(1, p)} ${circ}`;
  return (
    <g opacity={alpha} transform={`rotate(-110 ${c.x} ${c.y})`}>
      <circle cx={c.x} cy={c.y} r={rr} fill="none" stroke={C.gold} strokeWidth={14 / z} opacity={0.35} strokeDasharray={dash} filter="url(#c09-glow)" />
      <circle cx={c.x} cy={c.y} r={rr} fill="none" stroke={C.gold} strokeWidth={4.6 / z} strokeDasharray={dash} strokeLinecap="round" />
      {echo > 0 && (
        <circle cx={c.x} cy={c.y} r={rr * (1 + 0.35 * EASE.out(echo))} fill="none" stroke={C.gold} strokeWidth={3 / z} opacity={0.5 * (1 - echo)} />
      )}
    </g>
  );
};

// One four-point twinkle.
export const Twinkle: React.FC<{ q: Pt; s: number; spin: number }> = ({ q, s, spin }) => (
  <g transform={`rotate(${spin} ${q.x} ${q.y})`}>
    <circle cx={q.x} cy={q.y} r={s * 0.9} fill={C.gold} opacity={0.4} filter="url(#c09-glow)" />
    <ellipse cx={q.x} cy={q.y} rx={s} ry={s * 0.16} fill={C.text} />
    <ellipse cx={q.x} cy={q.y} rx={s * 0.16} ry={s} fill={C.text} />
    <circle cx={q.x} cy={q.y} r={s * 0.22} fill={C.text} />
  </g>
);

// Twinkles at fingertips / toes, popping in one after another.
export const Sparkles: React.FC<{ pts: Pt[]; p: number; alpha: number; size: number }> = ({ pts, p, alpha, size }) => {
  if (alpha <= 0.001) return null;
  return (
    <g opacity={alpha}>
      {pts.map((q, i) => {
        const t = Math.max(0, Math.min(1, p * 1.25 - i * 0.07));
        const k = Math.sin(Math.PI * t);
        if (k <= 0.01) return null;
        return <Twinkle key={i} q={q} s={size * k * (i % 2 ? 0.75 : 1)} spin={t * 50} />;
      })}
    </g>
  );
};

// A warm band of light slides down the face (forehead -> eye -> nose -> lips
// -> chin), clipped to the head, leaving a fine gold rim along the profile.
export const FaceSweep: React.FC<{ profile: Pt[]; p: number; glow: number; s: number; z: number }> = ({ profile, p, glow, s, z }) => {
  if (glow <= 0.001) return null;
  const d = smooth(profile, false);
  const total = 400;
  const trail = `${Math.max(0, total * 1.1 * p)} ${total * 2}`;
  const pool = profile[4];
  // twinkles on the profile edge only (forehead, nose, lips): a star ON the sealed eye
  // reads as a catchlight / an open eye at phone size (rule 11; lids fused until ~26 wk)
  const feats = [profile[1], profile[4], profile[7]];
  const band = along(profile, -0.08 + 1.16 * p);
  const deg = (Math.atan2(band.t.x, -band.t.y) * 180) / Math.PI; // into the face (faces +x)
  const bandA = Math.sin(Math.PI * Math.max(0, Math.min(1, p))) * glow;
  return (
    <g>
      <circle cx={pool.x - 30 * s} cy={pool.y - 10 * s} r={150 * s} fill="url(#c09-facePool)" opacity={glow} />
      {bandA > 0.01 && (
        <g clipPath="url(#c09-headClip)">
          <ellipse cx={40 * s} cy={0} rx={125 * s} ry={50 * s} fill="url(#c09-band)" opacity={0.85 * bandA}
            transform={`translate(${band.p.x} ${band.p.y}) rotate(${deg})`} style={{ mixBlendMode: "screen" }} />
        </g>
      )}
      <path d={d} pathLength={total} fill="none" stroke={C.gold} strokeWidth={16 / z} strokeLinecap="round"
        strokeDasharray={trail} opacity={0.5 * glow} filter="url(#c09-glow)" />
      <path d={d} pathLength={total} fill="none" stroke={C.gold} strokeWidth={5 / z} strokeLinecap="round"
        strokeDasharray={trail} opacity={0.95 * glow} />
      <Sparkles pts={feats} p={Math.min(1, p * 1.1)} alpha={glow} size={17 / z} />
    </g>
  );
};

// The sealed eyelid: a fine bright glint runs along the lid seam, outer to inner
// corner, and fades out there (no star at the end: on the eye it reads as a
// catchlight, i.e. an open eye). `lid` = seam points.
export const LidGlint: React.FC<{ lid: Pt[]; p: number; alpha: number; z: number }> = ({ lid, p, alpha, z }) => {
  if (alpha <= 0.001) return null;
  const d = smooth(lid, false);
  const tail = 0.38;
  const head = along(lid, Math.min(1, p * (1 + tail))).p;
  const off = -(p * (1 + tail) - tail);
  return (
    <g opacity={alpha} strokeLinecap="round" fill="none">
      <path d={d} stroke={C.gold} strokeWidth={12 / z} opacity={0.35} filter="url(#c09-soft)" />
      <path d={d} pathLength={1} stroke={C.gold} strokeWidth={14 / z} strokeDasharray={`${tail} 3`} strokeDashoffset={off}
        filter="url(#c09-glow)" />
      <path d={d} pathLength={1} stroke={C.text} strokeWidth={5 / z} strokeDasharray={`${tail} 3`} strokeDashoffset={off} />
      <circle cx={head.x} cy={head.y} r={5 / z} fill={C.text} opacity={Math.sin(Math.PI * p)} />
    </g>
  );
};
