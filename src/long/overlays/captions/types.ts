/**
 * One caption line = one sentence of briefs/long/script.md, in GLOBAL seconds.
 *
 *   id        unique, e.g. "C04-1"
 *   text      exact sentence text (words split on single spaces)
 *   start/end first word start / speech end
 *   emphasis  words drawn gold (compared lower-case, letters only); the film's LAST line
 *             defaults to its last word ("world.")
 *   words     each word's start (seconds), same count as text.split(" "); else spread by length
 *   phrases   word indices where a spoken phrase starts; a sentence too long for 2 rows is
 *             paged preferably at these, else after punctuation (see captions/pages.ts)
 */
export type CaptionLine = {
  id: string;
  text: string;
  start: number;
  end: number;
  emphasis?: string[];
  words?: number[];
  phrases?: number[];
};
