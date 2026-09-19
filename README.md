# Scale Shape

An interactive Next.js scale visualizer with light/dark themes and Tone.js playback.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` then `npm start`.

## Explore

- Drag the polygon or use its arrow keys to transpose by semitones.
- First control row: **Key signature**, **Scale type**, **Play scale / Stop scale**.
- Second control row: **Instrument** and **Note duration** (0.1–1.0 seconds, in 0.1-second steps).
- Choose a sine synthesizer or any of 20 sampled instruments. Piano is the default.
- Playback ascends from the selected tonic to the tonic one octave above, within C4–B5. Highlights follow the audio clock.
- Changing the key, scale, instrument or duration cancels playback, including a pending instrument load. Reset restores C major while preserving sound preferences.
- Theme preferences persist locally. Sharp/flat labels are pitch-class equivalents, not theoretical key-specific spellings.

## Source structure

```text
src/
  app/                  Next.js route and root layout
  components/           Explorer, circle interaction, controls, details, help
  hooks/                Playback session state, scheduling and cancellation
  lib/
    music/              Scale definitions, MIDI sequence and circle geometry
    audio/              Tone.js adapter, instrument catalog and sample mappings
  styles/               Readable global styles and responsive layouts
```

Keep music calculations independent of React. UI components render data and send changes to the explorer; `useScalePlayback` owns audio resources and cleans them up on cancellation or unmount. Tone.js is imported only when the user starts playback, so server rendering never creates an audio context.

## Instruments and attribution

Tone.js 15 supplies the synthesizer, sampler and audio clock. The instrument mappings are vendored from [nbrosowsky/tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments), revision `622c2f1c32c8cfce4158ddc3eb26e518ddef37e5`. Its original global loader targets an older Tone API; `src/lib/audio/instruments.ts` adapts those mappings to the current Sampler API.

Sample files load on demand from the same pinned GitHub revision. Only samples near the application's register are loaded; Tone.Sampler interpolates the remaining notes. First use of sampled instruments requires internet access; failed loads show a retry message and the sine option remains available. Notes sustain for the selected duration with a short release tail, subject to the natural length of each recording.

Code: MIT, copyright 2018 Nicholaus P. Brosowsky. Samples: [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), credited to N. P. Brosowsky / tonejs-instruments. See `src/lib/audio/TONEJS-INSTRUMENTS-LICENSE.md`. Source recordings have not been edited here. To update the library, update both the mappings and pinned asset revision together.

## Checks

```sh
npm test
npm run build
npm run typecheck
npm run format:check
```

After relocating routes, run the build before typechecking to regenerate Next.js route types. Use `npm run format` to keep source formatting consistent.
