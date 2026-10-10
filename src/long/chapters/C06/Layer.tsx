import React from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { Cam, camTransform } from "./camera";

// Copied from src/scenes/Scene3/Layer.tsx (unchanged; plus overflow hidden on
// the blurred plane so a pushed-in blur can never exceed the frame).

type Props = {
  cam: Cam;
  depth?: number;
  blur?: number;
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  children: React.ReactNode;
};

// One depth plane: a full-frame SVG in world coords, moved by the camera with
// parallax (depth < 1 = far/slow, > 1 = near/fast) and optionally defocused.
export const Layer: React.FC<Props> = ({ cam, depth = 1, blur = 0, opacity = 1, blend, children }) => (
  <AbsoluteFill
    style={{
      filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
      opacity,
      mixBlendMode: blend,
      overflow: "hidden",
    }}
  >
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", overflow: "visible" }}>
      <g transform={camTransform(cam, depth)}>{children}</g>
    </svg>
  </AbsoluteFill>
);
