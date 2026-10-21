import { test, expect, appReady, game } from "../fixtures";

// The task text on the playing page goes through `markdown | keyword`
// (ngx-markdown, then the keyword pipe that adds the flag chip). Authors write
// this text and every player sees it, so what is rendered — and what is NOT
// (scripts, event handlers, javascript: links) — must survive library upgrades.
test.describe("task text rendering on the playing page", () => {
  test.use({ geolocation: { latitude: 51.96, longitude: 7.6, accuracy: 5 }, permissions: ["geolocation"] });

  async function showTaskText(page: any, api: any, text: string) {
    const g = game();
    (g.tasks[0].question as any).text = text;
    api.on("GET", "/game/game-1", { message: "ok", content: g });
    const bundle = { id: "game-1", isVRWorld: false, isVRMirrored: false, gameCode: "A", isSingleMode: true, shareData_cbox: false, playerName: "A", isRejoin: false };
    await page.goto("/play-game/playing-game/" + encodeURIComponent(JSON.stringify(bundle)));
    await appReady(page);
    await expect(page.getByText("GPS accuracy: 5.00 m")).toBeVisible();
    const text$ = page.locator(".task-text").first();
    await expect(text$).not.toBeEmpty();
    return text$;
  }

  test("renders markdown: headings, emphasis, code, lists, links and line breaks", async ({ page, api }) => {
    const t = await showTaskText(
      page,
      api,
      "# Title\n\nSome **bold** and *italic* text with `code`.\n\n- one\n- two\n\n[GeoGami](https://example.org) line1  \nline2"
    );
    await expect(t.locator("h1")).toHaveText("Title");
    await expect(t.locator("strong")).toHaveText("bold");
    await expect(t.locator("em")).toHaveText("italic");
    await expect(t.locator("code")).toHaveText("code");
    await expect(t.locator("ul > li")).toHaveText(["one", "two"]);
    await expect(t.locator("a")).toHaveAttribute("href", "https://example.org");
    await expect(t.locator("br")).toHaveCount(1);
  });

  test("the keyword pipe adds the flag chip to Flag/Fahne in any language", async ({ page, api }) => {
    const t = await showTaskText(page, api, "Find the Flag and the Fahne.");
    await expect(t.locator("ion-text")).toHaveCount(2);
    await expect(t.locator("ion-text ion-chip ion-icon[name=flag]")).toHaveCount(2);
    await expect(t).toContainText("Find the Flag");
  });

  test("keeps harmless inline HTML but strips scripts, event handlers and javascript: links", async ({ page, api }) => {
    const t = await showTaskText(
      page,
      api,
      '<b>raw</b> <img src="x" onerror="window.__pwned=(window.__pwned||0)+1"> <script>window.__pwned=(window.__pwned||0)+10</script> <a href="javascript:window.__pwned=100">x</a>'
    );
    await expect(t.locator("b")).toHaveText("raw");
    await expect(t.locator("script")).toHaveCount(0);
    await expect(t.locator("img")).not.toHaveAttribute("onerror", /.*/);
    const href = (await t.locator("a").getAttribute("href")) || "";
    expect(href.startsWith("javascript:")).toBe(false);
    await t.locator("a").click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).__pwned || 0)).toBe(0);
  });

  test("does not let authors inject Ionic components", async ({ page, api }) => {
    const t = await showTaskText(page, api, 'Look: <ion-icon name="flag"></ion-icon> <ion-chip>chip</ion-chip>');
    await expect(t.locator("ion-chip, ion-icon")).toHaveCount(0);
  });

  test("a text that is indented as a whole is a paragraph, not a code block", async ({ page, api }) => {
    const t = await showTaskText(page, api, "    Walk to the church\n    then turn left");
    await expect(t.locator("pre, code")).toHaveCount(0);
    await expect(t.locator("p")).toHaveCount(1);
    await expect(t).toContainText("Walk to the church");
  });

  test("an indented list is still a list", async ({ page, api }) => {
    const t = await showTaskText(page, api, "    - item a\n    - item b");
    await expect(t.locator("ul > li")).toHaveText(["item a", "item b"]);
    await expect(t.locator("pre")).toHaveCount(0);
  });

  test("shows special characters as typed", async ({ page, api }) => {
    const t = await showTaskText(page, api, "5 > 3 && 2 < 4 \"quoted\" it's");
    await expect(t).toHaveText("5 > 3 && 2 < 4 \"quoted\" it's");
  });
});
