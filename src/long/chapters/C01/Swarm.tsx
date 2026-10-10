import React from "react";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { layerXf, xfAttr } from "./camera";
import { LAYER, LayerId } from "./constants";
import { SpermPose, SpermShape, TAIL } from "./Sperm";
import { streamPose } from "./stream";
import { STREAM } from "./streamSpecs";
import { SURVIVORS, survivorPose } from "./survivors";

// One depth layer of the swarm inside its own parallax transform. The mid
// layer also carries the survivors (their poses are in egg-plane units).
export const SwarmLayer: React.FC<{ layer: LayerId; frame: number }> = ({ layer, frame }) => {
  const cfg = LAYER[layer];
  const L = layerXf(frame, cfg.p);
  const prefix = `c01-${layer}-`;
  const items: { key: string; pose: SpermPose | null; base: number }[] = STREAM[layer].map((s) => ({
    key: s.key,
    pose: streamPose(s, frame),
    base: cfg.alpha,
  }));
  if (layer === "mid") for (const sv of SURVIVORS) items.push({ key: sv.st.key, pose: survivorPose(sv, frame), base: 1 });
  return (
    <g transform={xfAttr(L)}>
      {items.map(({ key, pose, base }) => {
        if (!pose || pose.op * base < 0.01) return null;
        // cull anything fully off-screen (head + full tail length margin)
        const sx = L.ox + pose.x * L.zL;
        const sy = L.oy + pose.y * L.zL;
        const m = pose.size * L.zL * (TAIL + 2);
        if (sx < -m || sx > WIDTH + m || sy < -m || sy > HEIGHT + m) return null;
        return <SpermShape key={key} prefix={prefix} glow={cfg.glow} {...pose} op={pose.op * base} />;
      })}
    </g>
  );
};
