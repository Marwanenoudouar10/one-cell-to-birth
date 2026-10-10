import { registerRoot } from "remotion";
import { Scene2 } from "../scenes/Scene2";
import { makeSceneRoot } from "./makeSceneRoot";

registerRoot(makeSceneRoot("Scene2", Scene2));
