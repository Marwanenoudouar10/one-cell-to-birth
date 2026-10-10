// Showcase for the shared fetus (review only, not part of the film).
// mode "morph": 6 s growth 9 -> 40 wk with pose changes.
// mode "single": frame k = week WEEKS[k], big, same size (for ffmpeg tiles).
// mode "sheet": 3x3 grid, same size. mode "scale": true relative size.
// mode "poses": frame k = pose test k at a fixed week (props.week).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { EASE, heartbeat, tween } from "../../../lib/ease";
import { Fetus } from "../Fetus";
import { fetusAnchors } from "../anchors";
import { FetusPose } from "../pose";
import { crlCm } from "../growth";

export const WEEKS = [9, 12, 16, 20, 24, 28, 32, 36, 40];

export const POSES: FetusPose[] = [
  {},
  { armPose: "handToFace" },
  { armPose: "thumbSuck" },
  { legKick: 1, toesCurl: -0.8, handOpen: 1 },
  { curl: 1, headTilt: 8 },
  { curl: 0, headTilt: -8 },
  { headDown: 1 },
  { headDown: 1, mirror: true },
  { expression: 1, eyeOpen: 1 },
  { expression: -1, eyeOpen: 0.5, breathe: 1 },
  { hiccup: 1 },
  { armPose: { rest: 0.5, thumbSuck: 0.5 } },
];

const Label: React.FC<{ x: number; y: number; t: string; s?: number }> = ({ x, y, t, s = 30 }) => (
  <text x={x} y={y} fill={C.textDim} fontSize={s} fontFamily="monospace" textAnchor="middle" letterSpacing={3}>
    {t}
  </text>
);

const Dots: React.FC<{ week: number; pose: FetusPose; size: number }> = ({ week, pose, size }) => {
  const a = fetusAnchors(week, pose, size);
  const pts = [a.navel, a.heart, a.hand, a.thumbTip, a.foot, a.eye, a.mouth, a.crown, a.chin, a.ear, a.knee, a.rump, a.back];
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={C.cellCyan} />
      ))}
      <line x1={a.navel.x} y1={a.navel.y} x2={a.navel.x + a.navelDir.x * 40} y2={a.navel.y + a.navelDir.y * 40} stroke={C.cellCyan} strokeWidth={3} />
      <rect x={a.bounds.x0} y={a.bounds.y0} width={a.bounds.x1 - a.bounds.x0} height={a.bounds.y1 - a.bounds.y0} fill="none" stroke={C.cellCyan} strokeOpacity={0.4} />
      <circle cx={a.headCenter.x} cy={a.headCenter.y} r={a.headRadius} fill="none" stroke={C.gold} strokeOpacity={0.5} />
    </g>
  );
};

const morph = (f: number) => {
  const week = 9 + 31 * tween(f, 6, 168, [0, 1], EASE.inOut);
  const face = tween(f, 26, 40) - tween(f, 56, 70);
  const suck = tween(f, 96, 110) - tween(f, 132, 146);
  const kick = -0.35 * (tween(f, 62, 74) - tween(f, 74, 78)) + tween(f, 74, 78) - tween(f, 82, 98);
  const pose: FetusPose = {
    armPose: { rest: Math.max(0, 1 - face - suck), handToFace: face, thumbSuck: suck },
    handOpen: 0.3 + 0.6 * tween(f, 6, 18) * (1 - tween(f, 22, 30)),
    legKick: kick,
    toesCurl: -0.7 * tween(f, 72, 76) + 0.8 * tween(f, 84, 92),
    headDown: tween(f, 148, 176, [0, 1], EASE.inOut),
    breathe: 0.5 + 0.5 * Math.sin(f * 0.25),
    hiccup: f > 118 ? Math.exp(-(f - 118) / 3) : 0,
    eyeOpen: tween(f, 140, 150) ,
    expression: tween(f, 150, 165),
    headTilt: 3 * Math.sin(f * 0.05),
  };
  return { week, pose };
};

export const Showcase: React.FC<{ mode: string; week?: number; anchors?: boolean }> = ({ mode, week = 20, anchors }) => {
  const f = useCurrentFrame();
  const hb = heartbeat(f, 150);
  let body: React.ReactNode = null;
  if (mode === "morph") {
    const m = morph(f);
    body = (
      <g transform="translate(540 860)">
        <Fetus week={m.week} size={760} pose={m.pose} heartbeat={hb} />
        {anchors && <Dots week={m.week} pose={m.pose} size={760} />}
        <Label x={0} y={620} t={`WEEK ${m.week.toFixed(1)}`} />
      </g>
    );
  } else if (mode === "single" || mode === "poses") {
    const w = mode === "single" ? WEEKS[Math.min(WEEKS.length - 1, f)] : week;
    const pose = mode === "poses" ? POSES[Math.min(POSES.length - 1, f)] : {};
    body = (
      <g transform="translate(540 900)">
        <Fetus week={w} size={900} pose={pose} heartbeat={hb} />
        {anchors && <Dots week={w} pose={pose} size={900} />}
        <Label x={0} y={700} t={mode === "single" ? `WEEK ${w}` : `POSE ${f}`} />
      </g>
    );
  } else if (mode === "sheet") {
    body = WEEKS.map((w, i) => (
      <g key={w} transform={`translate(${180 + 360 * (i % 3)} ${330 + 600 * Math.floor(i / 3)})`}>
        <Fetus week={w} size={420} heartbeat={hb} />
        <Label x={0} y={275} t={`WK ${w}`} s={26} />
      </g>
    ));
  } else if (mode === "scale") {
    // true relative size: size proportional to crown-rump length
    const k = 1000 / crlCm(40);
    const slots = [[200, 360], [430, 360], [700, 360], [230, 680], [690, 700], [270, 1130], [770, 1140], [280, 1640], [760, 1620]];
    body = WEEKS.map((w, i) => (
      <g key={w} transform={`translate(${slots[i][0]} ${slots[i][1]})`}>
        <Fetus week={w} size={(k * crlCm(w)) / 2.6} heartbeat={hb} />
        <Label x={0} y={(k * crlCm(w)) / 5.2 + 34} t={`${w}`} s={24} />
      </g>
    ));
  }
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 45%, ${C.bg2} 0%, ${C.bg0} 75%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <radialGradient id="fetus-sc-sac">
            <stop offset="0" stopColor={C.womb} stopOpacity={0.42} />
            <stop offset="0.7" stopColor={C.wombDeep} stopOpacity={0.3} />
            <stop offset="1" stopColor={C.wombDeep} stopOpacity={0} />
          </radialGradient>
        </defs>
        {mode !== "sheet" && mode !== "scale" && <circle cx={540} cy={880} r={620} fill="url(#fetus-sc-sac)" />}
        {body}
      </svg>
    </AbsoluteFill>
  );
};
