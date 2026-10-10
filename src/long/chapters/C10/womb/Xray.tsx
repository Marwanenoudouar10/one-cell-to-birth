// X-ray-style glow inside the translucent body (silent, 0.4-3.0 s): the long
// bones of the near arm and both legs warm from pale cartilage-blue to
// bone-white, from the middle of each shaft outward (the ends stay
// cartilage), and the skull plates grow as islands in a soft membrane.
// Bones were already hardening since ~wk 7-9: at frame 0 of the effect the
// shafts are partly white already, so nothing "starts" here.
// Drawn in the fetus kit's rig coords (same geo as <Fetus>), over the body.
import React from "react";
import { C } from "../../../../theme/colors";
import { buildFetus, outFrame } from "../../../../shared/fetus";
import { Pt, add, capsule, dist, lerp, lerpPt, mul, norm, perp, sub } from "../geom";
import { Skull } from "./Skull";

type Geo = ReturnType<typeof buildFetus>;

type Bone = { a: Pt; b: Pt; r: number; dim: number };

const twin = (a: Pt, b: Pt, r: number, off: number, dim: number, k = 0.62): Bone[] => {
  const n = mul(perp(norm(sub(b, a))), off);
  return [
    { a: add(a, n), b: add(b, n), r, dim },
    { a: sub(a, n), b: sub(b, n), r: r * k, dim: dim * 0.85 },
  ];
};

const bonesOf = (geo: Geo): Bone[] => {
  const { arm, leg, farLeg } = geo;
  return [
    ...twin(farLeg.hip, farLeg.knee, farLeg.r[0] * 0.36, 0, 0.4).slice(0, 1),
    ...twin(farLeg.knee, farLeg.ankle, farLeg.r[1] * 0.34, farLeg.r[1] * 0.28, 0.4),
    { a: leg.hip, b: leg.knee, r: leg.r[0] * 0.36, dim: 1 },
    ...twin(leg.knee, leg.ankle, leg.r[1] * 0.34, leg.r[1] * 0.3, 1),
    { a: arm.shoulder, b: arm.elbow, r: arm.r[0] * 0.36, dim: 1 },
    ...twin(arm.elbow, arm.wrist, arm.r[1] * 0.32, arm.r[1] * 0.3, 1, 0.8),
  ];
};

// One long bone: cartilage model, ossified collar from mid-shaft, warm front.
const LongBone: React.FC<{ b: Bone; oss: number; idx: number }> = ({ b, oss, idx }) => {
  const a0 = lerpPt(b.a, b.b, 0.09);
  const b0 = lerpPt(b.a, b.b, 0.91);
  const m = lerpPt(a0, b0, 0.5);
  const o = Math.min(1, Math.max(0, oss * 1.08 - idx * 0.012));
  const half = lerp(0.17, 0.34, o); // fraction of the model that is bone-white
  const c0 = lerpPt(m, a0, half * 2);
  const c1 = lerpPt(m, b0, half * 2);
  const front = Math.sin(Math.PI * Math.min(1, o * 1.05)) * 0.9 + 0.1;
  const r = b.r;
  return (
    <g opacity={b.dim}>
      {/* cartilage model: a shaft with soft knobs at both ends (they stay cartilage) */}
      <path d={capsule(a0, b0, r * 1.05, r)} fill={C.cellCyan} opacity={0.36} />
      {[a0, b0].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={r * 1.5} fill={C.cellCyan} opacity={0.42} />
          <circle cx={p.x} cy={p.y} r={r * 0.95} fill={C.cell} opacity={0.3} />
        </g>
      ))}
      {/* bone collar spreading from mid-shaft, warm at its growing edges */}
      <path d={capsule(c0, c1, r * 0.8, r * 0.8)} fill={C.text} opacity={0.95} />
      <path d={capsule(c0, c1, r * 0.32, r * 0.32)} fill={C.cell} opacity={0.7} />
      {[c0, c1].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={r * 1.15} fill={C.gold} opacity={0.45 * front} />
      ))}
    </g>
  );
};

