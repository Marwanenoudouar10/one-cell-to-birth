import React from "react";
import { C } from "../../../../theme/colors";
import { airAll, airAt, airFront, inflate } from "./breath";
import { Branch, LOBES, Tip, TRACHEA, TRACHEA_S1, TREES } from "./lungTree";
import { LungDefs } from "./LungDefs";

const ease = (t: number) => t * t * (3 - 2 * t);
const qd = (br: Branch) => `M${br.a[0]},${br.a[1]} Q${br.c[0]},${br.c[1]} ${br.b[0]},${br.b[1]}`;
const fill = (frame: number, s0: number, s1: number) => Math.max(0, Math.min(1, (airFront(frame) - s0) / (s1 - s0)));
const TRACH: Branch = { a: TRACHEA.top, c: [540, 416], b: TRACHEA.carina, w0: TRACHEA.w, w1: TRACHEA.w * 0.92, s0: 0, s1: TRACHEA_S1, depth: -1 };
const [CX, CY] = TRACHEA.carina;

// One airway: dark outline, fluid-filled rose tube, and the air running into
// it as a bright core (stroke-dash = how far the air has got).
const Airway: React.FC<{ br: Branch; k: number }> = ({ br, k }) => {
  const w = (br.w0 + br.w1) / 2;
  const d = qd(br);
  return (
    <g>
      <path d={d} fill="none" stroke={C.wombDeep} strokeOpacity={0.6} strokeWidth={w + 5} strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.womb} strokeWidth={w} strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.rose} strokeOpacity={0.45} strokeWidth={w * 0.42} strokeLinecap="round" transform="translate(-1.5 -2)" />
      {k > 0.01 && (
        <>
          <path d={d} pathLength={1} strokeDasharray={`${k} 2`} fill="none" stroke={C.peach} strokeWidth={w * 0.95} strokeLinecap="round" />
          <path d={d} pathLength={1} strokeDasharray={`${k} 2`} fill="none" stroke={C.skin} strokeWidth={w * 0.62} strokeLinecap="round" transform="translate(-0.8 -1)" />
          <path d={d} pathLength={1} strokeDasharray={`${k} 2`} fill="none" stroke={C.text} strokeOpacity={0.85} strokeWidth={w * 0.24} strokeLinecap="round" transform="translate(-1.8 -2.2)" />
        </>
      )}
    </g>
  );
};

// Grape-like cluster of air sacs at a branch tip: small, dark and full of fluid
// first; round, bright and airy once the air arrives (the fluid drop retreats).
const Cluster: React.FC<{ tip: Tip; frame: number; swell: number }> = ({ tip, frame, swell }) => {
  const a = ease(airAt(frame, tip.s, 0.08));
  const k = (0.62 + 0.38 * a) * swell;
  const dropT = Math.min(1, a * 1.2);
  const dx = tip.p[0] + (tip.drop[0] - tip.p[0]) * dropT;
  const dy = tip.p[1] + (tip.drop[1] - tip.p[1]) * dropT;
  const dropO = Math.sin(Math.PI * dropT) * 0.8;
  return (
    <g>
      {dropO > 0.02 && (
        <g opacity={dropO}>
          <circle cx={dx} cy={dy} r={7 * (1 - 0.55 * dropT)} fill="url(#c16-sacFluid)" />
          <circle cx={dx - 2} cy={dy - 2.4} r={2} fill={C.peach} opacity={0.75} />
        </g>
      )}
      {tip.sacs.map((sc, i) => {
        const r = sc.r * k;
        const spread = 0.72 + 0.28 * a;
        const x = tip.p[0] + (sc.x - tip.p[0]) * spread;
        const y = tip.p[1] + (sc.y - tip.p[1]) * spread;
        return (
          <g key={i}>
            <circle cx={x + 1.5} cy={y + 2} r={r + 1.5} fill={C.wombDeep} opacity={0.5} />
            {a < 0.98 && <circle cx={x} cy={y} r={r} fill="url(#c16-sacFluid)" opacity={1 - 0.75 * a} />}
            {a > 0.02 && <circle cx={x} cy={y} r={r} fill="url(#c16-sacAir)" opacity={a} />}
            <circle cx={x - r * 0.34} cy={y - r * 0.36} r={r * (0.2 + 0.06 * a)} fill={C.text} opacity={0.2 + 0.4 * a} />
          </g>
        );
      })}
    </g>
  );
};

