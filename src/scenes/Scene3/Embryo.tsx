import React from "react";
import { C } from "../../theme/colors";
import { Blob, Geo } from "./embryoShape";
import { Heart, HeartDefs } from "./Heart";

type Props = { g: Geo; pulse: number; glow: number; ignite: number; hold: number };

const Ell: React.FC<{ b: Blob; fill: string; opacity?: number; grow?: number }> = ({ b, fill, opacity, grow = 0 }) => (
  <ellipse
    rx={b.rx + grow}
    ry={b.ry + grow}
    transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`}
    fill={fill}
    opacity={opacity}
  />
);

// The body silhouette = tube + head + heart/liver bulges (one shape).
const Union: React.FC<{ g: Geo; fill: string }> = ({ g, fill }) => (
  <>
    <path d={g.outline} fill={fill} />
    {g.blobs.map((b, i) => (
      <Ell key={i} b={b} fill={fill} />
    ))}
  </>
);

const Defs: React.FC<Props> = (p) => (
  <defs>
    <radialGradient id="s3-skin" gradientUnits="userSpaceOnUse" cx={-30} cy={-56} r={240}>
      <stop offset="0" stopColor={C.skin} />
      <stop offset="0.42" stopColor={C.peach} />
      <stop offset="0.8" stopColor={C.skinShade} />
      <stop offset="1" stopColor={C.rose} />
    </radialGradient>
    <radialGradient id="s3-soft-skin" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor={C.text} stopOpacity={0.85} />
      <stop offset="0.5" stopColor={C.skin} stopOpacity={0.5} />
      <stop offset="1" stopColor={C.skin} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="s3-somite" cx="0.45" cy="0.4" r="0.6">
      <stop offset="0" stopColor={C.skin} stopOpacity={0.95} />
      <stop offset="0.6" stopColor={C.skin} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.skinShade} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="s3-bud" cx="0.38" cy="0.35" r="0.7">
      <stop offset="0" stopColor={C.skin} />
      <stop offset="0.6" stopColor={C.peach} />
      <stop offset="1" stopColor={C.skinShade} />
    </radialGradient>
    <radialGradient id="s3-eye" cx="0.5" cy="0.5" r="0.5">
      {/* pigmented optic cup seen through the skin: a soft dark ring, not a pupil */}
      <stop offset="0" stopColor={C.wombDeep} stopOpacity={0.55} />
      <stop offset="0.5" stopColor={C.bg2} stopOpacity={0.85} />
      <stop offset="0.72" stopColor={C.wombDeep} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.wombDeep} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="s3-spill" gradientUnits="userSpaceOnUse" cx={p.g.heart.x} cy={p.g.heart.y} r={190}>
      <stop offset="0" stopColor={C.heart} stopOpacity={0.9} />
      <stop offset="0.35" stopColor={C.rose} stopOpacity={0.45} />
      <stop offset="1" stopColor={C.rose} stopOpacity={0} />
    </radialGradient>
    <HeartDefs p={p.g.heart} pulse={p.pulse} ignite={p.ignite} hold={p.hold} />
    <clipPath id="s3-body">
      <Union g={p.g} fill="#fff" />
    </clipPath>
    <filter id="s3-bud-shadow" x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation="2.6" />
    </filter>
    <filter id="s3-halo" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    {/* directional rim light (top-left), core shade + warm bounce edge (bottom-right) */}
    <filter id="s3-rimfx" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feOffset in="SourceAlpha" dx="5" dy="6" result="o1" />
      <feGaussianBlur in="o1" stdDeviation="3" result="b1" />
      <feComposite in="SourceAlpha" in2="b1" operator="out" result="rimL" />
      <feFlood floodColor={C.text} floodOpacity={0.72} result="c1" />
      <feComposite in="c1" in2="rimL" operator="in" result="rimLc" />
      <feOffset in="SourceAlpha" dx="-13" dy="-12" result="o2" />
      <feGaussianBlur in="o2" stdDeviation="10" result="b2" />
      <feComposite in="SourceAlpha" in2="b2" operator="out" result="sh" />
      <feFlood floodColor={C.womb} floodOpacity={0.55} result="c2" />
      <feComposite in="c2" in2="sh" operator="in" result="shc" />
      <feOffset in="SourceAlpha" dx="-3" dy="-3" result="o3" />
      <feGaussianBlur in="o3" stdDeviation="1.2" result="b3" />
      <feComposite in="SourceAlpha" in2="b3" operator="out" result="bo" />
      <feFlood floodColor={C.rose} floodOpacity={0.9} result="c3" />
      <feComposite in="c3" in2="bo" operator="in" result="boc" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="shc" />
        <feMergeNode in="boc" />
        <feMergeNode in="rimLc" />
      </feMerge>
    </filter>
  </defs>
);

// A limb bud: a soft paddle that grows out of the flank. Its base end fades
// into the body (mask) so it reads as a swelling, not a stuck-on pill.
const Bud: React.FC<{ b: Blob; id: string }> = ({ b, id }) => (
  <g transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`}>
    <defs>
      <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={-b.rx} y1={0} x2={-b.rx * 0.15} y2={0}>
        <stop offset="0" stopColor="#fff" stopOpacity={0} />
        <stop offset="1" stopColor="#fff" stopOpacity={1} />
      </linearGradient>
      <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={-b.rx * 2} y={-b.ry * 3} width={b.rx * 4} height={b.ry * 6}>
        <rect x={-b.rx * 2} y={-b.ry * 3} width={b.rx * 4} height={b.ry * 6} fill={`url(#${id}-fade)`} />
      </mask>
    </defs>
    <g mask={`url(#${id}-mask)`}>
      <ellipse cx={1.5} cy={b.ry * 0.35} rx={b.rx} ry={b.ry} fill={C.womb} opacity={0.4} filter="url(#s3-bud-shadow)" />
      <ellipse rx={b.rx} ry={b.ry} fill="url(#s3-bud)" />
      <ellipse cx={b.rx * 0.1} cy={-b.ry * 0.3} rx={b.rx * 0.6} ry={b.ry * 0.38} fill="url(#s3-soft-skin)" opacity={0.75} />
    </g>
  </g>
);

