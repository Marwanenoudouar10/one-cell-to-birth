// Skin details that change with age, drawn in rig space and clipped to the
// body: inner glow + vessels (translucent early), visible heart (very early),
// fine wrinkles (22-26 wk), fat creases (32 wk+), vernix (20-38 wk) and the
// lanugo fuzz along the backlit outline (16-32 wk). All kept subtle.
import React from "react";
import { C } from "../../theme/colors";
import { Pt, add, mul, smooth, sub, unit } from "./geom";
import { FetusGeom } from "./rig";
import { Ids, url } from "./Defs";

// vessels in spine coords: [u along neck->rump, w across: +1 belly, -1 back]
const VESSELS: [number, number][][] = [
  [[0.18, 0.62], [0.3, 0.32], [0.42, 0.1], [0.56, -0.16], [0.66, -0.3]],
  [[0.3, 0.32], [0.36, 0.56], [0.46, 0.76]],
  [[0.5, 0.72], [0.58, 0.42], [0.67, 0.2], [0.8, 0.04]],
  [[0.58, 0.42], [0.65, 0.66]],
  [[0.12, -0.18], [0.26, -0.44], [0.4, -0.56]],
  [[0.56, -0.16], [0.7, -0.5], [0.84, -0.44]],
  [[0.7, -0.5], [0.78, -0.74]],
];
// fine skin folds (22-26 wk): [u, w start, w end]
const WRINKLES: [number, number, number][] = [
  [0.47, 0.58, 0.9], [0.555, 0.66, 0.93], [0.64, 0.55, 0.86], [0.08, -0.4, -0.8], [0.175, -0.5, -0.82], [0.3, -0.62, -0.88],
];

// Inside the torso: inner glow, spine, vessels, heart, wrinkles, vernix.
export const TorsoDetail: React.FC<{ geo: FetusGeom; ids: Ids; heartbeat: number }> = ({ geo, ids, heartbeat }) => {
  const { g, sp } = geo;
  const at = ([u, w]: [number, number]) => sp.pos(u, w);
  const spine = smooth(sp.backLine, false);
  const tr = g.translucency;
  const heartA = Math.max(0, (tr - 0.45) / 0.55);
  return (
    <g clipPath={url(ids.cTorso)}>
      <path d={geo.torso} fill="none" stroke={C.rose} strokeWidth={26} filter={url(ids.glow)} opacity={0.2 + 0.4 * tr} />
      <path d={spine} fill="none" stroke={C.skinShade} strokeWidth={14} strokeLinecap="round" filter={url(ids.sh)} opacity={0.12 + 0.3 * tr} />
      <path d={spine} fill="none" stroke={C.skinShade} strokeWidth={7} strokeLinecap="round" strokeDasharray="1 11"
        filter={url(ids.soft)} opacity={0.12 + 0.36 * tr} />
      {g.vessels > 0.01 && (
        <g fill="none" strokeLinecap="round" opacity={g.vessels} filter={url(ids.fine)}>
          {VESSELS.map((v, i) => (
            <path key={i} d={smooth(v.map(at), false)} stroke={i % 3 === 1 ? C.womb : C.heart} strokeOpacity={0.15} strokeWidth={i % 2 ? 1.6 : 2.2} />
          ))}
        </g>
      )}
      {heartA > 0.01 && (
        <circle cx={geo.heart.x} cy={geo.heart.y} r={0.2 * g.L * (1 + 0.08 * heartbeat)} fill={url(ids.heartG)}
          opacity={heartA * (0.12 + 0.4 * heartbeat)} />
      )}
      {g.wrinkle > 0.01 && (
        <g fill="none" strokeLinecap="round" opacity={g.wrinkle}>
          {WRINKLES.map(([u, w0, w1], i) => {
            // a fold = soft shadow line + a faint lit lip just above it
            const d = smooth([at([u, w0]), at([u + 0.014, (w0 + w1) / 2]), at([u + 0.004, w1])], false);
            const d2 = smooth([at([u - 0.012, w0 + 0.05]), at([u + 0.002, (w0 + w1) / 2]), at([u - 0.008, w1 - 0.03])], false);
            return (
              <g key={i}>
                <path d={d} stroke={C.skinShade} strokeOpacity={0.3} strokeWidth={2.4} filter={url(ids.fine)} />
                <path d={d2} stroke={C.skin} strokeOpacity={0.35} strokeWidth={1.8} filter={url(ids.fine)} />
              </g>
            );
          })}
        </g>
      )}
      {g.fat > 0.01 && (
        <g fill="none" stroke={C.skinShade} strokeOpacity={0.4 * g.fat} strokeWidth={3.2} strokeLinecap="round">
          <path d={smooth([at([0.05, 0.2]), at([0.07, 0.55]), at([0.05, 0.9])], false)} />
          <path d={smooth([at([0.82, 0.55]), at([0.86, 0.75]), at([0.84, 0.95])], false)} />
        </g>
      )}
      {g.vernix > 0.01 && (
        <g opacity={g.vernix}>
          {[[0.32, -0.86, 0.09], [0.62, -0.92, 0.08], [0.06, 0.55, 0.07], [0.86, 0.6, 0.06]].map(([u, w, r], i) => {
            const c = sp.pos(u, w);
            return <circle key={i} cx={c.x} cy={c.y} r={r * g.L} fill={url(ids.vernixG)} opacity={0.3} />;
          })}
          <path d={spine} fill="none" stroke={C.text} strokeOpacity={0.12} strokeWidth={10} filter={url(ids.glow)} />
        </g>
      )}
    </g>
  );
};

