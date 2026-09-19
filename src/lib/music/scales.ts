export const sharp = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
];
export const flat = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
export const scales = {
  Major: {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    mood: "Bright, open & familiar",
    description:
      "The foundation of Western harmony. A balanced pattern of whole and half steps gives the major scale its bright, resolved sound.",
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
  },
  "Natural minor": {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    mood: "Reflective, soft & expressive",
    description:
      "A lowered third, sixth, and seventh give the natural minor scale its introspective character. The same notes, a different emotional landscape.",
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"],
  },
  "Harmonic minor": {
    intervals: [0, 2, 3, 5, 7, 8, 11],
    mood: "Dramatic, rich & distinctive",
    description:
      "A raised seventh pulls strongly toward the tonic. The wide step between the sixth and seventh creates its distinctive, dramatic sound.",
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "7"],
  },
  "Minor pentatonic": {
    intervals: [0, 3, 5, 7, 10],
    mood: "Soulful, grounded & melodic",
    description:
      "A five-note staple of blues and rock. Its spacious intervals make a natural starting point for expressive melodies and improvisation.",
    degrees: ["1", "♭3", "4", "5", "♭7"],
  },
  "Major pentatonic": {
    intervals: [0, 2, 4, 7, 9],
    mood: "Simple, warm & free",
    description:
      "Five notes with room to breathe. Removing the half steps creates an open, melodic scale heard in folk, pop, and music around the world.",
    degrees: ["1", "2", "3", "5", "6"],
  },
  Dorian: {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    mood: "Mellow with a little light",
    description:
      "A minor sound with a brighter sixth. Dorian combines a reflective mood with an unexpected lift, making it a favorite in jazz and funk.",
    degrees: ["1", "2", "♭3", "4", "5", "6", "♭7"],
  },
  Phrygian: {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    mood: "Dark, tense & exotic",
    description:
      "A minor mode with a flattened second. The half step above its tonic creates a dark, immediate tension found in flamenco and metal.",
    degrees: ["1", "♭2", "♭3", "4", "5", "♭6", "♭7"],
  },
  Lydian: {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    mood: "Bright, weightless & luminous",
    description:
      "A major sound with a raised fourth. That single lifted note gives Lydian its floating, open quality.",
    degrees: ["1", "2", "3", "♯4", "5", "6", "7"],
  },
  Mixolydian: {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    mood: "Bright, loose & bluesy",
    description:
      "Major with a lowered seventh. This small change softens the pull toward home and gives the scale its relaxed, bluesy character.",
    degrees: ["1", "2", "3", "4", "5", "6", "♭7"],
  },
  Locrian: {
    intervals: [0, 1, 3, 5, 6, 8, 10],
    mood: "Unstable, shadowy & unresolved",
    description:
      "Its flattened second and fifth remove the usual sense of rest. Locrian has a tense, unsettled color that resists resolution.",
    degrees: ["1", "♭2", "♭3", "4", "♭5", "♭6", "♭7"],
  },
  Hijaz: {
    intervals: [0, 1, 4, 5, 7, 8, 10],
    mood: "Vivid, dramatic & distinctive",
    description:
      "This 12-tone approximation of the Hijaz sound pairs a flattened second with a major third, creating its characteristic wide, expressive leap.",
    degrees: ["1", "♭2", "3", "4", "5", "♭6", "♭7"],
  },
  "Hungarian minor": {
    intervals: [0, 2, 3, 6, 7, 8, 11],
    mood: "Intense, ornate & restless",
    description:
      "Raised fourth and seventh degrees frame a minor scale with two large, dramatic gaps. Its color is vivid and highly directional.",
    degrees: ["1", "2", "♭3", "♯4", "5", "♭6", "7"],
  },
  "Whole tone": {
    intervals: [0, 2, 4, 6, 8, 10],
    mood: "Dreamlike, floating & even",
    description:
      "Every note is a whole step apart. Its perfectly symmetrical shape reflects a floating sound without a strong sense of home.",
    degrees: ["1", "2", "3", "♯4", "♯5", "♭7"],
  },
  Chromatic: {
    intervals: Array.from({ length: 12 }, (_, i) => i),
    mood: "Every color, every possibility",
    description:
      "All twelve semitones, equally spaced. The chromatic scale contains every pitch class in Western equal temperament.",
    degrees: ["1", "♭2", "2", "♭3", "3", "4", "♯4", "5", "♭6", "6", "♭7", "7"],
  },
};
export type ScaleName = keyof typeof scales;

export function scaleSequence(root: number, intervals: readonly number[]) {
  return [...intervals, 12].map((interval) => 60 + root + interval);
}