// Local-space embryo; the parent places it in the world.
export const Embryo: React.FC<Props> = (p) => {
  const { g, glow, ignite } = p;
  return (
    <g>
      <Defs {...p} />
      {/* translucent glow the body throws into the fluid */}
      <g filter="url(#s3-halo)" opacity={0.42 + 0.4 * glow}>
        <Union g={g} fill={C.peach} />
      </g>
      <g filter="url(#s3-rimfx)">
        <Union g={g} fill="url(#s3-skin)" />
        <g clipPath="url(#s3-body)">
          {g.vesicles.map((b, i) => (
            <Ell key={i} b={b} fill="url(#s3-soft-skin)" opacity={0.55} />
          ))}
          <path d={g.spine} fill="none" stroke={C.skin} strokeOpacity={0.35} strokeWidth={5} strokeLinecap="round" />
          {g.somites.map((b, i) => (
            <Ell key={i} b={b} fill="url(#s3-somite)" />
          ))}
          <Ell b={{ ...g.blobs[3], rx: g.blobs[3].rx * 0.8, ry: g.blobs[3].ry * 0.75 }} fill={C.womb} opacity={0.22} />
          {/* each beat lights the body from the heart outward; the heart is drawn
              on top so it stays a saturated red rather than washing to pink */}
          <circle
            cx={g.heart.x}
            cy={g.heart.y}
            r={190}
            fill="url(#s3-spill)"
            opacity={Math.min(0.85, 0.1 * ignite + 0.55 * glow)}
            style={{ mixBlendMode: "screen" }}
          />
          <Heart p={g.heart} pulse={p.pulse} ignite={ignite} hold={p.hold} />
        </g>
        <ellipse
          cx={g.cardiac.x - 14}
          cy={g.cardiac.y - 16}
          rx={17}
          ry={9}
          transform={`rotate(-35 ${g.cardiac.x - 14} ${g.cardiac.y - 16})`}
          fill="url(#s3-soft-skin)"
          opacity={0.55}
        />
        <Bud b={g.arm} id="s3-arm" />
        <Bud b={g.leg} id="s3-leg" />
      </g>
      <ellipse cx={g.eye.x} cy={g.eye.y} rx={12} ry={13} fill="url(#s3-eye)" />
    </g>
  );
};
