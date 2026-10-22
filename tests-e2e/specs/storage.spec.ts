import { test, expect, appReady } from "../fixtures";

// What the app keeps through @ionic/storage: the chosen language, and the removal of two
// keys that older versions used for unfinished games. The data is in the browser's
// localStorage under `_ionicstorage/_ionickv/<key>` (JSON values), with IndexedDB as the
// fallback — this is the format people's devices already hold, and it has to stay readable.
// (The language handling itself is covered in language.spec.ts.)

const PREFIX = "_ionicstorage/_ionickv/";

const read = (page: any, key: string): Promise<string | null> => page.evaluate((k: string) => localStorage.getItem(k), key);

/** Writes entries before the app starts (only on the first load of the tab, so a later reload keeps what the app wrote). */
async function seed(page: any, entries: Record<string, string>) {
  await page.addInitScript((data: Record<string, string>) => {
    if (!sessionStorage.getItem("__seeded")) {
      for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
      sessionStorage.setItem("__seeded", "1");
    }
  }, entries);
}

test.describe("legacy game data", () => {
  test("is discarded at start, while the language choice and everything else stays", async ({ page }) => {
    await seed(page, {
      [PREFIX + "game"]: JSON.stringify({ name: "Old draft", tasks: [] }),
      [PREFIX + "savedTracksData"]: JSON.stringify({ game: "g1", waypoints: [] }),
      [PREFIX + "SELECTED_LANGUAGE"]: '"fr"',
      [PREFIX + "other_preference"]: '"keep me"',
      unrelated_key: "keep me too",
    });
    await page.goto("/");
    await appReady(page);

    await expect.poll(() => read(page, PREFIX + "game")).toBeNull();
    await expect.poll(() => read(page, PREFIX + "savedTracksData")).toBeNull();
    expect(await read(page, PREFIX + "SELECTED_LANGUAGE")).toBe('"fr"');
    expect(await read(page, PREFIX + "other_preference")).toBe('"keep me"');
    expect(await read(page, "unrelated_key")).toBe("keep me too");
    expect(await page.evaluate(() => document.documentElement.lang)).toBe("fr");
  });

  test("starting again with nothing to discard is fine", async ({ page }) => {
    await page.goto("/");
    await appReady(page);
    await page.reload();
    await appReady(page);
    expect(await read(page, PREFIX + "game")).toBeNull();
    expect(await read(page, PREFIX + "savedTracksData")).toBeNull();
  });
});

test.describe("when the browser's localStorage cannot be written", () => {
  // e.g. a full quota. The library chooses its driver once at start; a later failing write is simply lost.
  // That must be quiet: no uncaught errors (the console check of the test fixture would fail the test).
  test("the app still works for the session, but the choice cannot be kept", async ({ page }) => {
    await page.addInitScript(() => {
      const real = Storage.prototype.setItem;
      Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
        if (key.startsWith("_ionicstorage/")) throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
        return real.call(this, key, value);
      };
    });
    const lang = () => page.evaluate(() => document.documentElement.lang);
    await page.goto("/");
    await appReady(page);
    await expect.poll(lang).toBe("en");

    await page.locator("ion-select").first().click();
    await page.locator("ion-select-popover ion-item", { has: page.locator("ion-label", { hasText: /^FR$/ }) }).click();
    await expect.poll(lang).toBe("fr"); // switching works within the session
    expect(await read(page, PREFIX + "SELECTED_LANGUAGE")).toBeNull();

    await page.reload();
    await appReady(page);
    await expect.poll(lang).toBe("en"); // nothing was kept: back to the browser language
  });
});
