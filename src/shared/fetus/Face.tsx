// Face + scalp details, drawn in head-local space (face toward +x), clipped
// to the head. Eyelids stay fused until ~26 wk; from then `eyeOpen` opens
// them. Early weeks show the dark pigmented eye through the thin lid and
// faint scalp vessels; late weeks get brows, fuller lips and a hair hint.
import React from "react";
import { C } from "../../theme/colors";
import { lerp, smooth } from "./geom";
import { FetusGeom } from "./rig";
import { HAIR, SCALP_VESSELS } from "./headShapes";
import { Ids, url } from "./Defs";

export const Face: React.FC<{ geo: FetusGeom; ids: Ids }> = ({ geo, ids }) => {
  const { g, p, lm } = geo;
  const e = p.expression;
  const smile = Math.max(0, e);
  const frown = Math.max(0, -e);
  const open = p.eyeOpen * g.lidOpenable;
  const { x: ex, y: ey } = lm.eye;
  const { x: mx, y: my } = lm.mouth;
  const ear = lm.ear;
  const es = lerp(0.82, 1.12, g.earRise) * (1 + 0.06 * g.fat);
  const earOuter = smooth(
    [[4, -18], [13, -8], [12, 8], [3, 18], [-7, 12], [-10, -4], [-6, -15]].map(([x, y]) => ({ x: ear.x + x * es, y: ear.y + y * es })),
  );
  // closed lid curve; opening lifts the upper lid (an almond opens)
  const lidY = ey + 9 - 2.5 * smile;
  const upY = lerp(lidY, ey - 15, open);
  const xf = `translate(${geo.headO.x} ${geo.headO.y}) rotate(${geo.headRot}) scale(${geo.headS})`;
  const crown = smooth(geo.headPts.slice(1, 7), false);
  return (
    <g clipPath={url(ids.cHead)}>
      {g.hair > 0.01 && (
        <g fill="none" strokeLinecap="round" opacity={g.hair}>
          <path d={crown} stroke={C.wombDeep} strokeWidth={46 * geo.headS} filter={url(ids.wide)} opacity={0.18} />
          <path d={crown} stroke={C.wombDeep} strokeWidth={7 * geo.headS} strokeDasharray={`${1.2 * geo.headS} ${3.4 * geo.headS}`}
            filter={url(ids.fine)} opacity={0.28} />
        </g>
      )}
      <g transform={xf}>
        {/* scalp vessels through translucent skin (early) */}
        {g.vessels > 0.01 && (
          <g fill="none" strokeLinecap="round" opacity={g.vessels} filter={url(ids.fine)}>
            {SCALP_VESSELS.map((v, i) => (
              <path key={i} d={smooth(v, false)} stroke={i % 2 ? C.womb : C.heart} strokeOpacity={0.17} strokeWidth={i < 1 ? 2.2 : 1.5} />
            ))}
          </g>
        )}
        {/* hair hint on the crown (30 wk+) */}
        {g.hair > 0.01 && (
          <g opacity={g.hair}>
            <g fill="none" stroke={C.wombDeep} strokeOpacity={0.18} strokeWidth={1.5} strokeLinecap="round" filter={url(ids.fine)}>
              {HAIR.map((h, i) => (
                <path key={i} d={smooth(h, false)} />
              ))}
            </g>
          </g>
        )}

        {/* cheek warmth (fuller + pinker with fat), brow light */}
        <ellipse cx={lm.cheek.x - 6} cy={lm.cheek.y - 3 * smile} rx={30 + 8 * g.fat} ry={18 + 6 * g.fat} fill={url(ids.blush)} opacity={0.5 + 0.5 * g.fat + 0.3 * smile} />
        <ellipse cx={ex + 10} cy={ey - 24} rx={30} ry={12} fill={C.skin} opacity={0.5} filter={url(ids.glow)} />

        {/* eye: dark pigmented eye under thin lids (early), socket, lid */}
        {g.eyeDark > 0.01 && (
          <ellipse cx={ex - 1} cy={ey + 2} rx={16} ry={13} fill={C.wombDeep} opacity={0.5 * g.eyeDark} filter={url(ids.soft)} />
        )}
        <ellipse cx={ex} cy={ey} rx={17} ry={11} fill={C.skinShade} opacity={0.5} filter={url(ids.sh)} />
        {open > 0.01 && (
          <g>
            <clipPath id={`${ids.cHead}-eye`}>
              <path d={`M${ex - 13},${ey - 1} Q${ex},${upY} ${ex + 13},${ey + 2} Q${ex},${lidY} ${ex - 13},${ey - 1}Z`} />
            </clipPath>
            <g clipPath={`url(#${ids.cHead}-eye)`} opacity={Math.min(1, open * 1.8)}>
              <rect x={ex - 14} y={ey - 16} width={28} height={28} fill={C.text} opacity={0.9} />
              <circle cx={ex + 4} cy={ey + 1} r={8} fill={C.bg1} />
              <circle cx={ex + 6} cy={ey - 2} r={2.6} fill={C.text} opacity={0.9} />
            </g>
          </g>
        )}
        <path d={`M${ex - 13},${ey - 1} Q${ex},${upY} ${ex + 13},${ey + 2}`} fill="none" stroke={C.wombDeep}
          strokeOpacity={0.8} strokeWidth={2.8} strokeLinecap="round" />
        <path d={`M${ex - 9},${lerp(ey - 5, ey - 13, open) - 1.5 * smile} Q${ex},${lerp(ey + 1, ey - 8, open)} ${ex + 9},${lerp(ey - 3, ey - 11, open)}`}
          fill="none" stroke={C.skin} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />
        {/* brow (late): frown pulls it down and in */}
        {g.hair > 0.01 && (
          <path d={`M${ex - 12},${ey - 20 + 4 * frown} Q${ex + 2},${ey - 27 - 2 * smile} ${ex + 16},${ey - 22 + 5 * frown}`}
            fill="none" stroke={C.skinShade} strokeOpacity={0.4 * g.hair} strokeWidth={3} strokeLinecap="round" />
        )}

        {/* nostril, lips, mouth line (expression bends the corner) */}
        <ellipse cx={lm.nose.x} cy={lm.nose.y} rx={3} ry={2.2} fill={C.wombDeep} opacity={0.45} />
        <ellipse cx={mx - 2} cy={my + 1} rx={7} ry={6 + 2 * g.fat} fill={C.rose} opacity={0.12 + 0.16 * g.fat} filter={url(ids.soft)} />
        <path d={`M${mx},${my} q-6,${2 + 1.5 * smile - 1 * frown} -12,${1 - 5 * smile + 4.5 * frown}`} fill="none"
          stroke={C.wombDeep} strokeOpacity={0.5} strokeWidth={2.2} strokeLinecap="round" />
        {smile > 0.05 && (
          <path d={`M${mx - 14},${my - 6 * smile} q-4,3 -3,7`} fill="none" stroke={C.skinShade} strokeOpacity={0.35 * smile}
            strokeWidth={2} strokeLinecap="round" />
        )}

        {/* ear: low and small early, rises and grows */}
        <path d={earOuter} fill={C.skinShade} opacity={0.72} />
        <path d={`M${ear.x + 2 * es},${ear.y - 10 * es} q${8 * es},${6 * es} ${3 * es},${16 * es} q${-4 * es},${4 * es} ${-8 * es},${-1 * es}`}
          fill="none" stroke={C.womb} strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />
        {g.vernix > 0.01 && (
          <ellipse cx={ear.x - 18} cy={ear.y + 6} rx={14} ry={22} fill={url(ids.vernixG)} opacity={0.32 * g.vernix} />
        )}

      </g>
    </g>
  );
};
