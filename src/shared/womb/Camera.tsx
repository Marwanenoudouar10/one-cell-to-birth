// <Camera> + <WombLayer>: the womb kit's parallax camera.
//
// <Camera zoom x y rot shake drift anchor seed> wraps a whole womb shot. The
//   world point (x, y) is placed at the screen `anchor` (default HERO centre
//   540,860) and the world is scaled by `zoom` around it. With the defaults
//   (zoom 1, x 540, y 860) world px == screen px.
//   - zoom   number  1 = no zoom; 1.00 -> 1.06 is the house "slow push".
//   - x, y   number  world point the camera looks at (default 540, 860).
//   - rot    number  degrees of roll (keep within +-2).
//   - shake  number  px amplitude of a fast noise jitter (0 = none). Use
//                    kickShake(frame, kickFrame) for a decaying thump.
//   - drift  number  1 = the gentle always-alive hand-held drift (6px, 0.5deg).
// Every kit component (and your own <WombLayer>) inside reads the camera from
// context and applies it scaled by its own `depth` (parallax): depth 1 = the
// sac plane, < 1 = farther (moves/zooms less), > 1 = nearer (moves more),
// 0 = locked to the screen. Outside a <Camera>, layers render untransformed.
//
// <WombLayer depth blur opacity blend> is one full-frame SVG plane in world
// coords. Put your own chapter art (embryo, fetus, hands) in one:
//   <WombLayer depth={1} blur={focusBlur}><MyFetus /></WombLayer>
import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { HEIGHT, HERO, WIDTH } from "../../theme/layout";
import { Pt } from "./geom";

export type CamState = {
  zoom: number;
  x: number;
  y: number;
  rot: number;
  dx: number; // drift + shake offset, screen px
  dy: number;
  ax: number; // anchor (screen px)
  ay: number;
};

const IDENTITY: CamState = { zoom: 1, x: HERO.cx, y: HERO.cy, rot: 0, dx: 0, dy: 0, ax: HERO.cx, ay: HERO.cy };
const CamCtx = createContext<CamState>(IDENTITY);

export const useWombCamera = () => useContext(CamCtx);

// SVG transform for a plane at `depth` (1 = sac plane).
export const camTransform = (c: CamState, depth = 1) => {
  const s = 1 + (c.zoom - 1) * depth;
  const fx = c.ax + (c.x - c.ax) * depth;
  const fy = c.ay + (c.y - c.ay) * depth;
  return `translate(${c.ax + c.dx * depth} ${c.ay + c.dy * depth}) rotate(${c.rot * depth}) scale(${s}) translate(${-fx} ${-fy})`;
};

// World point -> screen point for a plane at `depth` (for screen-space effects).
export const worldToScreen = (c: CamState, p: Pt, depth = 1): Pt => {
  const s = 1 + (c.zoom - 1) * depth;
  const fx = c.ax + (c.x - c.ax) * depth;
  const fy = c.ay + (c.y - c.ay) * depth;
  const lx = (p.x - fx) * s;
  const ly = (p.y - fy) * s;
  const r = (c.rot * depth * Math.PI) / 180;
  return {
    x: c.ax + c.dx * depth + lx * Math.cos(r) - ly * Math.sin(r),
    y: c.ay + c.dy * depth + lx * Math.sin(r) + ly * Math.cos(r),
  };
};

// A decaying shake amplitude (px) for a thump at `at`: 0 before, peak `amp`
// two frames later, gone after ~20 frames. Feed it to <Camera shake>.
export const kickShake = (frame: number, at: number, amp = 14) => {
  const k = Math.max(0, frame - at) / 2;
  return frame < at ? 0 : amp * k * Math.exp(1 - k) * Math.exp(-Math.max(0, frame - at - 2) / 8);
};

type CameraProps = {
  zoom?: number;
  x?: number;
  y?: number;
  rot?: number;
  shake?: number;
  drift?: number;
  anchor?: Pt;
  seed?: string;
  children: React.ReactNode;
};

export const Camera: React.FC<CameraProps> = ({
  zoom = 1,
  x = HERO.cx,
  y = HERO.cy,
  rot = 0,
  shake = 0,
  drift = 1,
  anchor = { x: HERO.cx, y: HERO.cy },
  seed = "wb-cam",
  children,
}) => {
  const f = useCurrentFrame();
  const t = f * 0.01;
  const q = f * 0.55;
  const cam: CamState = {
    zoom,
    x,
    y,
    ax: anchor.x,
    ay: anchor.y,
    rot: rot + drift * noise2D(`${seed}r`, t * 0.6, 3) * 0.5 + shake * 0.05 * noise2D(`${seed}sr`, q, 7),
    dx: drift * noise2D(`${seed}x`, t, 0) * 6 + shake * noise2D(`${seed}sx`, q, 1),
    dy: drift * noise2D(`${seed}y`, 0, t) * 6 + shake * noise2D(`${seed}sy`, 2, q),
  };
  return (
    <CamCtx.Provider value={cam}>
      <AbsoluteFill>{children}</AbsoluteFill>
    </CamCtx.Provider>
  );
};

type LayerProps = {
  depth?: number;
  blur?: number;
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  children: React.ReactNode;
};

export const WombLayer: React.FC<LayerProps> = ({ depth = 1, blur = 0, opacity = 1, blend, children }) => {
  const cam = useWombCamera();
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        opacity: opacity < 1 ? opacity : undefined,
        mixBlendMode: blend,
        pointerEvents: "none",
      }}
    >
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", overflow: "visible" }}>
        <g transform={camTransform(cam, depth)}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};
