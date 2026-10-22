import { test, expect, appReady, list } from "../fixtures";

// The app watches the connection through the native network plugin (`Network.onDisconnect()` /
// `onConnect()`, in app.component.ts): the plugin fires "offline" / "online" on the `document`.
// A browser does not fire those on the document by itself, so the tests send them the way the
// native layer does. Real airplane-mode switching on a device is still a manual check (README).

const goOffline = (page: any) => page.evaluate(() => document.dispatchEvent(new Event("offline")));
const goOnline = (page: any) => page.evaluate(() => document.dispatchEvent(new Event("online")));

const toast = (page: any, text: string) => page.locator("ion-toast", { hasText: text });

test.describe("connection status", () => {
  test.beforeEach(async ({ page, api }) => {
    api.on("GET", /^\/game\/all\/?$/, list([]));
    await page.goto("/");
    await appReady(page);
  });

  test("going offline shows a 'No connection' toast that stays until it is dismissed", async ({ page }) => {
    await goOffline(page);
    await expect(toast(page, "No connection")).toBeVisible();
    await expect(toast(page, "No connection").locator(".toast-button")).toContainText("Dismiss");

    await page.waitForTimeout(3500); // longer than the usual 3 s toast: this one has no timeout
    await expect(toast(page, "No connection")).toBeVisible();

    await toast(page, "No connection").locator(".toast-button").click();
    await expect(toast(page, "No connection")).toHaveCount(0);
  });

  test("coming back online removes that toast and says 'Back online'", async ({ page }) => {
    await goOffline(page);
    await expect(toast(page, "No connection")).toBeVisible();

    await goOnline(page);
    await expect(toast(page, "Back online")).toBeVisible();
    await expect(toast(page, "No connection")).toHaveCount(0);
    await expect(toast(page, "Back online")).toHaveCount(0, { timeout: 6000 }); // it is only shown for 3 s
  });

  test("online events alone show nothing about a missing connection", async ({ page }) => {
    await goOnline(page);
    await expect(toast(page, "Back online")).toBeVisible();
    await expect(toast(page, "No connection")).toHaveCount(0);
  });

  test("while offline, the game list warns that there is no internet connection", async ({ page }) => {
    await goOffline(page);
    await page.locator("ion-card").first().click(); // the "Games" card on the start page
    await expect(page.locator("ion-alert")).toContainText("No Internet Connection");
  });

  test("once back online, the game list opens without the warning", async ({ page }) => {
    await goOffline(page);
    await goOnline(page);
    await page.locator("ion-card").first().click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/play-game/play-game-list");
    await page.waitForTimeout(500);
    await expect(page.locator("ion-alert")).toHaveCount(0);
  });

  test("the connection is watched from the start: a second offline/online round works as well", async ({ page }) => {
    for (let round = 0; round < 2; round++) {
      await goOffline(page);
      await expect(toast(page, "No connection")).toBeVisible();
      await goOnline(page);
      await expect(toast(page, "No connection")).toHaveCount(0);
      await expect(toast(page, "Back online")).toBeVisible();
      await expect(toast(page, "Back online")).toHaveCount(0, { timeout: 6000 });
    }
  });
});
