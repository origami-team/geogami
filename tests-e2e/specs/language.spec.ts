import fs from "node:fs";
import path from "node:path";
import { test, expect, appReady, signIn, user } from "../fixtures";

// Language handling: which language the app starts in, switching it, keeping the
// choice across reloads (and for people who already have one saved), the language
// stored on an account, and right-to-left layout for Arabic. Expected texts are
// read from the real translation files, so a missing or broken file shows up as a
// failing test, and the checks stay valid when the translation library changes.

const LANGUAGES = ["de", "en", "it", "pt", "fr", "ar"] as const;
type Lng = (typeof LANGUAGES)[number];

const dictionaries: Record<string, any> = {};
for (const lng of LANGUAGES) {
  dictionaries[lng] = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../src/assets/i18n/${lng}.json`), "utf8"));
}

/** The translation of `key` in `lng`, with {{params}} filled in (what the app is expected to show). */
function t(lng: Lng, key: string, params: Record<string, string> = {}): string {
  const value = key.split(".").reduce((node: any, part) => (node ? node[part] : undefined), dictionaries[lng]);
  expect(value, `translation ${lng}:${key}`).toBeTruthy();
  return Object.entries(params).reduce((text, [name, v]) => text.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), v), value);
}

// How the language choice is saved today (by @ionic/storage); people already have this on their devices.
const STORAGE_KEY = "_ionicstorage/_ionickv/SELECTED_LANGUAGE";

const stored = (page: any): Promise<string | null> => page.evaluate((key: string) => localStorage.getItem(key), STORAGE_KEY);
const documentState = (page: any) => page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));

async function openStart(page: any) {
  await page.goto("/");
  await appReady(page);
}

/** The text a visitor sees on the start page in `lng`. */
const expectStartIn = (page: any, lng: Lng) => expect(page.locator("ion-router-outlet")).toContainText(t(lng, "Start.playModeDescription"));

/** Picks a language in the picker at the top of the start page (options are labelled DE, EN, FR, ...). */
async function choose(page: any, lng: Lng) {
  await page.locator("ion-select").first().click();
  // by the label inside the row: matching on the row's own text also sees Ionic's shadow DOM
  await page.locator("ion-select-popover ion-item", { has: page.locator("ion-label", { hasText: new RegExp(`^${lng.toUpperCase()}$`) }) }).click();
  await expect(page.locator("ion-select-popover")).toHaveCount(0);
}

test.describe("language at the first start follows the browser language", () => {
  const CASES: [string, Lng][] = [
    ["en-US", "en"],
    ["de-DE", "de"],
    ["fr-FR", "fr"],
    ["it-IT", "it"],
    ["pt-BR", "pt"],
    ["ar-EG", "ar"],
    ["ja-JP", "de"], // not supported: German is the default
  ];
  for (const [locale, expected] of CASES) {
    test.describe(locale, () => {
      test.use({ locale });
      test(`starts in ${expected} and remembers it`, async ({ page }) => {
        await openStart(page);
        await expectStartIn(page, expected);
        expect(await documentState(page)).toEqual({ lang: expected, dir: expected === "ar" ? "rtl" : "ltr" });
        await expect.poll(() => stored(page)).toBe(JSON.stringify(expected));
      });
    });
  }
});

test.describe("choosing a language", () => {
  for (const lng of LANGUAGES) {
    test(`switches the start page to ${lng}`, async ({ page }) => {
      await openStart(page);
      await choose(page, lng);
      await expectStartIn(page, lng);
      expect(await documentState(page)).toEqual({ lang: lng, dir: lng === "ar" ? "rtl" : "ltr" });
      await expect.poll(() => stored(page)).toBe(JSON.stringify(lng));
    });
  }

  test("switching back and forth changes direction both ways", async ({ page }) => {
    await openStart(page);
    await choose(page, "ar");
    await expect.poll(async () => (await documentState(page)).dir).toBe("rtl");
    await choose(page, "en");
    await expectStartIn(page, "en");
    expect(await documentState(page)).toEqual({ lang: "en", dir: "ltr" });
  });

  test("pages that load later follow the chosen language", async ({ page }) => {
    await openStart(page);
    await choose(page, "it");
    await expect.poll(() => stored(page)).toBe('"it"');
    await page.goto("/user/login");
    await appReady(page);
    await expect(page.locator("ion-router-outlet")).toContainText(t("it", "User.login"));
    await expect(page.locator("ion-router-outlet")).toContainText(t("it", "General.back_button"));
  });
});

test.describe("the choice is kept", () => {
  test("after a reload, and it wins over the browser language", async ({ page }) => {
    await openStart(page); // browser language: English
    await choose(page, "pt");
    await expectStartIn(page, "pt");
    await expect.poll(() => stored(page)).toBe('"pt"');

    await page.reload();
    await appReady(page);
    await expectStartIn(page, "pt");
    expect((await documentState(page)).lang).toBe("pt");
  });

  test("in a second tab of the same browser", async ({ page, context }) => {
    await openStart(page);
    await choose(page, "fr");
    await expect.poll(() => stored(page)).toBe('"fr"');
    const second = await context.newPage();
    await openStart(second);
    await expectStartIn(second, "fr");
  });

  test("for people who already have a saved choice from before (old storage format)", async ({ page }) => {
    // exactly what is on their device today: the key and JSON string the app has always written
    await page.addInitScript(({ key, value }) => {
      if (!sessionStorage.getItem("__seeded")) {
        localStorage.setItem(key, value);
        sessionStorage.setItem("__seeded", "1");
      }
    }, { key: STORAGE_KEY, value: '"de"' });

    await openStart(page); // browser language: English, but the saved German wins
    await expectStartIn(page, "de");
    expect((await documentState(page)).lang).toBe("de");
    expect(await stored(page)).toBe('"de"');

    await page.reload();
    await appReady(page);
    await expectStartIn(page, "de");
  });
});

test.describe("language of an account", () => {
  const loginWith = async (page: any, api: any, language: string) => {
    const who = user({ language });
    api.on("POST", "/user/login", { user: who, token: "access-1", refreshToken: "refresh-1" });
    api.on("POST", "/user/refresh-auth", { data: { user: who }, token: "access-2", refreshToken: "refresh-2" });
    await page.goto("/user/login");
    await appReady(page);
    await page.locator("#username input").fill("tester");
    await page.locator("#password input").fill("pw");
    await page.locator("ion-button.submit-btn").click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  };

  test("logging in switches the app to the language saved on the account", async ({ page, api }) => {
    await loginWith(page, api, "de");
    await expectStartIn(page, "de");
    expect((await documentState(page)).lang).toBe("de");
    await expect.poll(() => stored(page)).toBe('"de"');
  });

  test("a locale-style value such as pt_BR is understood", async ({ page, api }) => {
    await loginWith(page, api, "pt_BR");
    await expectStartIn(page, "pt");
  });

  test("an unsupported value is ignored", async ({ page, api }) => {
    await loginWith(page, api, "xx");
    await expectStartIn(page, "en");
    expect((await documentState(page)).lang).toBe("en");
  });

  test("the language stays after a reload (session restored)", async ({ page, api }) => {
    await loginWith(page, api, "it");
    await expectStartIn(page, "it");
    await page.reload();
    await appReady(page);
    await expectStartIn(page, "it");
  });

  test("registering saves the language the app is shown in on the new account", async ({ page, api }) => {
    api.on("POST", "/user/register", { success: true });
    await openStart(page);
    await choose(page, "fr");
    await expect.poll(() => stored(page)).toBe('"fr"');
    await page.goto("/user/register");
    await appReady(page);
    await page.locator("#email input").fill("new@example.org");
    await page.locator("#username input").fill("newbie");
    await page.locator("#password input").fill("secret-pw");
    await page.locator("ion-button.submit-btn").click();
    await expect.poll(() => api.callsTo("POST", "/user/register").length).toBe(1);
    expect(api.callsTo("POST", "/user/register")[0].body).toEqual({ email: "new@example.org", username: "newbie", password: "secret-pw", language: "fr" });
  });

  test("the profile page shows the saved language, and saving a new one switches the app at once", async ({ page, api }) => {
    await signIn(page, api, user({ name: "Tester Name", language: "de" }));
    api.on("PUT", "/user/profile", { success: true, user: user({ name: "Tester Name", language: "it" }) });
    await page.goto("/user/profile");
    await appReady(page);
    await expect(page.locator("form ion-select")).toContainText("Deutsch");

    await page.locator("form ion-select").click();
    await page.locator("ion-select-popover ion-item", { hasText: "Italiano" }).click();
    await page.locator("ion-button.save-btn").click();

    await expect.poll(() => api.callsTo("PUT", "/user/profile").length).toBe(1);
    expect(api.callsTo("PUT", "/user/profile")[0].body).toEqual({ name: "Tester Name", language: "it" });
    await expect(page.locator("ion-router-outlet")).toContainText(t("it", "User.language"));
    expect((await documentState(page)).lang).toBe("it");
    await expect.poll(() => stored(page)).toBe('"it"');
  });
});

test.describe("texts with parameters", () => {
  for (const lng of ["en", "de", "ar"] as Lng[]) {
    test(`the delete-account confirmation names the user, in ${lng}`, async ({ page, api }) => {
      await signIn(page, api, user({ username: "tester", language: lng }));
      await openStart(page);
      await choose(page, lng);
      await page.goto("/user/profile");
      await appReady(page);
      await page.locator("ion-button", { hasText: t(lng, "User.deleteAccount") }).last().click();
      const alert = page.locator("ion-alert");
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(t(lng, "User.deleteAccountHeader"));
      await expect(alert).toContainText(t(lng, "User.deleteAccountTypeUsername", { username: "tester" }));
    });
  }
});

test.describe("Arabic is laid out right to left", () => {
  test("the whole page flips and the back button moves to the other side", async ({ page }) => {
    await openStart(page);
    await choose(page, "en");
    await page.goto("/user/login");
    await appReady(page);
    const side = async () => {
      const box = await page.locator("ion-header ion-back-button").boundingBox();
      const width = page.viewportSize()!.width;
      return box!.x + box!.width / 2 < width / 2 ? "left" : "right";
    };
    expect(await side()).toBe("left");
    expect(await page.evaluate(() => getComputedStyle(document.body).direction)).toBe("ltr");

    await page.goto("/");
    await appReady(page);
    await choose(page, "ar");
    await page.goto("/user/login");
    await appReady(page);
    await expect(page.locator("ion-router-outlet")).toContainText(t("ar", "User.login"));
    expect(await page.evaluate(() => getComputedStyle(document.body).direction)).toBe("rtl");
    expect(await side()).toBe("right");
  });

  test("screenshots: start page and login in Arabic", async ({ page }) => {
    await openStart(page);
    await choose(page, "ar");
    await expectStartIn(page, "ar");
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot("start-arabic.png");
    await page.goto("/user/login");
    await appReady(page);
    await expect(page.locator("ion-router-outlet")).toContainText(t("ar", "User.login"));
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot("login-arabic.png");
  });
});
