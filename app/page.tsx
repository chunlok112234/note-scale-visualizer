"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, AudioLines, Check, ChevronDown, CircleHelp, Moon, MoveUpRight, Music2, Pause, Play, RotateCcw, Sun, X } from "lucide-react";

const sharp = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const flat = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const scales = {
  Major: { intervals: [0, 2, 4, 5, 7, 9, 11], mood: "Bright, open & familiar", description: "The foundation of Western harmony. A balanced pattern of whole and half steps gives the major scale its bright, resolved sound.", degrees: ["1", "2", "3", "4", "5", "6", "7"] },
  "Natural minor": { intervals: [0, 2, 3, 5, 7, 8, 10], mood: "Reflective, soft & expressive", description: "A lowered third, sixth, and seventh give the natural minor scale its introspective character. The same notes, a different emotional landscape.", degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"] },
  "Harmonic minor": { intervals: [0, 2, 3, 5, 7, 8, 11], mood: "Dramatic, rich & distinctive", description: "A raised seventh pulls strongly toward the tonic. The wide step between the sixth and seventh creates its distinctive, dramatic sound.", degrees: ["1", "2", "♭3", "4", "5", "♭6", "7"] },
  "Major pentatonic": { intervals: [0, 2, 4, 7, 9], mood: "Simple, warm & free", description: "Five notes with room to breathe. Removing the half steps creates an open, melodic scale heard in folk, pop, and music around the world.", degrees: ["1", "2", "3", "5", "6"] },
  "Minor pentatonic": { intervals: [0, 3, 5, 7, 10], mood: "Soulful, grounded & melodic", description: "A five-note staple of blues and rock. Its spacious intervals make a natural starting point for expressive melodies and improvisation.", degrees: ["1", "♭3", "4", "5", "♭7"] },
  Dorian: { intervals: [0, 2, 3, 5, 7, 9, 10], mood: "Mellow with a little light", description: "A minor sound with a brighter sixth. Dorian combines a reflective mood with an unexpected lift, making it a favorite in jazz and funk.", degrees: ["1", "2", "♭3", "4", "5", "6", "♭7"] },
  Mixolydian: { intervals: [0, 2, 4, 5, 7, 9, 10], mood: "Bright, loose & bluesy", description: "Major with a lowered seventh. This small change softens the pull toward home and gives the scale its relaxed, bluesy character.", degrees: ["1", "2", "3", "4", "5", "6", "♭7"] },
  "Whole tone": { intervals: [0, 2, 4, 6, 8, 10], mood: "Dreamlike, floating & even", description: "Every note is a whole step apart. Its perfectly symmetrical shape reflects a floating sound without a strong sense of home.", degrees: ["1", "2", "3", "♯4", "♯5", "♭7"] },
  Chromatic: { intervals: Array.from({ length: 12 }, (_, i) => i), mood: "Every color, every possibility", description: "All twelve semitones, equally spaced. The chromatic scale contains every pitch class in Western equal temperament.", degrees: ["1", "♭2", "2", "♭3", "3", "4", "♯4", "5", "♭6", "6", "♭7", "7"] },
};
type ScaleName = keyof typeof scales;
const round = (n: number) => Math.round(n * 1000) / 1000;
const point = (n: number, radius = 185) => ({ x: round(280 + Math.sin(n * Math.PI / 6) * radius), y: round(280 - Math.cos(n * Math.PI / 6) * radius) });

export default function Home() {
  const [root, setRoot] = useState(0);
  const [type, setType] = useState<ScaleName>("Major");
  const [dark, setDark] = useState(false);
  const [flats, setFlats] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [help, setHelp] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [audioError, setAudioError] = useState("");
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ angle: number; root: number } | null>(null);
  const context = useRef<AudioContext | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const voices = useRef<OscillatorNode[]>([]);
  const run = useRef(0);
  const scale = scales[type];
  const names = flats ? flat : sharp;
  const notes = scale.intervals.map(i => (root + i) % 12);
  const steps = scale.intervals.map((n, i) => (scale.intervals[i + 1] ?? 12) - n);
  const stop = () => {
    run.current += 1;
    timers.current.forEach(clearTimeout); timers.current = [];
    voices.current.forEach(v => { try { v.stop(); } catch {} }); voices.current = [];
    setPlaying(false); setActive(null);
  };
  useEffect(() => {
    const stored = localStorage.getItem("scale-shape-theme");
    setDark(stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches));
    return () => { timers.current.forEach(clearTimeout); void context.current?.close(); };
  }, []);
  const changeRoot = (n: number) => { stop(); setRoot((n + 12) % 12); };
  const play = async () => {
    if (playing) { stop(); return; }
    stop();
    const id = run.current;
    try {
      context.current ??= new AudioContext();
      const ctx = context.current;
      await ctx.resume();
      if (id !== run.current) return;
      setAudioError(""); setPlaying(true);
      // Keep one complete scale cycle inside the C4–B5 register: begin at the
      // selected tonic, then finish as soon as that tonic returns an octave up.
      const startMidi = 60 + root;
      const sequence = [...scale.intervals.map(interval => startMidi + interval), startMidi + 12];
      const start = ctx.currentTime + 0.05;
      sequence.forEach((midi, i) => {
        const time = start + i * 0.38;
        const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
        oscillator.type = "sine"; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(0.22, time + 0.025); gain.gain.exponentialRampToValueAtTime(0.001, time + 0.34);
        oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(time); oscillator.stop(time + 0.36);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        voices.current.push(oscillator);
        timers.current.push(setTimeout(() => setActive(midi), (time - ctx.currentTime) * 1000));
      });
      timers.current.push(setTimeout(stop, (sequence.length * 0.38 + 0.08) * 1000));
    } catch { setAudioError("Audio could not start. Please try playing again."); stop(); }
  };
  const angle = (x: number, y: number) => {
    const rect = svg.current!.getBoundingClientRect();
    return Math.atan2(x - rect.left - rect.width / 2, -(y - rect.top - rect.height / 2)) * 180 / Math.PI;
  };
  const reset = () => { stop(); setRoot(0); setType("Major"); };

  return <div className={`app ${dark ? "dark" : "light"}`}>
    <header className="header"><a href="/" className="brand" aria-label="Scale Shape home"><span className="brand-mark"><AudioLines size={23} /></span>scale<span className="brand-light">shape</span><span className="brand-dot">.</span></a>
      <div className="header-right"><span className="header-caption">A little music. A new perspective.</span><span className="header-divider"/><button className="icon-button" onClick={() => setHelp(true)} aria-label="How to use Scale Shape"><CircleHelp size={20}/></button><button className="icon-button theme-button" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} onClick={() => { setDark(!dark); localStorage.setItem("scale-shape-theme", dark ? "light" : "dark"); }}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button></div>
    </header>
    <main>
      <section className="intro"><div className="eyebrow"><span/> MUSIC, IN A DIFFERENT SHAPE</div><h1>See the shape of sound<span>.</span></h1><p>Twelve notes. Endless possibilities. Explore the geometry behind your favorite scales.</p></section>
      <section className="workspace" aria-label="Interactive scale explorer">
        <div className="explorer">
          <div className="explorer-top"><span className="section-label"><span className="live-dot"/> SCALE EXPLORER</span><button className="text-button" onClick={reset}><RotateCcw size={14}/> Reset</button></div>
          <div className="circle-wrap">
            <svg ref={svg} viewBox="0 0 560 560" role="group" aria-label={`${names[root]} ${type} scale. Drag the polygon to transpose, or use arrow keys.`} tabIndex={0}
              onKeyDown={e => { if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(e.key)) { e.preventDefault(); changeRoot(root + (["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : -1)); } }}
              onPointerDown={e => { if (e.button !== 0) return; stop(); drag.current = { angle: angle(e.clientX, e.clientY), root }; e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }}
              onPointerMove={e => { if (!drag.current) return; let delta = angle(e.clientX, e.clientY) - drag.current.angle; if (delta > 180) delta -= 360; if (delta < -180) delta += 360; setRoot((drag.current.root + Math.round(delta / 30) + 24) % 12); }}
              onPointerUp={() => { drag.current = null; setDragging(false); }} onPointerCancel={() => { drag.current = null; setDragging(false); }} className={dragging ? "dragging" : ""}>
              <circle cx="280" cy="280" r="224" className="outer-guide"/>
              {Array.from({ length: 60 }, (_, i) => { const a = point(i / 5, 217); const b = point(i / 5, i % 5 === 0 ? 208 : 213); return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="tick"/>; })}
              <circle cx="280" cy="280" r="185" className="main-ring"/>
              {[0, 1, 2, 3, 4, 5].map(n => { const a = point(n); const b = point(n + 6); return <line key={n} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="guide"/>; })}
              <polygon points={notes.map(n => { const p = point(n); return `${p.x},${p.y}`; }).join(" ")} className="scale-polygon"/>
              {sharp.map((_, n) => { const p = point(n); const label = point(n, 246); const selected = notes.includes(n); const sounding = active !== null && active % 12 === n; return <g key={n}>
                {n === root && <circle cx={p.x} cy={p.y} r="17" className="tonic-halo"/>}
                {sounding && <circle cx={p.x} cy={p.y} r="23" className="playing-halo"/>}
                <circle cx={p.x} cy={p.y} r={n === root || sounding ? 9 : selected ? 6.5 : 4.5} className={sounding ? "sounding-note" : selected ? "selected-note" : "unused-note"}/>
                <text x={label.x} y={label.y} dominantBaseline="central" textAnchor="middle" className={`note-label ${selected ? "in-scale" : ""} ${n === root ? "root-label" : ""}`}>{names[n]}</text>
              </g>; })}
              <circle cx="280" cy="280" r="69" className="center-disc"/>
              <text x="280" y="252" textAnchor="middle" className="center-eyebrow">{playing ? "NOW PLAYING" : "TONIC"}</text>
              <text x="280" y="299" textAnchor="middle" className="center-note">{active !== null ? `${names[active % 12]}${Math.floor(active / 12) - 1}` : names[root]}</text>
              <text x="280" y="323" textAnchor="middle" className="center-scale">{type}</text>
            </svg>
            <div className="drag-hint"><RotateCcw size={14}/>{dragging ? "Release to keep this key" : "Drag the shape to discover a new key"}</div>
          </div>
          <div className="controls"><label className="select-field"><span>Key signature</span><select aria-label="Key signature" value={root} onChange={e => changeRoot(Number(e.target.value))}>{names.map((n, i) => <option key={n} value={i}>{n}</option>)}</select><ChevronDown size={17}/></label>
            <label className="select-field scale-select"><span>Scale type</span><select aria-label="Scale type" value={type} onChange={e => { stop(); setType(e.target.value as ScaleName); }}>{Object.keys(scales).map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={17}/></label>
            <button className={`play-button ${playing ? "is-playing" : ""}`} onClick={play}>{playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}<span>{playing ? "Stop scale" : "Play scale"}</span></button>
          </div>
          <div className="audio-caption"><AudioLines size={13}/><span>Sine wave</span><span className="small-dot"/><span>C4 – B5 register</span><span className="small-dot"/><span>One cycle</span><span className="audio-status">{playing ? <><span className="live-dot"/> Playing</> : "Sound on, curiosity up"}</span></div>
          {audioError && <p role="alert" className="error">{audioError}</p>}
        </div>
        <aside className="details"><div className="detail-heading"><span className="section-label">THE SCALE AT A GLANCE</span><span className="mini-icon"><Music2 size={18}/></span></div><div className="scale-title"><h2>{names[root]} <span>{type.toLowerCase()}</span></h2><p>{scale.mood}</p></div>
          <div className="note-count"><span className="count-number">{notes.length}</span><span>notes<span className="count-sub">out of 12 semitones</span></span><svg viewBox="0 0 48 48" width="47" height="47" aria-hidden="true">{sharp.map((_, i) => <circle key={i} cx={round(24 + Math.sin(i * Math.PI / 6) * 18)} cy={round(24 - Math.cos(i * Math.PI / 6) * 18)} r="2.8" fill={notes.includes(i) ? "var(--primary)" : "var(--outline)"}/>)}</svg></div>
          <div className="detail-section"><h3>Notes in this scale</h3><div className="note-chips">{notes.map((n, i) => <span key={n} className={`note-chip ${i === 0 ? "tonic-chip" : ""} ${active !== null && active % 12 === n ? "active-chip" : ""}`}>{names[n]}{i === 0 && <span className="chip-dot"/>}</span>)}</div><div className="legend"><span/> Tonic / home note</div></div>
          <div className="detail-section"><h3>Interval pattern</h3><div className="intervals">{steps.map((s, i) => <span key={i}>{s === 2 ? "W" : s === 1 ? "H" : "3H"}{i < steps.length - 1 && <i>·</i>}</span>)}</div><p className="small-copy">W = whole step <span>H = half step</span>{steps.includes(3) && <span>3H = three half steps</span>}</p></div>
          <div className="description"><span className="description-icon"><AudioLines size={19}/></span><p>{scale.description}</p></div>
          <div className="notation"><div><h3>Note notation</h3><p>Same sound, different name.</p></div><div className="segmented" aria-label="Note notation"><button aria-pressed={!flats} className={!flats ? "chosen" : ""} onClick={() => setFlats(false)}>{!flats && <Check size={12}/>}♯</button><button aria-pressed={flats} className={flats ? "chosen" : ""} onClick={() => setFlats(true)}>{flats && <Check size={12}/>}♭</button></div></div>
        </aside>
      </section>
      <section className="learn-strip"><div className="learn-icon"><MoveUpRight size={22}/></div><div><h3>A new key. The same shape.</h3><p>Rotate a scale and its notes change, but the space between them stays the same. That’s transposition.</p></div><button onClick={() => setHelp(true)} aria-label="Learn about transposition"><ArrowUpRight size={21}/></button></section>
      <footer><span>Made for your eyes. And your ears.</span><span>EXPLORE <span className="footer-dot">·</span> LISTEN <span className="footer-dot">·</span> DISCOVER</span><span className="footer-end"><span/> A small space for musical curiosity</span></footer>
    </main>
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === "Escape") setHelp(false); }}><button autoFocus className="icon-button close-help" aria-label="Close help" onClick={() => setHelp(false)}><X size={20}/></button><span className="eyebrow">A QUICK GUIDE</span><h2 id="help-title">A little circle. A lot to discover.</h2><p>Each point represents one of the twelve semitones. The polygon connects the notes in your selected scale; the larger point marks its tonic, or home note.</p><p><strong>Rotate.</strong> Drag the circle or focus it and use the arrow keys. Each step changes the key by one semitone, preserving the scale’s interval pattern.</p><p><strong>Explore.</strong> Choose a key and scale below the circle. The sharp / flat switch changes pitch-class labels to their enharmonic equivalents.</p><p><strong>Listen.</strong> Play one ascending sine-wave cycle in the C4–B5 register: begin at the selected tonic and stop when that tonic returns an octave higher. The highlighted point follows each sound.</p><button className="play-button" onClick={() => setHelp(false)}>Let’s explore <ArrowUpRight size={16}/></button></section></div>}
  </div>;
}
