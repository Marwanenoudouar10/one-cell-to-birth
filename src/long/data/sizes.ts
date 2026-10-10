/**
 * Size of the baby per week (weeks 4..40), read by the week tracker's size chip:
 * "size of a lime · 5.4 cm". Verified rows from briefs/long/sizes.json, embedded VERBATIM in
 * SIZES_JSON below (tsconfig has no resolveJsonModule and the brief lives outside src/).
 * If sizes.json changes, regenerate SIZES_JSON from it; the mapping below stays.
 *
 * Mapping (storyboard Appendix item 4):
 *   compare     the leading "a " / "an " moves into `article`, so the chip never says
 *               "size of a a lime"            "an ear of corn" -> article "an", compare "ear of corn"
 *   lengthType  "crown-rump" -> "CRL", "crown-heel" -> "CHL" (the jump at week 20 is real)
 *
 * SizeRow
 *   week       gestational week (completed weeks) the row applies to
 *   compare    noun phrase after the article, drawn bright   e.g. "lime"
 *   article    "a" / "an" / "" (none)
 *   lengthCm   length in cm (< 1 cm is shown in mm by the chip)
 *   lengthType "CRL" crown-rump or "CHL" crown-heel
 *   weightG    weight in grams (shown only when the tracker's showWeight is on)
 */
export type SizeRow = {
  week: number;
  compare: string;
  article?: string;
  lengthCm: number;
  lengthType: "CRL" | "CHL";
  weightG: number;
};

type JsonRow = {
  week: number;
  compare: string;
  lengthCm: number;
  lengthType: "crown-rump" | "crown-heel";
  weightG: number;
};

// prettier-ignore
export const SIZES_JSON: readonly JsonRow[] = [
  { week: 4, compare: "a poppy seed", lengthCm: 0.1, lengthType: "crown-rump", weightG: 0 },
  { week: 5, compare: "a sesame seed", lengthCm: 0.2, lengthType: "crown-rump", weightG: 0 },
  { week: 6, compare: "a lentil", lengthCm: 0.6, lengthType: "crown-rump", weightG: 0 },
  { week: 7, compare: "a blueberry", lengthCm: 1, lengthType: "crown-rump", weightG: 0 },
  { week: 8, compare: "a raspberry", lengthCm: 1.6, lengthType: "crown-rump", weightG: 1 },
  { week: 9, compare: "a cherry", lengthCm: 2.3, lengthType: "crown-rump", weightG: 2 },
  { week: 10, compare: "a strawberry", lengthCm: 3.1, lengthType: "crown-rump", weightG: 4 },
  { week: 11, compare: "a fig", lengthCm: 4.1, lengthType: "crown-rump", weightG: 7 },
  { week: 12, compare: "a lime", lengthCm: 5.4, lengthType: "crown-rump", weightG: 14 },
  { week: 13, compare: "a peach", lengthCm: 7.4, lengthType: "crown-rump", weightG: 23 },
  { week: 14, compare: "a lemon", lengthCm: 8.7, lengthType: "crown-rump", weightG: 43 },
  { week: 15, compare: "an apple", lengthCm: 10.1, lengthType: "crown-rump", weightG: 70 },
  { week: 16, compare: "an avocado", lengthCm: 11.6, lengthType: "crown-rump", weightG: 100 },
  { week: 17, compare: "a pomegranate", lengthCm: 13, lengthType: "crown-rump", weightG: 140 },
  { week: 18, compare: "a sweet potato", lengthCm: 14.2, lengthType: "crown-rump", weightG: 190 },
  { week: 19, compare: "a mango", lengthCm: 15.3, lengthType: "crown-rump", weightG: 240 },
  { week: 20, compare: "a banana", lengthCm: 25.6, lengthType: "crown-heel", weightG: 300 },
  { week: 21, compare: "an ear of corn", lengthCm: 27.3, lengthType: "crown-heel", weightG: 360 },
  { week: 22, compare: "a grapefruit", lengthCm: 28.9, lengthType: "crown-heel", weightG: 430 },
  { week: 23, compare: "an eggplant", lengthCm: 30.6, lengthType: "crown-heel", weightG: 501 },
  { week: 24, compare: "a head of romaine", lengthCm: 32.3, lengthType: "crown-heel", weightG: 600 },
  { week: 25, compare: "a bunch of bananas", lengthCm: 33.9, lengthType: "crown-heel", weightG: 660 },
  { week: 26, compare: "a coconut", lengthCm: 35.6, lengthType: "crown-heel", weightG: 760 },
  { week: 27, compare: "a bunch of celery", lengthCm: 36.6, lengthType: "crown-heel", weightG: 875 },
  { week: 28, compare: "a cauliflower", lengthCm: 37.6, lengthType: "crown-heel", weightG: 1005 },
  { week: 29, compare: "a butternut squash", lengthCm: 38.6, lengthType: "crown-heel", weightG: 1153 },
  { week: 30, compare: "a cabbage", lengthCm: 39.9, lengthType: "crown-heel", weightG: 1319 },
  { week: 31, compare: "a spaghetti squash", lengthCm: 41.1, lengthType: "crown-heel", weightG: 1502 },
  { week: 32, compare: "a cantaloupe", lengthCm: 42.4, lengthType: "crown-heel", weightG: 1702 },
  { week: 33, compare: "a pineapple", lengthCm: 43.7, lengthType: "crown-heel", weightG: 1918 },
  { week: 34, compare: "a large papaya", lengthCm: 45, lengthType: "crown-heel", weightG: 2146 },
  { week: 35, compare: "a honeydew melon", lengthCm: 46.2, lengthType: "crown-heel", weightG: 2383 },
  { week: 36, compare: "a mini watermelon", lengthCm: 47.4, lengthType: "crown-heel", weightG: 2622 },
  { week: 37, compare: "a small pumpkin", lengthCm: 47.9, lengthType: "crown-heel", weightG: 2859 },
  { week: 38, compare: "a large honeydew", lengthCm: 48.6, lengthType: "crown-heel", weightG: 3083 },
  { week: 39, compare: "a small watermelon", lengthCm: 49.3, lengthType: "crown-heel", weightG: 3288 },
  { week: 40, compare: "a pumpkin", lengthCm: 49.9, lengthType: "crown-heel", weightG: 3462 },
];

/** "a lime" -> ["a", "lime"]; "an ear of corn" -> ["an", "ear of corn"]; "lime" -> [undefined, "lime"]. */
export const splitArticle = (phrase: string): [article: string | undefined, rest: string] => {
  const m = /^(a|an)\s+(.+)$/i.exec(phrase.trim());
  return m ? [m[1].toLowerCase(), m[2]] : [undefined, phrase.trim()];
};

const LENGTH_TYPE: Record<JsonRow["lengthType"], SizeRow["lengthType"]> = {
  "crown-rump": "CRL",
  "crown-heel": "CHL",
};

export const toSizeRow = (r: JsonRow): SizeRow => {
  const [article, compare] = splitArticle(r.compare);
  return { week: r.week, compare, article, lengthCm: r.lengthCm, lengthType: LENGTH_TYPE[r.lengthType], weightG: r.weightG };
};

export const SIZES: SizeRow[] = SIZES_JSON.map(toSizeRow);

/** Row for an integer week: exact match, else the closest lower week, else the first row. */
export const sizeForWeek = (week: number, rows: readonly SizeRow[] = SIZES): SizeRow => {
  let best = rows[0];
  for (const r of rows) if (r.week <= week && r.week >= best.week) best = r;
  return best;
};
