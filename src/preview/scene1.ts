import { registerRoot } from "remotion";
import { Scene1 } from "../scenes/Scene1";
import { makeSceneRoot } from "./makeSceneRoot";

registerRoot(makeSceneRoot("Scene1", Scene1));
