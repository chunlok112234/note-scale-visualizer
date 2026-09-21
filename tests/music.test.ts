import assert from "node:assert/strict";
import test from "node:test";
import { scales, scaleSequence } from "../src/lib/music/scales";
import maps from "../src/lib/audio/sample-maps.json";

test("scale selector follows the curated mode order", () => {
  assert.deepEqual(Object.keys(scales), [
    "Major",
    "Natural minor",
    "Harmonic minor",
    "Major pentatonic",
    "Minor pentatonic",
    "Dorian",
    "Phrygian",
    "Lydian",
    "Mixolydian",
    "Locrian",
    "Hijaz",
    "Hungarian minor",
    "Whole tone",
    "Chromatic",
  ]);
});

test("every scale in every key ascends through exactly one octave in C4–B5", () => {
  for (let root = 0; root < 12; root++) {
    for (const scale of Object.values(scales)) {
      const notes = scaleSequence(root, scale.intervals);
      assert.equal(notes[0], 60 + root);
      assert.equal(notes.at(-1), notes[0] + 12);
      assert.equal(notes.length, scale.intervals.length + 1);
      assert.ok(
        notes.every(
          (note, i) =>
            note >= 60 && note <= 83 && (i === 0 || note > notes[i - 1]),
        ),
      );
    }
  }
});

test("all 20 sample instruments provide samples in the playback register", () => {
  assert.equal(Object.keys(maps).length, 20);
  const pitch = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  for (const [instrument, samples] of Object.entries(maps)) {
    const inRange = Object.entries(samples).filter(([note]) => {
      const [, letter, accidental, octave] = /^([A-G])(#?)(\d)$/.exec(note)!;
      const midi =
        (Number(octave) + 1) * 12 +
        pitch[letter as keyof typeof pitch] +
        (accidental ? 1 : 0);
      return midi >= 55 && midi <= 84;
    });
    assert.ok(inRange.length > 0, instrument);
    assert.ok(
      inRange.every(([, file]) => file.endsWith(".mp3")),
      instrument,
    );
  }
});
