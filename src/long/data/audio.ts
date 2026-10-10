/**
 * Clip lists for <SoundtrackLong />. Paths are inside /public, `at` is GLOBAL seconds.
 * Empty until the long VO / music exist. To hang a sound off a chapter beat use
 * toGlobalSec(chapterId, localSec), e.g. { src: "sfx/pop.wav", at: toGlobalSec("C03", 2.4) }.
 * (A chapter may also play its own <Audio> inside its component, in local time.)
 */
import type { LongClip } from "../overlays/SoundtrackLong";

export const LONG_MUSIC: LongClip[] = [];
export const LONG_SFX: LongClip[] = [];
export const LONG_VOICE: LongClip[] = [];
