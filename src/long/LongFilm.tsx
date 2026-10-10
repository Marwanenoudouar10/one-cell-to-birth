/**
 * The long film (composition "Long", LONG_TOTAL frames, 1080x1920 @30fps).
 *
 *   Background (warms over the whole film)
 *   TransitionSeries of CHAPTERS (registry component or placeholder; cut/fade/focus)
 *   LongOverlays (week tracker + size chip, captions) -> Grain -> SoundtrackLong
 *
 *   <LongFilm />          no props; everything comes from chapters.ts, registry.ts, data/*
 *   <LongChapters />      just the chapter series (transparent), if you need it alone
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { Grain } from "../overlays/Grain";
import { CHAPTERS, LONG_TOTAL, chapterFrames } from "./chapters";
import { LONG_MUSIC, LONG_SFX, LONG_VOICE } from "./data/audio";
import { transitionFor } from "./lib/transitions";
import { BackgroundLong } from "./overlays/BackgroundLong";
import { LongOverlays } from "./overlays/LongOverlays";
import { SoundtrackLong } from "./overlays/SoundtrackLong";
import { chapterComponent } from "./registry";

export const LongChapters: React.FC = () => (
  <TransitionSeries>
    {CHAPTERS.map((c, i) => {
      const Chapter = chapterComponent(c.id);
      const t = i > 0 ? transitionFor(c.transition) : null;
      return (
        <React.Fragment key={c.id}>
          {t && <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} />}
          <TransitionSeries.Sequence durationInFrames={chapterFrames(c.id)} name={c.id}>
            <Chapter />
          </TransitionSeries.Sequence>
        </React.Fragment>
      );
    })}
  </TransitionSeries>
);

export const LongFilm: React.FC = () => (
  <AbsoluteFill>
    <BackgroundLong totalFrames={LONG_TOTAL} />
    <LongChapters />
    <LongOverlays />
    <Grain />
    <SoundtrackLong music={LONG_MUSIC} sfx={LONG_SFX} voice={LONG_VOICE} />
  </AbsoluteFill>
);
