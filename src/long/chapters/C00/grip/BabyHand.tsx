import React from "react";
import { C } from "../../../../theme/colors";
import { smoothOpen } from "./geometry";
import { CUFF, FINGERS, fingerPose, PALM, PALM_LINES, SLEEVE, SLEEVE_AXIS, THENAR, THUMB, thumbPose, WRIST, WRIST_CREASE } from "./gripGeom";

const BIG = { x: -1600, y: -1000, width: 4000, height: 2800 };
const ARM = [WRIST, THENAR, PALM];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Shared filters + gradients for everything in grip space.
export const GripDefs: React.FC = () => (
  <defs>
    {[6, 10, 18].map((s) => (
      <filter key={s} id={`c00-s5-blur${s}`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation={s} />
      </filter>
    ))}
    <linearGradient id="c00-s5-bskin" gradientUnits="userSpaceOnUse" x1={0} y1={-160} x2={-60} y2={320}>
      <stop offset="0" stopColor={C.skin} />
      <stop offset="0.5" stopColor={C.skin} />
      <stop offset="1" stopColor={C.peach} />
    </linearGradient>
    <linearGradient id="c00-s5-fskin" gradientUnits="userSpaceOnUse" x1={0} y1={-170} x2={0} y2={20}>
      <stop offset="0" stopColor={C.skin} />
      <stop offset="0.6" stopColor={C.skin} />
      <stop offset="1" stopColor={C.peach} />
    </linearGradient>
    <linearGradient id="c00-s5-sleeve" gradientUnits="userSpaceOnUse" x1={-260} y1={200} x2={-330} y2={560}>
      <stop offset="0" stopColor={C.womb} />
      <stop offset="0.4" stopColor={C.wombDeep} />
      <stop offset="1" stopColor={C.bg1} />
    </linearGradient>
    <linearGradient id="c00-s5-sleeveDepth" gradientUnits="userSpaceOnUse" x1={-300} y1={360} x2={-760} y2={520}>
      <stop offset="0" stopColor={C.bg0} stopOpacity={0} />
      <stop offset="1" stopColor={C.bg0} stopOpacity={0.75} />
    </linearGradient>
    <linearGradient id="c00-s5-cuff" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={C.rose} />
      <stop offset="0.5" stopColor={C.womb} />
      <stop offset="1" stopColor={C.wombDeep} />
    </linearGradient>
    <radialGradient id="c00-s5-tipBlush">
      <stop offset="0" stopColor={C.rose} stopOpacity={0.42} />
      <stop offset="1" stopColor={C.rose} stopOpacity={0} />
    </radialGradient>
    <mask id="c00-s5-armMask" maskUnits="userSpaceOnUse" {...BIG}>
      <rect {...BIG} fill="white" />
      <g filter="url(#c00-s5-blur18)">
        {ARM.map((d, i) => (
          <path key={i} d={d} fill="black" />
        ))}
      </g>
    </mask>
    <clipPath id="c00-s5-armClip">
      {ARM.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </clipPath>
    <clipPath id="c00-s5-sleeveClip">
      <path d={SLEEVE} />
    </clipPath>
  </defs>
);

const Sleeve: React.FC = () => {
  const ang = (Math.atan2(SLEEVE_AXIS.by - SLEEVE_AXIS.ay, SLEEVE_AXIS.bx - SLEEVE_AXIS.ax) * 180) / Math.PI;
  return (
    <g>
      <path d={SLEEVE} fill={C.bg0} opacity={0.5} transform="translate(10 30)" filter="url(#c00-s5-blur18)" />
      <g clipPath="url(#c00-s5-sleeveClip)">
        <rect {...BIG} fill={C.rose} opacity={0.55} />
        <path d={SLEEVE} fill="url(#c00-s5-sleeve)" transform="translate(5 8)" />
        <g transform={`translate(${SLEEVE_AXIS.ax} ${SLEEVE_AXIS.ay}) rotate(${ang})`} opacity={0.5}>
          {[-90, -20, 60].map((y, i) => (
            <path key={i} d={`M80,${y} C300,${y + 24} 520,${y - 18} 900,${y + 10}`} fill="none" stroke={C.bg0} strokeWidth={14} filter="url(#c00-s5-blur6)" />
          ))}
        </g>
        <rect {...BIG} fill="url(#c00-s5-sleeveDepth)" />
      </g>
      <g transform={`translate(${CUFF.x} ${CUFF.y}) rotate(${CUFF.rot})`}>
        <ellipse cx={4} cy={6} rx={CUFF.rx} ry={CUFF.ry} fill={C.bg0} opacity={0.5} filter="url(#c00-s5-blur10)" />
        <ellipse cx={0} cy={0} rx={CUFF.rx} ry={CUFF.ry} fill="url(#c00-s5-cuff)" />
        {Array.from({ length: 9 }, (_, i) => {
          const y = -128 + i * 32;
          const w = CUFF.rx * Math.sqrt(Math.max(0, 1 - (y / CUFF.ry) ** 2)) * 0.82;
          return <path key={i} d={`M${-w},${y} L${w},${y}`} stroke={C.wombDeep} strokeOpacity={0.55} strokeWidth={9} strokeLinecap="round" />;
        })}
        <ellipse cx={-CUFF.rx * 0.45} cy={-CUFF.ry * 0.35} rx={CUFF.rx * 0.35} ry={CUFF.ry * 0.5} fill={C.peach} opacity={0.18} filter="url(#c00-s5-blur10)" />
      </g>
    </g>
  );
};

// Palm, wrist and sleeve: behind the adult finger.
export const BabyHandBack: React.FC<{ c: number }> = ({ c }) => (
  <g>
    <g opacity={0.45} filter="url(#c00-s5-blur18)" transform="translate(12 28)">
      {ARM.map((d, i) => (
        <path key={i} d={d} fill={C.wombDeep} />
      ))}
    </g>
    <g clipPath="url(#c00-s5-armClip)">
      <rect {...BIG} fill={C.gold} />
      <rect {...BIG} fill={C.text} opacity={0.55} />
      <g transform="translate(5 9)">
        {ARM.map((d, i) => (
          <path key={i} d={d} fill="url(#c00-s5-bskin)" />
        ))}
      </g>
      <rect {...BIG} fill={C.rose} opacity={0.45} mask="url(#c00-s5-armMask)" />
      {PALM_LINES.map((pts, i) => (
        <path key={i} d={smoothOpen(pts)} fill="none" stroke={C.skinShade} strokeWidth={4} strokeLinecap="round" opacity={0.5 * (1 - clamp01(c))} />
      ))}
      <path d={smoothOpen(WRIST_CREASE)} fill="none" stroke={C.skinShade} strokeWidth={7} strokeLinecap="round" opacity={0.75} />
    </g>
    <Sleeve />
  </g>
);

// Newborn nail: soft, translucent, follows the fingertip.
const Nail: React.FC<{ x: number; y: number; dir: number; r: number; o: number }> = ({ x, y, dir, r, o }) => (
  <g transform={`translate(${x} ${y}) rotate(${(dir * 180) / Math.PI})`} opacity={o}>
    <rect x={-r * 0.92} y={-r * 0.5} width={r * 0.8} height={r} rx={r * 0.45} fill={C.text} opacity={0.42} />
    <path d={`M${-r * 0.8},${-r * 0.34} Q${-r * 0.45},${-r * 0.5} ${-r * 0.2},${-r * 0.3}`} fill="none" stroke={C.text} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
  </g>
);

// Soft specular streak along the lit (upper-left) side of a finger.
const Shine: React.FC<{ a: [number, number]; b: [number, number]; dir: number; r: number }> = ({ a, b, dir, r }) => {
  const px = -Math.sin(dir) * r * 0.42;
  const py = Math.cos(dir) * r * 0.42 - r * 0.15;
  return (
    <path
      d={`M${a[0] + px},${a[1] + py} L${a[0] * 0.25 + b[0] * 0.75 + px},${a[1] * 0.25 + b[1] * 0.75 + py}`}
      stroke={C.text}
      strokeWidth={r * 0.32}
      strokeLinecap="round"
      opacity={0.28}
      filter="url(#c00-s5-blur6)"
    />
  );
};

// Tiny fingers + thumb: in front of the adult finger. c = curl per finger.
export const BabyHandFront: React.FC<{ c: number[]; thumb: number }> = ({ c, thumb }) => {
  const poses = FINGERS.map((f, i) => fingerPose(f, c[i]));
  const th = thumbPose(thumb);
  const order = [3, 2, 1, 0];
  return (
    <g>
      {order.map((i) => {
        const p = poses[i];
        const on = clamp01((c[i] - 0.5) / 0.4);
        return <ellipse key={i} cx={p.tip[0] + 6} cy={p.tip[1] + 20} rx={p.r * 1.15} ry={p.r * 0.75} fill={C.wombDeep} opacity={0.45 * on} filter="url(#c00-s5-blur10)" />;
      })}
      {order.map((i) => {
        const p = poses[i];
        const on = clamp01((c[i] - 0.55) / 0.3);
        const deg = (p.dir * 180) / Math.PI;
        const len = Math.hypot(p.tip[0] - p.base[0], p.tip[1] - p.base[1]);
        const j = 0.42;
        const mid: [number, number] = [p.base[0] + (p.tip[0] - p.base[0]) * j, p.base[1] + (p.tip[1] - p.base[1]) * j];
        return (
          <g key={i}>
            <path d={p.d} fill={C.skinShade} opacity={0.6} transform="translate(6 5)" filter="url(#c00-s5-blur6)" />
            <path d={p.d} fill="url(#c00-s5-fskin)" />
            <circle cx={p.base[0] - 5} cy={p.base[1] - 8} r={p.r * 0.8} fill={C.text} opacity={0.24} filter="url(#c00-s5-blur6)" />
            <circle cx={p.tip[0]} cy={p.tip[1]} r={p.rt * 1.3} fill="url(#c00-s5-tipBlush)" />
            {len > p.r * 1.2 && <Shine a={p.base} b={p.tip} dir={p.dir} r={p.r} />}
            {len > p.r * 1.5 && (
              <g transform={`translate(${mid[0]} ${mid[1]}) rotate(${deg})`} opacity={0.32 * on}>
                <path d={`M-2,${-p.r * 0.38} Q-6,0 -2,${p.r * 0.38}`} fill="none" stroke={C.skinShade} strokeWidth={3} strokeLinecap="round" />
              </g>
            )}
            <Nail x={p.tip[0]} y={p.tip[1]} dir={p.dir} r={p.rt} o={on} />
          </g>
        );
      })}
      <path d={th.d} fill={C.wombDeep} opacity={0.35} transform="translate(8 14)" filter="url(#c00-s5-blur10)" />
      <path d={th.d} fill="url(#c00-s5-bskin)" />
      <circle cx={th.tip[0]} cy={th.tip[1]} r={32} fill="url(#c00-s5-tipBlush)" />
      <Shine a={THUMB.base} b={th.tip} dir={th.dir} r={34} />
      <g transform={`translate(${(THUMB.base[0] + th.tip[0]) / 2} ${(THUMB.base[1] + th.tip[1]) / 2}) rotate(${(th.dir * 180) / Math.PI})`} opacity={0.35}>
        <path d="M-2,-24 Q-8,0 -2,24" fill="none" stroke={C.skinShade} strokeWidth={3.5} strokeLinecap="round" />
      </g>
      <Nail x={th.tip[0]} y={th.tip[1]} dir={th.dir} r={25} o={clamp01((thumb - 0.5) / 0.4)} />
    </g>
  );
};
