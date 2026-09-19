# Scale Shape

An interactive Next.js scale visualizer with Material Design 3 colors, light and dark themes, and Web Audio sine-wave playback.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. For a production build, run `npm run build` followed by `npm start`.

## Explore

- Drag the polygon to transpose by semitones. The key selector updates automatically.
- Focus the circle and use arrow keys for keyboard transposition.
- Select one of nine scales and switch between sharp and flat pitch-class labels.
- Play one ascending scale cycle within the C4–B5 register. Playback starts at the selected tonic and stops when that tonic returns an octave higher. The circle highlights the sounding note.
- Changing the scale or key stops playback. Press Stop scale to stop manually.
- Theme preferences persist locally; the initial theme follows the system preference.

Pitch-class labels use a consistent sharp or flat notation rather than theoretical key-specific enharmonic spelling. Playback uses equal temperament with A4 = 440 Hz.

## Checks

```sh
npm run typecheck
npm run build
```
