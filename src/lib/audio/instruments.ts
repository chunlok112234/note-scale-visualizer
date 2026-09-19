import sampleMaps from "./sample-maps.json";

export type SampleInstrument = keyof typeof sampleMaps;
export type InstrumentName = "sine" | SampleInstrument;
export const instruments: { value: InstrumentName; label: string }[] = [
  { value: "sine", label: "Sine wave" },
  ...Object.keys(sampleMaps).map((value) => ({
    value: value as SampleInstrument,
    label: value
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" "),
  })),
];

// Vendored note/file mappings from nbrosowsky/tonejs-instruments, MIT.
// Samples: Nicholaus P. Brosowsky, CC BY 3.0. See accompanying license.
// Pin assets to the same revision as the mappings to prevent upstream drift.
const sampleBase =
  "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/622c2f1c32c8cfce4158ddc3eb26e518ddef37e5/samples/";

export async function createInstrument(
  Tone: typeof import("tone"),
  name: InstrumentName,
  signal: AbortSignal,
): Promise<import("tone").Synth | import("tone").Sampler> {
  signal.throwIfAborted();
  if (name === "sine") {
    return new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.05 },
      volume: -12,
    }).toDestination();
  }
  return new Promise((resolve, reject) => {
    // Use samples around the app's C4–B5 register. Sampler interpolates pitches.
    const urls = Object.fromEntries(
      Object.entries(sampleMaps[name]).filter(([note]) => {
        const midi = Tone.Frequency(note).toMidi();
        return midi >= 55 && midi <= 84;
      }),
    );
    const cleanup = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
    };
    const fail = (error: unknown) => {
      cleanup();
      sampler.dispose();
      reject(error);
    };
    const abort = () =>
      fail(new DOMException("Playback cancelled", "AbortError"));
    const timeout = setTimeout(
      () => fail(new Error("Instrument loading timed out")),
      20000,
    );
    const sampler = new Tone.Sampler({
      urls,
      baseUrl: `${sampleBase}${name}/`,
      release: 0.05,
      volume: -9,
      onload: () => {
        cleanup();
        resolve(sampler.toDestination());
      },
      onerror: (error) => fail(error),
    });
    signal.addEventListener("abort", abort, { once: true });
  });
}
