import { BEATS } from "../../theme/beats";
import { SCENES, TRANSITION } from "../../theme/timing";

// Story beats (local frames) and scene length. Animate to these, never to raw numbers.
export const B = BEATS.Scene1;
export const DUR = SCENES.find((s) => s.id === "Scene1")!.duration;
export const END = DUR - TRANSITION; // handoff to Scene2 starts here

// Egg-plane world units. The camera zoom at the END is 1.5, so the zygote
// core lands at radius 150 px and the zona ring at ~175 px.
export const R = 100; // egg core (oocyte) radius
export const ZONA = R * 1.17; // outer edge of the zona pellucida
export const HEAD = (2 * R) / 20; // sperm head length: egg diameter ~ 20 heads

// Where the winning sperm meets the zona (angle in screen space, y down).
export const CONTACT_ANGLE = (118 * Math.PI) / 180;
export const CDIR = { x: Math.cos(CONTACT_ANGLE), y: Math.sin(CONTACT_ANGLE) };

// Shockwave (zona reaction) speed, world units per frame.
export const RING_V = 13;

export const ID = "s1"; // prefix for every SVG id in this scene
