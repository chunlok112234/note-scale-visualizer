import { test, expect, circle } from "./fixtures";

// Independent expectations: do not import production scale calculations.
const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const cases: [string, number[], string][] = [
  ["Major", [0, 2, 4, 5, 7, 9, 11], "W W H W W W H"],
  ["Natural minor", [0, 2, 3, 5, 7, 8, 10], "W H W W H W W"],
  ["Harmonic minor", [0, 2, 3, 5, 7, 8, 11], "W H W W H 3H H"],
  ["Major pentatonic", [0, 2, 4, 7, 9], "W W 3H W 3H"],
  ["Minor pentatonic", [0, 3, 5, 7, 10], "3H W W 3H W"],
  ["Dorian", [0, 2, 3, 5, 7, 9, 10], "W H W W W H W"],
  ["Phrygian", [0, 1, 3, 5, 7, 8, 10], "H W W W H W W"],
  ["Lydian", [0, 2, 4, 6, 7, 9, 11], "W W W H W W H"],
  ["Mixolydian", [0, 2, 4, 5, 7, 9, 10], "W W H W W H W"],
  ["Locrian", [0, 1, 3, 5, 6, 8, 10], "H W W H W W W"],
  ["Hijaz", [0, 1, 4, 5, 7, 8, 10], "H 3H H W H W W"],
  ["Hungarian minor", [0, 2, 3, 6, 7, 8, 11], "W H 3H H H 3H H"],
  ["Whole tone", [0, 2, 4, 6, 8, 10], "W W W W W W"],
  [
    "Chromatic",
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "H H H H H H H H H H H H",
  ],
];

test("initial page and control defaults", async ({ app }) => {
  await expect(app).toHaveTitle(/Scale Visualizer/i);
  await expect(app.getByRole("heading", { level: 1 })).toHaveText(
    "See the shape of sound.",
  );
  await expect(app.getByLabel("Key signature")).toHaveValue("0");
  await expect(app.getByLabel("Scale type")).toHaveValue("Major");
  await expect(
    app.getByRole("combobox", { name: "Instrument", exact: true }),
  ).toHaveValue("piano");
  await expect(app.getByRole("slider")).toHaveValue("0.4");
  await expect(app.locator(".audio-status")).toHaveText("Ready to play");
  await expect(circle(app).locator(".note-label")).toHaveCount(12);
  await expect(app.getByLabel("Scale type").locator("option")).toHaveCount(14);
  await expect(
    app
      .getByRole("combobox", { name: "Instrument", exact: true })
      .locator("option"),
  ).toHaveCount(21);
});

for (const [scale, intervals, pattern] of cases) {
  test(`${scale}: notes, geometry and intervals in all 12 keys`, async ({
    app,
  }) => {
    await app.getByLabel("Scale type").selectOption(scale);
    for (let root = 0; root < 12; root++) {
      await app.getByLabel("Key signature").selectOption(String(root));
      const notes = intervals.map((i) => names[(root + i) % 12]);
      await expect(app.getByRole("heading", { level: 2 })).toHaveText(
        `${names[root]} ${scale.toLowerCase()}`,
      );
      await expect(app.locator(".note-chip")).toHaveText(notes);
      await expect(app.locator(".count-number")).toHaveText(
        String(notes.length),
      );
      await expect(circle(app).locator(".selected-note")).toHaveCount(
        notes.length,
      );
      await expect(circle(app).locator(".root-label")).toHaveText(names[root]);
      await expect(app.locator(".tonic-chip")).toHaveText(names[root]);
      const points = await circle(app)
        .locator("polygon")
        .getAttribute("points");
      expect(points!.split(" ")).toHaveLength(notes.length);
      // Validate the actual vertices, not just their number.
      points!.split(" ").forEach((p, i) => {
        const [x, y] = p.split(",").map(Number);
        const angle = (((root + intervals[i]) % 12) * Math.PI) / 6;
        expect(x).toBeCloseTo(280 + Math.sin(angle) * 185, 1);
        expect(y).toBeCloseTo(280 - Math.cos(angle) * 185, 1);
      });
      await expect(app.locator(".intervals > span")).toHaveText(
        pattern
          .split(" ")
          .map((step, i) => step + (i < notes.length - 1 ? "·" : "")),
      );
    }
    await expect(app.locator(".description p")).not.toBeEmpty();
  });
}

