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

## Automated browser tests

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:e2e
```

Playwright builds the production app and starts its own server on port **3100**.
Keep that port free. Test builds use `.next-e2e` so they do not overwrite a
running development server’s `.next` output. Tests use fresh browser contexts and local audio fixtures;
no sample downloads or external services are needed during the test run. Browser
installation and dependency installation require internet access.

```sh
npm run test:e2e -- --project=chromium # quick single-browser run
npm run test:e2e:ui                    # interactive test runner
npm run test:e2e:headed                # visible browser windows
npm run test:e2e:report                # view the last HTML report
```

The 46 test cases run on Chromium, Firefox, WebKit, Pixel 7 emulation, and iPhone 13
emulation (230 executions total). Mobile projects emulate browser/device settings; they do not replace
physical-device testing.

- `tests/e2e/explorer.spec.ts`: initial state, all 14 scales in all 12 keys,
  expected notes and polygon vertices, intervals, keyboard and pointer
  transposition, sharp/flat notation, duration bounds, and reset preferences.
- `tests/e2e/interface.spec.ts`: saved and system themes, both help entry points
  and all dismissal methods, and layouts from 320 to 1280 pixels wide.
- `tests/e2e/playback.spec.ts`: real Tone.js sine playback and sequential note
  highlights, all 20 sampled instruments, stop/change cancellation, pending-load
  cancellation, failed downloads, and successful retry.
- `tests/e2e/fixtures.ts`: isolated page setup, uncaught browser error checks, and
  generated PCM WAV responses for sample requests.

Audio tests exercise real Web Audio scheduling and decoding with a short test
tone substituted for remote recordings. They verify UI state and timing, not
speaker output, musical timbre, or upstream sample availability. Scale
expectations are maintained independently of production scale definitions.

GitHub Actions runs unit and browser tests plus typechecking on pushes and pull
requests. Failed tests retain screenshots, videos, and traces; the HTML report
and results are uploaded for 14 days. CI retries failures twice and uses two
workers; local runs do not retry. Generated reports are excluded from Git.
