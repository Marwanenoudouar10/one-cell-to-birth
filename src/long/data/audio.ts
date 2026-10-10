/**
 * Clip lists for <SoundtrackLong />. Paths are inside /public, `at` is GLOBAL seconds.
 * LONG_VOICE is built from the voice take (voTiming.ts, generated): one clip per chapter.
 * Music and effects get added in the final mix. To hang a sound off a chapter beat use
 * toGlobalSec(chapterId, localSec), e.g. { src: "sfx/pop.wav", at: toGlobalSec("C03", 2.4) }.
 * (A chapter may also play its own <Audio> inside its component, in local time.)
 */
import type { LongClip } from "../overlays/SoundtrackLong";
import { ChapterId, toGlobalSec } from "../chapters";
import { VO_TIMING } from "./voTiming";

export const LONG_MUSIC: LongClip[] = [];
export const LONG_SFX: LongClip[] = [];
export const LONG_VOICE: LongClip[] = Object.entries(VO_TIMING).map(([id, t]) => ({
  src: t.src,
  at: toGlobalSec(id as ChapterId, t.clipAt),
}));