test("arrow keys transpose, wrap and preserve the scale", async ({ app }) => {
  await app.getByLabel("Scale type").selectOption("Dorian");
  await circle(app).focus();
  for (const [key, root] of [
    ["ArrowLeft", "11"],
    ["ArrowDown", "10"],
    ["ArrowRight", "11"],
    ["ArrowUp", "0"],
  ]) {
    await circle(app).press(key);
    await expect(app.getByLabel("Key signature")).toHaveValue(root);
    await expect(app.getByLabel("Scale type")).toHaveValue("Dorian");
  }
  await circle(app).press("Enter");
  await expect(app.getByLabel("Key signature")).toHaveValue("0");
});

test("pointer rotation transposes and ends on release", async ({ app }) => {
  await circle(app).scrollIntoViewIfNeeded();
  const box = (await circle(app).boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2,
    r = box.width * 0.3;
  await app.mouse.move(x, y - r);
  await app.mouse.down();
  await expect(app.locator(".drag-hint")).toHaveText(
    "Release to keep this key",
  );
  await app.mouse.move(x + r, y, { steps: 8 });
  await expect(app.getByLabel("Key signature")).toHaveValue("3");
  await app.mouse.up();
  await expect(app.locator(".drag-hint")).toHaveText(
    "Drag the shape to discover a new key",
  );
});

test("flat notation changes labels without changing pitches or shape", async ({
  app,
}) => {
  await app.getByLabel("Key signature").selectOption("1");
  const points = await app.locator(".scale-polygon").getAttribute("points");
  await app.getByRole("button", { name: "♭", exact: true }).click();
  await expect(
    app.getByRole("button", { name: "♭", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(app.locator(".note-chip")).toHaveText([
    "D♭",
    "E♭",
    "F",
    "G♭",
    "A♭",
    "B♭",
    "C",
  ]);
  await expect(app.locator(".center-note")).toHaveText("D♭");
  await expect(app.locator(".scale-polygon")).toHaveAttribute(
    "points",
    points!,
  );
  await expect(app.getByLabel("Key signature")).toHaveValue("1");
  await app.getByRole("button", { name: "♯", exact: true }).click();
  await expect(app.locator(".tonic-chip")).toHaveText("C♯");
});

test("duration bounds and reset preserve sound and display preferences", async ({
  app,
}) => {
  const slider = app.getByRole("slider");
  await slider.fill("0.1");
  await expect(slider).toHaveAttribute("aria-valuetext", "0.1 seconds");
  await slider.press("ArrowLeft");
  await expect(slider).toHaveValue("0.1");
  await slider.fill("1");
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("1");
  await expect(slider).toHaveAttribute("aria-valuetext", "1.0 seconds");
  await app
    .getByRole("combobox", { name: "Instrument", exact: true })
    .selectOption("sine");
  await app.getByLabel("Scale type").selectOption("Hijaz");
  await app.getByLabel("Key signature").selectOption("9");
  await app.getByRole("button", { name: "♭", exact: true }).click();
  await app.getByRole("button", { name: "Switch to dark mode" }).click();
  await app.getByRole("button", { name: "Reset" }).click();
  await expect(app.getByRole("heading", { level: 2 })).toHaveText("C major");
  await expect(slider).toHaveValue("1");
  await expect(
    app.getByRole("combobox", { name: "Instrument", exact: true }),
  ).toHaveValue("sine");
  await expect(
    app.getByRole("button", { name: "♭", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(app.locator(".app")).toHaveClass("app dark");
});
