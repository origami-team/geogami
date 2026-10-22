import fs from "node:fs";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import QRCode from "qrcode";
import { environment } from "../../src/environments/environment.prod";
import { test, expect, appReady, signIn, user, game } from "../fixtures";

// QR codes on the game detail page: the class QR (a hand-out for pupils, also
// exported as a PDF) and the multiplayer code that players scan to join. They
// are rendered as <img src="data:image/png…"> inside an element with a class
// (`class-qr-code` / `qr-code`): downloadQrPdf() reads `.class-qr-code img`, so
// that structure is part of the contract. The tests decode the picture, so what
// is checked is the link a phone would actually open, not just that an image exists.

/** Decodes a PNG data URL the way a phone camera would. */
function decode(dataUrl: string): { text: string | null; width: number; height: number } {
  expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  const png = PNG.sync.read(Buffer.from(dataUrl.split(",")[1], "base64"));
  const result = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  return { text: result ? result.data : null, width: png.width, height: png.height };
}

const pixels = (dataUrl: string) => PNG.sync.read(Buffer.from(dataUrl.split(",")[1], "base64"));

/**
 * The picture must equal, pixel for pixel, what the qrcode library makes for the options the
 * page asks for. (Not byte for byte: in the browser the library encodes the PNG with the canvas,
 * in Node with another encoder, so the files differ although the pictures are identical.)
 */
async function expectSamePicture(actual: string, value: string, errorCorrectionLevel: "L" | "M", width: number) {
  const a = pixels(actual);
  const b = pixels(await expectedDataUrl(value, errorCorrectionLevel, width));
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  expect(Buffer.compare(a.data, b.data), "QR pixels differ from the qrcode library's output").toBe(0);
}

/** The qrcode library's output for the options the page asks for. */
const expectedDataUrl = (value: string, errorCorrectionLevel: "L" | "M", width: number) =>
  QRCode.toDataURL(value, {
    version: "" as any,
    errorCorrectionLevel,
    margin: 4,
    scale: 4,
    width,
    color: { dark: "#000", light: "#FFF" },
  });

const srcOf = (page: any, selector: string): Promise<string> => page.locator(selector).getAttribute("src");

test.describe("class QR code", () => {
  test.beforeEach(async ({ page, api }) => {
    await signIn(page, api, user({ roles: ["scholar"] }));
    api.on("GET", "/game/game-1", { message: "ok", content: game() });
    await page.goto("/play-game/game-detail?gameId=game-1");
    await appReady(page);
    await page.locator("ion-header ion-button:has(ion-icon[name=qr-code-outline])").click();
    await expect(page.locator(".class-qr-code img")).toBeVisible();
  });

  test("shows a QR image inside .class-qr-code that decodes to the class link", async ({ page }) => {
    const link = await page.locator(".copy-link-input").inputValue();
    expect(link).toBe(`${environment.uiURL}/play-game/game-detail?gameId=game-1&uId=user-1&iName=tester`);

    await expect(page.locator("div.class-qr-code > img")).toHaveCount(1);
    const decoded = decode(await srcOf(page, ".class-qr-code img"));
    expect(decoded.text).toBe(link);
    expect(decoded.width).toBe(600);
    expect(decoded.height).toBe(600);
  });

  test("the picture is what the qrcode library makes for these options (medium error correction, 600 px)", async ({ page }) => {
    const link = await page.locator(".copy-link-input").inputValue();
    await expectSamePicture(await srcOf(page, ".class-qr-code img"), link, "M", 600);
  });

  test("downloads the hand-out as a PDF", async ({ page }) => {
    const downloading = page.waitForEvent("download");
    await page.getByRole("button", { name: /pdf/i }).click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe("GeoGami-Campus_walk.pdf");
    const bytes = fs.readFileSync((await download.path())!);
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(5_000); // the QR image and the text are in it
  });
});

test.describe("QR code visibility", () => {
  test("a visitor who is not logged in gets no class QR button", async ({ page, api }) => {
    api.on("GET", "/game/game-1", { message: "ok", content: game() });
    await page.goto("/play-game/game-detail?gameId=game-1");
    await appReady(page);
    await expect(page.locator("ion-card-title").first()).toContainText("Campus walk");
    await expect(page.locator("ion-header ion-button:has(ion-icon[name=qr-code-outline])")).toHaveCount(0);
    await expect(page.locator(".class-qr-code")).toHaveCount(0);
  });
});

test.describe("multiplayer join code", () => {
  test("the instructor view shows a QR image inside .qr-code that decodes to the teacher code", async ({ page, api }) => {
    await signIn(page, api, user({ roles: ["scholar"] }));
    api.on("GET", "/game/game-m1", { message: "ok", content: game({ _id: "game-m1", name: "Team game", isMultiplayerGame: true, numPlayers: 2 }) });
    await page.goto("/play-game/game-detail?gameId=game-m1");
    await appReady(page);

    await expect(page.locator("div.qr-code > img")).toHaveCount(1);
    const src = await srcOf(page, ".qr-code img");
    const decoded = decode(src);
    expect(decoded.text).toBe("user-1-game-m1");
    await expectSamePicture(src, "user-1-game-m1", "L", 10); // low error correction, default size
  });
});
