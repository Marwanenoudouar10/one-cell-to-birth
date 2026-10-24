// Mum's heartbeat as slow, wide, low sound rings rolling in from her side
// (upper left). Each beat is a lub (strong) + dub (soft) pair; the lub reaches
// the ear exactly on its beat and the ear lights up.
//   HeartRings         the womb kit's muffled <SoundWaves> in the fluid, behind the baby
//   HeartRings front   the same wavefront as a soft line of light over the baby,
//                      so the ring visibly travels across the head to the ear
//   EarGlow            two short arcs (open toward the source) close in on the
//                      ear, then the ear itself glows warm (C11's treatment).
//                      No ring round the ear, no bright centre dot (rule 11).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { WIDTH, HEIGHT } from "../../../theme/layout";
import { SoundWaves, WombLayer, soundProgress } from "../../../shared/womb";
import { fetusAnchors } from "../../../shared/fetus";
import { lerp, smooth } from "../../../shared/fetus/geom";
import { BEATS, HEART_PERIOD, HEART_RINGS } from "./beats";
import { shotAt, toScreen } from "./camera";
import { kitGeo } from "./kitGeo";
import { FX, FY, P2, SIZE, camAnchors, kitWeek, poseAt, toWorld } from "./rig";

// mum's heart, just off-screen upper left (screen px). Close enough that each
// ring reads as a curved ")" wave at phone size (a far source drew near-straight
// streaks that read as lens lines).
const SRC: P2 = { x: -230, y: 360 };
const SPEED = 24; // px per frame: slow (each ring is on screen ~24 frames before the ear)
const SPREAD = 34; // half-angle, degrees
const DUB = 8; // frames from lub to dub
const STRENGTH = [1, 1, 0.35]; // the third beat is soft: the tummy rumble takes over
// two faint pre-beats set up her rhythm before "hear" (fluid only: no light over
// the head, no ear glow), the first one under the WEEK 22 landing
const PRE = [
  { at: BEATS.heart1 - 2 * HEART_PERIOD, s: 0.5 },
  { at: BEATS.heart1 - HEART_PERIOD, s: 0.65 },
];
const ALL_IN = { cx: 540, cy: 960, r: 6000 }; // all arcs muffled (we are inside the womb)
// keep effects out of the week-tracker band (y 100-290) and the captions (y 1300-1560)
export const BAND_MASK = "linear-gradient(180deg, transparent 0px, transparent 270px, black 400px, black 1130px, transparent 1290px)";

export const heartHits = Array.from({ length: HEART_RINGS }, (_, k) => BEATS.heart1 + k * HEART_PERIOD);
const earScreen = (f: number) => toScreen(shotAt(f), camAnchors(f).ear);

const BEAT_LIST = [
  ...PRE.map((p) => ({ ...p, pre: true })),
  ...heartHits.map((at, k) => ({ at, s: STRENGTH[k] ?? 0.3, pre: false })),
];
const TRAINS = BEAT_LIST.flatMap((b, k) => {
  const ear = earScreen(b.at);
  const d = Math.hypot(ear.x - SRC.x, ear.y - SRC.y);
  const dir = (Math.atan2(ear.y - SRC.y, ear.x - SRC.x) * 180) / Math.PI;
  const len = d + 520;
  return [0, 1].map((dub) => {
    const start = b.at + dub * DUB - d / SPEED;
    return { key: `${k}-${dub}`, start, end: start + len / SPEED, len, d, dir, s: b.s * (dub ? 0.5 : 1), dub, pre: b.pre };
  });
});

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const fadeOut = (f: number) => 1 - smoothstep(BEATS.heartOut - 14, BEATS.heartOut, f); // all gone by heartOut

// a tapered arc band around SRC (screen px), as a closed polygon
const band = (r: number, dir: number, w: number) => {
  const N = 40;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = ((dir + (u * 2 - 1) * SPREAD) * Math.PI) / 180;
    const hw = (w / 2) * Math.pow(Math.sin(Math.PI * u), 0.6);
    const pt = (rr: number) => `${(SRC.x + Math.cos(a) * rr).toFixed(1)},${(SRC.y + Math.sin(a) * rr).toFixed(1)}`;
    outer.push(pt(r + hw));
    inner.unshift(pt(r - hw));
  }
  return `M${outer.join(" L")} L${inner.join(" L")}Z`;
};

