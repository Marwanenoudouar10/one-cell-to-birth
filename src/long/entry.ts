// Isolated entry that registers ONLY the "Long" composition (the teaser and its
// scenes are not bundled). Used by scripts/long-render.sh.
//   npx remotion render src/long/entry.ts Long out/long.mp4 --scale=0.25
import { registerRoot } from "remotion";
import { LongRoot } from "./LongRoot";

registerRoot(LongRoot);