// A lobe of soft tissue: lit from the upper left, with an inner glow along its
// edge and a warm rim on the lower right. Brighter and airier with `air`.
const Lobe: React.FC<{ side: "L" | "R"; air: number }> = ({ side, air }) => (
  <g>
    <path d={LOBES[side]} fill="url(#c16-lobeFluid)" />
    <path d={LOBES[side]} fill="url(#c16-lobeAir)" opacity={air} />
    <g clipPath={`url(#c16-lobeClip${side})`}>
      <path d={LOBES[side]} fill="none" stroke={C.rose} strokeOpacity={0.35 + 0.3 * air} strokeWidth={46} style={{ filter: "blur(16px)" }} />
      <path d={LOBES[side]} fill="none" stroke={C.peach} strokeOpacity={0.5 * air} strokeWidth={14} transform="translate(-6 -8)" style={{ filter: "blur(6px)" }} />
    </g>
    <path d={LOBES[side]} fill="none" stroke={C.rose} strokeOpacity={0.5} strokeWidth={2.5} />
    <path d={LOBES[side]} fill="none" stroke={C.peach} strokeOpacity={0.55 * air} strokeWidth={2.5} />
  </g>
);

// The two lungs, filling with air over the first breaths.
export const Lungs: React.FC<{ frame: number }> = ({ frame }) => {
  const vol = inflate(frame);
  const all = airAll(frame);
  // the lungs open out from the windpipe: a little bigger once airy, and
  // swelling with each breath
  const open = 0.93 + 0.07 * all + 0.035 * vol;
  const swell = 1 + 0.06 * vol;
  const tk = fill(frame, TRACH.s0, TRACH.s1);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
      <LungDefs />
      <g mask="url(#c16-trachMask)">
        <Airway br={TRACH} k={tk} />
        {Array.from({ length: 13 }, (_, i) => {
          const y = TRACHEA.top[1] + 30 + i * 27;
          const w = TRACHEA.w * 0.48;
          return <path key={i} d={`M${540 - w},${y - 2} Q540,${y + 6} ${540 + w},${y - 2}`} fill="none" stroke={TRACHEA.top[1] + tk * (CY - TRACHEA.top[1]) > y ? C.text : C.rose} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />;
        })}
      </g>
      <g transform={`translate(${CX} ${CY}) scale(${open}) translate(${-CX} ${-CY})`}>
        <Lobe side="L" air={all} />
        <Lobe side="R" air={all} />
        {/* soft glow of the air as it runs down the branches (one blur for all) */}
        <g style={{ filter: "blur(10px)", mixBlendMode: "screen" }} opacity={0.6}>
          {[...TREES.L.branches, ...TREES.R.branches].map((br, i) => {
            const k = fill(frame, br.s0, br.s1);
            return k > 0.01 ? <path key={i} d={qd(br)} pathLength={1} strokeDasharray={`${k} 2`} fill="none" stroke={C.gold} strokeOpacity={0.5} strokeWidth={(br.w0 + br.w1) * 0.9} strokeLinecap="round" /> : null;
          })}
        </g>
        {[...TREES.L.branches, ...TREES.R.branches].map((br, i) => (
          <Airway key={i} br={br} k={fill(frame, br.s0, br.s1)} />
        ))}
        {[...TREES.L.tips, ...TREES.R.tips].map((tip, i) => (
          <Cluster key={i} tip={tip} frame={frame} swell={swell} />
        ))}
      </g>
    </svg>
  );
};
