import React from "react";
import { C } from "../../../theme/colors";
import { YolkSac } from "../../../shared/embryo";
import { smoothPath } from "../../../shared/embryo/math";
import { yolkAt } from "./view";

// The kit's yolk sac, as a sphere cut by the disc's bottom face: the disc is
// the shared wall between the amnion (above) and the yolk sac (below). The
// part above the cut is masked away with a soft edge (so its halo never shows
// a hard line). After the swap the kit's free-hanging sac is drawn unmasked.
type Yolk = ReturnType<typeof yolkAt>;

// Before the swap it is a soft, see-through warm bubble (context, like the amnion
// above); it firms up into the kit's solid sac while it shrinks onto the stalk.
export const Yolk: React.FC<{ y: Yolk; shade: number; glow: number; opacity: number }> = ({ y, shade, glow, opacity }) => {
  const sac = <YolkSac x={y.x} y={y.y} r={y.r} glow={glow} opacity={opacity} id="c05" />;
  if (y.swapT >= 1) return sac;
  const { cut } = y;
  const arc = [];
  for (let i = 0; i <= 24; i++) {
    const th = Math.PI * (1 - i / 24);
    arc.push({ x: cut.x + cut.rx * Math.cos(th), y: cut.y - cut.ry * Math.sin(th) });
  }
  const W = 1400;
  const d = `${smoothPath(arc, false)} L${cut.x + W},${cut.y} L${cut.x + W},${cut.y + 2400} L${cut.x - W},${cut.y + 2400} L${cut.x - W},${cut.y} Z`;
  return (
    <g>
      <defs>
        <filter id="c05-yolk-feather" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient id="c05-yolk-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.womb} stopOpacity={0} />
          <stop offset="0.5" stopColor={C.womb} stopOpacity={0.3} />
          <stop offset="1" stopColor={C.wombDeep} stopOpacity={0.8} />
        </linearGradient>
        <mask id="c05-yolk-mask" maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={7000}>
          <path d={d} fill="#fff" filter="url(#c05-yolk-feather)" />
        </mask>
      </defs>
      <g mask="url(#c05-yolk-mask)">
        {sac}
        {/* the yolk sac is context, not the subject: it sinks into its own darker
            tone (multiply, same warm hue) so the disc stays the brightest thing */}
        {shade > 0.01 && <circle cx={y.x} cy={y.y} r={y.r} fill="url(#c05-yolk-shade)" opacity={shade} style={{ mixBlendMode: "multiply" }} />}
      </g>
    </g>
  );
};
