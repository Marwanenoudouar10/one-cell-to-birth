/**
 * transitionFor(kind) -> { presentation, timing } for <TransitionSeries.Transition>,
 * or null for "cut" (chapters simply butt together, no overlap).
 *   "fade"   plain crossfade, outgoing shot stays opaque underneath (match cuts)
 *   "focus"  focus pull: old shot defocuses + drifts, new one pulls into focus (EASE.inOut)
 * Both reuse src/lib/focusPull.tsx (same look as the teaser) and last LONG_TRANSITION frames.
 */
import { linearTiming } from "@remotion/transitions";
import { EASE } from "../../lib/ease";
import { focusPull } from "../../lib/focusPull";
import { LONG_TRANSITION, TransitionKind } from "../chapters";

export const transitionFor = (kind: TransitionKind) => {
  if (kind === "cut") return null;
  if (kind === "fade") {
    return {
      presentation: focusPull({ blur: 0, zoom: 0 }),
      timing: linearTiming({ durationInFrames: LONG_TRANSITION }),
    };
  }
  return {
    presentation: focusPull({ blur: 18, zoom: 0.04 }),
    timing: linearTiming({ durationInFrames: LONG_TRANSITION, easing: EASE.inOut }),
  };
};
