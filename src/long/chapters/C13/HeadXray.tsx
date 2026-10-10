// <HeadXray>: the "translucent head" window over the shared <Fetus>. Drawn in
// the same placement (translate x,y + the kit's own rig transform) so it sits
// exactly on the kit's head; clipped to the head outline and masked to a soft
// cranium-shaped window, so the face (eye, nose, mouth) stays skin.
//   xray   0..1 window opens from the brain centre outward (and closes back)
//   press  0..1 the skull rim glows where the grown brain presses on it
import React from "react";
import { C } from "../../../theme/colors";
import type { FetusGeom } from "../../../shared/fetus/rig";
import type { OutFrame } from "../../../shared/fetus/frame";
import { Brain, BrainProps } from "./Brain";
import { BRAIN_C, CEREBELLUM, windowPath } from "./brainShape";

type Props = {
  geo: FetusGeom;
  fr: OutFrame;
  x: number;
  y: number;
  xray: number;
  press: number;
  brain: Omit<BrainProps, "uid">;
};

export const headLocalCss = (geo: FetusGeom) =>
  `translate(${geo.headO.x.toFixed(3)} ${geo.headO.y.toFixed(3)}) rotate(${geo.headRot.toFixed(3)}) scale(${geo.headS.toFixed(5)})`;

export const HeadXray: React.FC<Props> = ({ geo, fr, x, y, xray, press, brain }) => {
  if (xray <= 0.001) return null;
  const id = (n: string) => `c13-xr-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const hl = headLocalCss(geo);
  // first the brain's warm light glows through the skin, then a soft iris
  // opens out of the brain centre (and contracts back into it at the end),
  // so the head never passes through a muddy half-dark wash
  const xi = Math.max(0, Math.min(1, (xray - 0.22) / 0.78));
  const through = 0.75 * Math.sin(Math.PI * Math.min(1, xray / 0.75));
  const ws = 0.04 + 0.96 * (1 - Math.pow(1 - xi, 2.2));
  const wT = `translate(${BRAIN_C.x} ${BRAIN_C.y}) scale(${ws}) translate(${-BRAIN_C.x} ${-BRAIN_C.y})`;
  const cb = CEREBELLUM;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={fr.css}>
        <defs>
          <clipPath id={id("head")}>
            <path d={geo.head} />
          </clipPath>
          <filter id={id("feather")} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={13} />
          </filter>
          <filter id={id("rimblur")} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={7} />
          </filter>
          <mask id={id("win")} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={8000} height={8000}>
            <g transform={hl}>
              <g transform={wT} filter={url("feather")} fill="white" opacity={Math.min(1, xi * 5)}>
                <path d={windowPath(16)} />
                <ellipse cx={cb.cx} cy={cb.cy + 2} rx={cb.rx + 12} ry={cb.ry + 12} transform={`rotate(${cb.rot} ${cb.cx} ${cb.cy})`} />
              </g>
            </g>
          </mask>
          <radialGradient id={id("inner")} gradientUnits="userSpaceOnUse" cx={BRAIN_C.x} cy={BRAIN_C.y + 6} r={150}>
            <stop offset={0} stopColor={C.bg1} />
            <stop offset={0.5} stopColor={C.bg2} />
            <stop offset={0.78} stopColor={C.wombDeep} />
            <stop offset={1} stopColor={C.skinShade} stopOpacity={0.5} />
          </radialGradient>
        </defs>
        <g clipPath={url("head")}>
          {through > 0.01 && (
            <g transform={hl} filter={url("feather")} opacity={through}>
              <path d={windowPath(4)} fill={C.rose} opacity={0.55} />
              <ellipse cx={BRAIN_C.x} cy={BRAIN_C.y} rx={70} ry={50} fill={C.peach} opacity={0.6} />
              <ellipse cx={BRAIN_C.x} cy={BRAIN_C.y - 6} rx={34} ry={24} fill={C.gold} opacity={0.5} />
            </g>
          )}
          <g mask={url("win")}>
            {/* the skin goes glassy: deep translucent interior, lit skin edge */}
            <g transform={hl}>
              <rect x={-170} y={-170} width={340} height={340} fill={url("inner")} opacity={0.9} />
              <ellipse cx={BRAIN_C.x} cy={BRAIN_C.y + 8} rx={118} ry={90} fill={C.rose} opacity={0.16 + 0.1 * brain.glow} filter={url("rimblur")} />
            </g>
            <path d={geo.head} fill="none" stroke={C.peach} strokeWidth={30} opacity={0.42 + 0.35 * press} filter={url("rimblur")} />
            <path d={geo.head} fill="none" stroke={C.gold} strokeWidth={22} opacity={0.85 * press} filter={url("rimblur")} />
            <path d={geo.head} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.6 * press} />
            <path d={geo.head} fill="none" stroke={C.skin} strokeWidth={2.4} opacity={0.55} />
            <g transform={hl} opacity={Math.min(1, xi * 2.5)}>
              <Brain uid="b" {...brain} mx={fr.mx} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
};
