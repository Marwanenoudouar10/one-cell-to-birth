import React from "react";
import { C } from "../../theme/colors";
import { P, lerpPt, smooth } from "./geom";
import { Body } from "./rig";

// Face details in head-local space (face looks toward +x). Eyelids are fused
// at both 12 and 20 weeks, so the eye is a closed lid over a soft socket.
export const Face: React.FC<{ b: Body }> = ({ b }) => {
  const m = b.mHead;
  const eye = lerpPt(P(86, 6), P(90, 8), m);
  const ear = lerpPt(P(-6, 50), P(-14, 30), m);
  const ex = eye.x;
  const ey = eye.y;
  const earOuter = smooth([
    P(ear.x + 4, ear.y - 18), P(ear.x + 13, ear.y - 8), P(ear.x + 12, ear.y + 8),
    P(ear.x + 3, ear.y + 18), P(ear.x - 7, ear.y + 12), P(ear.x - 10, ear.y - 4), P(ear.x - 6, ear.y - 15),
  ]);
  return (
    <g transform={`translate(${b.headO.x} ${b.headO.y}) rotate(${b.headRot}) scale(${b.headS})`}>
      {/* cheek warmth + brow light */}
      <ellipse cx={ex - 4} cy={ey + 34} rx={24} ry={14} fill={C.rose} opacity={0.22} filter="url(#s4-glow)" />
      <ellipse cx={ex + 10} cy={ey - 24} rx={30} ry={12} fill={C.skin} opacity={0.55} filter="url(#s4-glow)" />

      {/* eye: socket shade, fused lid line, tiny lid highlight */}
      <ellipse cx={ex} cy={ey} rx={17} ry={11} fill={C.skinShade} opacity={0.55} filter="url(#s4-sh)" />
      <path
        d={`M${ex - 13},${ey - 1} Q${ex},${ey + 9} ${ex + 13},${ey + 2}`}
        fill="none"
        stroke={C.wombDeep}
        strokeOpacity={0.8}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
      <path
        d={`M${ex - 9},${ey - 5} Q${ex},${ey + 1} ${ex + 9},${ey - 3}`}
        fill="none"
        stroke={C.skin}
        strokeOpacity={0.7}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* nostril + mouth line */}
      <ellipse cx={125} cy={lerpPt(P(0, 33), P(0, 37), m).y} rx={3} ry={2.2} fill={C.wombDeep} opacity={0.45} />
      <path
        d={`M${121},${lerpPt(P(0, 52), P(0, 57), m).y} q-6,2 -12,1`}
        fill="none"
        stroke={C.wombDeep}
        strokeOpacity={0.5}
        strokeWidth={2.2}
        strokeLinecap="round"
      />

      {/* ear (sits low at 12 weeks, rises by 20) */}
      <path d={earOuter} fill={C.skinShade} opacity={0.75} />
      <path
        d={`M${ear.x + 2},${ear.y - 10} q8,6 3,16 q-4,4 -8,-1`}
        fill="none"
        stroke={C.womb}
        strokeOpacity={0.55}
        strokeWidth={2.4}
        strokeLinecap="round"
      />

      {/* soft specular on the crown: thin, translucent skin */}
      <ellipse cx={-28} cy={-66} rx={52} ry={26} transform="rotate(-28 -28 -66)" fill={C.text} opacity={0.22} filter="url(#s4-glow)" />
    </g>
  );
};
