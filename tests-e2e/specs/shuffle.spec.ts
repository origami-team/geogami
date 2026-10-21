import { test, expect, appReady, game } from "../fixtures";

// Multiple-choice answers are shown in random order (`keyvalue | shuffle`). The
// right answer is the item with key "0", which `keyvalue` always sorts first, so
// without the shuffle it would always be the first choice. The order must be
// random per task but must NOT change while the task is on screen.
test.describe("shuffled multiple-choice answers", () => {
  test.use({ geolocation: { latitude: 51.96, longitude: 7.6, accuracy: 5 }, permissions: ["geolocation"] });

  const CHOICES: Record<string, string> = {
    "0": "Correct answer",
    "1": "Wrong A",
    "2": "Wrong B",
    "3": "Wrong C",
    "4": "Wrong D",
    "5": "Wrong E",
  };
  const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

  function multipleChoiceGame(answer: Record<string, unknown>) {
    const g = game();
    g.tasks[0] = {
      ...g.tasks[0],
      name: "Tasktypes.objectLocation",
      type: "theme-object",
      question: { type: 1, key: "QuestionText.findTheHouseChoosePhoto", text: "Which one is right?" },
      answer,
      evaluate: "evalMultipleChoice",
    } as any;
    return g;
  }

  async function open(page: any, api: any, answer: Record<string, unknown>) {
    api.on("GET", "/game/game-1", { message: "ok", content: multipleChoiceGame(answer) });
    const bundle = { id: "game-1", isVRWorld: false, isVRMirrored: false, gameCode: "A", isSingleMode: true, shareData_cbox: false, playerName: "A", isRejoin: false };
    await page.goto("/play-game/playing-game/" + encodeURIComponent(JSON.stringify(bundle)));
    await appReady(page);
    await expect(page.getByText("GPS accuracy: 5.00 m")).toBeVisible();
  }

  // textContent, not innerText: on the phone layout the panel text can be laid out as hidden,
  // and innerText would then be empty. Waits until all choices are rendered.
  async function texts(page: any): Promise<string[]> {
    const choices = page.locator(".multiple-choice-text .choice");
    await expect(choices).toHaveCount(Object.keys(CHOICES).length);
    return (await choices.allTextContents()).map((x: string) => x.trim());
  }

  test("shows every text choice exactly once", async ({ page, api }) => {
    await open(page, api, { type: "MULTIPLE_CHOICE_TEXT", choices: CHOICES });
    expect((await texts(page)).sort()).toEqual(Object.values(CHOICES).sort());
  });

  test("keeps the order while the task is on screen: selecting and resizing do not reshuffle", async ({ page, api }) => {
    await open(page, api, { type: "MULTIPLE_CHOICE_TEXT", choices: CHOICES });
    const first = await texts(page);

    await page.locator(".multiple-choice-text .choice").nth(2).click();
    await expect(page.locator(".multiple-choice-text .choice.selected")).toHaveCount(1);
    expect(await texts(page)).toEqual(first);

    await page.setViewportSize({ width: 700, height: 900 });
    await page.setViewportSize({ width: 1000, height: 700 });
    expect(await texts(page)).toEqual(first);

    await page.waitForTimeout(800); // timers and GPS updates keep running in the background
    expect(await texts(page)).toEqual(first);

    await page.locator(".multiple-choice-text .choice").nth(4).click();
    expect(await texts(page)).toEqual(first);
  });

  test("is random per visit: the order differs between loads and the right answer is not always first", async ({ page, api }) => {
    const orders: string[][] = [];
    for (let i = 0; i < 4; i++) {
      await open(page, api, { type: "MULTIPLE_CHOICE_TEXT", choices: CHOICES });
      orders.push(await texts(page));
    }
    const distinct = new Set(orders.map((o) => o.join("|")));
    expect(distinct.size, `identical order on all loads: ${orders[0].join(", ")}`).toBeGreaterThan(1);
    // none of the loads may have kept the unshuffled (key) order
    expect(orders.some((o) => o.join("|") !== Object.values(CHOICES).join("|"))).toBe(true);
  });

  test("also shuffles photo choices, once each", async ({ page, api }) => {
    const photos = { "0": PIXEL + "#a", "1": PIXEL + "#b", "2": PIXEL + "#c", "3": PIXEL + "#d" };
    await open(page, api, { type: "MULTIPLE_CHOICE", photos });
    const thumbs = page.locator(".multiple-choice ion-thumbnail");
    await expect(thumbs).toHaveCount(4);
    const srcs = await thumbs.locator("img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute("src")));
    expect(srcs.sort()).toEqual(Object.values(photos).sort());
  });
});
