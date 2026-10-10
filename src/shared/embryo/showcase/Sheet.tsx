import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../../theme/colors";
import { MONO } from "../../../theme/fonts";
import { HEIGHT, WIDTH } from "../../../theme/layout";
import { Embryo } from "../Embryo";
import { YolkSac, YolkStalk, sacEdge } from "../YolkSac";
import { centreOf, embryoAnchors, yolkSuggest } from "../anchors";
import { heartbeatGlow, heartbeatPulse } from "../heartbeat";

// Showcase: a grid of weeks (contact sheet), or one big embryo for detail.
// props.scene3 = place week 6 exactly where Scene3 puts its embryo (to diff).
export type SheetProps = { weeks: number[]; cols: number; scene3?: boolean; guides?: boolean; zip?: number; rotate?: number };

export const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 45%, ${C.bg2} 0%, ${C.bg0} 72%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 45%, ${C.wombDeep} 0%, transparent 70%)`, opacity: 0.6 }} />
  </AbsoluteFill>
);

type SpecProps = { week: number; x: number; y: number; size: number; id: string; zip?: number; guides?: boolean; rotate?: number };
export const Specimen: React.FC<SpecProps> = ({
  week,
  x,
  y,
  size,
  id,
  zip,
  guides,
  rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const a = embryoAnchors(week, size, { x, y, rotate });
  const sac = yolkSuggest(week, size, { x, y, rotate });
  const pulse = heartbeatPulse(frame + 3, { start: 0, firstBoost: false });
  const glow = heartbeatGlow(frame + 3, { start: 0, firstBoost: false });
  return (
    <g>
      {sac.stalk > 0 && <YolkStalk from={a.yolkStalk} to={sacEdge(sac, a.yolkStalk)} scale={sac.stalk} glow={glow} />}
      <YolkSac x={sac.x} y={sac.y} r={sac.r} glow={glow} id={id} />
      <Embryo week={week} size={size} x={x} y={y} rotate={rotate} id={id} heartBeat={pulse} heartGlow={glow} zip={zip} />
      {guides && (
        <g>
          <rect x={x - a.width / 2} y={y - a.height / 2} width={a.width} height={a.height} fill="none" stroke={C.cellCyan} strokeOpacity={0.35} strokeDasharray="6 6" />
          {[a.heart, a.head, a.crown, a.eye, a.hand, a.foot, a.yolkStalk, a.tail].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="none" stroke={[C.heart, C.gold, C.gold, C.cellCyan, C.cell, C.cell, C.peach, C.rose][i]} strokeWidth={2} />
          ))}
        </g>
      )}
    </g>
  );
};

export const Sheet: React.FC<SheetProps> = ({ weeks, cols, scene3, guides, zip, rotate }) => {
  const rows = Math.ceil(weeks.length / cols);
  const cw = WIDTH / cols;
  const ch = (HEIGHT - 120) / rows;
  const size = Math.min(cw, ch) * 0.62;
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute" }}>
        {weeks.map((w, i) => {
          if (scene3) {
            const c = centreOf(w);
            return <Specimen key={i} week={w} x={492 + c.x * 1.15} y={856 + c.y * 1.15} size={280 * 1.15} id={`s${i}`} guides={guides} zip={zip} />;
          }
          const cx = cw * (i % cols) + cw * 0.44;
          const cy = 80 + ch * Math.floor(i / cols) + ch * 0.5;
          return <Specimen key={i} week={w} x={cx} y={cy} size={size} id={`s${i}`} guides={guides} zip={zip} rotate={rotate} />;
        })}
      </svg>
      {!scene3 &&
        weeks.map((w, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cw * (i % cols) + 28,
              top: 80 + ch * Math.floor(i / cols) + 18,
              fontFamily: MONO,
              fontSize: 26,
              letterSpacing: 3,
              color: C.textDim,
            }}
          >
            WEEK {w}
          </div>
        ))}
    </AbsoluteFill>
  );
};
