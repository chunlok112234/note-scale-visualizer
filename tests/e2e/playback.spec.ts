import {
  test,
  expect,
  expectIdle,
  circle,
  sampleURL,
  sampleWav,
} from "./fixtures";

test("sine playback highlights notes, reaches upper tonic and finishes", async ({
  app,
}) => {
  await app
    .getByRole("combobox", { name: "Instrument", exact: true })
    .selectOption("sine");
  await app.getByLabel("Key signature").selectOption("11");
  await app.getByLabel("Scale type").selectOption("Minor pentatonic");
  await app.getByRole("slider").fill("0.5");
  // Observe each React update in the browser, avoiding polling across short notes.
  await app.evaluate(() => {
    const observations: { note: string; chip: string | null; halos: number }[] =
      [];
    Object.assign(window, { playbackObservations: observations });
    const observer = new MutationObserver(() => {
      const note = document.querySelector(".center-note")?.textContent ?? "";
      if (!/\d$/.test(note) || observations.at(-1)?.note === note) return;
      observations.push({
        note,
        chip: document.querySelector(".active-chip")?.textContent ?? null,
        halos: document.querySelectorAll(".playing-halo").length,
      });
    });
    observer.observe(document.querySelector(".workspace")!, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
  });
  await app.getByRole("button", { name: "Play scale", exact: true }).click();
  await expect(app.locator(".audio-status")).toHaveText("Playing");
  await expect(app.locator(".center-eyebrow")).toHaveText("NOW PLAYING");
  await expectIdle(app);
  const observed = await app.evaluate(
    () =>
      (window as unknown as { playbackObservations: unknown[] })
        .playbackObservations,
  );
  expect(observed).toEqual(
    ["B4", "D5", "E5", "F♯5", "A5", "B5"].map((note) => ({
      note,
      chip: note.slice(0, -1),
      halos: 1,
    })),
  );
  await expect(app.locator(".center-note")).toHaveText("B");
});

const actions = [
  "stop",
  "key",
  "scale",
  "instrument",
  "duration",
  "reset",
  "keyboard",
  "pointer",
] as const;
for (const action of actions) {
  test(`${action} cancels active playback`, async ({ app }) => {
    await app
      .getByRole("combobox", { name: "Instrument", exact: true })
      .selectOption("sine");
    await app.getByRole("slider").fill("1");
    await app.getByRole("button", { name: "Play scale", exact: true }).click();
    await expect(app.locator(".audio-status")).toHaveText("Playing");
    if (action === "stop")
      await app.getByRole("button", { name: "Stop scale" }).click();
    if (action === "key")
      await app.getByLabel("Key signature").selectOption("2");
    if (action === "scale")
      await app.getByLabel("Scale type").selectOption("Dorian");
    if (action === "instrument")
      await app
        .getByRole("combobox", { name: "Instrument", exact: true })
        .selectOption("piano");
    if (action === "duration") await app.getByRole("slider").fill("0.2");
    if (action === "reset")
      await app.getByRole("button", { name: "Reset" }).click();
    if (action === "keyboard") await circle(app).press("ArrowRight");
    if (action === "pointer") await circle(app).click();
    await expectIdle(app);
  });
}

test("sampled instruments decode and play with attribution", async ({
  app,
}) => {
  // Exercise every sample map with real Tone.Sampler and browser audio decoding.
  const select = app.getByRole("combobox", { name: "Instrument", exact: true });
  const values = await select
    .locator("option")
    .evaluateAll((options) =>
      options
        .map((o) => (o as HTMLOptionElement).value)
        .filter((v) => v !== "sine"),
    );
  for (const value of values) {
    await test.step(value, async () => {
      await select.selectOption(value);
      await expect(
        app.getByRole("link", { name: "tonejs-instruments · N. P. Brosowsky" }),
      ).toBeVisible();
      await app
        .getByRole("button", { name: "Play scale", exact: true })
        .click();
      await expect(app.locator(".audio-status")).toHaveText("Playing");
      await app.getByRole("button", { name: "Stop scale" }).click();
      await expectIdle(app);
    });
  }
  await select.selectOption("sine");
  await expect(app.locator(".sample-credit")).toHaveCount(0);
});

for (const action of [
  "cancel",
  "key",
  "scale",
  "instrument",
  "duration",
  "reset",
]) {
  test(`${action} cancels a pending sample load and ignores late completion`, async ({
    app,
  }) => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await app.route(sampleURL, async (route) => {
      await pending;
      await route.fulfill({
        contentType: "audio/wav",
        body: sampleWav(),
        headers: { "access-control-allow-origin": "*" },
      });
    });
    const requested = app.waitForRequest(/\/samples\//);
    await app.getByRole("button", { name: "Play scale", exact: true }).click();
    await requested;
    await expect(app.locator(".audio-status")).toHaveText(
      "Loading instrument…",
    );
    try {
      if (action === "cancel")
        await app.getByRole("button", { name: "Cancel load" }).click();
      if (action === "key")
        await app.getByLabel("Key signature").selectOption("2");
      if (action === "scale")
        await app.getByLabel("Scale type").selectOption("Dorian");
      if (action === "instrument")
        await app
          .getByRole("combobox", { name: "Instrument", exact: true })
          .selectOption("sine");
      if (action === "duration") await app.getByRole("slider").fill("0.2");
      if (action === "reset")
        await app.getByRole("button", { name: "Reset" }).click();
      await expectIdle(app);
    } finally {
      release();
    }
    await app.unrouteAll({ behavior: "wait" });
    await expectIdle(app);
    // A fresh session must still succeed after the cancelled session completes.
    await app
      .getByRole("combobox", { name: "Instrument", exact: true })
      .selectOption("sine");
    await app.getByRole("button", { name: "Play scale", exact: true }).click();
    await expect(app.locator(".audio-status")).toHaveText("Playing");
    await app.getByRole("button", { name: "Stop scale" }).click();
    await expectIdle(app);
    await expect(app.getByRole("main").getByRole("alert")).toHaveCount(0);
  });
}

test("failed sample loads show a useful error and allow retry", async ({
  app,
}) => {
  await app.route(sampleURL, (route) => route.abort("failed"));
  await app.getByRole("button", { name: "Play scale", exact: true }).click();
  await expect(app.getByRole("main").getByRole("alert")).toContainText(
    "Could not load or play this instrument",
  );
  await expectIdle(app);
  await app.unroute(sampleURL);
  await app.route(sampleURL, (route) =>
    route.fulfill({
      contentType: "audio/wav",
      body: sampleWav(),
      headers: { "access-control-allow-origin": "*" },
    }),
  );
  await app.getByRole("button", { name: "Play scale", exact: true }).click();
  await expect(app.locator(".audio-status")).toHaveText("Playing");
  await expect(app.getByRole("main").getByRole("alert")).toHaveCount(0);
});
