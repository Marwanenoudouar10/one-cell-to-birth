import React from "react";
import { SceneId } from "../theme/timing";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  Scene1,
  Scene2,
  Scene3,
  Scene4,
  Scene5,
};
