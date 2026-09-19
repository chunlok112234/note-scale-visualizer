import { test as base, expect, type Page } from "@playwright/test";

export const sampleURL =
  "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/**/samples/**";
// A valid PCM WAV exercises real browser decoding and Tone.Sampler offline.
export function sampleWav() {
  const samples = 2205;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(22050, 24);
  wav.writeUInt32LE(44100, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((i * 2 * Math.PI * 440) / 22050) * 1000),
      44 + i * 2,
    );
  return wav;
}

export const test = base.extend<{ app: Page }>({
  app: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(sampleURL, (route) =>
      route.fulfill({
        contentType: "audio/wav",
        body: sampleWav(),
        headers: { "access-control-allow-origin": "*" },
      }),
    );
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeVisible();
    await use(page);
    expect(errors, "Uncaught browser errors").toEqual([]);
  },
});
export { expect };
export const circle = (page: Page) =>
  page.getByRole("group", { name: /scale. Drag the polygon/ });
export async function expectIdle(page: Page) {
  await expect(page.locator(".audio-status")).toHaveText("Ready to play");
  await expect(
    page.getByRole("button", { name: "Play scale", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".active-chip, .playing-halo")).toHaveCount(0);
  await expect(page.locator(".center-eyebrow")).toHaveText("TONIC");
}
