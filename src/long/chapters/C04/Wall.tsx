import React from "react";
import { getPointAtLength } from "@remotion/paths";
import { C } from "../../../theme/colors";
import { mix } from "./palette";
import { Pt, smooth, smoothOpen } from "./geometry";
import { WALL } from "./timeline";
import {
  Ball, DEPTH, GLAND_X, LOBES, MAIN, STROMA, TWIGS, VESSELS, X0, X1, bodyPath, chordY, glandPath, humpPts, surfacePts,
} from "./wallShape";

// The endometrium behind the ball (world px): thick rose flesh, soft lobes,
// stroma, glands, spiral arteries with travelling glints, the vessel the
// message leaves by, and the lit surface (hidden where it passes behind the
// ball, so only the blanket's own edge reads in front of it).

const Fold: React.FC<{ pts: Pt[]; fill: string; rim: string; rimO: number }> = ({ pts, fill, rim, rimO }) => (
  <g>
    <path d={bodyPath(pts)} fill={fill} />
    <path d={smoothOpen(pts)} fill="none" stroke={rim} strokeOpacity={rimO} strokeWidth={6} />
  </g>
);

export const WallFar: React.FC<{ f: number; dy: number; op: number }> = ({ f, dy, op }) => (
  <g transform={`translate(0 ${dy.toFixed(1)})`} opacity={op} style={{ filter: "blur(7px)" }}>
    <Fold pts={humpPts(-90, 330, 360, WALL - 30, f, 0.3)} fill="url(#c04w-far)" rim={C.rose} rimO={0.32} />
    <Fold pts={humpPts(1180, 350, 330, WALL - 20, f, 2.1)} fill="url(#c04w-far)" rim={C.rose} rimO={0.28} />
  </g>
);

export const WallNear: React.FC<{ f: number; dy: number; op: number }> = ({ f, dy, op }) => (
  <g transform={`translate(0 ${dy.toFixed(1)})`} opacity={op} style={{ filter: "blur(12px)" }}>
    <Fold pts={humpPts(-110, 420, 250, WALL + 820, f, 1.2)} fill="url(#c04w-near)" rim={C.womb} rimO={0.45} />
    <Fold pts={humpPts(1210, 420, 230, WALL + 840, f, 3.3)} fill="url(#c04w-near)" rim={C.womb} rimO={0.4} />
  </g>
);

const Glints: React.FC<{ d: string; len: number; f: number; i: number; speed: number; r: number; o: number; up: boolean }> = ({ d, len, f, i, speed, r, o, up }) => (
  <>
    {[0, 0.5].map((ph) => {
      const t = (ph + i * 0.17 + f * speed) % 1;
      const p = getPointAtLength(d, (up ? t : 1 - t) * len);
      if (!p) return null;
      const a = Math.sin(Math.PI * t) ** 0.7 * (up ? smooth((t - 0.3) / 0.35) : 1) * o;
      return <circle key={ph} cx={p.x} cy={p.y} r={r} fill="url(#c04w-glint)" opacity={a} />;
    })}
  </>
);

const Vessels: React.FC<{ f: number; heat: number[]; main: number }> = ({ f, heat, main }) => (
  <g>
    {VESSELS.map((v, i) => {
      const hot = heat[i] ?? 0;
      return (
        <g key={i}>
          <path d={v.d} fill="none" stroke="url(#c04w-vglow)" strokeOpacity={0.5 + 0.5 * hot} strokeWidth={18 + 8 * hot} strokeLinecap="round" />
          <path d={v.d} fill="none" stroke="url(#c04w-vcore)" strokeWidth={5 + 2 * hot} strokeLinecap="round" />
          <path d={v.d} fill="none" stroke="url(#c04w-vhi)" strokeOpacity={0.6 + 0.4 * hot} strokeWidth={1.3} strokeLinecap="round" transform="translate(-1 -1)" />
          {TWIGS[i].map((t, k) => (
            <path key={k} d={t} fill="none" stroke={C.heart} strokeOpacity={0.45 + 0.35 * hot} strokeWidth={2.2} strokeLinecap="round" />
          ))}
          <Glints d={v.d} len={v.len} f={f} i={i} speed={0.014 + 0.012 * hot} r={7 + 4 * hot} o={0.75 + 0.25 * hot} up />
        </g>
      );
    })}
    <g>
      <path d={MAIN.d} fill="none" stroke={C.heart} strokeOpacity={0.12 + 0.16 * main} strokeWidth={46} strokeLinecap="round" style={{ filter: "blur(8px)" }} />
      <path d={MAIN.d} fill="none" stroke="url(#c04w-main)" strokeOpacity={0.55 + 0.25 * main} strokeWidth={12} strokeLinecap="round" />
      <path d={MAIN.d} fill="none" stroke={C.wombDeep} strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" transform="translate(0 1.5)" />
      <path d={MAIN.d} fill="none" stroke={C.peach} strokeOpacity={0.4 + 0.3 * main} strokeWidth={1.5} strokeLinecap="round" transform="translate(-1 -4)" />
      <Glints d={MAIN.d} len={MAIN.len} f={f} i={7} speed={0.012} r={8} o={0.6} up={false} />
    </g>
  </g>
);

