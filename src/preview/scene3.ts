import { registerRoot } from "remotion";
import { Scene3 } from "../scenes/Scene3";
import { makeSceneRoot } from "./makeSceneRoot";

registerRoot(makeSceneRoot("Scene3", Scene3));
