// <Fetus>: the one parametric baby used from week 9 to week 40.
//
//   <svg ...><g transform="translate(540 860)">
//     <Fetus week={20} size={520} pose={{ armPose: "thumbSuck", legKick: k }} cord={<MyCord .../>} />
//   </g></svg>
//
// Draws in LOCAL px coords centred on its own origin (centre of the curled
// body in the week's reference pose; see frame.ts). Facing +x (right), head
// up, unless pose.mirror / headDown / rotate. `size` = px height of the
// curled body in the reference pose (pose changes never rescale it).
// Use fetusAnchors(week, pose, size) for navel / hands / feet / face / heart.
// Must be rendered inside an <svg>. Ids are unique per instance.
import React, { useId } from "react";
import { C } from "../../theme/colors";
import { FetusPose } from "./pose";
import { buildFetus } from "./rig";
import { outFrame } from "./frame";
import { FetusDefs, Ids, makeIds, url } from "./Defs";
import { Face } from "./Face";
import { LimbDetail, Lanugo, TorsoDetail } from "./Skin";
import { FootShape, HandShape, LimbLight, Shadow } from "./parts";

export type FetusProps = {
  week: number; // 9..40, fractional OK (animate it for growth)
  size: number; // px height of the curled body (reference pose)
  pose?: FetusPose;
  cord?: React.ReactNode; // drawn above torso/legs, below head/arm; same coords as fetusAnchors
  rim?: number; // warm rim light 0..1 (default 0.75)
  glow?: number; // soft halo into the fluid 0..1 (default 1)
  bloom?: number; // extra warm glow 0..1 (growth spurts, birth light)
  heartbeat?: number; // 0..1 pulse (e.g. heartbeat(frame)); shows through the chest early
  opacity?: number;
  uid?: string; // optional fixed id prefix (default: React useId)
};

// every SVG id is "fetus-<uid>-<name>" (uid: React useId unless given)
const useUid = (given?: string) => {
  const r = useId();
  return `fetus-${(given ?? r).replace(/[^a-zA-Z0-9_-]/g, "")}`;
};

