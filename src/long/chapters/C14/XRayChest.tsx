// The chest turns softly translucent (x-ray style) and the lung tree draws
// itself inside it: trachea -> bronchi -> grape-like sac clusters, then a gold
// film and one practice pulse. Drawn in the baby's LOCAL px (inside the
// translate(BABY) group), masked to the torso (+ arm) minus head / legs so it
// always sits inside the body. Muted rose = fluid-filled, never airy white.
import React from "react";
import { C } from "../../../theme/colors";
import { BabyState } from "./baby";
import { CHEST_TREE, Pt, cluster, segPath } from "./lungTree";
import { pulseProg, surfProg, tipsProg, treeProg, xrayEnv } from "./motion";
import { TorsoMask } from "./TorsoMask";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// the tips' tiny clusters (normalised lung units), fixed per tip
const TIP_SACS = CHEST_TREE.tips.map((t, i) => cluster(t.p, t.ang, 0.035, 4, `c14-ct${i}`));

export const XRayChest: React.FC<{ f: number; b: BabyState }> = ({ f, b }) => {
  const env = xrayEnv(f);
  if (env <= 0.002) return null;
  const { chest: m, chestPx } = b;
  const tree = CHEST_TREE;
  const D = treeProg(f) * tree.maxD * 1.02;
  const tips = tipsProg(f);
  const surf = surfProg(f);
  const pp = pulseProg(f);
  const pulseD = pp * tree.maxD;
  const pulseA = pp > 0 && pp < 1.35 ? Math.sin(clamp01(pp / 1.35) * Math.PI) : 0;
  const c = m({ x: 0, y: -0.42 });
  const ang = (Math.atan2(m({ x: 0, y: -1 }).x - m({ x: 0, y: 0 }).x, -(m({ x: 0, y: -1 }).y - m({ x: 0, y: 0 }).y)) * 180) / Math.PI;
  const lobes = [-1, 1].map((side) => m({ x: side * 0.3, y: -0.6 }));
  const wpx = (w: number) => Math.max(1.2, w * chestPx);
  return (
    <g opacity={env}>
      <defs>
        <TorsoMask id="c14-xmask" b={b} />
        <radialGradient id="c14-xwin">
          <stop offset="0%" stopColor={C.womb} stopOpacity={0.72} />
          <stop offset="55%" stopColor={C.womb} stopOpacity={0.5} />
          <stop offset="100%" stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="c14-xlobe">
          <stop offset="0%" stopColor={C.rose} stopOpacity={0.5} />
          <stop offset="70%" stopColor={C.womb} stopOpacity={0.35} />
          <stop offset="100%" stopColor={C.womb} stopOpacity={0} />
        </radialGradient>
        <filter id="c14-xglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
      </defs>
      <g mask="url(#c14-xmask)">
        {/* the translucent window */}
        <ellipse cx={c.x} cy={c.y} rx={chestPx * 0.95} ry={chestPx * 0.82} transform={`rotate(${ang} ${c.x} ${c.y})`} fill="url(#c14-xwin)" />
        {/* soft lobes behind the branches */}
        {lobes.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx={chestPx * 0.36 * clamp01(D / tree.maxD + 0.2)} ry={chestPx * 0.5 * clamp01(D / tree.maxD + 0.2)}
            transform={`rotate(${ang + (i ? 12 : -12)} ${p.x} ${p.y})`} fill="url(#c14-xlobe)" />
        ))}
        {/* branch glow (one blurred group) + crisp cores */}
        <g filter="url(#c14-xglow)" opacity={0.85}>
          {tree.segs.map((s, i) => {
            const k = clamp01((D - s.d0) / (s.d1 - s.d0));
            return k > 0 ? <path key={i} d={segPath(s, m)} pathLength={1} strokeDasharray={`${k} 2`} stroke={C.rose} strokeWidth={wpx(s.w) * 2.6} strokeLinecap="round" fill="none" /> : null;
          })}
        </g>
        {tree.segs.map((s, i) => {
          const k = clamp01((D - s.d0) / (s.d1 - s.d0));
          return k > 0 ? <path key={i} d={segPath(s, m)} pathLength={1} strokeDasharray={`${k} 2`} stroke={C.peach} strokeOpacity={0.95} strokeWidth={wpx(s.w)} strokeLinecap="round" fill="none" /> : null;
        })}
        {/* the practice pulse: a bright bead running out along every branch */}
        {pulseA > 0.01 &&
          tree.segs.map((s, i) => {
            const k = (pulseD - s.d0) / (s.d1 - s.d0);
            if (k < -0.2 || k > 1.2) return null;
            return <path key={i} d={segPath(s, m)} pathLength={1} strokeDasharray="0.22 2" strokeDashoffset={-(k - 0.11)} stroke={C.text} strokeOpacity={0.9 * pulseA} strokeWidth={wpx(s.w) * 1.2} strokeLinecap="round" fill="none" />;
          })}
        {/* grape-like sac clusters at the tips, then the gold film */}
        {tips > 0.01 &&
          TIP_SACS.map((sacs, i) =>
            sacs.map((q, j) => {
              const p: Pt = m(q.p);
              const r = q.r * chestPx * Math.max(0, tips) * (1 + 0.18 * Math.max(0, Math.sin(Math.PI * clamp01(pp - 0.7))));
              return (
                <g key={`${i}-${j}`}>
                  <circle cx={p.x} cy={p.y} r={r} fill={C.womb} stroke={C.rose} strokeWidth={1.2} />
                  <circle cx={p.x - r * 0.3} cy={p.y - r * 0.3} r={r * 0.35} fill={C.peach} opacity={0.55} />
                  {surf > 0.01 && <circle cx={p.x} cy={p.y} r={r + 0.8} fill="none" stroke={C.gold} strokeWidth={1.6} opacity={surf} />}
                </g>
              );
            }),
          )}
      </g>
    </g>
  );
};
