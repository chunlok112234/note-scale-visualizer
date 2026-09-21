"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  AudioLines,
  CircleHelp,
  Moon,
  MoveUpRight,
  RotateCcw,
  Sun,
} from "lucide-react";

import { ScaleCircle } from "./ScaleCircle";
import { ScaleDetails } from "./ScaleDetails";
import { ScaleControls } from "./ScaleControls";
import { HelpDialog } from "./HelpDialog";
import { useScalePlayback } from "../hooks/useScalePlayback";
import {
  flat,
  sharp,
  scales,
  scaleSequence,
  type ScaleName,
} from "../lib/music/scales";
import { type InstrumentName } from "../lib/audio/instruments";

export function ScaleExplorer() {
  const [root, setRoot] = useState(0);
  const [type, setType] = useState<ScaleName>("Major");
  const [dark, setDark] = useState(false);
  const [flats, setFlats] = useState(false);
  const [help, setHelp] = useState(false);
  const [instrument, setInstrument] = useState<InstrumentName>("piano");
  const [duration, setDuration] = useState(0.4);
  const {
    playing,
    loading,
    active,
    error: audioError,
    play: startPlayback,
    stop,
  } = useScalePlayback();
  const scale = scales[type];
  const names = flats ? flat : sharp;
  const notes = scale.intervals.map((i) => (root + i) % 12);
  useEffect(() => {
    const stored = localStorage.getItem("scale-shape-theme");
    setDark(
      stored === "dark" ||
        (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, []);
  const changeRoot = (n: number) => {
    stop();
    setRoot((n + 12) % 12);
  };
  const play = () => {
    if (playing || loading) stop();
    else
      void startPlayback(
        scaleSequence(root, scale.intervals),
        instrument,
        duration,
      );
  };
  const reset = () => {
    stop();
    setRoot(0);
    setType("Major");
  };

  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      <header className="header">
        <a href="/" className="brand" aria-label="Scale Visualizer home">
          <span className="brand-mark">
            <AudioLines size={23} />
          </span>
          scale<span className="brand-light">visualizer</span>
          <span className="brand-dot">.</span>
        </a>
        <div className="header-right">
          <span className="header-caption">
            A little music. A new perspective.
          </span>
          <span className="header-divider" />
          <button
            className="icon-button"
            onClick={() => setHelp(true)}
            aria-label="How to use Scale Visualizer"
          >
            <CircleHelp size={20} />
          </button>
          <button
            className="icon-button theme-button"
            aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
            onClick={() => {
              setDark(!dark);
              localStorage.setItem(
                "scale-shape-theme",
                dark ? "light" : "dark",
              );
            }}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </header>
      <main>
        <section className="intro">
          <div className="eyebrow">
            <span /> MUSIC, IN A DIFFERENT SHAPE
          </div>
          <h1>
            See the shape of sound<span>.</span>
          </h1>
          <p>
            Twelve notes. Endless possibilities. Explore the geometry behind
            your favorite scales.
          </p>
        </section>
        <section className="workspace" aria-label="Interactive scale explorer">
          <div className="explorer">
            <div className="explorer-top">
              <span className="section-label">
                <span className="live-dot" /> SCALE EXPLORER
              </span>
              <button className="text-button" onClick={reset}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            <ScaleCircle
              {...{
                root,
                type,
                names,
                notes,
                active,
                playing,
                stop,
                changeRoot,
              }}
            />
            <ScaleControls
              {...{
                root,
                type,
                names,
                instrument,
                duration,
                playing,
                loading,
                play,
                changeRoot,
              }}
              onScaleChange={(value) => {
                stop();
                setType(value);
              }}
              onInstrumentChange={(value) => {
                stop();
                setInstrument(value);
              }}
              onDurationChange={(value) => {
                stop();
                setDuration(value);
              }}
            />
            {audioError && (
              <p role="alert" className="error">
                {audioError}
              </p>
            )}
          </div>
          <ScaleDetails
            {...{ root, type, names, notes, active, flats, setFlats }}
          />
        </section>
        <section className="learn-strip">
          <div className="learn-icon">
            <MoveUpRight size={22} />
          </div>
          <div>
            <h3>A new key. The same shape.</h3>
            <p>
              Rotate a scale and its notes change, but the space between them
              stays the same. That’s transposition.
            </p>
          </div>
          <button
            onClick={() => setHelp(true)}
            aria-label="Learn about transposition"
          >
            <ArrowUpRight size={21} />
          </button>
        </section>
        <footer>
          <span>Made for your eyes. And your ears.</span>
          <span>
            EXPLORE <span className="footer-dot">·</span> LISTEN{" "}
            <span className="footer-dot">·</span> DISCOVER
          </span>
          <span className="footer-end">
            <span /> A small space for musical curiosity
          </span>
        </footer>
      </main>
      {help && <HelpDialog onClose={() => setHelp(false)} />}
    </div>
  );
}
