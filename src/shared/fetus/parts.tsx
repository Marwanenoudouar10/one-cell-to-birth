// Small drawing pieces shared by <Fetus>: hand, foot, contact shadow.
import React from "react";
import { C } from "../../theme/colors";
import { Pt } from "./geom";
import { Foot, Hand } from "./handFoot";
import { Ids, url } from "./Defs";

export const HandShape: React.FC<{ h: Hand; fill: string; edge: string; sep: number }> = ({ h, fill, edge, sep }) => (
  <g fill={fill}>
    {h.web && <path d={h.web} opacity={1 - sep} />}
    <path d={h.thumb} stroke={edge} strokeWidth={1.4} />
    {h.fingers.map((d, i) => (
      <path key={i} d={d} stroke={edge} strokeWidth={1.4 * sep + 0.4} />
    ))}
    <path d={h.palm} />
    {h.web && <path d={h.web} opacity={(1 - sep) * 0.85} />}
  </g>
);

export const FootShape: React.FC<{ f: Foot; fill: string; edge: string; pads?: boolean; sep: number; padId?: string }> = ({
  f, fill, edge, pads, sep, padId,
}) => (
  <g fill={fill}>
    <path d={f.sole} />
    {pads &&
      f.pads.map((p, i) => (
        <ellipse key={i} cx={p.c.x} cy={p.c.y} rx={p.rx} ry={p.ry} transform={`rotate(${p.rot} ${p.c.x} ${p.c.y})`}
          fill={C.skin} opacity={0.55} filter={padId ? url(padId) : undefined} />
      ))}
    {f.toes.map((d, i) => (
      <path key={i} d={d} stroke={edge} strokeWidth={1.3 * sep + 0.3} />
    ))}
    {f.web && <path d={f.web} opacity={(1 - sep) * 0.9} />}
  </g>
);

// Contact shadow cast by `d` onto the receiver clip, soft and offset toward
// the lower right of the screen (off is already converted to rig space).
export const Shadow: React.FC<{ ids: Ids; clip: string; d: string[]; off: Pt; o?: number; mask?: string }> = ({
  ids, clip, d, off, o = 0.5, mask,
}) => (
  <g clipPath={url(clip)}>
    <g mask={mask}>
      <g filter={url(ids.sh)} opacity={o} transform={`translate(${off.x} ${off.y})`}>
        {d.map((p, i) => (
          <path key={i} d={p} fill={C.wombDeep} />
        ))}
      </g>
    </g>
  </g>
);

// Key-light edge on a limb: its outline as a soft bright stroke, pushed
// away from the light and clipped, so only the upper-left inner edge glows.
export const LimbLight: React.FC<{ ids: Ids; clip: string; d: string; off: Pt; o?: number; mask?: string }> = ({
  ids, clip, d, off, o = 0.55, mask,
}) => (
  <g clipPath={url(clip)}>
    <g mask={mask}>
      <path d={d} fill="none" stroke={C.skin} strokeWidth={10} filter={url(ids.glow)} opacity={o}
        transform={`translate(${off.x} ${off.y})`} />
    </g>
  </g>
);
