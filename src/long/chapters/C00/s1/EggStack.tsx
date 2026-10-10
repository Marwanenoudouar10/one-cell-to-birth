// The cell and, at the very end, C01's whole opening world, layered as
// src/scenes/Scene1/index.tsx does (back to front): tube wall (far) · egg light
// · corona · egg · [children] · tube wall (near) · caption shade. No swarm: in
// C01 it only bursts in at 0.15 s. With world = 1, story = B.fertilise - 1 and
// clock = 0 this renders C01's frame 0, so the hard cut is invisible.
import React from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import { EASE, tween } from "../../../../lib/ease";
import { C } from "../../../../theme/colors";
import { HEIGHT, WIDTH } from "../../../../theme/layout";
import { B, R } from "./constants";
import { Corona } from "./Corona";
import { Egg } from "./Egg";
import { Tissue } from "./Tissue";
import { exitAt } from "./Zygote";

const CAPTION_MASK = `linear-gradient(180deg, ${C.bg0} 0px, ${C.bg0} 1150px, ${C.bg0}5c 1290px, ${C.bg0}5c 1570px, ${C.bg0}b3 1720px)`;
const svgStyle = (blur = 0, mask = false, opacity = 1): React.CSSProperties => ({
  position: "absolute",
  opacity,
  filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
  WebkitMaskImage: mask ? CAPTION_MASK : undefined,
  maskImage: mask ? CAPTION_MASK : undefined,
});

const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

export type EggStackProps = {
  clock: number; // Scene1 frame for camera and wobble (0 on C00's last frame)
  story: number; // Scene1 frame for the cell's look (END = gold zygote)
  x: number;
  y: number;
  z: number; // egg-plane scale: core radius = 100 z
  breath: number;
  blur?: number; // focus blur on the cell (px)
  glow?: number; // extra light around the cell (the "single" pulse)
  world?: number; // 0..1: tube walls, corona, caption shade
  children?: React.ReactNode;
};

export const EggStack: React.FC<EggStackProps> = ({ clock, story, x, y, z, breath, blur = 0, glow = 0, world = 0, children }) => {
  const warm = tween(story, B.fertilise, B.fertilise + 24, [0, 1], EASE.inOut);
  const glowCol = interpolateColors(warm, [0, 1], [C.cellCyan, C.gold]);
  const r = R * z * breath;
  const glowA = (0.3 + 0.16 * warm) * exitAt(story) * (1 + glow);
  const xf = `translate(${x} ${y}) scale(${z})`;
  const w = world > 0.004;
  return (
    <AbsoluteFill>
      {w && <Tissue depth="back" frame={clock} fade={world} />}
      {glowA > 0.003 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${x}px ${y}px, ${glowCol}${hex(glowA)} 0px, ${glowCol}${hex(glowA * 0.62)} ${r * 1.3}px, ${glowCol}${hex(glowA * 0.2)} ${r * 2.6}px, ${glowCol}${hex(glowA * 0.06)} ${r * 4}px, transparent ${r * 5.5}px)`,
          }}
        />
      )}
      {w && (
        <svg width={WIDTH} height={HEIGHT} style={svgStyle(1.1, false, world)}>
          <g transform={xf}>
            <Corona story={story} clock={clock} />
          </g>
        </svg>
      )}
      <svg width={WIDTH} height={HEIGHT} style={svgStyle(blur, true)}>
        <g transform={xf}>
          <Egg story={story} clock={clock} breath={breath} />
        </g>
      </svg>
      {children}
      {w && <Tissue depth="front" frame={clock} fade={world} />}
      {w && (
        <AbsoluteFill
          style={{
            opacity: world,
            background: `linear-gradient(180deg, transparent 0%, transparent 57%, ${C.bg0}80 69%, ${C.bg0}9e 81%, ${C.bg0}80 100%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