export const Fetus: React.FC<FetusProps> = ({ week, size, pose, cord, rim = 0.75, glow = 1, bloom = 0, heartbeat = 0, opacity = 1, uid }) => {
  const ids: Ids = makeIds(useUid(uid));
  const geo = buildFetus(week, pose ?? {});
  const fr = outFrame(geo, size);
  const { g } = geo;
  const V = (x: number, y: number) => fr.vecToRig({ x, y });
  const h = geo.arm.hand;
  const f = geo.leg.foot;
  const handParts = [h.palm, h.thumb, ...h.fingers];
  const legParts = [geo.leg.path, f.sole, ...f.toes];
  const edge = `${C.skinShade}cc`;
  const pink = g.pink;
  const tint = (d: string, k = 1) => <path d={d} fill={C.rose} opacity={pink * k} />;
  // translucent early: the whole body lets the fluid glow through a little
  const bodyOpacity = opacity * (1 - 0.08 * Math.pow(g.translucency, 1.5));
  const H = 250 * geo.headS;
  const spec = { x: geo.headO.x + V(-0.1, -0.27).x * H, y: geo.headO.y + V(-0.1, -0.27).y * H };
  const specRot = fr.mx * (-28 - fr.rot);
  return (
    <g>
      <FetusDefs ids={ids} geo={geo} fr={fr} />
      {/* warm glow the body throws into the fluid */}
      <g transform={fr.css} filter={url(ids.halo)} opacity={opacity * glow * (0.22 + 0.3 * bloom)}>
        {geo.silhouette.map((d, i) => (
          <path key={i} d={d} fill={C.peach} />
        ))}
      </g>
      <g opacity={bodyOpacity}>
        <g transform={fr.css}>
          {/* far leg, in shade behind the body */}
          <path d={geo.farLeg.path} fill={url(ids.far)} />
          <FootShape f={geo.farLeg.foot} fill={url(ids.far)} edge={`${C.womb}88`} sep={g.fingerSep} />
          <g opacity={0.1}>
            {[geo.farLeg.path, geo.farLeg.foot.sole, ...geo.farLeg.foot.toes].map((d, i) => (
              <path key={i} d={d} fill={C.womb} />
            ))}
          </g>
          <LimbLight ids={ids} clip={ids.cFar} d={geo.farLeg.path} off={V(7, 8)} o={0.35} />

          {/* torso */}
          <path d={geo.torso} fill={url(ids.body)} />
          {tint(geo.torso)}
          <TorsoDetail geo={geo} ids={ids} heartbeat={heartbeat} />
          <Shadow ids={ids} clip={ids.cTorso} d={legParts} off={V(5, 8)} o={0.5} mask={url(ids.hipS)} />
          <Shadow ids={ids} clip={ids.cTorso} d={[geo.leg.path]} off={V(0, 0)} o={0.4} mask={url(ids.hipS)} />
          <Shadow ids={ids} clip={ids.cTorso} d={[geo.head]} off={V(4, 10)} o={0.55} />

          {/* near leg + foot (sole toward us) */}
          <path d={geo.leg.path} fill={url(ids.body)} />
          {tint(geo.leg.path)}
          <LimbLight ids={ids} clip={ids.cLeg} d={geo.leg.path} off={V(7, 8)} mask={url(ids.hipS)} />
          <LimbDetail geo={geo} ids={ids} part="leg" />
          <FootShape f={f} fill={url(ids.foot)} edge={edge} pads sep={g.fingerSep} padId={ids.soft} />
          {tint(f.sole, 0.7)}
        </g>

        {cord}

        <g transform={fr.css}>
          {/* head: translucent inner glow, face, crown light, fuzz */}
          <path d={geo.head} fill={url(ids.head)} />
          {tint(geo.head, 0.85)}
          <g clipPath={url(ids.cTH)}>
            <path d={geo.head} fill="none" stroke={C.rose} strokeWidth={30} filter={url(ids.glow)} opacity={0.18 + 0.32 * g.translucency} />
          </g>
          <Face geo={geo} ids={ids} />
          <g clipPath={url(ids.cHead)}>
            <ellipse cx={spec.x} cy={spec.y} rx={52 * geo.headS} ry={26 * geo.headS} transform={`rotate(${specRot} ${spec.x} ${spec.y})`}
              fill={C.text} opacity={0.12 + 0.12 * g.translucency + 0.08 * g.vernix} filter={url(ids.glow)} />
          </g>
          <Lanugo geo={geo} ids={ids} />

          {/* near arm + hand, contact shadow on head/body */}
          <Shadow ids={ids} clip={ids.cBody} d={[geo.arm.path, ...handParts]} off={V(6, 7)} o={0.45} mask={url(ids.shS)} />
          <path d={geo.arm.path} fill={url(ids.body)} />
          {tint(geo.arm.path)}
          <LimbLight ids={ids} clip={ids.cArm} d={geo.arm.path} off={V(6, 7)} mask={url(ids.shS)} />
          <LimbDetail geo={geo} ids={ids} part="arm" />
          <HandShape h={h} fill={url(ids.hand)} edge={edge} sep={g.fingerSep} />
          {[h.palm, h.thumb, ...h.fingers].map((d, i) => (
            <React.Fragment key={i}>{tint(d, 0.7)}</React.Fragment>
          ))}

          {/* warm rim light on the lower-right silhouette edge (screen space) */}
          <g mask={url(ids.rimM)} opacity={rim * (1 + 0.3 * bloom)}>
            {geo.silhouette.map((d, i) => (
              <path key={i} d={d} fill={url(ids.rimG)} />
            ))}
          </g>
        </g>
      </g>
    </g>
  );
};
