// One macro fingertip seen from the pad side, pointing up: translucent skin
// with key light upper-left, warm rim lower-right, rose subsurface glow, the
// distal crease, the ridge canvas, glowing ridge start points and the lock
// ring. Everything lives in pad-local px inside one transformed box, and the
// finger fades out downward before the caption zone.
import React from "react";
import { C } from "../../../../theme/colors";
import { smoothPath } from "../geom";
import { APEX, PAD, fingerOutline, halfWidth } from "./pad";
import { PrintSpec, SOURCES } from "./prints";
import { RidgeCanvas } from "./RidgeCanvas";
import { TipState } from "./timeline";

const OUT = smoothPath(fingerOutline(), true, 0.16);
const VB = { x: -520, y: -640, w: 1040, h: 1420 }; // local box of the whole fingertip (+ lock ring)
const svgAbs: React.CSSProperties = { position: "absolute", left: VB.x, top: VB.y, width: VB.w, height: VB.h, overflow: "visible" };
const fadeMask = (() => {
  const a = ((PAD.crease + 120 - VB.y) / VB.h) * 100;
  const b = ((PAD.bottom - 20 - VB.y) / VB.h) * 100;
  return `linear-gradient(to bottom, black ${a.toFixed(1)}%, transparent ${b.toFixed(1)}%)`;
})();
const cw = halfWidth(PAD.crease);

