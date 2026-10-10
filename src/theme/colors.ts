// One palette for the whole film. Dark, warm "inside the body" world,
// with cool white-cyan for single cells and gold for the spark of life.
export const C = {
  // backgrounds (darkest -> lighter)
  bg0: "#0B0818",
  bg1: "#1C0F2E",
  bg2: "#3A1638",

  // womb / tissue (warm)
  wombDeep: "#5C1A3A",
  womb: "#B23A5B",
  rose: "#FF7F96",
  peach: "#FFB89A",
  skin: "#FFC9A8",
  skinShade: "#E8907A",

  // cells (cool)
  cell: "#EAF6FF",
  cellCyan: "#7FE3FF",
  cellBlue: "#3D7BFF",

  // life accents
  gold: "#FFD36E",
  heart: "#FF3D5E",

  // text
  text: "#FFF6F0",
  textDim: "rgba(255, 246, 240, 0.62)",
} as const;
