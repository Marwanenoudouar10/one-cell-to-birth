/**
 * Soundtrack for the long film, driven by clip lists (no imports of teaser audio).
 *
 *   <SoundtrackLong music={LONG_MUSIC} sfx={LONG_SFX} voice={LONG_VOICE} />
 *     each list: LongClip[] = { src: path inside /public, at: GLOBAL seconds, volume? }
 *     default volumes: music 0.35, sfx 0.6, voice 1 (a clip's own volume wins)
 * Mount at film level (frame 0 = film start).
 */
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FPS } from "../../theme/layout";

export type LongClip = { src: string; at: number; volume?: number };

const Layer: React.FC<{ clips: readonly LongClip[]; base: number }> = ({ clips, base }) => (
  <>
    {clips.map((c) => (
      <Sequence key={`${c.src}@${c.at}`} from={Math.round(c.at * FPS)} layout="none">
        <Audio src={staticFile(c.src)} volume={c.volume ?? base} />
      </Sequence>
    ))}
  </>
);

export const SoundtrackLong: React.FC<{
  music?: readonly LongClip[];
  sfx?: readonly LongClip[];
  voice?: readonly LongClip[];
}> = ({ music = [], sfx = [], voice = [] }) => (
  <>
    <Layer clips={music} base={0.35} />
    <Layer clips={sfx} base={0.6} />
    <Layer clips={voice} base={1} />
  </>
);
