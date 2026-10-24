// X-ray-style glow inside the translucent body (silent, ~0.5-2.4 s): the long bones of
// the near arm and both legs warm from pale cartilage-blue to bone-white, from the middle
// of each shaft outward (the ends stay cartilage), the trunk skeleton (column, ribs,
// collarbone) and the skull plates growing as islands in a soft membrane.
// Bones were already hardening since ~wk 7-9: at the first frame the shafts are partly
// white already, so nothing "starts" here.
// Drawn in the fetus kit's rig coords (same geo as <Fetus>), over the body.
import React from "react";
import { C } from "../../../../theme/colors";
import { buildFetus, outFrame } from "../../../../shared/fetus";
import { Pt, add, capsule, dist, lerp, lerpPt, mul, norm, perp, sub } from "../geom";
import { Axial } from "./Axial";
import { Skull } from "./Skull";

type Geo = ReturnType<typeof buildFetus>;
type Bone = { a: Pt; b: Pt; r: number; dim: number };

// two parallel forearm / shin bones (radius + ulna, tibia + fibula)
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
    { a: farLeg.hip, b: farLeg.knee, r: farLeg.r[0] * 0.3, dim: 0.4 },
    ...twin(farLeg.knee, farLeg.ankle, farLeg.r[1] * 0.3, farLeg.r[1] * 0.28, 0.4),
    { a: leg.hip, b: leg.knee, r: leg.r[0] * 0.3, dim: 1 },
    ...twin(leg.knee, leg.ankle, leg.r[1] * 0.3, leg.r[1] * 0.3, 1),
    { a: arm.shoulder, b: arm.elbow, r: arm.r[0] * 0.32, dim: 1 },
    ...twin(arm.elbow, arm.wrist, arm.r[1] * 0.3, arm.r[1] * 0.3, 1, 0.8),
  ];
};

// where the white bone collar reaches on one shaft (from mid-shaft outward)
const collar = (b: Bone, oss: number, idx: number) => {
  const a0 = lerpPt(b.a, b.b, 0.1);
  const b0 = lerpPt(b.a, b.b, 0.9);
  const m = lerpPt(a0, b0, 0.5);
  const o = Math.min(1, Math.max(0, oss * 1.08 - idx * 0.012));
  const half = lerp(0.2, 0.39, o); // fraction of the model that is bone-white
  return { a0, b0, c0: lerpPt(m, a0, half * 2), c1: lerpPt(m, b0, half * 2), front: Math.sin(Math.PI * Math.min(1, o * 1.05)) * 0.85 + 0.15 };
};

// One long bone: the cartilage model (shaft + soft knobs), then the white collar with
// warm growing edges.
const LongBone: React.FC<{ b: Bone; oss: number; idx: number }> = ({ b, oss, idx }) => {
  const { a0, b0, c0, c1, front } = collar(b, oss, idx);
  const r = b.r;
  return (
    <g opacity={b.dim}>
      <path d={capsule(a0, b0, r * 1.05, r)} fill={C.cellCyan} opacity={0.3} />
      {[a0, b0].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={r * 1.35} fill={C.cellCyan} opacity={0.26} />
      ))}
      <path d={capsule(c0, c1, r * 0.82, r * 0.82)} fill={C.text} opacity={0.95} />
      {[c0, c1].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={r * 0.95} fill={C.gold} opacity={0.4 * front} />
      ))}
    </g>
  );
};

// the small bones of the hand: cartilage with bright cores
const HandBones: React.FC<{ geo: Geo; oss: number }> = ({ geo, oss }) => {
  const h = geo.arm.hand;
  const segs: [Pt, Pt][] = [];
  h.knuckles.forEach((k, i) => {
    segs.push([lerpPt(h.wrist, k, 0.2), lerpPt(h.wrist, k, 0.92)]);
    if (h.tips[i]) segs.push([lerpPt(k, h.tips[i], 0.12), lerpPt(k, h.tips[i], 0.84)]);
  });
  segs.push([lerpPt(h.wrist, h.thumbTip, 0.25), lerpPt(h.wrist, h.thumbTip, 0.85)]);
  const r = h.s * 2.1;
  return (
    <g>
      {segs.map(([p, q], i) => (
        <g key={i}>
          <path d={capsule(p, q, r * 1.3, r)} fill={C.cellCyan} opacity={0.4} />
          <path d={capsule(lerpPt(p, q, 0.3), lerpPt(p, q, 0.7), r * 0.7, r * 0.7)} fill={C.text} opacity={0.55 + 0.4 * oss} />
        </g>
      ))}
    </g>
  );
};

type XrayProps = { week: number; size: number; pose: Parameters<typeof buildFetus>[1]; amount: number; oss: number; scan: number };

export const Xray: React.FC<XrayProps> = ({ week, size, pose, amount, oss, scan }) => {
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
        <clipPath id="c10-xray-body">
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <filter id="c10-xray-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={L * 0.016} />
        </filter>
        <filter id="c10-xray-rim" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={L * 0.03} />
        </filter>
        <linearGradient id="c10-xray-scan" x1={0} y1={0} x2={1} y2={0}>
          <stop offset={0} stopColor={C.cell} stopOpacity={0} />
          <stop offset={0.5} stopColor={C.cell} stopOpacity={0.5} />
          <stop offset={1} stopColor={C.cell} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath="url(#c10-xray-body)">
        {/* the "film": the body goes dusky and cool, a cyan inner rim */}
        <rect x={-2000} y={-2000} width={4000} height={4000} fill={C.wombDeep} opacity={0.42} />
        <g filter="url(#c10-xray-rim)" opacity={0.5}>
          {geo.silhouette.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={C.cellCyan} strokeWidth={L * 0.05} opacity={0.3} />
          ))}
        </g>
        <Skull geo={geo} oss={oss} />
        <Axial geo={geo} oss={oss} />
        {/* a soft bloom under the white collars, then the crisp bones */}
        <g filter="url(#c10-xray-glow)" opacity={0.7}>
          {bones.map((b, i) => {
            const c = collar(b, oss, i);
            return <path key={i} d={capsule(c.c0, c.c1, b.r * 1.1, b.r * 1.1)} fill={C.cell} opacity={b.dim} />;
          })}
        </g>
        {bones.map((b, i) => (
          <LongBone key={i} b={b} oss={oss} idx={i} />
        ))}
        <HandBones geo={geo} oss={oss} />
        {scan > 0 && scan < 1 && (
          <rect
            x={band.x - span * 0.12} y={band.y - 1500} width={span * 0.24} height={3000}
            transform={`rotate(${ang} ${band.x} ${band.y})`}
            fill="url(#c10-xray-scan)" opacity={Math.sin(Math.PI * scan)}
          />
        )}
      </g>
    </g>
  );
};
