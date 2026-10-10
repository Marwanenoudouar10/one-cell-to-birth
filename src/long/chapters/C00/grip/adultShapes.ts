import { capsule, Pt, smoothClosed, smoothOpen } from "./geometry";

// The grown-up's hand in grip space, seen from the back (dorsal side): the
// index finger lies along the x axis with its tip at `t` (pointing to -x) and
// its nail facing the camera; the other fingers are curled into a loose fist
// at the right edge. Real scale: a newborn finger is ~0.4x this finger's width.
export const AY = -24; // finger axis (local y)

// half-width of the finger at distance u from the tip (gentle joint bulges)
const PROFILE: [number, number][] = [
  [8, 32], [26, 54], [62, 67], [130, 70], [200, 74], [300, 72], [460, 79], [600, 78], [770, 85], [1000, 92], [1700, 98],
];

export const indexFinger = (t: number): string => {
  const top: Pt[] = PROFILE.map(([u, r]) => [t + u, AY - r]);
  const bot: Pt[] = PROFILE.map(([u, r]) => [t + u, AY + r + 2] as Pt).reverse();
  return smoothClosed([[t, AY], ...top, ...bot]);
};

// back of the hand + the curled middle and ring fingers (behind the index),
// pressed up against the index so the hand reads as one loose fist
export const fist = (t: number): string[] => [
  smoothClosed([[t + 700, AY - 74], [t + 900, AY - 96], [t + 1300, AY - 130], [t + 1500, AY + 520], [t + 1000, AY + 470], [t + 780, AY + 220]]),
  capsule(t + 600, AY + 150, t + 1000, AY + 104, 76, 88), // middle finger: knuckle up...
  capsule(t + 600, AY + 150, t + 690, AY + 300, 76, 62), // ...bending down under the palm
  capsule(t + 780, AY + 300, t + 1100, AY + 240, 72, 86), // ring finger knuckle
  capsule(t + 780, AY + 300, t + 860, AY + 430, 72, 60),
];

// creases between the curled fingers + middle-knuckle wrinkles (over the fist)
export const fistLines = (t: number): string[] => [
  smoothOpen([[t + 700, AY + 236], [t + 820, AY + 222], [t + 980, AY + 190]]),
  smoothOpen([[t + 640, AY + 228], [t + 660, AY + 262], [t + 690, AY + 290]]),
  smoothOpen([[t + 556, AY + 124], [t + 548, AY + 150], [t + 556, AY + 180]]),
  smoothOpen([[t + 576, AY + 112], [t + 566, AY + 150], [t + 576, AY + 192]]),
];
export const KNUCKLE: Pt = [596, AY + 128]; // middle-finger knuckle highlight (add t)

// nail plate seen from above, with free edge, lunula and cuticle
export const nail = (t: number) => {
  const plate = smoothClosed([
    [t + 9, AY], [t + 13, AY - 28], [t + 30, AY - 42], [t + 70, AY - 45], [t + 110, AY - 41],
    [t + 126, AY - 26], [t + 131, AY], [t + 126, AY + 26], [t + 110, AY + 41], [t + 70, AY + 45], [t + 30, AY + 42], [t + 13, AY + 28],
  ]);
  const freeEdge = smoothClosed([
    [t + 9, AY], [t + 13, AY - 28], [t + 30, AY - 42], [t + 34, AY - 30], [t + 30, AY], [t + 34, AY + 30], [t + 30, AY + 42], [t + 13, AY + 28],
  ]);
  const lunula = smoothClosed([[t + 106, AY - 30], [t + 120, AY - 20], [t + 125, AY], [t + 120, AY + 20], [t + 106, AY + 30], [t + 100, AY]]);
  const cuticle = smoothOpen([[t + 112, AY - 44], [t + 129, AY - 26], [t + 135, AY], [t + 129, AY + 26], [t + 112, AY + 44]]);
  const shine = smoothOpen([[t + 38, AY - 27], [t + 70, AY - 31], [t + 102, AY - 27]]);
  return { plate, freeEdge, lunula, cuticle, shine };
};

// knuckle wrinkles across the back of the finger (end joint, middle joint)
export const wrinkles = (t: number): { d: string; w: number; o: number }[] => {
  const arc = (u: number, h: number, bow: number) =>
    smoothOpen([[t + u + bow, AY - h], [t + u, AY - h * 0.2], [t + u + bow * 0.6, AY + h * 0.55]]);
  return [
    { d: arc(176, 46, 7), w: 3.5, o: 0.45 },
    { d: arc(192, 54, 8), w: 4, o: 0.6 },
    { d: arc(208, 40, 6), w: 3.5, o: 0.4 },
    { d: arc(452, 52, 10), w: 4, o: 0.5 },
    { d: arc(470, 62, 12), w: 4.5, o: 0.65 },
    { d: arc(488, 60, 12), w: 4.5, o: 0.6 },
    { d: arc(506, 46, 9), w: 3.5, o: 0.45 },
  ];
};
