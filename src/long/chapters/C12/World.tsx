// The womb world of C12 (womb kit, mid look leaning late) with the fetus kit
// at weeks 21 -> 27. Two cameras: the far backdrop zooms gently, the sac plane
// (fluid, fetus) takes the full push into the eye.
import React from "react";
import { Freeze, useCurrentFrame } from "remotion";
import { Fetus, fetusAnchors } from "../../../shared/fetus";
import {
  AmnioticSac, Camera, CordShape, FluidSpecks, LightShafts, Placenta, WombBackdrop, WombLayer, WOMB_LOOKS, mixLook,
  placentaPort,
} from "../../../shared/womb";
import { heartbeat } from "../../../lib/ease";
import { Shot } from "./camera";
import { FX, FY, SIZE, kitWeek, poseAt } from "./rig";

export const LOOK = mixLook(WOMB_LOOKS.mid, WOMB_LOOKS.late, 0.22);
const SAC = { ...LOOK.sac, cx: 540, cy: 850, r: 410 };
const WALL_CLOCK0 = 370; // C11's wall clock at its f270 = our frame 0

// The kit's own eye stays sealed (eyeOpen 0): the close-up eye is MacroEye's.
type Props = { shot: Shot; behind?: React.ReactNode; front?: React.ReactNode };

export const World: React.FC<Props> = ({ shot, behind, front }) => {
  const f = useCurrentFrame();
  const week = kitWeek(f);
  const pose = poseAt(f, 0);
  const a = fetusAnchors(week, pose, SIZE);
  const port = placentaPort(SAC, LOOK.placenta.at, LOOK.placenta.size);
  const far = 1 - shot.ecu; // specks and shafts fade as we go macro
  const cam = { x: shot.x, y: shot.y, rot: shot.rot, anchor: shot.anchor, seed: "c12-cam" };
  return (
    <>
      <Camera {...cam} zoom={shot.backZoom}>
        {/* the wall keeps breathing on C11's running clock (384 at C11 f284 = our f14),
            same folds as C11's wall (its seed, centre and radius) under the focus pull */}
        <Freeze frame={WALL_CLOCK0 + f}>
          <WombBackdrop {...LOOK.backdrop} cx={540} cy={860} r={444} breathe={1} seed="c11-bd" />
        </Freeze>
      </Camera>
      <Camera {...cam} zoom={shot.zoom}>
        <AmnioticSac {...SAC} seed="c12-sac">
          <LightShafts intensity={LOOK.shafts.intensity * (0.5 + 0.5 * far)} seed="c12-shafts" />
          {far > 0.01 && <FluidSpecks seed="c12-far" count={22} opacity={far} />}
          <Placenta {...LOOK.placenta} />
          {behind}
          <WombLayer>
            <g transform={`translate(${FX} ${FY})`}>
              <Fetus
                week={week}
                size={SIZE}
                pose={pose}
                uid="c12"
                heartbeat={heartbeat(f, 150)}
                cord={
                  <CordShape
                    from={a.navel}
                    to={{ x: port.x - FX, y: port.y - FY }}
                    slack={0.45}
                    side={1}
                    twist={1}
                    pulse={0.5}
                    bpm={150}
                    width={LOOK.cordWidth}
                    sway={1}
                    seed="c12-cord"
                    frame={f}
                  />
                }
              />
            </g>
          </WombLayer>
          {front}
          {far > 0.01 && <FluidSpecks seed="c12-near" layer="near" count={8} opacity={0.8 * far} />}
        </AmnioticSac>
      </Camera>
    </>
  );
};