// Fat creases on the near arm / leg (wrist, elbow, ankle, knee), 28 wk+.
export const LimbDetail: React.FC<{ geo: FetusGeom; ids: Ids; part: "arm" | "leg" }> = ({ geo, ids, part }) => {
  const { g } = geo;
  if (g.fat < 0.01) return null;
  const ring = (a: Pt, b: Pt, t: number, r: number) => {
    const c = add(a, mul(sub(b, a), t));
    const d = unit(sub(b, a));
    const n = { x: -d.y, y: d.x };
    return smooth([add(c, mul(n, -r * 0.85)), add(add(c, mul(d, r * 0.18)), mul(n, 0)), add(c, mul(n, r * 0.85))], false);
  };
  const lines: string[] = [];
  if (part === "arm") {
    const { shoulder, elbow, wrist, r } = geo.arm;
    lines.push(ring(elbow, wrist, 0.86, r[2]), ring(shoulder, elbow, 0.92, r[1]));
  } else {
    const { hip, knee, ankle, r } = geo.leg;
    lines.push(ring(knee, ankle, 0.86, r[2]), ring(hip, knee, 0.9, r[1]));
  }
  return (
    <g clipPath={url(part === "arm" ? ids.cArm : ids.cLeg)} fill="none" strokeLinecap="round">
      <g stroke={C.skinShade} strokeOpacity={0.45 * g.fat} strokeWidth={3}>
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
};

// Fine backlit fuzz (lanugo) along the back and the crown.
export const Lanugo: React.FC<{ geo: FetusGeom; ids: Ids }> = ({ geo, ids }) => {
  const a = geo.g.lanugo;
  if (a < 0.01) return null;
  const back = [0.04, 0.14, 0.28, 0.44, 0.6, 0.74, 0.86].map((u) => geo.sp.pos(u, -1.01));
  const crown = geo.headPts.slice(0, 7);
  const paths = [smooth(back, false), smooth(crown, false)];
  // a soft backlit glow hugging the outline, with a faint hair texture in it
  return (
    <g fill="none" strokeLinecap="round" opacity={a}>
      <g stroke={C.peach} strokeWidth={9} filter={url(ids.soft)} opacity={0.3}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g stroke={C.skin} strokeWidth={6} strokeDasharray="0.6 1.9" filter={url(ids.fine)} opacity={0.16}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
};

