"use strict";

// src/theme/layout.ts
var FPS = 30;

// src/theme/timing.ts
var sec = (s) => Math.round(s * FPS);
var TRANSITION = 15;
var SCENES = [
  { id: "Scene1", duration: 195 },
  // the race + fertilisation
  { id: "Scene2", duration: 165 },
  // cell division -> implantation
  { id: "Scene3", duration: 165 },
  // week 6 heartbeat
  { id: "Scene4", duration: 225 },
  // week 12 -> week 20 growth + kick
  { id: "Scene5", duration: 210 }
  // week 40 birth + "Hello, world."
];
var SCENE_START = (() => {
  const out = {};
  let t = 0;
  for (const s of SCENES) {
    out[s.id] = t;
    t += s.duration - TRANSITION;
  }
  return out;
})();
var TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.duration, 0) - TRANSITION * (SCENES.length - 1);

// src/theme/beats.ts
var local = (scene, globalSec) => sec(globalSec) - SCENE_START[scene];
var BEATS = {
  Scene1: {
    raceStart: local("Scene1", 0.6),
    // "It starts with a race."
    millions: local("Scene1", 2.6),
    // "Millions run."
    oneWins: local("Scene1", 4.3),
    // "Only one wins." -> sperm reaches egg
    fertilise: local("Scene1", 5)
    // flash, egg glows gold, becomes zygote
  },
  Scene2: {
    two: local("Scene2", 7.65),
    // "...becomes two"
    four: local("Scene2", 8.4),
    // "...four"
    hundreds: local("Scene2", 9.3),
    // "...hundreds" -> morula/blastocyst
    implant: local("Scene2", 10.6)
    // blastocyst nests into womb wall
  },
  Scene3: {
    weekSix: local("Scene3", 11.6),
    // "Week six"
    heartStarts: local("Scene3", 13.4)
    // "...a tiny heart starts to beat"
  },
  Scene4: {
    weekTwelve: local("Scene4", 16.6),
    // "Week twelve"
    fingers: local("Scene4", 17.7),
    // "fingers"
    toes: local("Scene4", 18.4),
    // "toes"
    face: local("Scene4", 19.3),
    // "a face"
    weekTwenty: local("Scene4", 20.3),
    // "Week twenty"
    kick: local("Scene4", 22)
    // "...the first kick" -> kick ripple
  },
  Scene5: {
    weekForty: local("Scene5", 23.6),
    // "Week forty"
    birth: local("Scene5", 25.4),
    // light opens, baby emerges
    human: local("Scene5", 26.9),
    // "...a whole new human"
    hello: local("Scene5", 28)
    // "Hello, world." title lands
  }
};

// src/theme/voTiming.ts
var VO_TIMING = {
  "l1": {
    "src": "vo/l1.wav",
    "clipAt": 0.5,
    "start": 0.5,
    "end": 2.102,
    "words": [
      0.5,
      0.729,
      1.187,
      1.53,
      1.702
    ]
  },
  "l2": {
    "src": "vo/l2.wav",
    "clipAt": 2.3,
    "start": 2.4,
    "end": 5.381,
    "words": [
      2.4,
      3.018,
      3.89,
      4.387,
      4.801
    ]
  },
  "l3": {
    "src": "vo/l3.wav",
    "clipAt": 6.35,
    "start": 6.45,
    "end": 10.242,
    "words": [
      6.45,
      6.754,
      7.12,
      7.668,
      8.412,
      9.313
    ]
  },
  "l4": {
    "src": "vo/l4.wav",
    "clipAt": 11.5,
    "start": 11.6,
    "end": 14.75,
    "words": [
      11.6,
      12.009,
      12.754,
      12.925,
      13.267,
      13.666,
      14.123,
      14.351
    ]
  },
  "l5": {
    "src": "vo/l5.wav",
    "clipAt": 16.45,
    "start": 16.55,
    "end": 19.935,
    "words": [
      16.55,
      16.879,
      17.665,
      18.505,
      19.094,
      19.346
    ]
  },
  "l6": {
    "src": "vo/l6.wav",
    "clipAt": 20.15,
    "start": 20.25,
    "end": 22.534,
    "words": [
      20.25,
      20.565,
      21.373,
      21.678,
      22.106
    ]
  },
  "l7": {
    "src": "vo/l7.wav",
    "clipAt": 23.5,
    "start": 23.6,
    "end": 27.366,
    "words": [
      23.6,
      23.941,
      24.769,
      25.045,
      25.377,
      25.653,
      26.095,
      26.261,
      26.648,
      26.924
    ]
  },
  "l8": {
    "src": "vo/l8.wav",
    "clipAt": 27.9,
    "start": 28,
    "end": 28.933,
    "words": [
      28,
      28.466
    ]
  }
};

// src/audio/clips.ts
var beat = (s, k, offsetSec = 0) => (SCENE_START[s] + BEATS[s][k]) / FPS + offsetSec;
var VOICE = Object.values(VO_TIMING).map((t) => ({ src: t.src, at: t.clipAt }));
var CASCADE = [0, 0.07, 0.12, 0.18, 0.22, 0.27, 0.31, 0.36, 0.4, 0.45].map((d, i) => ({
  src: i % 2 ? "sfx/pop-hi2.wav" : "sfx/pop-hi.wav",
  at: beat("Scene2", "hundreds", d),
  volume: 0.42 * (1 - i * 0.06)
}));
var SFX = [
  // Scene1: the race and the spark
  { src: "sfx/whoosh.wav", at: beat("Scene1", "raceStart", -0.12), volume: 0.55 },
  { src: "sfx/whoosh-low.wav", at: beat("Scene1", "millions", -0.1), volume: 0.4 },
  { src: "sfx/whoosh.wav", at: beat("Scene1", "oneWins", -0.45), volume: 0.28 },
  { src: "sfx/impact.wav", at: beat("Scene1", "fertilise", -0.03), volume: 0.75 },
  // Scene2: cells dividing, then nesting into the wall
  { src: "sfx/pop.wav", at: beat("Scene2", "two", -0.02), volume: 0.6 },
  { src: "sfx/pop-hi.wav", at: beat("Scene2", "four", -0.02), volume: 0.55 },
  ...CASCADE,
  { src: "sfx/pop-lo.wav", at: beat("Scene2", "implant"), volume: 0.5 },
  // Scene3: heartbeat track is built so its t=0 is the heartStarts frame
  { src: "sfx/heartbeat.wav", at: beat("Scene3", "heartStarts"), volume: 0.85 },
  // Scene4: the kick
  { src: "sfx/kick.wav", at: beat("Scene4", "kick", -0.02), volume: 0.9 },
  // Scene5: light swell peaks on the flash (riser take peaks 1.25s in)
  { src: "sfx/riser.wav", at: (SCENE_START.Scene5 + BEATS.Scene5.human - 7) / FPS - 1.25, volume: 0.6 }
];

// out/qa-audio-times.ts
var all = [...VOICE.map((c) => ({ ...c, kind: "vo" })), ...SFX.map((c) => ({ ...c, kind: "sfx" }))];
console.log(JSON.stringify(all.map((c) => ({ src: c.src, at: c.at, frame: sec(c.at), t: sec(c.at) / 30, vol: c.volume ?? (c.kind === "vo" ? 1 : 0.6), kind: c.kind }))));