// Lit surface: soft bloom + epithelial cells + crisp rim.
const Surface: React.FC<{ pts: Pt[]; d: string }> = ({ pts, d }) => {
  const cells = [];
  for (let i = 2; i < pts.length - 2; i += 2) {
    const [x, y] = pts[i];
    const a = Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]);
    const cx = x - Math.sin(a) * 15;
    const cy = y + Math.cos(a) * 15;
    cells.push(
      <ellipse
        key={i}
        cx={cx}
        cy={cy}
        rx={11.5}
        ry={14}
        transform={`rotate(${((a * 180) / Math.PI).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`}
        fill="url(#c04w-epi)"
        stroke={C.peach}
        strokeOpacity={0.2}
        strokeWidth={1.1}
      />,
    );
  }
  return (
    <g>
      <path d={d} fill="none" stroke={C.rose} strokeOpacity={0.5} strokeWidth={60} style={{ filter: "blur(18px)" }} />
      {cells}
      <path d={d} fill="none" stroke={mix(C.rose, C.peach, 0.6)} strokeOpacity={0.95} strokeWidth={4.5} />
      <path d={d} fill="none" stroke={C.text} strokeOpacity={0.35} strokeWidth={1.4} transform="translate(0 -1.5)" />
    </g>
  );
};

export const WallBack: React.FC<{ f: number; ball: Ball | null; heat: number[]; main: number }> = ({ f, ball, heat, main }) => {
  const pts = surfacePts(f, ball);
  const edge = smoothOpen(pts);
  // The flesh behind the ball reaches up to the line between the blanket's
  // lips, so no empty pit (with straight walls) shows through the ball.
  const body: Pt[] = ball ? pts.map(([x, y]) => [x, Math.min(y, chordY(ball, x))]) : pts;
  return (
    <g>
      <defs>
        <mask id="c04w-mask" maskUnits="userSpaceOnUse" x={X0} y={WALL - 900} width={X1 - X0} height={DEPTH - WALL + 900}>
          <rect x={X0} y={WALL - 900} width={X1 - X0} height={DEPTH - WALL + 900} fill={C.text} />
          {ball && <circle cx={ball.x} cy={ball.y} r={ball.r + ball.tau * 0.3} fill="url(#c04w-hole)" />}
        </mask>
      </defs>
      <path d={bodyPath(body)} fill="url(#c04w-body)" />
      {LOBES.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="url(#c04w-lobe)" />
      ))}
      {STROMA.map((s, i) => (
        <ellipse
          key={i}
          cx={s.x}
          cy={s.y}
          rx={s.rx}
          ry={s.ry}
          transform={`rotate(${s.rot.toFixed(1)} ${s.x.toFixed(1)} ${s.y.toFixed(1)})`}
          fill={s.light ? C.rose : C.wombDeep}
          opacity={s.light ? 0.12 : 0.42}
        />
      ))}
      {GLAND_X.map((x, i) => {
        const d = glandPath(x, f, i);
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="url(#c04w-gline)" strokeWidth={24} strokeLinecap="round" />
            <path d={d} fill="none" stroke="url(#c04w-glum)" strokeWidth={9} strokeLinecap="round" />
          </g>
        );
      })}
      <Vessels f={f} heat={heat} main={main} />
      <g mask="url(#c04w-mask)">
        <Surface pts={pts} d={edge} />
      </g>
    </g>
  );
};
