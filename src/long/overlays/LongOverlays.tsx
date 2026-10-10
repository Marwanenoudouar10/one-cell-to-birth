/**
 * The global overlays that sit above every chapter: week tracker (+ size chip) and
 * captions. One component, used by the full film AND by every chapter preview, so a
 * preview always looks exactly like the film. Needs the GLOBAL film frame.
 *
 *   <LongOverlays />                         film level
 *   <Sequence from={-LONG_START[id]}><LongOverlays /></Sequence>   chapter preview
 */
import React from "react";
import { LONG_LINES } from "../data/lines";
import { CaptionsLong } from "./CaptionsLong";
import { WeekTrackerLong } from "./WeekTrackerLong";

export const LongOverlays: React.FC = () => (
  <>
    <WeekTrackerLong />
    <CaptionsLong lines={LONG_LINES} />
  </>
);
