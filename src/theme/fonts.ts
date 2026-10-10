import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Two type levels only: Sora for words, JetBrains Mono for numbers/labels.
export const { fontFamily: DISPLAY } = loadSora("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});

export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});
