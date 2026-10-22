# Browser smoke tests

Playwright tests that drive the **production build** (`www/`) in a headless browser. The GeoGami API is
fully mocked and every other external host (map tiles, fonts, GitHub, Keycloak) is blocked, so the
tests are fast, deterministic and never touch production.

They are deliberately independent of the app's Angular/Ionic/Capacitor versions: they only see the
rendered app. That makes them the safety net for framework upgrades.

## Run

```bash
yarn verify                 # in geogami-ui: build + unit tests + these tests
# or, with an existing build in www/:
yarn test:e2e               # all projects (desktop + mobile)
cd tests-e2e && npx playwright test specs/play.spec.ts --project=desktop
cd tests-e2e && npx playwright show-report   # after a failure
```

First time on a machine: `cd tests-e2e && yarn install && npx playwright install chromium`.

Playwright is pinned to 1.49.1 because newer releases need Node 20. Bump it when the project moves to Node 20.

## What is covered

| Spec | What it checks |
| --- | --- |
| `routes.spec.ts` | every lazy-loaded page that can be opened directly renders without errors (signed out and signed in); guarded pages redirect signed-out visitors to the login page |
| `auth.spec.ts` | login through the form (trimmed username, tokens stored, errors shown, unconfirmed email), session restore, rejected refresh token |
| `play.spec.ts` | game list → detail → name + consent box → Start (the bundle handed to the playing page is checked) → playing with GPS and map → finishing with and without consent (what is uploaded to `POST /track`); consent-required games |
| `markdown.spec.ts` | the task text on the playing page: markdown is rendered, the flag chip is added, and scripts, event handlers, `javascript:` links and `<ion-*>` tags typed by an author are stripped |
| `language.spec.ts` | language handling: the start language follows the browser (and falls back to German), switching in the picker for all six languages (texts come from the real `assets/i18n/*.json`), the choice survives reload and a second tab, people with an already-saved choice (old storage format) keep it, the language saved on an account (login, `pt_BR`-style values, registration, profile), texts with parameters, and right-to-left Arabic with screenshots |
| `socket.spec.ts` | the virtual-environment flow over Socket.IO against a real 2.5 test server: no connection until needed, name check and joining the room, a taken name, the VE (played by a second socket sending `joinVEGame { playerName }` like Unity) closing the game, reconnect and re-join, and a second game in the same session without a reload (old room left, name free again, one registration per game, no duplicate re-join after a reconnect) |
| `network.spec.ts` | the connection messages of the native network plugin, driven by the `offline` / `online` events it fires on the document: a "No connection" toast that stays until dismissed, "Back online" for 3 s and the first toast removed, the game list warning while offline and not once back online, several rounds |
| `storage.spec.ts` | the browser storage (`@ionic/storage`): the two legacy game keys are removed at start while the language choice and other keys stay, and a localStorage that cannot be written does not break or spam the app (the choice then just lasts for the session) |
| `qr.spec.ts` | the class QR and the multiplayer join code on the game detail page: the image is decoded (like a phone camera would) and must contain the right link, match the `qrcode` library pixel for pixel, sit in the element the styles and the PDF export expect, and the PDF hand-out downloads |
| `lottie.spec.ts` | the three Lottie animations (finished-game star, saving astronaut on create and edit): rendered, actually animating, and stopped once the page is left |
| `shuffle.spec.ts` | multiple-choice answers on the playing page: every answer once, random order per visit (the right answer is not always first), and a stable order while the task is on screen |
| `material.spec.ts` | the pages that use Angular Material: user-management and game-tracks tables, paginator, filters, role dropdown and the download dialog, with screenshots (baselines taken on the Angular 14 build, so they show any visual change of the Material upgrade) |
| `visual.spec.ts` | screenshot baselines of the main pages, desktop and mobile |
| `guards.spec.ts` | the harness itself: a missing local asset is reported, blocked external hosts are not |

Pages that need navigation state from the previous page (create-game-list, create-game-overview, …)
bounce back on a direct visit by design, so they can only be reached through the UI flow.

## Sockets: what is automated, what is still checked by hand

