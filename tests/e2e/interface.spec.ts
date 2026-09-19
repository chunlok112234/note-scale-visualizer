import { test, expect } from "./fixtures";

test("theme toggles both ways and persists across reloads", async ({ app }) => {
  await app.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(app.locator(".app")).toHaveClass("app dark");
  await app.reload();
  await expect(
    app.getByRole("button", { name: "Switch to light mode" }),
  ).toBeVisible();
  await app.getByRole("button", { name: "Switch to light mode" }).click();
  await app.reload();
  await expect(app.locator(".app")).toHaveClass("app light");
});

test("system theme is used only when no saved preference exists", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator(".app")).toHaveClass("app dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.reload();
  await expect(page.locator(".app")).toHaveClass("app light");
});

for (const method of ["close button", "escape", "explore button", "backdrop"]) {
  test(`help opens from both entry points and closes with ${method}`, async ({
    app,
  }) => {
    for (const entry of [
      "How to use Scale Shape",
      "Learn about transposition",
    ]) {
      await app.getByRole("button", { name: entry }).click();
      const dialog = app.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleName(
        "A little circle. A lot to discover.",
      );
      await expect(
        app.getByRole("button", { name: "Close help" }),
      ).toBeFocused();
      await dialog.getByRole("heading").click();
      await expect(dialog).toBeVisible();
      if (method === "close button")
        await app.getByRole("button", { name: "Close help" }).click();
      if (method === "escape")
        await app.getByRole("button", { name: "Close help" }).press("Escape");
      if (method === "explore button")
        await app.getByRole("button", { name: "Let’s explore" }).click();
      if (method === "backdrop")
        await app
          .locator(".modal-backdrop")
          .click({ position: { x: 2, y: 2 } });
      await expect(dialog).toHaveCount(0);
    }
  });
}

for (const width of [320, 375, 768, 1280]) {
  test(`layout remains usable at ${width}px`, async ({ app }) => {
    await app.setViewportSize({ width, height: 900 });
    expect(
      await app.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    for (const label of ["Key signature", "Scale type", "Instrument"]) {
      await app
        .getByRole("combobox", { name: label, exact: true })
        .scrollIntoViewIfNeeded();
      await expect(
        app.getByRole("combobox", { name: label, exact: true }),
      ).toBeVisible();
    }
    await app.getByLabel("Key signature").selectOption("7");
    await expect(app.getByRole("heading", { level: 2 })).toHaveText("G major");
    await app.getByRole("button", { name: "How to use Scale Shape" }).click();
    await expect(app.getByRole("dialog")).toBeVisible();
    await app.getByRole("button", { name: "Let’s explore" }).click();
    await expect(app.getByRole("dialog")).toHaveCount(0);
  });
}
