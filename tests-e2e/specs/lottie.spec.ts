import { test, expect, appReady, signIn, user, game, ignoreKnownErrors } from "../fixtures";

// Three pages show a Lottie animation (the own `lottie` directive): the
// star on the finished-game card, and the astronaut while a game is being saved
// (create and edit). It must render, actually animate, and — when the page is
// left — stop running (no animation left looping in the background).

const FINISH_STATE_TYPEERROR = /Cannot read properties of undefined \(reading '(answer|getLayer)'\)/; // known app issue, see play.spec.ts

/** Keeps a handle on the SVG so it can be inspected after the page has been left. */
async function holdSvg(page: any) {
  await page.evaluate(() => {
    (window as any).__lottieSvg = document.querySelector(".lottie-style svg");
  });
}
const heldContent = (page: any): Promise<string | null> =>
  page.evaluate(() => ((window as any).__lottieSvg ? (window as any).__lottieSvg.innerHTML : null));

async function expectAnimating(page: any) {
  const svg = page.locator(".lottie-style svg");
  await expect(svg).toHaveCount(1);
  await expect(svg.locator("g").first()).toBeAttached();
  const box = await page.locator(".lottie-style").boundingBox();
  expect(box!.width).toBeGreaterThan(100);
  expect(box!.height).toBeGreaterThan(60);
  // the markup changes from frame to frame
  const first = await svg.innerHTML();
  await expect.poll(async () => (await svg.innerHTML()) !== first, { timeout: 5000 }).toBe(true);
}

/** After leaving the page the old animation must not keep running (even on its detached element). */
async function expectStopped(page: any) {
  await expect(page.locator(".lottie-style")).toHaveCount(0);
  const a = await heldContent(page);
  await page.waitForTimeout(450);
  const b = await heldContent(page);
  expect(b, "the animation kept running after its page was left").toBe(a);
}

test.describe("finished-game animation (playing page)", () => {
  test.use({ geolocation: { latitude: 51.96, longitude: 7.6, accuracy: 5 }, permissions: ["geolocation"] });

  test("renders and animates the star, and stops when the page is left", async ({ page, api, consoleErrors }) => {
    api.on("GET", "/game/game-1", { message: "ok", content: game() });
    const assets: string[] = [];
    page.on("response", (r: any) => {
      if (/\/assets\/lottie\//.test(r.url())) assets.push(`${r.status()} ${new URL(r.url()).pathname}`);
    });
    const bundle = { id: "game-1", isVRWorld: false, isVRMirrored: false, gameCode: "A", isSingleMode: true, shareData_cbox: false, playerName: "A", isRejoin: false };
    await page.goto("/play-game/playing-game/" + encodeURIComponent(JSON.stringify(bundle)));
    await appReady(page);
    await expect(page.getByText("GPS accuracy: 5.00 m")).toBeVisible();

    await expect(async () => {
      await page.locator("app-playing-game ion-toolbar ion-buttons[slot=end] ion-button").click({ timeout: 2000 });
      await expect(page.getByText("You finished the game!")).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15_000 });

    await expectAnimating(page);
    expect(assets).toEqual(["200 /assets/lottie/star-success.json"]);

    await holdSvg(page);
    await page.locator("ion-button", { hasText: /done/i }).first().click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expectStopped(page);
    ignoreKnownErrors(consoleErrors, FINISH_STATE_TYPEERROR);
  });
});

test.describe("saving animation (create and edit game overview)", () => {
  test("create: shows the astronaut while saving and stops when the page is left", async ({ page, api }) => {
    await signIn(page, api, user({ roles: ["scholar"] }));
    api.on("POST", "/game", { message: "created" }, 201);
    const bundle = { isVRWorld: false, isVRMirrored: false, isSingleMode: true, numPlayers: 1 };
    await page.goto("/create-game/create-game-overview/" + encodeURIComponent(JSON.stringify(bundle)));
    await appReady(page);

    await page.locator("ion-input input").first().fill("My new game");
    await page.locator("ion-button", { hasText: /save/i }).last().click();

    await expect(page.locator(".overlay.success")).toBeVisible();
    await expectAnimating(page);
    await expect(page.locator(".overlay.success ion-button")).not.toHaveAttribute("disabled", ""); // saved
    expect(api.callsTo("POST", "/game")).toHaveLength(1);

    await holdSvg(page);
    await page.locator(".overlay.success ion-button").click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expectStopped(page);
  });

  test("edit: shows the astronaut while saving and stops when the page is left", async ({ page, api }) => {
    await signIn(page, api, user({ roles: ["scholar"] }));
    // tasks coming from the server carry a 24-character _id, which updateGame() relies on
    const stored = game();
    stored.tasks = stored.tasks.map((t: any) => ({ ...t, _id: "6000000000000000000000a1" }));
    api.on("GET", "/game/game-1", { message: "ok", content: stored });
    api.on("PUT", "/game", { message: "updated" }, 200);
    const bundle = { game_id: "game-1", isVRWorld: false, isVRMirrored: false };
    await page.goto("/edit-game/edit-game-overview/" + encodeURIComponent(JSON.stringify(bundle)));
    await appReady(page);
    await expect(page.locator("ion-input input").first()).toHaveValue("Campus walk");

    await page.locator("ion-button[type=submit]").click();

    await expect(page.locator(".overlay.success")).toBeVisible();
    await expectAnimating(page);
    await expect(page.locator(".overlay.success ion-button")).not.toHaveAttribute("disabled", ""); // saved
    expect(api.callsTo("PUT", "/game")).toHaveLength(1);

    await holdSvg(page);
    await page.locator(".overlay.success ion-button").click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expectStopped(page);
  });
});
