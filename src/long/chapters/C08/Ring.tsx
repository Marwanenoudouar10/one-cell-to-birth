// The soft gold "look here" ring (world space): draws itself round the hand on
// "fingers", glides along a gentle arc to the tail tip on "tail", lands with a
// small pop, then widens and fades before the dissolve. Also exports where it
// is, so the screen-space spotlight can follow it.
import React from "react";
import { random } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { Pt, add, lerp, lerpPt, mul, norm, perp, sub } from "../../../shared/embryo/math";
import { BEATS } from "./beats";
import { Pose, handToWorld } from "./kit";
import { tailGeo } from "./tail";

export type RingState = { c: Pt; r: number; o: number; draw: number };

const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => lerpPt(lerpPt(a, c, t), lerpPt(c, b, t), t);

export const ringAt = (f: number, pose: Pose, tailPose: Pose): RingState => {
  const hc = handToWorld(pose, { x: 0.45, y: 0 });
  const hr = pose.hand.R * 1.8;
  const tg = tailGeo(tailPose, 1, 0);
  const tc = tailPose.toWorld(tg.mid); // round the free part of the tail, tip included
  const tr = 27;
  const move = tween(f, BEATS.ringMove, BEATS.ringAtTail, [0, 1], EASE.inOut);
  // arc bulges away from the body (to the right) on its way down
  const side = perp(norm(sub(tc, hc)));
  const ctrl = add(lerpPt(hc, tc, 0.5), mul(side, side.x < 0 ? 54 : -54));
  const c = move <= 0 ? hc : move >= 1 ? tc : bez(hc, ctrl, tc, move);
  const land = tween(f, BEATS.ringAtTail - 1, BEATS.ringAtTail + 15, [0, 1], EASE.out);
  const pop = Math.sin(Math.PI * land) * 0.14 * move; // a small landing bounce, no step
  const off = tween(f, BEATS.ringOff, BEATS.ringOff + 14, [0, 1], EASE.inOut);
  const breathe = 1 + 0.025 * Math.sin((f / 30) * Math.PI * 2 * 0.8);
  const r = lerp(hr, tr, move) * (1 + pop) * breathe * (1 + 0.3 * off);
  const on = tween(f, BEATS.ringOn, BEATS.ringOn + 14, [0, 1], EASE.out);
  return { c, r, o: on * (1 - off), draw: on };
};

export const GoldRing: React.FC<{ s: RingState; f: number }> = ({ s, f }) => {
  if (s.o <= 0.002) return null;
  const sw = 1.6;
  return (
    <g opacity={s.o}>
      <defs>
        <radialGradient id="c08-ring-lens" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor={C.gold} stopOpacity={0} />
          <stop offset="0.93" stopColor={C.gold} stopOpacity={0.12} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
        <filter id="c08-ring-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <circle cx={s.c.x} cy={s.c.y} r={s.r * 1.04} fill="url(#c08-ring-lens)" />
      <g transform={`rotate(-90 ${s.c.x} ${s.c.y})`}>
        <circle cx={s.c.x} cy={s.c.y} r={s.r} fill="none" stroke={C.gold} strokeWidth={sw * 4} strokeOpacity={0.35} pathLength={1} strokeDasharray={`${s.draw} 1`} filter="url(#c08-ring-blur)" />
        <circle cx={s.c.x} cy={s.c.y} r={s.r} fill="none" stroke={C.gold} strokeWidth={sw} pathLength={1} strokeDasharray={`${s.draw} 1`} strokeLinecap="round" />
        <circle cx={s.c.x} cy={s.c.y} r={s.r} fill="none" stroke={C.text} strokeWidth={sw * 0.4} strokeOpacity={0.7} pathLength={1} strokeDasharray={`${s.draw} 1`} strokeLinecap="round" />
      </g>
      {/* a few sparkles riding the ring */}
      {[0, 1, 2].map((i) => {
        const a = (-90 + 360 * s.draw * (i === 0 ? 1 : 0) + i * 120 + f * (0.9 + 0.3 * i)) * (Math.PI / 180);
        const tw = 0.55 + 0.45 * Math.sin(f * 0.35 + random(`c08-rsp${i}`) * 6);
        const p = { x: s.c.x + Math.cos(a) * s.r, y: s.c.y + Math.sin(a) * s.r };
        return (
          <g key={i} opacity={tw}>
            <circle cx={p.x} cy={p.y} r={3.6} fill={C.gold} opacity={0.3} />
            <circle cx={p.x} cy={p.y} r={1.3} fill={C.text} />
          </g>
        );
      })}
    </g>
  );
};
