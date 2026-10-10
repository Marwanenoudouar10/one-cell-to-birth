import React from "react";

// Blur filters shared by every Scene4 layer. Defined once, in the first
// (back) SVG, so each id exists exactly once in the document.
const blur = (id: string, sd: number, pad = 30) => (
  <filter id={id} x={`-${pad}%`} y={`-${pad}%`} width={`${100 + 2 * pad}%`} height={`${100 + 2 * pad}%`}>
    <feGaussianBlur stdDeviation={sd} />
  </filter>
);

export const Filters: React.FC = () => (
  <defs>
    {blur("s4-rimSoft", 5, 20)}
    {blur("s4-halo", 26, 40)}
    {blur("s4-soft", 3, 50)}
    {blur("s4-sh", 7, 30)}
    {blur("s4-glow", 9, 30)}
    {blur("s4-wide", 18, 40)}
  </defs>
);
