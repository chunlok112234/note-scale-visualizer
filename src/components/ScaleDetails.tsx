import { AudioLines, Check, Music2 } from "lucide-react";
import { sharp, scales, type ScaleName } from "../lib/music/scales";
import { round } from "../lib/music/geometry";
interface Props {
  root: number;
  type: ScaleName;
  names: string[];
  notes: number[];
  active: number | null;
  flats: boolean;
  setFlats: (value: boolean) => void;
}
export function ScaleDetails({
  root,
  type,
  names,
  notes,
  active,
  flats,
  setFlats,
}: Props) {
  const scale = scales[type];
  const steps = scale.intervals.map(
    (n, i) => (scale.intervals[i + 1] ?? 12) - n,
  );
  return (
    <aside className="details">
      <div className="detail-heading">
        <span className="section-label">THE SCALE AT A GLANCE</span>
        <span className="mini-icon">
          <Music2 size={18} />
        </span>
      </div>
      <div className="scale-title">
        <h2>
          {names[root]} <span>{type.toLowerCase()}</span>
        </h2>
        <p>{scale.mood}</p>
      </div>
      <div className="note-count">
        <span className="count-number">{notes.length}</span>
        <span>
          notes<span className="count-sub">out of 12 semitones</span>
        </span>
        <svg viewBox="0 0 48 48" width="47" height="47" aria-hidden="true">
          {sharp.map((_, i) => (
            <circle
              key={i}
              cx={round(24 + Math.sin((i * Math.PI) / 6) * 18)}
              cy={round(24 - Math.cos((i * Math.PI) / 6) * 18)}
              r="2.8"
              fill={notes.includes(i) ? "var(--primary)" : "var(--outline)"}
            />
          ))}
        </svg>
      </div>
      <div className="detail-section">
        <h3>Notes in this scale</h3>
        <div className="note-chips">
          {notes.map((n, i) => (
            <span
              key={n}
              className={`note-chip ${i === 0 ? "tonic-chip" : ""} ${active !== null && active % 12 === n ? "active-chip" : ""}`}
            >
              {names[n]}
            </span>
          ))}
        </div>
        <div className="legend">
          <span />
          The note highlighted is the tonic / home tone.
        </div>
      </div>
      <div className="detail-section">
        <h3>Interval pattern</h3>
        <div className="intervals">
          {steps.map((s, i) => (
            <span key={i}>
              {s === 2 ? "W" : s === 1 ? "H" : "3H"}
              {i < steps.length - 1 && <i>·</i>}
            </span>
          ))}
        </div>
        <p className="small-copy">
          W = whole step <span>H = half step</span>
          {steps.includes(3) && <span>3H = three half steps</span>}
        </p>
      </div>
      <div className="description">
        <span className="description-icon">
          <AudioLines size={19} />
        </span>
        <p>{scale.description}</p>
      </div>
      <div className="notation">
        <div>
          <h3>Note notation</h3>
          <p>Same sound, different name.</p>
        </div>
        <div className="segmented" aria-label="Note notation">
          <button
            aria-pressed={!flats}
            className={!flats ? "chosen" : ""}
            onClick={() => setFlats(false)}
          >
            {!flats && <Check size={12} />}♯
          </button>
          <button
            aria-pressed={flats}
            className={flats ? "chosen" : ""}
            onClick={() => setFlats(true)}
          >
            {flats && <Check size={12} />}♭
          </button>
        </div>
      </div>
    </aside>
  );
}
