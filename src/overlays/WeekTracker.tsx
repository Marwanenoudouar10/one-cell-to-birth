import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme/colors";
import { MONO } from "../theme/fonts";
import { TRACKER_Y } from "../theme/layout";
import { BEATS } from "../theme/beats";
import { SCENE_START, SceneId, sec } from "../theme/timing";
import { EASE, tween } from "../lib/ease";

// Every key is a story beat (global frame), so a VO retime moves the tracker
// with the pictures.
const at = (scene: SceneId, local: number) => SCENE_START[scene] + local;
const B2 = BEATS.Scene2;
const B4 = BEATS.Scene4;

// Days after fertilisation, switched exactly when that stage is on screen.
const DAYS: [number, number][] = [
  [at("Scene1", BEATS.Scene1.fertilise), 1], // zygote
  [at("Scene2", B2.two), 2], // two cells
  [at("Scene2", B2.four), 3], // four -> eight cells
  [at("Scene2", B2.hundreds), 4], // morula
  [at("Scene2", B2.hundreds + 12), 5], // blastocyst (cavity opens)
  [at("Scene2", B2.implant - 14), 6], // hatches from its shell
  [at("Scene2", B2.implant), 7], // nests into the womb wall, held to the cut
];
// Days hand over to weeks as the Scene3 crossfade starts.
const ROLL = SCENE_START.Scene3;

// Pregnancy progress in weeks (global frame -> week) for the bar and counter.
const KEYS: [number, number][] = [
  [0, 0],
  ...DAYS.map(([f, d]): [number, number] => [f, d / 7]),
  [ROLL, 1],
  [at("Scene3", BEATS.Scene3.weekSix - 6), 6], // lands just before "Week six"
  [at("Scene4", B4.weekTwelve - 30), 6],
  [at("Scene4", B4.weekTwelve), 12],
  [at("Scene4", B4.weekTwenty - 6), 12], // waits for the face sweep to end
  [at("Scene4", B4.weekTwenty + 10), 20], // runs with the growth, lands on "twenty"
  [at("Scene5", BEATS.Scene5.weekForty - 21), 20],
  [at("Scene5", BEATS.Scene5.weekForty), 40],
];

const weekAt = (frame: number) =>
  interpolate(frame, KEYS.map(([f]) => f), KEYS.map(([, w]) => w), {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const pad = (n: number) => String(n).padStart(2, "0");
const label = (frame: number, w: number) => {
  if (frame >= ROLL) return `WEEK ${pad(Math.max(1, Math.round(w)))}`;
  const day = DAYS.reduce((d, [f, n]) => (frame >= f ? n : d), 1);
  return `DAY ${pad(day)}`;
};

// Thin progress bar at the top: where we are in the 40 weeks.
export const WeekTracker: React.FC = () => {
  const frame = useCurrentFrame();
  const w = weekAt(frame);
  const p = w / 40;
  const opacity = tween(frame, sec(0.2), sec(0.9)) * tween(frame, sec(27.6), sec(28.2), [1, 0]);
  const L = 90;
  const R = 990;
  const x = L + (R - L) * p;

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: TRACKER_Y - 52,
          left: L,
          right: 1080 - R,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 4,
          color: C.text,
        }}
      >
        <span>{label(frame, w)}</span>
        <span style={{ color: C.textDim, fontWeight: 500 }}>40 WEEKS</span>
      </div>
      <div style={{ position: "absolute", top: TRACKER_Y, left: L, width: R - L, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)" }} />
      <div
        style={{
          position: "absolute",
          top: TRACKER_Y,
          left: L,
          width: x - L,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${C.rose}, ${C.gold})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: TRACKER_Y + 2 - 9,
          left: x - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          background: C.gold,
          boxShadow: `0 0 18px 6px ${C.gold}88`,
        }}
      />
    </AbsoluteFill>
  );
};