export const Fingertip: React.FC<{ id: string; spec: PrintSpec; st: TipState; frame: number }> = ({ id, spec, st, frame }) => {
  const { place: p, look, dots, glow, ring, lock } = st;
  if (p.opacity <= 0.002) return null;
  const k = (n: string) => `c10-tip${id}-${n}`;
  const u = (n: string) => `url(#${k(n)})`;
  const core = SOURCES[0];
  return (
    <div
      style={{
        position: "absolute", left: 0, top: 0, width: 0, height: 0,
        transform: `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px) rotate(${p.rot.toFixed(3)}deg) scale(${p.s.toFixed(5)})`,
        transformOrigin: "0 0", opacity: p.opacity,
        filter: p.blur > 0.05 ? `blur(${p.blur.toFixed(2)}px)` : undefined,
      }}
    >
      <div style={{ position: "absolute", left: VB.x, top: VB.y, width: VB.w, height: VB.h, WebkitMaskImage: fadeMask, maskImage: fadeMask }}>
        <div style={{ position: "absolute", left: -VB.x, top: -VB.y }}>
          <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} style={svgAbs}>
            <defs>
              <radialGradient id={k("skin")} cx="0.36" cy="0.2" r="0.95">
                <stop offset={0} stopColor={C.skin} />
                <stop offset={0.42} stopColor={C.peach} />
                <stop offset={0.78} stopColor={C.skinShade} />
                <stop offset={1} stopColor={C.womb} />
              </radialGradient>
              <linearGradient id={k("rim")} x1="0" y1="0" x2="1" y2="1">
                <stop offset={0.45} stopColor={C.gold} stopOpacity={0} />
                <stop offset={1} stopColor={C.gold} stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id={k("cyl")} x1="0" y1="0" x2="1" y2="0">
                <stop offset={0} stopColor={C.text} stopOpacity={0.05} />
                <stop offset={0.2} stopColor={C.text} stopOpacity={0.2} />
                <stop offset={0.5} stopColor={C.text} stopOpacity={0} />
                <stop offset={0.8} stopColor={C.wombDeep} stopOpacity={0.22} />
                <stop offset={1} stopColor={C.wombDeep} stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id={k("low")} gradientUnits="userSpaceOnUse" x1="0" y1={PAD.crease - 10} x2="0" y2={PAD.bottom}>
                <stop offset={0} stopColor={C.wombDeep} stopOpacity={0} />
                <stop offset={0.25} stopColor={C.wombDeep} stopOpacity={0.3} />
                <stop offset={1} stopColor={C.bg1} stopOpacity={0.6} />
              </linearGradient>
              <clipPath id={k("clip")}>
                <path d={OUT} />
              </clipPath>
              <filter id={k("soft")} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={22} />
              </filter>
              <filter id={k("fine")} x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation={4} />
              </filter>
            </defs>
            {/* halo the finger throws into the fluid */}
            <path d={OUT} fill={C.peach} filter={u("soft")} opacity={0.18 + 0.32 * glow} transform="scale(1.04)" />
            <path d={OUT} fill={u("skin")} />
            <g clipPath={u("clip")}>
              {/* translucent rose subsurface glow along the edges */}
              <path d={OUT} fill="none" stroke={C.rose} strokeWidth={70} filter={u("soft")} opacity={0.42} />
              {/* round finger: lit left, rolling into shade on the right */}
              <rect x={-PAD.hw - 4} y={APEX - 10} width={2 * PAD.hw + 8} height={PAD.bottom - APEX + 60} fill={u("cyl")} />
              <rect x={-PAD.hw - 4} y={PAD.crease - 10} width={2 * PAD.hw + 8} height={PAD.bottom - PAD.crease + 60} fill={u("low")} />
              {/* soft pad bulge in the key light */}
              <ellipse cx={-70} cy={-150} rx={160} ry={200} fill={C.text} opacity={0.14} filter={u("soft")} />
              {/* distal crease: a soft fold, shade above, light below */}
              <path d={`M${-cw},${PAD.crease + 4} Q0,${PAD.crease - 14} ${cw},${PAD.crease + 4}`} fill="none" stroke={C.womb} strokeWidth={9} opacity={0.5} filter={u("fine")} />
              <path d={`M${-cw},${PAD.crease + 16} Q0,${PAD.crease - 2} ${cw},${PAD.crease + 16}`} fill="none" stroke={C.text} strokeWidth={5} opacity={0.22} filter={u("fine")} />
              <path d={`M${-cw * 0.8},${PAD.crease + 34} Q0,${PAD.crease + 20} ${cw * 0.8},${PAD.crease + 34}`} fill="none" stroke={C.womb} strokeWidth={6} opacity={0.42} filter={u("fine")} />
              <path d={`M${-cw * 0.9},${PAD.crease + 46} Q0,${PAD.crease + 32} ${cw * 0.9},${PAD.crease + 46}`} fill="none" stroke={C.text} strokeWidth={4} opacity={0.14} filter={u("fine")} />
              {/* lock bloom from the core */}
              <circle cx={core.x} cy={core.y} r={260} fill={C.gold} opacity={0.22 * lock} filter={u("soft")} />
            </g>
          </svg>
          <RidgeCanvas spec={spec} look={look} frame={frame} glow={glow} />
          <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} style={svgAbs}>
            <defs>
              <linearGradient id={k("shade")} x1="0" y1="0" x2="1" y2="0">
                <stop offset={0} stopColor={C.wombDeep} stopOpacity={0.18} />
                <stop offset={0.14} stopColor={C.wombDeep} stopOpacity={0} />
                <stop offset={0.7} stopColor={C.wombDeep} stopOpacity={0} />
                <stop offset={1} stopColor={C.wombDeep} stopOpacity={0.5} />
              </linearGradient>
              <radialGradient id={k("dot")}>
                <stop offset={0} stopColor={C.text} />
                <stop offset={0.3} stopColor={C.gold} stopOpacity={0.9} />
                <stop offset={1} stopColor={C.gold} stopOpacity={0} />
              </radialGradient>
            </defs>
            <g clipPath={u("clip")}>
              {/* the ridges roll away into shade at the sides */}
              <rect x={-PAD.hw - 4} y={APEX - 10} width={2 * PAD.hw + 8} height={PAD.crease - APEX + 20} fill={u("shade")} />
              {/* warm rim light, lower right */}
              <path d={OUT} fill="none" stroke={u("rim")} strokeWidth={26} filter={u("fine")} opacity={0.75} />
              {/* key-light edge, upper left */}
              <path d={OUT} fill="none" stroke={C.text} strokeWidth={8} opacity={0.18} filter={u("fine")} transform="translate(6 8)" />
            </g>
            {ring > 0 && (
              <g opacity={1 - ring}>
                <circle cx={core.x} cy={core.y} r={40 + 400 * ring} fill="none" stroke={C.gold} strokeWidth={30} opacity={0.45} filter={u("soft")} />
                <circle cx={core.x} cy={core.y} r={40 + 400 * ring} fill="none" stroke={C.text} strokeWidth={4} opacity={0.85} />
              </g>
            )}
            {SOURCES.map((q, i) =>
              dots[i] > 0.01 ? (
                <g key={i}>
                  <circle cx={q.x} cy={q.y} r={46 * dots[i]} fill={u("dot")} opacity={Math.min(1, dots[i])} />
                  <circle cx={q.x} cy={q.y} r={7 * Math.min(1, dots[i])} fill={C.text} opacity={Math.min(1, dots[i])} />
                </g>
              ) : null,
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

// a neighbouring finger far out of focus (depth cue for the macro shot)
export const GhostFinger: React.FC<{ place: TipState["place"] }> = ({ place: p }) =>
  p.opacity <= 0.002 ? null : (
    <div
      style={{
        position: "absolute", left: 0, top: 0, width: 0, height: 0, opacity: p.opacity,
        transform: `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px) rotate(${p.rot.toFixed(3)}deg) scale(${p.s.toFixed(5)})`,
        transformOrigin: "0 0", filter: `blur(${p.blur}px)`,
      }}
    >
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} style={{ ...svgAbs, WebkitMaskImage: fadeMask, maskImage: fadeMask }}>
        <defs>
          <linearGradient id="c10-ghost" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset={0} stopColor={C.skinShade} />
            <stop offset={0.6} stopColor={C.womb} />
            <stop offset={1} stopColor={C.wombDeep} />
          </linearGradient>
        </defs>
        <path d={OUT} fill="url(#c10-ghost)" opacity={0.75} />
      </svg>
    </div>
  );
