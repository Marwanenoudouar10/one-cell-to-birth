import React from "react";
import { AbsoluteFill } from "remotion";
import { camTransform, useWombCamera } from "../../../../shared/womb";
import { HEIGHT, WIDTH } from "../../../../theme/layout";

// C07's Layer (= C06's = Scene3's depth plane, + overflow hidden), reading the womb kit's
// <Camera> from context so C06's copied art and the kit's backdrop share one camera.
// The kit's camTransform is the same maths as C06's (anchor = HERO centre 540, 860).

type Props = {
  depth?: number;
  blur?: number;
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  children: React.ReactNode;
};

export const Layer: React.FC<Props> = ({ depth = 1, blur = 0, opacity = 1, blend, children }) => {
  const cam = useWombCamera();
  return (
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
};
