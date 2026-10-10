import { FPS } from "./layout";

export const sec = (s: number) => Math.round(s * FPS);

// Scenes overlap by TRANSITION frames (crossfade), so the film is exactly 30s.
export const TRANSITION = 15;

export const SCENES = [
  { id: "Scene1", duration: 195 }, // the race + fertilisation
  { id: "Scene2", duration: 165 }, // cell division -> implantation
  { id: "Scene3", duration: 165 }, // week 6 heartbeat
  { id: "Scene4", duration: 225 }, // week 12 -> week 20 growth + kick
  { id: "Scene5", duration: 210 }, // week 40 birth + "Hello, world."
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

// Global start frame of each scene, accounting for overlaps.
export const SCENE_START: Record<SceneId, number> = (() => {
  const out = {} as Record<SceneId, number>;
  let t = 0;
  for (const s of SCENES) {
    out[s.id] = t;
    t += s.duration - TRANSITION;
  }
  return out;
})();

export const TOTAL_FRAMES =
  SCENES.reduce((a, s) => a + s.duration, 0) - TRANSITION * (SCENES.length - 1);
