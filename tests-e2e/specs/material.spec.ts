import { test, expect, appReady, signIn, user } from "../fixtures";

// The two pages that use Angular Material (tables, paginator, select, dialog).
// Selectors use the directive attributes (tr[mat-row], td[mat-cell], ...) and ARIA
// roles rather than CSS classes, so they survive the move between the legacy and
// the MDC-based Material components.

// The filter boxes react to keyup, which fill() does not send: type like a user.
async function typeInto(input: any, text: string) {
  await input.fill("");
  await input.pressSequentially(text);
}

const USERS = [
  { _id: "u1", username: "alice", email: "alice@example.org", createdAt: "2026-01-05T09:00:00.000Z", roles: ["admin"], emailIsConfirmed: true },
  { _id: "u2", username: "bob", email: "bob@example.org", createdAt: "2026-02-11T09:00:00.000Z", roles: ["scholar"], emailIsConfirmed: true },
  { _id: "u3", username: "carol", email: "carol@example.org", createdAt: "2026-03-20T09:00:00.000Z", roles: ["user"], emailIsConfirmed: false },
  { _id: "u4", username: "dave", email: "dave@example.org", createdAt: "2026-04-02T09:00:00.000Z", roles: ["contentAdmin"], emailIsConfirmed: true },
  { _id: "u5", username: "erin", email: "erin@example.org", createdAt: "2026-05-30T09:00:00.000Z", roles: ["user"], emailIsConfirmed: true },
];

test.describe("user management table", () => {
  test.beforeEach(async ({ page, api }) => {
    await signIn(page, api, user({ roles: ["admin"] }));
    api.on("GET", "/user/user", USERS);
    await page.goto("/user/user-management");
    await appReady(page);
    await expect(page.locator("tr[mat-row]")).toHaveCount(5);
  });

  test("lists every user with a paginator", async ({ page }) => {
    await expect(page.locator("td[mat-cell]", { hasText: "alice@example.org" })).toBeVisible();
    await expect(page.locator("mat-paginator")).toContainText(/1\s*[–-]\s*5 of 5/);
    await expect(page).toHaveScreenshot("user-management.png");
  });

  test("the search box filters by name or email", async ({ page }) => {
    await typeInto(page.locator("input[matInput]").first(), "bob");
    await expect(page.locator("tr[mat-row]")).toHaveCount(1);
    await expect(page.locator("tr[mat-row]")).toContainText("bob@example.org");
    await typeInto(page.locator("input[matInput]").first(), "zzz");
    await expect(page.locator("tr[mat-row]")).toHaveCount(0);
  });

  test("the role dropdown opens its options and filters the table", async ({ page }) => {
    await page.locator("mat-select").first().click();
    await expect(page.locator("mat-option").first()).toBeVisible();
    await expect(page.locator("mat-option", { hasText: /^\s*admin\s*$/ })).toHaveCount(1);
    await expect(page).toHaveScreenshot("user-management-role-options.png");
    await page.locator("mat-option", { hasText: /^\s*admin\s*$/ }).click();
    await expect(page.locator("tr[mat-row]")).toHaveCount(1);
    await expect(page.locator("tr[mat-row]")).toContainText("alice");
  });
});

test.describe("game tracks table", () => {
  const TRACKS = [
    { _id: "track-a1", players: ["Alice"], createdAt: "2026-03-01T10:00:00.000Z" },
    { _id: "track-b2", players: ["Bob"], createdAt: "2026-03-02T11:00:00.000Z" },
    { _id: "track-c3", players: ["Carol"], createdAt: "2026-03-03T12:00:00.000Z" },
  ];
  const bundle = encodeURIComponent(JSON.stringify({ id: "game-1", name: "Campus walk" }));

  test.beforeEach(async ({ page, api }) => {
    await signIn(page, api, user({ roles: ["admin"] }));
    api.on("GET", "/track/gametracks/game-1", { message: "ok", content: TRACKS });
    await page.goto(`/analyze/game-tracks/${bundle}`);
    await appReady(page);
    await expect(page.locator("tr[mat-row]")).toHaveCount(3);
  });

  test("lists the tracks with player and date", async ({ page }) => {
    await expect(page.locator("tr[mat-row]").first()).toContainText("Alice");
    await expect(page.locator("tr[mat-row]").first()).toContainText("2026-03-01");
    await expect(page.locator("mat-paginator")).toContainText(/1\s*[–-]\s*3 of 3/);
    await expect(page).toHaveScreenshot("game-tracks.png");
  });

  test("the filter narrows the rows and shows a message when nothing matches", async ({ page }) => {
    await typeInto(page.locator("input[matInput]"), "bob");
    await expect(page.locator("tr[mat-row]")).toHaveCount(1);
    await typeInto(page.locator("input[matInput]"), "zzz");
    await expect(page.locator("tr[mat-row]")).toHaveCount(0);
    await expect(page.getByText('No data matching the filter "zzz"')).toBeVisible();
  });

  test("download asks for confirmation in a dialog", async ({ page, api }) => {
    api.on("GET", "/track/track-a1", { message: "ok", content: { _id: "track-a1", name: "Campus walk", players: ["Alice"], waypoints: [], events: [] } });
    await page.locator("tr[mat-row]").first().locator("ion-button").click();
    const dialog = page.locator("[role=dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Do you want to download selected track data?");
    await expect(dialog.getByRole("link", { name: /Yes/ })).toBeVisible();
    await expect(page).toHaveScreenshot("game-tracks-download-dialog.png");
    await dialog.getByRole("button", { name: "No" }).click();
    await expect(dialog).toHaveCount(0);
  });
});