// small bones of the hand (cartilage with tiny bright cores) and the spine
const SmallBones: React.FC<{ geo: Geo; oss: number }> = ({ geo, oss }) => {
  const h = geo.arm.hand;
  const segs: [Pt, Pt][] = [];
  h.knuckles.forEach((k, i) => {
    segs.push([lerpPt(h.wrist, k, 0.2), lerpPt(h.wrist, k, 0.92)]);
    if (h.tips[i]) segs.push([lerpPt(k, h.tips[i], 0.12), lerpPt(k, h.tips[i], 0.84)]);
  });
  segs.push([lerpPt(h.wrist, h.thumbTip, 0.25), lerpPt(h.wrist, h.thumbTip, 0.85)]);
  const r = h.s * 2.1;
  const vert = Array.from({ length: 17 }, (_, i) => geo.sp.pos(0.03 + (i / 16) * 0.93, -0.6));
  const vr = geo.g.L * 0.022;
  return (
    <g>
      {segs.map(([p, q], i) => (
        <g key={i}>
          <path d={capsule(p, q, r * 1.3, r)} fill={C.cellCyan} opacity={0.45} />
          <path d={capsule(lerpPt(p, q, 0.3), lerpPt(p, q, 0.7), r * 0.7, r * 0.7)} fill={C.text} opacity={0.55 + 0.4 * oss} />
        </g>
      ))}
      {vert.map((p, i) => (
        <g key={`v${i}`}>
          <circle cx={p.x} cy={p.y} r={vr * 1.25} fill={C.cellCyan} opacity={0.32} />
          <circle cx={p.x} cy={p.y} r={vr * lerp(0.45, 0.8, oss)} fill={C.text} opacity={0.75} />
        </g>
      ))}
    </g>
  );
};

export const Xray: React.FC<{ week: number; size: number; pose: Parameters<typeof buildFetus>[1]; amount: number; oss: number; scan: number }> = ({
  week, size, pose, amount, oss, scan,
}) => {
  if (amount < 0.002) return null;
  const geo = buildFetus(week, pose);
  const fr = outFrame(geo, size);
  const bones = bonesOf(geo);
  const L = geo.g.L;
  // scan band: a soft light line sweeping crown -> toes as the view switches on
  const top = geo.headPt(geo.lm.crown);
  const bot = geo.leg.foot.center;
  const span = dist(top, bot);
  const band = lerpPt(top, bot, -0.25 + 1.5 * scan);
  const ang = (Math.atan2(bot.y - top.y, bot.x - top.x) * 180) / Math.PI;
  return (
    <g transform={fr.css} opacity={amount}>
      <defs>
        <clipPath id="c10-body">
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <filter id="c10-bone-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={L * 0.022} />
        </filter>
        <filter id="c10-rim-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={L * 0.03} />
        </filter>
        <linearGradient id="c10-scan" x1={0} y1={0} x2={1} y2={0}>
          <stop offset={0} stopColor={C.cell} stopOpacity={0} />
          <stop offset={0.5} stopColor={C.cell} stopOpacity={0.55} />
          <stop offset={1} stopColor={C.cell} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath="url(#c10-body)">
        {/* the "film": body goes dusky and cool, a cyan inner rim */}
        <rect x={-2000} y={-2000} width={4000} height={4000} fill={C.wombDeep} opacity={0.42} />
        <g filter="url(#c10-rim-blur)" opacity={0.5}>
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={C.cellCyan} strokeWidth={L * 0.05} opacity={0.3} />
          ))}
        </g>
        <Skull geo={geo} oss={oss} />
        {/* soft glow pass, then the crisp bones */}
        <g filter="url(#c10-bone-glow)" opacity={0.85}>
          {bones.map((b, i) => (
            <LongBone key={i} b={b} oss={oss} idx={i} />
          ))}
        </g>
        {bones.map((b, i) => (
          <LongBone key={i} b={b} oss={oss} idx={i} />
        ))}
        <SmallBones geo={geo} oss={oss} />
        {scan > 0 && scan < 1 && (
          <rect
            x={band.x - span * 0.12} y={band.y - 1500} width={span * 0.24} height={3000}
            transform={`rotate(${ang} ${band.x} ${band.y})`}
            fill="url(#c10-scan)" opacity={Math.sin(Math.PI * scan)}
          />
        )}
      </g>
    </g>
  );
};
