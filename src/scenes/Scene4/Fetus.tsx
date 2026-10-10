import React from "react";
import { C } from "../../theme/colors";
import { Body, Foot, Hand } from "./rig";
import { Face } from "./Face";
import { P, add, mul, smooth, sub } from "./geom";
import { BACK } from "./shapes";

// Draws the rigged fetus in fetus-local space. Layer order, back to front:
// far leg -> torso -> near leg -> cord -> head -> near arm, then rim light.
// Lighting: key light from the upper left (skin gradients), warm rim light on
// the lower-right silhouette edge, rose inner glow for translucent skin.

const HandShape: React.FC<{ h: Hand; fill: string; edge: string }> = ({ h, fill, edge }) => (
  <g fill={fill}>
    <path d={h.thumb} stroke={edge} strokeWidth={1.4} />
    {h.fingers.map((d, i) => (
      <path key={i} d={d} stroke={edge} strokeWidth={1.4} />
    ))}
    <path d={h.palm} />
  </g>
);

const FootShape: React.FC<{ f: Foot; fill: string; edge: string; pads?: boolean }> = ({ f, fill, edge, pads }) => (
  <g fill={fill}>
    <path d={f.sole} />
    {pads &&
      f.pads.map((p, i) => (
        <ellipse key={i} cx={p.c.x} cy={p.c.y} rx={p.rx} ry={p.ry} transform={`rotate(${p.rot} ${p.c.x} ${p.c.y})`}
          fill={C.skin} opacity={0.55} filter="url(#s4-soft)" />
      ))}
    {f.toes.map((d, i) => (
      <path key={i} d={d} stroke={edge} strokeWidth={1.3} />
    ))}
  </g>
);

// Contact shadow cast by `d` onto the receiver clip, soft and offset.
const Shadow: React.FC<{ clip: string; d: string[]; dx?: number; dy?: number; o?: number; mask?: string }> = ({
  clip, d, dx = 5, dy = 8, o = 0.5, mask,
}) => (
  <g clipPath={`url(#${clip})`}>
    <g mask={mask}>
      <g filter="url(#s4-sh)" opacity={o} transform={`translate(${dx} ${dy})`}>
        {d.map((p, i) => (
          <path key={i} d={p} fill={C.wombDeep} />
        ))}
      </g>
    </g>
  </g>
);

// The spine seen through thin skin: a soft groove just inside the back line.
const spinePath = (b: Body) => {
  const pts = b.torsoPts;
  const c = mul(pts.reduce((a, q) => add(a, q), P(0, 0)), 1 / pts.length);
  // upper back -> lower back only (the neck/rump ends curl and read as a scar)
  const back = pts.slice(BACK[0] + 1, BACK[1]).map((q) => add(q, mul(sub(c, q), 0.17)));
  return smooth(back, false);
};

// Mask that fades a contact shadow out around a joint, so no ring shows.
const JointMask: React.FC<{ id: string; c: { x: number; y: number }; r: number; g?: string }> = ({ id, c, r, g = "s4-jointSoft" }) => (
  <mask id={id} maskUnits="userSpaceOnUse" x={-800} y={-800} width={1600} height={1600}>
    <rect x={-800} y={-800} width={1600} height={1600} fill="white" />
    <circle cx={c.x} cy={c.y} r={r} fill={`url(#${g})`} />
  </mask>
);

