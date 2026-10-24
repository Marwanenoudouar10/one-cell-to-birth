// Her tummy rumbling: ONE wobbly, bubbly ring that rolls in from her side
// (lower left, screen space) over the back and shoulder, and breaks on the ear
// exactly on the startle beat: its bubbles pop there and it is gone before it
// could reach the face (a line across the face read as a stray hair).
// Bubbles are plain soft rings with a small curved sheen (no highlight dots:
// a dot inside a circle reads as an eye). Masked out of the caption band.
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { C } from "../../../theme/colors";
import { WIDTH, HEIGHT } from "../../../theme/layout";
import { BEATS } from "./beats";
import { shotAt, toScreen } from "./camera";
import { P2, camAnchors } from "./rig";
import { BAND_MASK, RUMBLE_SRC } from "./Sound";

const SRC: P2 = RUMBLE_SRC;
const EAR = toScreen(shotAt(BEATS.startle), camAnchors(BEATS.startle).ear);
const D_EAR = Math.hypot(EAR.x - SRC.x, EAR.y - SRC.y);
const DIR = Math.atan2(EAR.y - SRC.y, EAR.x - SRC.x);
const R_IN = 290; // radius when it is born (just entering the frame at the lower left)
const SPEED = (D_EAR - R_IN) / (BEATS.startle - BEATS.rumbleIn);
const SPREAD = 0.62; // half-angle, radians: a curved ")" wave, back of the head to the shoulder
const R_OUT = D_EAR + 4 * SPEED; // breaks on the ear: gone 4 frames after the startle

const radiusAt = (f: number) => R_IN + SPEED * (f - BEATS.rumbleIn);

const BUBBLES = Array.from({ length: 22 }, (_, i) => ({
  a: (random(`c12-bba${i}`) * 2 - 1) * SPREAD * 0.85,
  off: -10 - 110 * random(`c12-bbo${i}`) ** 1.3,
  r: 12 + 24 * random(`c12-bbr${i}`) ** 1.8,
  pop: 0.6 + 0.32 * random(`c12-bbp${i}`), // most pop as the ring breaks on the head
}));

const p2 = (a: number, r: number) => `${(SRC.x + Math.cos(a) * r).toFixed(1)},${(SRC.y + Math.sin(a) * r).toFixed(1)}`;

export const Rumble: React.FC = () => {
  const f = useCurrentFrame();
  const R = radiusAt(f);
  if (f < BEATS.rumbleIn - 1 || R > R_OUT + SPEED) return null;
  const life = Math.max(0, (R - R_IN) / (R_OUT - R_IN));
  const fadeIn = Math.min(1, Math.max(0, f - BEATS.rumbleIn + 1) / 6);
  const fadeOut = 1 - Math.min(1, Math.max(0, (R - (D_EAR - 3 * SPEED)) / (R_OUT - (D_EAR - 3 * SPEED)))) ** 1.4;
  const alpha = fadeIn * fadeOut;
  const t = f * 0.09;
  // the wobbly band: radius bends with noise + a slow ripple; tapered ends
  const N = 60;
  const outer: string[] = [];
  const inner: string[] = [];
  const cOut: string[] = [];
  const cIn: string[] = [];
  const mid: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = DIR + (u * 2 - 1) * SPREAD;
    const taper = Math.pow(Math.sin(Math.PI * u), 0.7);
    const w = 28 * taper;
    const wc = 5.5 * taper; // the core tapers too (a constant stroke trailed off like a hair)
    const rr = R + 40 * noise2D("c12-rum", u * 3.2, t) + 15 * Math.sin(u * 24 + f * 0.5);
    outer.push(p2(a, rr + w));
    inner.unshift(p2(a, rr - w));
    cOut.push(p2(a, rr + wc));
    cIn.unshift(p2(a, rr - wc));
    mid.push(p2(a, rr));
  }
  const band = `M${outer.join(" L")} L${inner.join(" L")}Z`;
  const core = `M${cOut.join(" L")} L${cIn.join(" L")}Z`;
  const line = `M${mid.join(" L")}`;
  return (
    <AbsoluteFill style={{ maskImage: BAND_MASK, WebkitMaskImage: BAND_MASK, opacity: alpha }}>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="c12-rum-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={16} />
          </filter>
          <filter id="c12-rum-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={2} />
          </filter>
        </defs>
        <path d={line} fill="none" stroke={C.gold} strokeOpacity={0.2} strokeWidth={70} filter="url(#c12-rum-glow)" />
        <g filter="url(#c12-rum-soft)">
          <path d={band} fill={C.gold} opacity={0.34} />
          <path d={core} fill={C.rose} opacity={0.85} />
          {BUBBLES.map((b, i) => {
            const a = DIR + b.a;
            const wob = 9 * noise2D(`c12-bbw${i}`, t * 1.3, 0);
            const r = R + b.off + wob;
            const x = SRC.x + Math.cos(a) * r + 6 * noise2D(`c12-bbx${i}`, 0, t * 1.5);
            const y = SRC.y + Math.sin(a) * r;
            const popping = Math.max(0, (life - b.pop) / 0.12);
            if (popping >= 1) return null;
            const s = b.r * (1 + 0.6 * popping) * (0.9 + 0.1 * Math.sin(f * 0.6 + i));
            const sheen = `M${(x - s * 0.62).toFixed(1)},${(y - s * 0.12).toFixed(1)} A${(s * 0.66).toFixed(1)},${(s * 0.66).toFixed(1)} 0 0 1 ${(x - s * 0.1).toFixed(1)},${(y - s * 0.64).toFixed(1)}`;
            return (
              <g key={i} opacity={(1 - popping) * 0.9}>
                <circle cx={x} cy={y} r={s} fill={C.gold} fillOpacity={0.22} stroke={C.rose} strokeOpacity={0.9} strokeWidth={4} />
                <path d={sheen} fill="none" stroke={C.text} strokeOpacity={0.75} strokeWidth={3} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
