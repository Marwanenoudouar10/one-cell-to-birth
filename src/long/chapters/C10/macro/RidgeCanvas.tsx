// The fingerprint ridges, rasterised per frame into a canvas laid over the
// pad art (pad-local px, so it scales/rotates with its fingertip). Drawn in
// a layout effect, synchronously, so every rendered frame is complete and
// deterministic. A CSS drop-shadow gives the ridges their warm glow.
import React, { useLayoutEffect, useRef } from "react";
import { C } from "../../../../theme/colors";
import { BOX, RidgeLook, fieldFor, rasterize } from "./ridges";
import { PrintSpec } from "./prints";

type Props = { spec: PrintSpec; look: RidgeLook | null; frame: number; glow: number };

const hex = (a: number) =>
  Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, "0");

export const RidgeCanvas: React.FC<Props> = ({ spec, look, frame, glow }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    if (!look) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      return;
    }
    const img = ctx.createImageData(BOX.w, BOX.h);
    rasterize(fieldFor(spec), spec, look, img.data);
    ctx.putImageData(img, 0, 0);
  }, [spec, look, frame]);
  const g = Math.max(0, glow);
  return (
    <canvas
      ref={ref}
      width={BOX.w}
      height={BOX.h}
      style={{
        position: "absolute",
        left: BOX.x0,
        top: BOX.y0,
        width: BOX.w,
        height: BOX.h,
        filter: g > 0.01 ? `drop-shadow(0 0 ${(3 + 5 * g).toFixed(1)}px ${C.gold}${hex(0.55 * g)})` : undefined,
      }}
    />
  );
};
