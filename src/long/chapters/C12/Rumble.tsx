// Her tummy rumbling: ONE wobbly, bubbly ring that rolls through the frame
// from the lower left (screen space, soft and muffled like the heartbeat
// rings) and reaches the ear exactly on the startle beat. Gentle humour.
import React from "react";
import { random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { WIDTH, HEIGHT } from "../../../theme/layout";
import { BEATS } from "./beats";
import { shotAt, toScreen } from "./camera";
import { P2, camAnchors } from "./rig";

const SRC: P2 = { x: -220, y: 1900 };
const EAR = toScreen(shotAt(BEATS.startle), camAnchors(BEATS.startle).ear);
const D_EAR = Math.hypot(EAR.x - SRC.x, EAR.y - SRC.y);
const DIR = Math.atan2(EAR.y - SRC.y, EAR.x - SRC.x);
const R_IN = 620; // radius when it is born (just entering the frame)
const SPEED = (D_EAR - R_IN) / (BEATS.startle - BEATS.rumbleIn);
const SPREAD = 0.95; // half-angle, radians
const R_OUT = D_EAR + 1300;

const radiusAt = (f: number) => R_IN + SPEED * (f - BEATS.rumbleIn);

const BUBBLES = Array.from({ length: 24 }, (_, i) => ({
  a: (random(`c12-bba${i}`) * 2 - 1) * SPREAD * 0.88,
  off: -6 - 90 * random(`c12-bbo${i}`) ** 1.3,
  r: 7 + 17 * random(`c12-bbr${i}`) ** 1.8,
  pop: 0.35 + 0.6 * random(`c12-bbp${i}`),
}));

export const Rumble: React.FC = () => {
  const f = useCurrentFrame();
  const R = radiusAt(f);
  if (f < BEATS.rumbleIn || R > R_OUT) return null;
  const life = (R - R_IN) / (R_OUT - R_IN);
  const alpha = Math.min(1, (f - BEATS.rumbleIn) / 5) * (1 - Math.max(0, (life - 0.55) / 0.45) ** 1.5);
  const t = f * 0.09;
  // the wobbly band: radius bends with noise + a slow ripple; tapered ends
  const N = 60;
  const outer: string[] = [];
  const inner: string[] = [];
  const mid: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = DIR + (u * 2 - 1) * SPREAD;
    const w = 22 * Math.pow(Math.sin(Math.PI * u), 0.7);
    const rr = R + 42 * noise2D("c12-rum", u * 3.2, t) + 16 * Math.sin(u * 24 + f * 0.5);
    const at = (r: number) => `${(SRC.x + Math.cos(a) * r).toFixed(1)},${(SRC.y + Math.sin(a) * r).toFixed(1)}`;
    outer.push(at(rr + w));
    inner.unshift(at(rr - w));
    mid.push(at(rr));
  }
  const band = `M${outer.join(" L")} L${inner.join(" L")}Z`;
  const line = `M${mid.join(" L")}`;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }} opacity={alpha}>
      <defs>
        <filter id="c12-rumGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={16} />
        </filter>
        <filter id="c12-rumSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={2.2} />
        </filter>
      </defs>
      <path d={line} fill="none" stroke={C.peach} strokeOpacity={0.35} strokeWidth={90} filter="url(#c12-rumGlow)" />
      <g filter="url(#c12-rumSoft)">
        <path d={band} fill={C.peach} opacity={0.6} />
        <path d={line} fill="none" stroke={C.skin} strokeOpacity={0.7} strokeWidth={5} />
        {BUBBLES.map((b, i) => {
          const a = DIR + b.a;
          const wob = 9 * noise2D(`c12-bbw${i}`, t * 1.3, 0);
          const r = R + b.off + wob;
          const x = SRC.x + Math.cos(a) * r + 6 * noise2D(`c12-bbx${i}`, 0, t * 1.5);
          const y = SRC.y + Math.sin(a) * r;
          const popping = Math.max(0, (life - b.pop) / 0.12);
          if (popping >= 1) return null;
          const s = b.r * (1 + 0.6 * popping) * (0.9 + 0.1 * Math.sin(f * 0.6 + i));
          return (
            <g key={i} opacity={(1 - popping) * 0.85}>
              <circle cx={x} cy={y} r={s} fill={C.peach} fillOpacity={0.2} stroke={C.skin} strokeOpacity={0.85} strokeWidth={2.6} />
              <circle cx={x - s * 0.35} cy={y - s * 0.38} r={s * 0.24} fill={C.text} opacity={0.7} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
