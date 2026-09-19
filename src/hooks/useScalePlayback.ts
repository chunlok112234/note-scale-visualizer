import { useCallback, useEffect, useRef, useState } from "react";
import {
  createInstrument,
  type InstrumentName,
} from "../lib/audio/instruments";

type Voice = import("tone").Synth | import("tone").Sampler;

/** Owns a single playback session; cancellation also invalidates pending loads. */
export function useScalePlayback() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [error, setError] = useState("");
  const session = useRef<AbortController | null>(null);
  const voice = useRef<Voice | null>(null);
  const frame = useRef<number | null>(null);

  const cancel = useCallback(() => {
    session.current?.abort();
    session.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    // Disposing also cancels notes already scheduled on the audio clock.
    voice.current?.dispose();
    voice.current = null;
  }, []);

  const stop = useCallback(() => {
    cancel();
    setPlaying(false);
    setLoading(false);
    setActive(null);
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  const play = useCallback(
    async (
      sequence: number[],
      instrument: InstrumentName,
      duration: number,
    ) => {
      stop();
      const controller = new AbortController();
      session.current = controller;
      setError("");
      setLoading(true);
      try {
        const Tone = await import("tone");
        if (controller.signal.aborted) return;
        await Tone.start();
        if (controller.signal.aborted) return;
        const nextVoice = await createInstrument(
          Tone,
          instrument,
          controller.signal,
        );
        if (controller.signal.aborted) {
          nextVoice.dispose();
          return;
        }
        voice.current = nextVoice;
        const start = Tone.now() + 0.05;
        sequence.forEach((midi, index) => {
          nextVoice.triggerAttackRelease(
            Tone.Frequency(midi, "midi").toFrequency(),
            duration,
            start + index * duration,
          );
        });
        setLoading(false);
        setPlaying(true);
        // Follow the audio clock, so throttled rendering never changes note timing.
        const update = () => {
          if (controller.signal.aborted) return;
          const elapsed = Tone.immediate() - start;
          if (elapsed >= sequence.length * duration + 0.08) {
            stop();
            return;
          }
          const index = Math.floor(elapsed / duration);
          setActive(
            index >= 0 && index < sequence.length ? sequence[index] : null,
          );
          frame.current = requestAnimationFrame(update);
        };
        update();
      } catch {
        if (controller.signal.aborted) return;
        stop();
        setError(
          "Could not load or play this instrument. Check your connection and try again, or choose Sine wave.",
        );
      }
    },
    [stop],
  );

  return { playing, loading, active, error, play, stop };
}
