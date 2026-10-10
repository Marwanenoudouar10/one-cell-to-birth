import React from "react";
import { EASE, tween } from "../../lib/ease";
import { C } from "../../theme/colors";
import { B, CDIR, CONTACT_ANGLE, R, RING_V, ZONA } from "./constants";
import { polar } from "./math";

// Fertilisation effects in egg coordinates: the contact flash, the cortical
// wave running around the membrane from the entry point, and the zona
// shockwave ring that pushes every other sperm away.
const F = B.fertilise;
const CP = { x: CDIR.x * ZONA, y: CDIR.y * ZONA };
const MID = (R + ZONA) / 2;

// arc along the membrane from angle `head` back by `len` radians (signed)
const cometArc = (head: number, len: number) => {
  const p0 = polar(MID, head + len);
  const p1 = polar(MID, head);
  return `M${p0.x},${p0.y}A${MID},${MID} 0 0 ${len < 0 ? 1 : 0} ${p1.x},${p1.y}`;
};

export const FertiliseDefs: React.FC = () => (
  <defs>
    <radialGradient id="s1-flash">
      <stop offset="0" stopColor={C.text} stopOpacity={1} />
      <stop offset="0.12" stopColor={C.text} stopOpacity={0.9} />
      <stop offset="0.32" stopColor={C.gold} stopOpacity={0.55} />
      <stop offset="0.65" stopColor={C.gold} stopOpacity={0.14} />
      <stop offset="1" stopColor={C.gold} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="s1-spark">
      <stop offset="0" stopColor={C.text} stopOpacity={1} />
      <stop offset="0.4" stopColor={C.gold} stopOpacity={0.7} />
      <stop offset="1" stopColor={C.gold} stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const Fertilise: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < B.oneWins || frame > F + 46) return null;

  // during the slow-mo hold the zona warms where the head is about to touch
  const build = tween(frame, B.oneWins + 4, F, [0, 1], EASE.in) * (1 - tween(frame, F, F + 6));

  // anticipation: a pinpoint of light where head meets shell
  const pre = tween(frame, F - 6, F, [0, 1], EASE.in);
  // the flash itself
  const flashR = tween(frame, F - 1, F + 8, [12, 250], EASE.out);
  const flashOp = tween(frame, F - 1, F + 1) * (1 - tween(frame, F + 3, F + 24, [0, 1], EASE.out));
  // cortical wave: two comets racing around the membrane, meeting on the far side
  const wave = tween(frame, F, F + 17, [0, 1], EASE.inOut);
  const a = Math.PI * wave;
  const waveOp = tween(frame, F, F + 2) * (1 - tween(frame, F + 12, F + 22, [0, 1], EASE.inOut));
  const trail = Math.min(a, 1.1);
  const comets = [1, -1].map((d) => cometArc(CONTACT_ANGLE + d * a, -d * trail));
  // a faint afterglow on the membrane the wave has already crossed
  const after = 0.3 * tween(frame, F + 2, F + 10) * (1 - tween(frame, F + 12, F + 28, [0, 1], EASE.inOut));
  // zona shockwave expanding outward (speed matches the push timing)
  const ringP = Math.max(0, frame - F);
  const ringR = ZONA + ringP * RING_V;
  const ringOp = 0.85 * (1 - tween(frame, F, F + 30, [0, 1], EASE.out));
  const ring2R = ZONA + Math.max(0, ringP - 5) * RING_V * 0.8;
  const ring2Op = 0.4 * tween(frame, F + 5, F + 7) * (1 - tween(frame, F + 5, F + 36, [0, 1], EASE.out));
  const fronts = [CONTACT_ANGLE + a, CONTACT_ANGLE - a].map((ang) => polar(MID, ang));

  return (
    <g>
      {build > 0.01 && <circle cx={CP.x} cy={CP.y} r={18 + build * 34} fill="url(#s1-flash)" opacity={build * 0.55} />}
      {frame < F + 2 && pre > 0 && <circle cx={CP.x} cy={CP.y} r={6 + pre * 22} fill="url(#s1-spark)" opacity={pre} />}
      {after > 0.01 && <circle r={MID} fill="none" stroke={C.gold} strokeOpacity={after} strokeWidth={3} />}
      {waveOp > 0.01 &&
        comets.map((d, i) => (
          <g key={i} opacity={waveOp} fill="none" strokeLinecap="round">
            <path d={d} stroke={C.gold} strokeOpacity={0.3} strokeWidth={14} />
            <path d={d} stroke={C.text} strokeOpacity={0.85} strokeWidth={2.6} />
          </g>
        ))}
      {wave < 1 &&
        waveOp > 0 &&
        fronts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={14} fill="url(#s1-spark)" opacity={waveOp} />)}
      {ringOp > 0.01 && frame >= F && (
        <>
          <circle r={ringR} fill="none" stroke={C.gold} strokeOpacity={ringOp * 0.3} strokeWidth={22} />
          <circle r={ringR} fill="none" stroke={C.text} strokeOpacity={ringOp} strokeWidth={3} />
        </>
      )}
      {ring2Op > 0.01 && <circle r={ring2R} fill="none" stroke={C.gold} strokeOpacity={ring2Op} strokeWidth={2} />}
      {flashOp > 0.01 && <circle cx={CP.x} cy={CP.y} r={flashR} fill="url(#s1-flash)" opacity={flashOp} />}
    </g>
  );
};
