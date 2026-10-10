import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { CaptionShade } from "../../../shared/womb";
import { smooth } from "./geometry";
import { buildPrims } from "./prims";
import { warpAt, warpCentre } from "./warp";
import { Cells } from "./Cells";
import { BallGlow, Cavity, CoreFill, KnotBody, KnotLight, ShellPulse, knotCentre } from "./Inner";
import { Zona } from "./Zona";
import { WallDefs } from "./WallDefs";
import { WallBack, WallFar, WallNear } from "./Wall";
import { ContactGlow, Roots, Veil } from "./WallFront";
import { Message, messageFlow } from "./Message";
import { TestStrip } from "./TestStrip";
import { HormoneDots } from "./HormoneDots";
import { BuriedGlow, Specks, TubeMotes, WarmWash } from "./Atmos";
import { Ball, ROOTS } from "./wallShape";
import {
  B, CAM_REST, CX, CY, ballPos, ballR, blanketTau, camera, contact, coverAt, exitOp, reveal, roots, tint, wallBlur, warmEnd,
} from "./timeline";
import { EASE, tween } from "../../../lib/ease";
import { LONG_TRANSITION } from "../../chapters";

// C04 "A message to mum" (W02 -> W03 -> W04). The morula from C03 opens into a
// hollow ball (rose-plum shell, gold inner knot), squeezes out of its shell,
// rolls onto the womb wall, sinks in under a blanket of lining, sends hormone
// particles into a vessel, and a clean test strip draws its second line.
// Ends on a warm close-up of the buried embryo, fading under C05's focus pull.
// START = C03 END: the 64-cell morula (C03's packing, tumble and wobble, on
// C03's clock) in the same-size zona at (540, 860), gold glow r330, motes.

export const C04: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);
  const [bx, by] = ballPos(f);
  const R = ballR(f);
  const tau = blanketTau(f);
  const ball: Ball = { x: bx, y: by, r: R, tau, cover: coverAt(f, by, R + tau) };
  const closed = smooth((ball.cover - 2.6) / 0.54);
  const warp = warpAt(f);
  const prims = buildPrims(f, warp);
  const t = tint(f);
  const rv = reveal(f);
  const wb = wallBlur(f);
  const grow = ROOTS.map((_, i) => roots(f - i * 2.5));
  const flow = messageFlow(f);
  const heat = [0, 1, 2, 3, 4].map((v) => Math.max(0, ...ROOTS.map((r, i) => (r.vessel === v ? smooth((grow[i] - 0.85) / 0.15) : 0))));
  const mainRoot = ROOTS.findIndex((r) => r.vessel === -1);
  const main = Math.max(flow, smooth((grow[mainRoot] - 0.85) / 0.15) * 0.5);
  // Always alive: gentle hand-held drift.
  // (zero at frame 0 so the fade from C03's still morula lines up).
  const env = smooth(f / 30);
  const dx = 5 * env * noise2D("c04-cam", f * 0.012, 0.3);
  const dy = 5 * env * noise2D("c04-cam", 0.7, f * 0.012);
  const T = `translate(${(CX + dx).toFixed(2)} ${(CY + dy).toFixed(2)}) scale(${cam.s.toFixed(5)}) translate(${(-cam.x).toFixed(2)} ${(-cam.y).toFixed(2)})`;
  const farDy = (cam.y - CAM_REST) * (1 - 0.72);
  const nearDy = (cam.y - CAM_REST) * (1 - 1.35);
  const knot = knotCentre(f);
  const exit = exitOp(f);
  // C03's motes hand over to this chapter's parallax specks after the fade.
  const motes = 0.4 * (1 - tween(f, LONG_TRANSITION, LONG_TRANSITION + 30, [0, 1], EASE.inOut));
  const specks = tween(f, LONG_TRANSITION - 5, LONG_TRANSITION + 30, [0, 1], EASE.inOut);
  // Caption band: C03's strength at the handoff, full once the bright wall is up.
  const shade = 0.7 + 0.3 * rv;

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <WallDefs />
        <TubeMotes f={f} near={false} op={motes} />
        <g transform={T}>
          <g opacity={specks}>
            <Specks f={f} camY={cam.y} near={false} />
          </g>
          {rv > 0.005 && (
            <g opacity={rv} style={{ filter: wb > 0.3 ? `blur(${wb.toFixed(2)}px)` : undefined }}>
              <WallFar f={f} dy={farDy} op={smooth((rv - 0.3) / 0.5)} />
              <WallBack f={f} ball={f >= B.stick - 4 ? ball : null} heat={heat} main={main} />
            </g>
          )}
          <g transform={`translate(${bx.toFixed(2)} ${by.toFixed(2)})`}>
            <BallGlow f={f} buried={closed} at={warpCentre(warp)} />
            <CoreFill f={f} />
            <Cavity f={f} warp={warp} />
            <KnotBody f={f} warp={warp} />
            <Cells prims={prims} tint={t} />
            <KnotLight f={f} warp={warp} />
            <ShellPulse f={f} r={R} />
          </g>
          <g transform={`translate(${CX} ${CY})`}>
            <Zona f={f} />
          </g>
          {rv > 0.005 && (
            <g opacity={rv}>
              <Veil ball={ball} />
              <ContactGlow c={contact(f)} x={bx} settle={closed} />
              <BuriedGlow x={bx} y={by} r={R} o={closed} knot={knot} />
              <Roots ball={ball} grow={grow} f={f} />
            </g>
          )}
          <Message f={f} c={[bx, by]} R={R} />
          {rv > 0.005 && <WallNear f={f} dy={nearDy} op={rv} />}
          <g opacity={specks}>
            <Specks f={f} camY={cam.y} near />
          </g>
        </g>
        <TubeMotes f={f} near op={motes} />
        <WarmWash o={warmEnd(f)} />
        <TestStrip f={f} />
        <HormoneDots f={f} />
      </svg>
      <CaptionShade strength={shade} />
    </AbsoluteFill>
  );
};
