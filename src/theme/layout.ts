// 9:16 vertical canvas and the safe zones every scene respects.
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

// Hero visuals live in this box. Captions sit below it, week tracker above.
export const HERO = { cx: 540, cy: 860, top: 380, bottom: 1300 } as const;
export const CAPTION_Y = 1420; // vertical centre of caption block
export const TRACKER_Y = 190; // vertical centre of week tracker
