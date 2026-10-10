/**
 * Chapter id -> component for the full "Long" film. A chapter that is not listed here
 * renders <ChapterPlaceholder> (id, title, week range), so the film always plays.
 *
 * To register chapter C05 (component in src/long/chapters/C05/index.tsx, `export const C05`):
 *   1. add   import { C05 } from "./chapters/C05";
 *   2. add   C05,   inside CHAPTER_COMPONENTS
 * One line each, keep them sorted. Chapter previews do NOT read this file, so a broken
 * chapter can only break the full film render, never another chapter's preview.
 */
import type React from "react";
import type { ChapterId } from "./chapters";
import { placeholderFor } from "./Placeholder";

// --- chapter imports (one per line, sorted) ---
import { C00 } from "./chapters/C00";
import { C01 } from "./chapters/C01";
import { C02 } from "./chapters/C02";
import { C03 } from "./chapters/C03";
import { C04 } from "./chapters/C04";
import { C05 } from "./chapters/C05";
import { C06 } from "./chapters/C06";
import { C07 } from "./chapters/C07";
import { C08 } from "./chapters/C08";
import { C09 } from "./chapters/C09";
import { C10 } from "./chapters/C10";
import { C11 } from "./chapters/C11";
import { C12 } from "./chapters/C12";
import { C13 } from "./chapters/C13";
import { C14 } from "./chapters/C14";
import { C15 } from "./chapters/C15";
import { C16 } from "./chapters/C16";

export const CHAPTER_COMPONENTS: Partial<Record<ChapterId, React.FC>> = {
  // --- registered chapters (one per line, sorted) ---
  C00,
  C01,
  C02,
  C03,
  C04,
  C05,
  C06,
  C07,
  C08,
  C09,
  C10,
  C11,
  C12,
  C13,
  C14,
  C15,
  C16,
};

export const chapterComponent = (id: ChapterId): React.FC => CHAPTER_COMPONENTS[id] ?? placeholderFor(id);
