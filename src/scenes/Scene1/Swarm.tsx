import React from "react";
import { HEIGHT, WIDTH } from "../../theme/layout";
import { layerXf, xfAttr } from "./camera";
import { SpermShape, TAIL } from "./Sperm";
import { LAYER, SPECS } from "./swarmSpecs";
import { LayerId, packDim, spermAt } from "./swarmMotion";

// One depth layer of the swarm, inside its own parallax transform.
export const SwarmLayer: React.FC<{ layer: LayerId; frame: number }> = ({ layer, frame }) => {
  const cfg = LAYER[layer];
  const L = layerXf(frame, cfg.p);
  const prefix = `s1-${layer}-`;
  const spot = packDim(frame);
  const glow = layer === "far" ? 0.35 : layer === "mid" ? 0.65 : 0.5;
  return (
    <g transform={xfAttr(L)}>
      {SPECS[layer].map((s) => {
        const pose = spermAt(s, frame);
        if (pose.op < 0.01) return null;
        // cull anything fully off-screen (head + full tail length margin)
        const sx = L.ox + pose.x * L.zL;
        const sy = L.oy + pose.y * L.zL;
        const m = pose.size * L.zL * (TAIL + 2);
        if (sx < -m || sx > WIDTH + m || sy < -m || sy > HEIGHT + m) return null;
        return (
          <SpermShape
            key={s.key}
            prefix={prefix}
            {...pose}
            op={pose.op * cfg.alpha * spot}
            glow={glow}
          />
        );
      })}
    </g>
  );
};
