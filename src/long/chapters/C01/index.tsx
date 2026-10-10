import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tween } from "../../../lib/ease";
import { C } from "../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { B, END } from "./beats";
import { camAt, layerXf, scroll, xfAttr } from "./camera";
import { CAPTION_MASK, CDIR, R, hex, mixHex } from "./constants";
import { wombness } from "./corridor";
import { CalciumWave } from "./CalciumWave";
import { Corona } from "./Corona";
import { Egg, breathAt } from "./Egg";
import { Fertilise, FertiliseDefs } from "./Fertilise";
import { Lining } from "./Lining";
import { Mesh } from "./Mesh";
import { Motes } from "./Motes";
import { SpermDefs } from "./Sperm";
import { SwarmLayer } from "./Swarm";
import { Throat } from "./Throat";
import { Tissue } from "./Tissue";
import { Winner, winnerHead } from "./Winner";
import { exitAt } from "./Zygote";

const svgStyle = (blur = 0, mask = false): React.CSSProperties => ({
  position: "absolute",
  filter: blur ? `blur(${blur}px)` : undefined,
  WebkitMaskImage: mask ? CAPTION_MASK : undefined,
  maskImage: mask ? CAPTION_MASK : undefined,
});

// C01 "The obstacle course" (extends the teaser's Scene1).
// "It starts with a race. Hundreds of millions set off on an obstacle course.
// Only one gets in." The swarm bursts in; the camera climbs with it through
// three gates (mucus mesh, the wide womb, the narrow tube entrance) while the
// egg waits above; the survivors rest on the ciliated tube wall, light up and
// swim on; one edges ahead, slips through the zona and fuses.
// Back to front: walls (far) · womb darkness · egg light · far specks, mesh,
// swarm · corona · egg (+ calcium wave) · tube lining · throat · mid specks,
// mesh · swarm + survivors, winner, fx · near mesh, swarm · walls (near) ·
// bokeh · flash bloom · spotlight · caption shade. The egg sits behind the
// egg-plane corridor: it is the distant goal the gates sweep past.
export const C01: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(frame);
  const egg = layerXf(frame, 1);
  const z = cam.z * breathAt(frame);
  const r = R * z;
  const head = winnerHead(frame);
  // the open womb feels dark: walls gone, a deeper vignette
  const dark = wombness((960 - egg.oy) / egg.zL - scroll(frame));
  // a cool glow around the egg while it is the distant goal (not at frame 0)
  const glowA = 0.2 * tween(frame, B.push - 8, B.push + 20) * (1 - tween(frame, B.fuse, B.fuse + 16, [0, 1], EASE.inOut));
  const glowCol = mixHex(C.cellCyan, C.gold, tween(frame, B.fuse - 2, B.fuse + 10));
  // flash bloom on the fusion point
  const fp = { x: cam.ex + CDIR.x * r, y: cam.ey + CDIR.y * r };
  const bloom = 0.8 * tween(frame, B.fuse - 1, B.fuse + 2) * (1 - tween(frame, B.fuse + 2, B.fuse + 30, [0, 1], EASE.out));
  // slow-mo hold: the world darkens around the winner
  const spot = tween(frame, B.oneOut - 12, B.oneOut + 6, [0, 1], EASE.inOut) * (1 - tween(frame, B.fuse, B.fuse + 18, [0, 1], EASE.out));
  const ws = { x: egg.ox + head.x * egg.zL, y: egg.oy + head.y * egg.zL };
  // the caption shade is not needed once only the zygote is left
  const shade = 1 - tween(frame, B.fuse + 10, END - 6, [0, 1], EASE.inOut);
  const breath = `scale(${breathAt(frame)})`;
  // rack focus: the gate is the subject while it sweeps past the far egg
  const rack = tween(frame, B.womb - 4, B.gate - 18, [0, 1], EASE.inOut) * (1 - tween(frame, B.gate, B.rest + 6, [0, 1], EASE.inOut));

  return (
    <AbsoluteFill>
      <Tissue depth="back" frame={frame} />
      {dark > 0.01 && (
        <AbsoluteFill
          style={{ background: `radial-gradient(70% 55% at 50% 50%, ${C.bg0}${hex(0.22 * dark)} 0%, ${C.bg0}${hex(0.6 * dark)} 100%)` }}
        />
      )}
      {glowA > 0.003 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${cam.ex}px ${cam.ey}px, ${glowCol}${hex(glowA)} 0px, ${glowCol}${hex(glowA * 0.55)} ${r * 1.4}px, ${glowCol}${hex(glowA * 0.16)} ${r * 2.8}px, transparent ${r * 4.6}px)`,
          }}
        />
      )}
      <Motes depth="far" frame={frame} />
      <Mesh depth="far" frame={frame} />
      <svg width={WIDTH} height={HEIGHT} style={svgStyle(2.2, true)}>
        <SpermDefs prefix="c01-far-" />
        <SwarmLayer layer="far" frame={frame} />
      </svg>
      {/* the egg is the distant goal: the corridor's egg-plane structures pass
          IN FRONT of it, and focus racks to the gate while the throat crosses */}
      <svg width={WIDTH} height={HEIGHT} style={{ ...svgStyle(1.1 + 2.6 * rack), opacity: 1 - 0.18 * rack }}>
        <g transform={xfAttr(egg)}>
          <Corona frame={frame} winner={head} />
        </g>
      </svg>
      <svg width={WIDTH} height={HEIGHT} style={{ ...svgStyle(2.2 * rack, true), opacity: 1 - 0.12 * rack }}>
        <FertiliseDefs />
        <g transform={xfAttr(egg)}>
          <Egg frame={frame} />
          <g transform={breath} opacity={exitAt(frame)}>
            <CalciumWave frame={frame} />
          </g>
        </g>
      </svg>
      <Lining frame={frame} />
      <Throat frame={frame} />
      <Motes depth="mid" frame={frame} />
      <Mesh depth="mid" frame={frame} />

      <svg width={WIDTH} height={HEIGHT} style={svgStyle(0, true)}>
        <SpermDefs prefix="c01-mid-" />
        <SwarmLayer layer="mid" frame={frame} />
        <g transform={xfAttr(egg)}>
          <Winner frame={frame} />
          <Fertilise frame={frame} />
        </g>
      </svg>

      <Mesh depth="near" frame={frame} />
      <svg width={WIDTH} height={HEIGHT} style={svgStyle(0, true)}>
        <SpermDefs prefix="c01-near-" />
        <SwarmLayer layer="near" frame={frame} />
      </svg>
      <Tissue depth="front" frame={frame} />
      <Motes depth="near" frame={frame} />

      {bloom > 0.005 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${fp.x}px ${fp.y}px, ${C.gold}${hex(0.45 * bloom)} 0px, ${C.gold}${hex(0.12 * bloom)} 320px, transparent 760px)`,
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
      {/* keep the caption zone calm (Scene1's shade; not needed once only the zygote is left) */}
      <AbsoluteFill
        style={{
          opacity: shade,
          background: `linear-gradient(180deg, transparent 0%, transparent 57%, ${C.bg0}80 69%, ${C.bg0}9e 81%, ${C.bg0}80 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
