import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { MONO } from "../../../theme/fonts";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { EASE, tween } from "../../../lib/ease";
import { Embryo } from "../Embryo";
import { YolkSac, YolkStalk, sacEdge } from "../YolkSac";
import { embryoAnchors, yolkSuggest } from "../anchors";
import { heartbeatGlow, heartbeatPulse } from "../heartbeat";
import { Bg } from "./Sheet";
import { mono } from "../stage";

// 6 s continuous morph, week 3 -> 8.99, with the neural tube zipping shut and
// the heart starting to beat once it has formed.
export const MORPH_FRAMES = 180;
const ZIP = [44, 76] as const; // frames over which the tube zips (around week 4.0-4.6)

// More screen time where the most happens (disc -> C), less in the late weeks.
const KEYS: [number, number][] = [[6, 3], [36, 3.8], [96, 5.2], [140, 7], [172, 8.99]];
export const weekAt = (f: number) => mono(f, KEYS.map((k) => k[0]), KEYS.map((k) => k[1]));

export const Morph: React.FC = () => {
  const f = useCurrentFrame();
  const week = weekAt(f);
  const zip = tween(f, ZIP[0], ZIP[1], [0, 1], EASE.inOut);
  // heart starts beating when it has formed (week ~4.6)
  let start = 0;
  while (start < MORPH_FRAMES && weekAt(start) < 4.6) start++;
  const beat = { start, bpm: 110 };
  const pulse = heartbeatPulse(f, beat);
  const glow = heartbeatGlow(f, beat);
  const size = 520;
  const x = 540;
  const y = 860;
  const a = embryoAnchors(week, size, { x, y });
  const sac = yolkSuggest(week, size, { x, y });
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute" }}>
        {sac.stalk > 0 && <YolkStalk from={a.yolkStalk} to={sacEdge(sac, a.yolkStalk)} scale={sac.stalk} glow={glow} />}
        <YolkSac x={sac.x} y={sac.y} r={sac.r} glow={glow} />
        <Embryo week={week} size={size} x={x} y={y} zip={zip} heartBeat={pulse} heartGlow={glow} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", fontFamily: MONO, fontSize: 40, letterSpacing: 6, color: C.text }}>
        WEEK {week.toFixed(1)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: C.textDim }}>
        ZIP {zip.toFixed(2)} · BEAT {Math.min(1, pulse).toFixed(2)}
      </div>
    </AbsoluteFill>
  );
};
