import React from "react";
import { C } from "../../theme/colors";
import { Pt, lerp, lerpPt } from "./math";
import { Blob, HEAD_FEATURES, Rig } from "./rig";
import { Stage } from "./stage";

// Head features in head-local coords (origin = head centre, +x = Scene3 head
// axis, which points down-right toward the face; head ellipse 76 x 65). The
// group rides the head transform; each mark is counter-rotated to stay upright.

const E6 = HEAD_FEATURES.eye; // Scene3 eye
const E8 = { x: E6.x + 9, y: E6.y - 6 }; // eyes drift forward as the face forms
const NOSE = { x: 74, y: -4 };
const LIP = { x: 72, y: 13 };
const CHIN = { x: 67, y: 28 };
const EAR = { x: 16, y: 34 };

export const eyeLocal = (st: Stage): Pt => lerpPt(E6, E8, st.face);

// Extra silhouette prominences (nose, upper lip, chin) for the skin union, head-local.
export const faceBlobs = (st: Stage): Blob[] => {
  const f = st.face;
  if (f < 0.01) return [];
  return [
    { x: NOSE.x - 5 + 5 * f, y: NOSE.y, rx: 7 * f, ry: 6.5 * f, rot: 0 },
    { x: LIP.x - 4 + 4 * f, y: LIP.y, rx: 7 * f, ry: 5.5 * f, rot: 20 },
    { x: CHIN.x - 4 + 4 * f, y: CHIN.y, rx: 10 * f, ry: 8 * f, rot: 30 },
  ];
};

// Scene3's face prominence shrinks back as the real face forms (no snout).
export const faceScale = (st: Stage) => 1 - 0.3 * st.face;

export const headTransform = (rig: Rig, at: Pt, spin = 0) => `translate(${at.x} ${at.y}) rotate(${rig.head.rot + spin}) scale(${rig.head.s})`;

type Props = { st: Stage; uid: string; headRot: number };

export const Face: React.FC<Props> = ({ st, uid, headRot }) => {
  const e = eyeLocal(st);
  const dark = st.eyeDark;
  const er = lerp(12, 10, st.face);
  const lid = st.lids;
  const up = (p: Pt) => `rotate(${-headRot} ${p.x} ${p.y})`; // screen-upright around p
  return (
    <g>
      {st.eye > 0.01 && (
        <g opacity={st.eye} transform={up(e)}>
          <ellipse cx={e.x} cy={e.y} rx={er} ry={er * 1.08} fill={`url(#${uid}-eye)`} opacity={1 - 0.5 * dark} />
          {dark > 0.01 && (
            <g opacity={dark}>
              <ellipse cx={e.x} cy={e.y} rx={er * 0.8} ry={er * 0.84} fill={`url(#${uid}-iris)`} />
              <circle cx={e.x - er * 0.18} cy={e.y - er * 0.36} r={er * 0.17} fill={C.text} opacity={0.55 * (1 - 0.75 * lid)} />
            </g>
          )}
          {lid > 0.01 && (
            <g opacity={lid}>
              {/* lid folds grow over the eye from above and below */}
              <path
                d={`M${e.x - er * 1.2},${e.y - er * 0.1} Q${e.x - er * 0.1},${e.y - er * (1.6 - 0.55 * lid)} ${e.x + er * 1.15},${e.y - er * 0.2}`}
                fill="none"
                stroke={C.skin}
                strokeOpacity={0.9}
                strokeWidth={3.6}
                strokeLinecap="round"
              />
              <path
                d={`M${e.x - er * 0.9},${e.y + er * 0.75} Q${e.x},${e.y + er * 1.25} ${e.x + er * 0.95},${e.y + er * 0.65}`}
                fill="none"
                stroke={C.skinShade}
                strokeOpacity={0.6}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
      )}
      {st.face > 0.01 && (
        <g opacity={st.face}>
          {/* nostril and the soft line between the lips, kept small and upright */}
          <ellipse cx={NOSE.x + 3} cy={NOSE.y + 5} rx={2.4} ry={1.7} transform={up({ x: NOSE.x + 3, y: NOSE.y + 5 })} fill={C.wombDeep} opacity={0.4} />
          <path
            d={`M${LIP.x - 7},${LIP.y + 6} q5,2.5 9,1`}
            transform={up(LIP)}
            fill="none"
            stroke={C.wombDeep}
            strokeOpacity={0.45}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}
      {st.ear > 0.01 && (
        <g opacity={st.ear * 0.85} transform={up(EAR)}>
          {/* auricle forming low on the side of the head: a soft C open to the front */}
          <ellipse cx={EAR.x} cy={EAR.y} rx={9} ry={12} fill={C.skinShade} opacity={0.32} />
          <path d={`M${EAR.x + 4},${EAR.y - 10} q-10,0 -10,10 q0,10 9,11`} fill="none" stroke={C.womb} strokeOpacity={0.5} strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${EAR.x + 2},${EAR.y - 3} q-4,2 -2,6`} fill="none" stroke={C.womb} strokeOpacity={0.35} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
