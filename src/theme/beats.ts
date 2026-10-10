import { sec } from "./timing";
import { SCENE_START } from "./timing";

// Key story moments, as LOCAL frames inside each scene.
// Scenes animate to these numbers so the film can be re-timed to the real
// voiceover by editing only this file. Times are matched to the word
// timings in voTiming.ts (generated from the ElevenLabs take).
const local = (scene: keyof typeof SCENE_START, globalSec: number) =>
  sec(globalSec) - SCENE_START[scene];

export const BEATS = {
  Scene1: {
    raceStart: local("Scene1", 0.15), // the race is already on as "It starts with a race." begins (hook)
    millions: local("Scene1", 2.6), // "Millions run."
    oneWins: local("Scene1", 4.3), // "Only one wins." -> sperm reaches egg
    fertilise: local("Scene1", 5.0), // flash, egg glows gold, becomes zygote
  },
  Scene2: {
    two: local("Scene2", 7.65), // "...becomes two"
    four: local("Scene2", 8.4), // "...four"
    hundreds: local("Scene2", 9.3), // "...hundreds" -> morula/blastocyst
    implant: local("Scene2", 10.6), // blastocyst nests into womb wall
  },
  Scene3: {
    weekSix: local("Scene3", 11.6), // "Week six"
    heartStarts: local("Scene3", 13.4), // "...a tiny heart starts to beat"
  },
  Scene4: {
    weekTwelve: local("Scene4", 16.6), // "Week twelve"
    fingers: local("Scene4", 17.7), // "fingers"
    toes: local("Scene4", 18.4), // "toes"
    face: local("Scene4", 19.3), // "a face"
    weekTwenty: local("Scene4", 20.3), // "Week twenty"
    kick: local("Scene4", 22.0), // "...the first kick" -> kick ripple
  },
  Scene5: {
    weekForty: local("Scene5", 23.6), // "Week forty"
    birth: local("Scene5", 25.4), // light opens, baby emerges
    human: local("Scene5", 26.9), // "...a whole new human"
    hello: local("Scene5", 28.0), // "Hello, world." title lands
  },
} as const;
