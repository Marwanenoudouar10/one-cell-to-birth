// A <mask> that covers the baby's torso (+ the near arm, seen "through" in
// x-ray mode) but not the head, hand or legs in front of it. LOCAL px, for
// layers drawn inside the translate(BABY) group: the chest x-ray and the
// breath glow. Pass a unique id per use.
import React from "react";
import { BabyState } from "./baby";

export const TorsoMask: React.FC<{ id: string; b: BabyState; arm?: boolean }> = ({ id, b, arm = true }) => {
  const { geo, fr } = b;
  const h = geo.arm.hand;
  const ft = geo.leg.foot;
  const holes = [geo.head, h.palm, h.thumb, ...h.fingers, geo.leg.path, ft.sole, ...ft.toes, ...(arm ? [] : [geo.arm.path])];
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x={-900} y={-900} width={1800} height={1800}>
      <g transform={fr.css}>
        <path d={geo.torso} fill="#fff" />
        {arm && <path d={geo.arm.path} fill="#fff" />}
        {holes.map((d, i) => (
          <path key={i} d={d} fill="#000" />
        ))}
      </g>
    </mask>
  );
};
