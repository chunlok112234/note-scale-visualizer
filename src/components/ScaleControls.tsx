import { AudioLines, ChevronDown, Pause, Play } from "lucide-react";
import { scales, type ScaleName } from "../lib/music/scales";
import { instruments, type InstrumentName } from "../lib/audio/instruments";

interface Props {
  root: number;
  type: ScaleName;
  names: string[];
  instrument: InstrumentName;
  duration: number;
  playing: boolean;
  loading: boolean;
  play: () => void;
  changeRoot: (value: number) => void;
  onScaleChange: (value: ScaleName) => void;
  onInstrumentChange: (value: InstrumentName) => void;
  onDurationChange: (value: number) => void;
}

export function ScaleControls({
  root,
  type,
  names,
  instrument,
  duration,
  playing,
  loading,
  play,
  changeRoot,
  onScaleChange,
  onInstrumentChange,
  onDurationChange,
}: Props) {
  const busy = playing || loading;
  return (
    <div className="scale-controls">
      <div className="controls primary-controls">
        <label className="select-field">
          <span>Key signature</span>
          <select
            value={root}
            onChange={(event) => changeRoot(Number(event.target.value))}
          >
            {names.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown size={17} />
        </label>
        <label className="select-field scale-select">
          <span>Scale type</span>
          <select
            value={type}
            onChange={(event) => onScaleChange(event.target.value as ScaleName)}
          >
            {Object.keys(scales).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <ChevronDown size={17} />
        </label>
        <button
          className={`play-button ${busy ? "is-playing" : ""}`}
          onClick={play}
        >
          {busy ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          <span>
            {loading ? "Cancel load" : playing ? "Stop scale" : "Play scale"}
          </span>
        </button>
      </div>
      <div className="controls sound-controls">
        <label className="select-field">
          <span>Instrument</span>
          <select
            value={instrument}
            onChange={(event) =>
              onInstrumentChange(event.target.value as InstrumentName)
            }
          >
            {instruments.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={17} />
        </label>
        <label className="duration-field" htmlFor="note-duration">
          <span>
            Note duration{" "}
            <output htmlFor="note-duration">{duration.toFixed(1)} s</output>
          </span>
          <input
            id="note-duration"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={duration}
            aria-valuetext={`${duration.toFixed(1)} seconds`}
            onChange={(event) => onDurationChange(Number(event.target.value))}
          />
          <span className="range-limits">
            <span>0.1 s</span>
            <span>1.0 s</span>
          </span>
        </label>
      </div>
      <div className="audio-caption">
        <AudioLines size={13} />
        <span>C4 – B5 register</span>
        <span className="small-dot" />
        <span>One cycle</span>
        <span className="audio-status" role="status">
          {loading
            ? "Loading instrument…"
            : playing
              ? "Playing"
              : "Ready to play"}
        </span>
      </div>
      {instrument !== "sine" && (
        <p className="sample-credit">
          Samples:{" "}
          <a href="https://github.com/nbrosowsky/tonejs-instruments">
            tonejs-instruments · N. P. Brosowsky
          </a>{" "}
          · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>
        </p>
      )}
    </div>
  );
}