Sockets are blocked in every test **except** those that ask for the `socketServer` fixture: that starts a real
Socket.IO **2.5** server (`socket-server.ts`, the versions the API runs), answers the virtual-environment (VE) events
the way the API does (`newGame`, `joinVEGame`, `checkRoomNameExistance_v2`, `closeVEGame`), and routes the page's
socket traffic to it. `specs/socket.spec.ts` uses it to run the real browser bundle through: no connection until a
page needs one, the player-name check with its acknowledgement, joining the room, a name that is taken, the VE closing
the game, and the automatic reconnect that joins the room again. The app joins its room with `newGame { gameCode }`,
the Unity side with `joinVEGame { playerName }` — the same payloads as the API, so a test that sends the wrong one
fails. A second test plays two games one after the other **without reloading**, which is what exercises the
cleanup (leaving the room, removing the listeners) and the reuse of the connection.

Still checked by hand after each upgrade step, on the Netlify deploy preview (it uses the real API), in private
windows so no old service worker answers, with test accounts — these need the real API and, for 3 and 4, the
Unity build:

1. **Multiplayer, real world** — signed in as scholar/admin, open a multiplayer game, copy the game link;
   join it from a second browser (or phone) as player 2. Both see each other join; play one task each;
   finish. Check the game appears under *Evaluate* with both players' tracks.
2. **Multiplayer, rejoin** — reload player 2's tab mid-game; it rejoins the same room.
3. **Virtual environment, single player** — open a VE game, enter a name, Start; the VE opens and
   connects (avatar moves, the map panel follows), finish one task.
4. **Virtual environment, multiplayer** — as 1., but with a VE game.

The app's socket client (`src/app/services/socket-client.ts`) stays on `socket.io-client` 2.5 on purpose: that is the
protocol of the API, of the apps already in the stores and of this test server. Moving to Socket.IO 4 is a separate,
coordinated change (server first, with `allowEIO3`); the Unity VE ships its own Socket.IO v4 client library, which
has to be re-checked then.

## Native plugins (compass and connection status): check on a device

The compass (`cordova-plugin-device-orientation`) and the connection status (`cordova-plugin-network-information`) are
reached through `@awesome-cordova-plugins`. What can run without a phone is automated: the unit specs
`native-plugins.spec.ts` (the real wrapper classes against a fake native plugin: argument order, readings, errors, what
unsubscribing does) and `origami-orientation.service.spec.ts` (watch options per platform, one native watch, throttling),
and `specs/network.spec.ts` here (the toasts and the offline warning). The sensors themselves need a device, after any change
of the wrapper library or of the Cordova plugins, on an Android phone and an iPhone/iPad (installed app, not the browser):

1. **Compass** — start a real-world game; the direction arrow follows when you turn on the spot. Finish the game, start a
   second one without closing the app: the arrow still moves. Send the app to the background for a minute and bring it back:
   still moves. Open the map showroom: the heading is shown there too.
2. **Network** — in a game or on the start page switch on airplane mode: a "No connection" toast with a *Dismiss* button
   appears. Switch it off: the toast disappears and "Back online" shows for a moment. Also start the app once while in
   airplane mode and compare with the release in the store: it should behave the same (this change only swaps the wrapper).

## How the mock works

`fixtures.ts` intercepts everything:

- requests to the API origin go to a `MockApi`; **a call without a mock fails the test**, so a new API
  call introduced by an upgrade is noticed
- other external hosts are aborted, and every aborted URL is recorded in `api.blocked`
- `pageerror` and `console.error` fail the test. A "Failed to load resource" message is ignored only
  when its URL is one we blocked on purpose or an API response a test mocked with an error status
- independently of the console, a failed request that was not blocked on purpose, or any 4xx/5xx
  for a local asset, fails the test — so a missing app asset after an upgrade is noticed
- `ignoreKnownErrors` tolerates a known, already-reported app error in one test only. Current
  known issues: the playing page's finish-state errors (`play.spec.ts`) and the handbook's missing
  images (`routes.spec.ts`)

Response shapes follow the real server: lists under `/game/*` are `{ message, content: [...] }`, while
`/user/*` lists are bare arrays.

## Visual baselines

`specs/visual.spec.ts-snapshots/` holds the reference screenshots, one set per project and OS
(`*-desktop-darwin.png`). After an intended UI change, look at the diffs in the report, then run

```bash
cd tests-e2e && npx playwright test visual.spec.ts --update-snapshots
```

A diff is something to look at, not automatically a failure. Generate and compare on the same OS
(or in Playwright's Docker image) — fonts differ between systems.
