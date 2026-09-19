import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { sharp, type ScaleName } from "../lib/music/scales";
import { point } from "../lib/music/geometry";
interface Props {
  root: number;
  type: ScaleName;
  names: string[];
  notes: number[];
  active: number | null;
  playing: boolean;
  stop: () => void;
  changeRoot: (root: number) => void;
}
export function ScaleCircle({
  root,
  type,
  names,
  notes,
  active,
  playing,
  stop,
  changeRoot,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ angle: number; root: number } | null>(null);
  const angle = (x: number, y: number) => {
    const rect = svg.current!.getBoundingClientRect();
    return (
      (Math.atan2(
        x - rect.left - rect.width / 2,
        -(y - rect.top - rect.height / 2),
      ) *
        180) /
      Math.PI
    );
  };
  return (
    <div className="circle-wrap">
      <svg
        ref={svg}
        viewBox="0 0 560 560"
        role="group"
        aria-label={`${names[root]} ${type} scale. Drag the polygon to transpose, or use arrow keys.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (
            ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            changeRoot(
              root + (["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : -1),
            );
          }
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          stop();
          drag.current = { angle: angle(e.clientX, e.clientY), root };
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          let delta = angle(e.clientX, e.clientY) - drag.current.angle;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          changeRoot((drag.current.root + Math.round(delta / 30) + 24) % 12);
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        className={dragging ? "dragging" : ""}
      >
        <circle cx="280" cy="280" r="224" className="outer-guide" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = point(i / 5, 217);
          const b = point(i / 5, i % 5 === 0 ? 208 : 213);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="tick"
            />
          );
        })}
        <circle cx="280" cy="280" r="185" className="main-ring" />
        {[0, 1, 2, 3, 4, 5].map((n) => {
          const a = point(n);
          const b = point(n + 6);
          return (
            <line
              key={n}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="guide"
            />
          );
        })}
        <polygon
          points={notes
            .map((n) => {
              const p = point(n);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          className="scale-polygon"
        />
        {sharp.map((_, n) => {
          const p = point(n);
          const label = point(n, 246);
          const selected = notes.includes(n);
          const sounding = active !== null && active % 12 === n;
          return (
            <g key={n}>
              {n === root && (
                <circle cx={p.x} cy={p.y} r="17" className="tonic-halo" />
              )}
              {sounding && (
                <circle cx={p.x} cy={p.y} r="23" className="playing-halo" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={n === root || sounding ? 9 : selected ? 6.5 : 4.5}
                className={
                  sounding
                    ? "sounding-note"
                    : selected
                      ? "selected-note"
                      : "unused-note"
                }
              />
              <text
                x={label.x}
                y={label.y}
                dominantBaseline="central"
                textAnchor="middle"
                className={`note-label ${selected ? "in-scale" : ""} ${n === root ? "root-label" : ""}`}
              >
                {names[n]}
              </text>
            </g>
          );
        })}
        <circle cx="280" cy="280" r="69" className="center-disc" />
        <text x="280" y="252" textAnchor="middle" className="center-eyebrow">
          {playing ? "NOW PLAYING" : "TONIC"}
        </text>
        <text x="280" y="299" textAnchor="middle" className="center-note">
          {active !== null
            ? `${names[active % 12]}${Math.floor(active / 12) - 1}`
            : names[root]}
        </text>
        <text x="280" y="323" textAnchor="middle" className="center-scale">
          {type}
        </text>
      </svg>
      <div className="drag-hint">
        <RotateCcw size={14} />
        {dragging
          ? "Release to keep this key"
          : "Drag the shape to discover a new key"}
      </div>
    </div>
  );
}
