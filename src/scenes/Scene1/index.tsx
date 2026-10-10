import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../lib/ease";
import { C } from "../../theme/colors";
import { HEIGHT, WIDTH } from "../../theme/layout";
import { camAt, layerXf, xfAttr } from "./camera";
import { B, CDIR, END, R, ZONA } from "./constants";
import { Corona } from "./Corona";
import { Egg, breathAt } from "./Egg";
import { Fertilise, FertiliseDefs } from "./Fertilise";
import { SpermDefs } from "./Sperm";
import { SwarmLayer } from "./Swarm";
import { Tissue } from "./Tissue";
import { Rivals } from "./Rivals";
import { Winner, winnerAt } from "./Winner";
import { exitAt } from "./Zygote";

// Swimmers fade to a whisper through the caption band (y 1300-1560).
const CAPTION_MASK = `linear-gradient(180deg, ${C.bg0} 0px, ${C.bg0} 1150px, ${C.bg0}5c 1290px, ${C.bg0}5c 1570px, ${C.bg0}b3 1720px)`;
const svgStyle = (blur = 0, mask = false): React.CSSProperties => ({
  position: "absolute",
  filter: blur ? `blur(${blur}px)` : undefined,
  WebkitMaskImage: mask ? CAPTION_MASK : undefined,
  maskImage: mask ? CAPTION_MASK : undefined,
});

// Scene1 — "It starts with a race. Millions run. Only one wins."
// Back to front: tube wall (far) · egg light · far swarm · egg plane
// (corona, egg, mid swarm, winner, fertilisation fx) · near swarm · tube
// wall (near) · flash bloom · caption shade.
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(frame);
  const egg = layerXf(frame, 1);
  const warm = tween(frame, B.fertilise, B.fertilise + 24, [0, 1], EASE.inOut);
  const glowCol = interpolateColors(warm, [0, 1], [C.cellCyan, C.gold]);
  const r = R * cam.z * breathAt(frame);
  const glowA = (0.3 + 0.16 * warm) * exitAt(frame);
  // the caption shade is not needed once only the zygote is left
  const shade = 1 - tween(frame, B.fertilise + 10, END - 6, [0, 1], EASE.inOut);
  const w = winnerAt(frame);
  const head = { x: w.pos.x + Math.cos((w.ang * Math.PI) / 180) * 5, y: w.pos.y + Math.sin((w.ang * Math.PI) / 180) * 5 };

  // flash bloom centred on the contact point
  const cp = { x: cam.ex + CDIR.x * ZONA * cam.z, y: cam.ey + CDIR.y * ZONA * cam.z };
  const bloom = tween(frame, B.fertilise - 1, B.fertilise + 2) * (1 - tween(frame, B.fertilise + 2, B.fertilise + 30, [0, 1], EASE.out));

  // slow-mo hold: the world darkens around the winner
  const spot = tween(frame, B.oneWins - 12, B.oneWins + 6, [0, 1], EASE.inOut) * (1 - tween(frame, B.fertilise, B.fertilise + 18, [0, 1], EASE.out));
  const ws = { x: egg.ox + head.x * egg.zL, y: egg.oy + head.y * egg.zL };

  return (
    <AbsoluteFill>
      <Tissue depth="back" frame={frame} />

      {/* the egg's own light, washing the fluid around it */}
      {glowA > 0.003 && <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${cam.ex}px ${cam.ey}px, ${glowCol}${hex(glowA)} 0px, ${glowCol}${hex(glowA * 0.62)} ${r * 1.3}px, ${glowCol}${hex(glowA * 0.2)} ${r * 2.6}px, ${glowCol}${hex(glowA * 0.06)} ${r * 4}px, transparent ${r * 5.5}px)`,
        }}
      />}

      <svg width={WIDTH} height={HEIGHT} style={svgStyle(2.2, true)}>
        <SpermDefs prefix="s1-far-" />
        <SwarmLayer layer="far" frame={frame} />
      </svg>

      <svg width={WIDTH} height={HEIGHT} style={svgStyle(1.1)}>
        <g transform={xfAttr(egg)}>
          <Corona frame={frame} winner={head} />
        </g>
      </svg>

      <svg width={WIDTH} height={HEIGHT} style={svgStyle(0, true)}>
        <SpermDefs prefix="s1-mid-" />
        <FertiliseDefs />
        <g transform={xfAttr(egg)}>
          <Egg frame={frame} />
        </g>
        <SwarmLayer layer="mid" frame={frame} />
        <g transform={xfAttr(egg)}>
          <Rivals frame={frame} />
          <Winner frame={frame} />
          <Fertilise frame={frame} />
        </g>
      </svg>

      <svg width={WIDTH} height={HEIGHT} style={svgStyle(0, true)}>
        <SpermDefs prefix="s1-near-" />
        <SwarmLayer layer="near" frame={frame} />
      </svg>

      <Tissue depth="front" frame={frame} />

      {bloom > 0.005 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${cp.x}px ${cp.y}px, ${C.gold}${hex(0.45 * bloom)} 0px, ${C.gold}${hex(0.12 * bloom)} 320px, transparent 760px)`,
            mixBlendMode: "screen",
          }}
        />
      )}

      {spot > 0.005 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${ws.x}px ${ws.y}px, transparent 0px, transparent ${r * 1.2}px, ${C.bg0}${hex(0.5 * spot)} ${r * 3.4}px)`,
          }}
        />
      )}

      {/* keep the caption zone calm (not needed once only the zygote is left) */}
      <AbsoluteFill
        style={{
          opacity: shade,
          background: `linear-gradient(180deg, transparent 0%, transparent 57%, ${C.bg0}80 69%, ${C.bg0}9e 81%, ${C.bg0}80 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// alpha 0..1 -> two hex digits
const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");