export const Fetus: React.FC<{
  b: Body;
  cord?: React.ReactNode;
  translucency: number; // 0..1 rose inner glow strength
  rim: number; // 0..1 rim light strength
  bloom?: number; // 0..1 extra glow (growth spurt)
}> = ({ b, cord, translucency, rim, bloom = 0 }) => {
  const handParts = [b.hand.palm, b.hand.thumb, ...b.hand.fingers];
  const legParts = [b.leg, b.foot.sole, ...b.foot.toes];
  const farParts = [b.farLeg, b.farFoot.sole, ...b.farFoot.toes];
  const edge = `${C.skinShade}cc`;
  // one body-wide light falloff for torso + limbs, so joints never show seams
  const xs = b.torsoPts.map((q) => q.x);
  const ys = b.torsoPts.map((q) => q.y);
  const bw = Math.max(...xs) - Math.min(...xs);
  const bh = Math.max(...ys) - Math.min(...ys);
  const gx = Math.min(...xs) + bw * 0.3;
  const gy = Math.min(...ys) + bh * 0.22;
  const gr = Math.max(bw, bh) * 1.05;
  return (
    <g>
      <defs>
        <radialGradient id="s4-skin" cx="0.38" cy="0.3" r="0.85" fx="0.3" fy="0.22">
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.5" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id="s4-body" gradientUnits="userSpaceOnUse" cx={gx} cy={gy} r={gr} fx={gx - bw * 0.08} fy={gy - bh * 0.08}>
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.5" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id="s4-skinHead" cx="0.4" cy="0.34" r="0.78" fx="0.32" fy="0.24">
          <stop offset="0" stopColor={C.skin} />
          <stop offset="0.62" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id="s4-skinFar" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor={C.peach} />
          <stop offset="1" stopColor={C.skinShade} />
        </radialGradient>
        <radialGradient id="s4-jointSoft">
          <stop offset="0" stopColor="black" />
          <stop offset="1" stopColor="white" />
        </radialGradient>
        <linearGradient id="s4-rimG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.skin} />
          <stop offset="1" stopColor={C.gold} />
        </linearGradient>
        <clipPath id="s4-cTorso">
          <path d={b.torso} />
        </clipPath>
        <clipPath id="s4-cBody">
          <path d={b.torso} />
          <path d={b.head} />
          <path d={b.leg} />
        </clipPath>
        <clipPath id="s4-cFar">
          {farParts.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <clipPath id="s4-cTH">
          <path d={b.torso} />
          <path d={b.head} />
        </clipPath>
        <JointMask id="s4-hipS" c={b.hip} r={b.hipR * 2.6} g="s4-jointSoft" />
        <JointMask id="s4-shS" c={b.shoulder} r={b.shoulderR * 2.6} g="s4-jointSoft" />
        <mask id="s4-rimM" maskUnits="userSpaceOnUse" x={-700} y={-700} width={1400} height={1400}>
          <g fill="white">
            {b.silhouette.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g fill="black" transform="translate(-9 -10)" filter="url(#s4-rimSoft)">
            {b.silhouette.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </mask>
      </defs>

      {/* soft warm glow the body throws into the fluid */}
      <g filter="url(#s4-halo)" opacity={0.24 + 0.3 * bloom}>
        {b.silhouette.map((d, i) => (
          <path key={i} d={d} fill={C.peach} />
        ))}
      </g>

      {/* far leg, in shade behind the body. Shaded with a darker SKIN tone
          (not the sac colour, which read as a see-through ghost limb), with a
          solid outer edge drawn underneath so it reads as an opaque leg. */}
      <g>
        <g fill={C.skinShade} stroke={C.skinShade} strokeWidth={3}>
          {farParts.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <path d={b.farLeg} fill="url(#s4-skinFar)" />
        <FootShape f={b.farFoot} fill="url(#s4-skinFar)" edge={`${C.skinShade}cc`} />
        <g opacity={0.6} fill={C.skinShade}>
          {farParts.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g fill="none" stroke={`${C.womb}55`} strokeWidth={1.3}>
          {b.farFoot.toes.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {/* the near leg's soft contact shadow, where it passes over the far leg */}
        <Shadow clip="s4-cFar" d={legParts} dx={1} dy={5} o={0.6} />
      </g>

      {/* torso: translucent inner glow, the spine showing through */}
      <path d={b.torso} fill="url(#s4-body)" />
      <g clipPath="url(#s4-cTorso)">
        <path d={b.torso} fill="none" stroke={C.rose} strokeWidth={26} filter="url(#s4-glow)" opacity={0.5 * translucency} />
        <path d={spinePath(b)} fill="none" stroke={C.skinShade} strokeWidth={14} strokeLinecap="round"
          filter="url(#s4-sh)" opacity={0.35 * translucency} />
        <path d={spinePath(b)} fill="none" stroke={C.skinShade} strokeWidth={7} strokeLinecap="round"
          strokeDasharray="1 11" filter="url(#s4-soft)" opacity={0.45 * translucency} />
      </g>
      <Shadow clip="s4-cTorso" d={legParts} o={0.55} mask="url(#s4-hipS)" />
      <Shadow clip="s4-cTorso" d={[b.head]} dx={4} dy={10} o={0.6} />

      {/* near leg (same light falloff as the torso, so the hip blends) */}
      <path d={b.leg} fill="url(#s4-body)" />
      <FootShape f={b.foot} fill="url(#s4-skin)" edge={edge} pads />

      {cord}

      {/* head + face */}
      <path d={b.head} fill="url(#s4-skinHead)" />
      <g clipPath="url(#s4-cTH)">
        <path d={b.head} fill="none" stroke={C.rose} strokeWidth={30} filter="url(#s4-glow)" opacity={0.45 * translucency} />
      </g>
      <Face b={b} />

      {/* near arm + hand, with contact shadow on head/body */}
      <Shadow clip="s4-cBody" d={[b.arm, ...handParts]} dx={6} dy={7} o={0.5} mask="url(#s4-shS)" />
      <path d={b.arm} fill="url(#s4-body)" />
      <HandShape h={b.hand} fill="url(#s4-skin)" edge={edge} />

      {/* warm rim light on the lower-right edge of the silhouette */}
      <g mask="url(#s4-rimM)" opacity={rim}>
        {b.silhouette.map((d, i) => (
          <path key={i} d={d} fill="url(#s4-rimG)" />
        ))}
      </g>
    </g>
  );
};
