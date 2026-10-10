import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { sec } from "../theme/timing";
import { Clip, MUSIC, SFX, VOICE } from "./clips";

const Layer: React.FC<{ clips: Clip[]; base: number }> = ({ clips, base }) => (
  <>
    {clips.map((c) => (
      <Sequence key={`${c.src}@${c.at}`} from={sec(c.at)} layout="none">
        <Audio src={staticFile(c.src)} volume={c.volume ?? base} />
      </Sequence>
    ))}
  </>
);

export const Soundtrack: React.FC = () => (
  <>
    <Layer clips={MUSIC} base={0.35} />
    <Layer clips={SFX} base={0.6} />
    <Layer clips={VOICE} base={1} />
  </>
);
