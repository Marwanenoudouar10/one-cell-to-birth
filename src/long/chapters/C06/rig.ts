// Per-frame embryo placement + the anchors every C06 layer lines up with.
// (restBody / centreOf are read from the kit's anchors module: the tube overlay
// needs the kit's body outline and heart rotation, which index.ts doesn't export.)
import { embryoAnchors, stageFor, yolkSuggest } from "../../../shared/embryo";
import { centreOf, restBody } from "../../../shared/embryo/anchors";
import { embryoFloat, kitWeek, placeAt } from "./motion";

export const embryoRig = (f: number) => {
  const w = kitWeek(f);
  const pl = placeAt(w);
  const fl = embryoFloat(f);
  const place = { x: pl.x + fl.dx, y: pl.y + fl.dy, rotate: fl.rot };
  const a = embryoAnchors(w, pl.size, place);
  const yolk = yolkSuggest(w, pl.size, place);
  // rest pose (no float): the camera aims at this heart, like Scene3's `target`
  const rest = embryoAnchors(w, pl.size, { x: pl.x, y: pl.y });
  const st = stageFor(w, fl.rot);
  // the kit draws its heart rotated by cardiac.rot + spin, scaled by bulge
  const body = restBody(w, fl.rot);
  const heartRot = body.rig.cardiac.rot + st.spin;
  const ctr = centreOf(w, fl.rot);
  const k = pl.size / 280;
  // design units -> world px, exactly like <Embryo>'s placement
  const toWorld = `translate(${place.x} ${place.y}) scale(${k}) translate(${-ctr.x} ${-ctr.y})`;
  return { w, size: pl.size, k, place, a, rest, yolk, bulge: st.bulge, heartRot, body, toWorld };
};

export type EmbryoRig = ReturnType<typeof embryoRig>;
