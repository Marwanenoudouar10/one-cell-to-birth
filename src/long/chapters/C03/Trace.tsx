import React from "react";
import { C } from "../../../theme/colors";
import { EASE, tween } from "../../../lib/ease";
import { arc } from "./Zona";
import { B, ZR, traceAt, traceOp } from "./timeline";

// "But it doesn't grow": a faint dashed circle traces the zona ring (whose
// size has not changed) while a highlight sweeps around with its head. It
// closes on "grow", gives one soft pulse, then holds as a quiet reference
// while the cascade makes every cell smaller. A graphic, never a label.
export const TRACE_R = ZR + 12;
const A0 = -90; // starts at the top, runs clockwise

export const traceHead = (f: number) => {
  const p = traceAt(f);
  const on = tween(f, B.hold + 2, B.hold + 6) * (1 - tween(f, B.grow, B.grow + 12, [0, 1], EASE.inOut));
  return { ang: A0 + 360 * p, glint: on, p };
};

const ringPath = (r: number, p: number) => {
  const sweep = 360 * Math.min(1, p);
  if (sweep < 0.5) return "";
  if (sweep <= 180) return arc(r, A0, A0 + sweep);
  // two arcs so a full circle stays a valid path; the dash pattern runs on
  return `${arc(r, A0, A0 + 180)}${arc(r, A0 + 180, A0 + sweep).replace(/^M[^A]+/, "")}`;
};

export const Trace: React.FC<{ f: number }> = ({ f }) => {
  const o = traceOp(f);
  if (o <= 0.01) return null;
  const { ang, glint, p } = traceHead(f);
  const pulse = tween(f, B.grow - 1, B.grow + 3, [0, 1], EASE.out) * (1 - tween(f, B.grow + 3, B.grow + 22, [0, 1], EASE.inOut));
  const d = ringPath(TRACE_R, p);
  const hx = Math.cos((ang * Math.PI) / 180) * TRACE_R;
  const hy = Math.sin((ang * Math.PI) / 180) * TRACE_R;
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id="c03t-head">
          <stop offset={0} stopColor={C.text} stopOpacity={1} />
          <stop offset={0.3} stopColor={C.gold} stopOpacity={0.55} />
          <stop offset={1} stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {d && (
        <>
          <path
            d={d}
            fill="none"
            stroke={C.text}
            strokeOpacity={0.55 + 0.4 * pulse}
            strokeWidth={4 + 1.6 * pulse}
            strokeDasharray="12 13"
            strokeLinecap="round"
          />
        </>
      )}
      {glint > 0.01 && (
        <>
          <circle cx={hx} cy={hy} r={46} fill="url(#c03t-head)" opacity={glint * 0.35} />
          <circle cx={hx} cy={hy} r={20} fill="url(#c03t-head)" opacity={glint} />
          <circle cx={hx} cy={hy} r={3.2} fill={C.text} opacity={glint} />
        </>
      )}
    </g>
  );
};
