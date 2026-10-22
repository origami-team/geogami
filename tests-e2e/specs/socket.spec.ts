import { test, expect, appReady, game, list } from "../fixtures";

// The virtual-environment (VE) flow talks to the API over Socket.IO 2.x. These tests run the real
// browser bundle against a real Socket.IO 2.5 server (tests-e2e/socket-server.ts), so they cover the
// whole path: the socket client the app uses, the wire protocol, acknowledgements, rooms and the
// automatic reconnect. The live multiplayer (real-world) flow is still checked by hand — see README.

const VE_TYPE = "VirEnv_52";
const veGame = () =>
  game({
    _id: "game-ve",
    name: "Virtual walk",
    isVRWorld: true,
    virEnvType: VE_TYPE,
    tasks: [{ ...game().tasks[0], virEnvType: VE_TYPE }],
  });

async function openDetail(page: any, api: any) {
  api.on("GET", "/game/game-ve", { message: "ok", content: veGame() });
  await page.goto("/play-game/game-detail?gameId=game-ve");
  await appReady(page);
  await expect(page.locator("app-game-detail ion-card-title").first()).toContainText("Virtual walk");
}

// scoped to the detail page: Ionic keeps the pages visited before it in the DOM (hidden)
async function start(page: any, playerName: string) {
  await page.locator("app-game-detail ion-input input").first().fill(playerName);
  await page.locator("app-game-detail ion-footer ion-button").click();
}

test.describe("socket connection", () => {
  test("nothing connects until a page needs it", async ({ page, socketServer }) => {
    await page.goto("/");
    await appReady(page);
    await page.waitForTimeout(1500);
    expect(socketServer.connected).toBe(0);
  });

  test("a game page connects", async ({ page, api, socketServer }) => {
    await openDetail(page, api);
    await expect.poll(() => socketServer.connected).toBe(1);
  });
});

test.describe("starting a virtual-environment game", () => {
  test("a free player name: the app asks the server, joins the room and opens the VE", async ({ page, api, socketServer }) => {
    await openDetail(page, api);
    await start(page, "Alice");

    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/playing-virenv\//);
    expect(socketServer.eventsOf("checkRoomNameExistance_v2").map((e) => e.args)).toEqual([[{ gameCode: "Alice" }]]);
    // the app emits before it navigates, but the server only sees the packet once the long-poll request arrives
    await expect.poll(() => socketServer.eventsOf("newGame").map((e) => e.args)).toEqual([[{ gameCode: "Alice", virEnvType: VE_TYPE, isSingleMode: true }]]);
    await expect.poll(() => socketServer.membersOf("Alice")).toHaveLength(1);
  });

  test("a name that is already in use is refused and nothing is joined", async ({ page, api, socketServer }) => {
    await socketServer.joinAsApp("Alice"); // someone else is already playing as Alice
    await openDetail(page, api);
    await start(page, "Alice");

    await expect(page.locator("ion-alert")).toContainText("Use another name");
    expect(new URL(page.url()).pathname).toBe("/play-game/game-detail");
    // only the other participant ever joined the room
    expect(socketServer.eventsOf("newGame")).toHaveLength(1);
    expect(socketServer.membersOf("Alice")).toHaveLength(1);
  });
});

test.describe("while the virtual environment is running", () => {
  test("when the VE reports that the game is over, the app returns to the start page", async ({ page, api, socketServer }) => {
    await openDetail(page, api);
    await start(page, "Alice");
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/playing-virenv\//);

    const unity = await socketServer.joinAsUnity("Alice"); // the Unity side joins the room by player name
    unity.emit("closeVEGame");

    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  });

  test("after a dropped connection the app reconnects by itself and joins its room again", async ({ page, api, socketServer }) => {
    await openDetail(page, api);
    await start(page, "Alice");
    await expect.poll(() => socketServer.eventsOf("newGame").length).toBe(1);
    const firstConnection = socketServer.eventsOf("newGame")[0].socketId;

    socketServer.dropAllTransports();

    await expect.poll(() => socketServer.eventsOf("newGame").length, { timeout: 20_000 }).toBe(2);
    const second = socketServer.eventsOf("newGame")[1];
    expect(second.socketId).not.toBe(firstConnection); // a new connection...
    expect(second.args).toEqual([{ gameCode: "Alice", virEnvType: VE_TYPE, isSingleMode: true }]); // ...that joined the same room
    expect(socketServer.membersOf("Alice")).toEqual([second.socketId]);
  });

  test("a closeWebGLFrame sent to the room returns the app to the start page", async ({ page, api, socketServer }) => {
    await openDetail(page, api);
    await start(page, "Alice");
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/playing-virenv\//);
    socketServer.emitToRoom("Alice", "closeWebGLFrame");
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  });
});

test.describe("a second game in the same session (no reload)", () => {
  test("the connection is reused: the old room is left, the same name is free again, nothing is registered twice", async ({ page, api, socketServer }) => {
    test.setTimeout(90_000);
    const path = () => new URL(page.url()).pathname;
    api.on("GET", /^\/game\/all\/?$/, list([veGame()]));

    // ---- game 1 (opened directly), ended by the Unity side
    await openDetail(page, api);
    await start(page, "Alice");
    await expect.poll(path).toMatch(/^\/playing-virenv\//);
    // the app emits before it navigates, but the server only sees the packet once the long-poll request arrives
    await expect.poll(() => socketServer.eventsOf("newGame").length).toBe(1);
    const firstConnection = socketServer.eventsOf("newGame")[0].socketId;
    const unity = await socketServer.joinAsUnity("Alice");
    unity.emit("closeVEGame");
    await expect.poll(path).toBe("/");
    unity.close(); // the VE frame is gone

    // ---- back to the game list inside the app: it leaves the room by disconnecting
    await page.locator("ion-card").first().click(); // the "Games" card
    await expect.poll(path).toBe("/play-game/play-game-list");
    await expect.poll(() => socketServer.membersOf("Alice")).toEqual([]);

    // ---- game 2, same player name, same session
    await page.locator("select").first().selectOption("virtual"); // game environment
    await page.locator("ion-card.game-card", { hasText: "Virtual walk" }).click();
    await expect(page.locator("app-game-detail ion-card-title").first()).toContainText("Virtual walk");
    await start(page, "Alice"); // would be refused as taken if the first game had left its room behind
    await expect.poll(path).toMatch(/^\/playing-virenv\//);
    await expect.poll(() => socketServer.eventsOf("newGame").length).toBe(2);
    expect(socketServer.eventsOf("checkRoomNameExistance_v2")).toHaveLength(2);
    const secondConnection = socketServer.eventsOf("newGame")[1].socketId;
    expect(secondConnection).not.toBe(firstConnection); // the same client connected again
    expect(socketServer.membersOf("Alice")).toEqual([secondConnection]);

    // ---- one reconnect re-joins once: the handlers of game 1 were replaced, not added to
    socketServer.dropAllTransports();
    await expect.poll(() => socketServer.eventsOf("newGame").length, { timeout: 20_000 }).toBe(3);
    await page.waitForTimeout(2500); // a leftover handler would join a second time
    expect(socketServer.eventsOf("newGame")).toHaveLength(3);

    // ---- and game 2 can be ended the same way
    const unity2 = await socketServer.joinAsUnity("Alice");
    unity2.emit("closeVEGame");
    await expect.poll(path).toBe("/");
  });
});