export const HeartRings: React.FC<{ front?: boolean }> = ({ front }) => {
  const f = useCurrentFrame();
  const live = TRAINS.filter((t) => f > t.start && f < t.end && !(front && t.pre));
  const out = fadeOut(f);
  if (live.length === 0 || out <= 0) return null;
  if (!front) {
    return (
      <AbsoluteFill style={{ maskImage: BAND_MASK, WebkitMaskImage: BAND_MASK }}>
        {live.map((t) => (
          <SoundWaves key={t.key} from={SRC} dir={t.dir} progress={soundProgress(f, t.start, t.end)} count={1} length={t.len}
            spread={SPREAD} width={t.dub ? 34 : 54} color={C.rose} depth={0} sac={ALL_IN} opacity={Math.min(1, 1.3 * t.s) * out} seed={`c12-hb${t.key}`} />
        ))}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ maskImage: BAND_MASK, WebkitMaskImage: BAND_MASK, mixBlendMode: "screen" }}>
      <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="c12-hb-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={13} />
          </filter>
          <filter id="c12-hb-core" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={1.6} />
          </filter>
        </defs>
        {live.map((t) => {
          const r = (f - t.start) * SPEED;
          // fade in as it enters the frame, out soon after it has passed the ear
          // (gone before it reaches the eye: the ear catches it)
          const k = t.s * out * smoothstep(240, 420, r) * (1 - smoothstep(t.d + 10, t.d + 190, r));
          if (k < 0.01) return null;
          return (
            <g key={t.key}>
              <path d={band(r, t.dir, t.dub ? 60 : 96)} fill={C.rose} opacity={0.5 * k} filter="url(#c12-hb-glow)" />
              <path d={band(r, t.dir, t.dub ? 7 : 12)} fill={C.text} opacity={0.62 * k} filter="url(#c12-hb-core)" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const env = (f: number, at: number, decay: number) => (f < at ? 0 : Math.min(1, (f - at + 1) / 3) * Math.exp(-Math.max(0, f - at - 2) / decay));

// every ear event: the heartbeat lubs, then the tummy rumble (startle)
export const RUMBLE_SRC: P2 = { x: -200, y: 1250 }; // her tummy: lower left, just off-screen
const EAR_HITS = [...heartHits.map((h, k) => ({ at: h, s: STRENGTH[k] ?? 0.3, src: SRC })), { at: BEATS.startle, s: 0.85, src: RUMBLE_SRC }];

// 0..1 ear glow
export const earGlowAt = (f: number) => Math.min(1, EAR_HITS.reduce((a, h) => a + h.s * env(f, h.at, 10), 0));

// each beat also breathes a faint warm wash into the fluid from mum's side
// (behind the baby); two soft pre-beats set up her rhythm before the rings
export const HeartPulse: React.FC = () => {
  const f = useCurrentFrame();
  // the wash swells as each ring leaves her side (~24 frames before the ear)
  const a = BEAT_LIST.reduce((acc, h) => acc + h.s * env(f, h.at - 24, 12), 0) * fadeOut(f);
  if (a < 0.01) return null;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: Math.min(1, a) * 0.6,
        background: `radial-gradient(ellipse 820px 1000px at 0px 420px, ${C.rose}66 0%, ${C.womb}2a 45%, transparent 100%)`,
      }}
    />
  );
};

// the ear lights up (follows the real pose, startle included)
export const EarGlow: React.FC = () => {
  const f = useCurrentFrame();
  const a = earGlowAt(f);
  const arcs = EAR_HITS.flatMap((h) =>
    [-12, -6].map((d) => ({ u: (f - h.at - d) / 12, s: h.s, src: h.src })).filter((r) => r.u > 0 && r.u < 1),
  );
  if (a < 0.01 && arcs.length === 0) return null;
  const pose = poseAt(f, 0);
  const A = fetusAnchors(kitWeek(f), pose, SIZE);
  const { geo, fr, headXf } = kitGeo(kitWeek(f), pose, SIZE);
  const ear = toWorld(A.ear);
  const hr = A.headRadius;
  const es = earScreen(f);
  const arc = (r: number, src: P2) => {
    const from = Math.atan2(src.y - es.y, src.x - es.x); // toward the sound's source
    const p = (t: number) => `${(ear.x + Math.cos(t) * r).toFixed(2)},${(ear.y + Math.sin(t) * r).toFixed(2)}`;
    return `M${p(from - 0.84)}A${r.toFixed(2)},${r.toFixed(2)} 0 0 1 ${p(from + 0.84)}`;
  };
  // the kit's own ear outline (Face.tsx), head-local
  const el = geo.lm.ear;
  const k = lerp(0.82, 1.12, geo.g.earRise) * (1 + 0.06 * geo.g.fat);
  const earD = smooth(
    [[4, -18], [13, -8], [12, 8], [3, 18], [-7, 12], [-10, -4], [-6, -15]].map(([x, y]) => ({ x: el.x + x * k, y: el.y + y * k })),
  );
  return (
    <WombLayer blend="screen">
      <defs>
        <radialGradient id="c12-ear-halo">
          <stop offset={0} stopColor={C.gold} stopOpacity={0.6} />
          <stop offset={0.45} stopColor={C.gold} stopOpacity={0.34} />
          <stop offset={1} stopColor={C.rose} stopOpacity={0} />
        </radialGradient>
        <filter id="c12-ear-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={2.2} />
        </filter>
      </defs>
      {a > 0.01 && (
        <g transform={`translate(${FX} ${FY})`}>
          <g transform={fr.css}>
            <g transform={headXf}>
              {/* a warm wash spreads round the ear (reads on the word at phone size) */}
              <ellipse cx={el.x + 1} cy={el.y} rx={44 * k} ry={52 * k} fill="url(#c12-ear-halo)" opacity={a} />
              <path d={earD} fill={C.gold} opacity={0.92 * a} filter="url(#c12-ear-glow)" />
            </g>
          </g>
        </g>
      )}
      {arcs.map((r, i) => {
        const rad = hr * (0.62 - 0.42 * r.u);
        const o = Math.sin(Math.PI * Math.min(1, r.u * 1.15)) * Math.min(1, r.s * 1.2);
        return (
          <g key={i} fill="none" strokeLinecap="round" opacity={0.9 * o}>
            <path d={arc(rad, r.src)} stroke={C.peach} strokeWidth={6.5} strokeOpacity={0.5} filter="url(#c12-ear-glow)" />
            <path d={arc(rad, r.src)} stroke={C.text} strokeWidth={2.2} strokeOpacity={0.85} />
          </g>
        );
      })}
    </WombLayer>
  );
};
