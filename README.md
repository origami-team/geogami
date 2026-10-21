<p align="center">
  <img src=https://github.com/origami-team/geogami/blob/master/src/assets/icons/icon.png width="100" alt="GeoGami logo"/>
</p>

<h1 align="center">GeoGami UI</h1>

<p align="center">
  Cross-platform mobile and web client for the <strong>GeoGami</strong> location-based game platform.
</p>

<p align="center">
  <a href="https://doi.org/10.5281/zenodo.5384903"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.5384903.svg" alt="DOI"/></a>
  <img src="https://img.shields.io/badge/Angular-15-DD0031?logo=angular" alt="Angular 15"/>
  <img src="https://img.shields.io/badge/Ionic-6-3880FF?logo=ionic" alt="Ionic 6"/>
  <img src="https://img.shields.io/badge/Capacitor-iOS%20%7C%20Android-119EFF?logo=ionic" alt="Capacitor"/>
</p>

GeoGami is a location-based game built by the **Spatial Intelligence Lab (SIL)** at the Institute for Geoinformatics, University of Münster. The app lets users **play and create map-based games** in the real world or in a virtual environment, with the goal of training and studying spatial cognition.

This repository contains the **front-end client** — an Angular + Ionic application that runs as a web app, an iOS app, and an Android app from a single codebase.

> Looking for the other components?
> - **Backend API**: [`../geogami-server`](https://github.com/geogami-team/origami-backend)
> - **Analytics dashboard**: [`../geogami-dashboard`](https://github.com/geogami-team/geogami-dashboard)
> - **Virtual environment**: [`../geogami-virtual-environment-dev`](https://github.com/geogami-team/geogami-virtual-environment-dev)

---

## Table of contents

- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Available scripts](#available-scripts)
- [Testing](#testing)
- [Upgrade status and known caveats](#upgrade-status-and-known-caveats)
- [Project structure](#project-structure)
- [Building for mobile (iOS / Android)](#building-for-mobile-ios--android)
- [Internationalisation](#internationalisation)
- [Class QR codes (instructor sharing)](#class-qr-codes-instructor-sharing)
- [Contributing](#contributing)
- [Map Features and Task Types in GeoGami](#map-features-and-task-types-in-geogami)
- [Contact](#contact)
- [License](#license)

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | Angular 15, Ionic 6 |
| Native shell | Capacitor 2 (iOS, Android) |
| Maps | Mapbox GL JS |
| State / forms | Reactive forms, RxJS |
| UI components | Angular Material, Ionic Components |
| i18n | `@ngx-translate/core` |
| HTTP | Angular HttpClient (JWT bearer) |

## Prerequisites

- **Node.js** — the version in [`.nvmrc`](.nvmrc) (use `nvm use`). It is also the version Netlify builds the web app with, so
  check your changes with it. Angular 15 needs Node 18.10 or newer (16.13+ also works).
- **yarn 1.x** — use `yarn`, **not `npm install`**. `yarn.lock` is the only committed lockfile (Netlify installs from it);
  `npm install` creates a second, conflicting one.
- **Ionic CLI** (only for `ionic serve` and the Capacitor commands): `npm i -g @ionic/cli`
- For mobile builds:
  - iOS: macOS, Xcode 14+, CocoaPods
  - Android: Android Studio with SDK 33+

## Getting started

```bash
git clone <repo-url>
cd geogami-ui
nvm use
yarn install --frozen-lockfile
ionic serve         # http://localhost:8100   (or: yarn start -> http://localhost:4200)
```

The dev server proxies API calls to the URL configured in `src/environments/environment.ts`.

## Configuration

Per-environment configuration lives in `src/environments/`:

| File | Used when |
|---|---|
| `environment.ts` | `ionic serve`, dev builds |
| `environment.prod.ts` | `ionic build --prod` |

Typical values:

```ts
export const environment = {
  production: false,
  apiURL: 'http://localhost:3000',         // GeoGami server
  dashboardURL: 'http://localhost:3838',   // Shiny dashboard
  mapboxAccessToken: '<your-mapbox-token>',// Required for Mapbox GL map rendering

  // Virtual environment (only required for virtual-world games)
  uiURL: 'http://localhost:8100',          // UI origin used by the embedded WebGL view
  webglURL: 'http://localhost:50544'       // Unity WebGL build served locally
};
```

## Available scripts

| Command | Purpose |
|---|---|
| `yarn start` / `ionic serve` | Run dev server with live reload (`yarn start` on port 4200, `ionic serve` on 8100) |
| `yarn build` | Build the web bundle into `www/` (add `--configuration production` for the production build) |
| `yarn test` | Run the Karma unit tests (watch mode) |
| `yarn test:e2e` | Run the Playwright browser tests against the production build in `www/` |
| `yarn verify` | Production build + unit tests + browser tests in one go — run it before pushing |
| `ionic capacitor sync ios` | Copy `www/` into the iOS Xcode project |
| `ionic capacitor sync android` | Copy `www/` into the Android Studio project |

There is no lint script: Angular 13 removed the TSLint builder and the project has not moved to ESLint yet.
The old Cordova targets (`build-browser`) were removed; native apps are built with Capacitor.

## Testing

`yarn verify` runs, in this order:

1. the production build, on the Node version from `.nvmrc`;
2. the Karma unit tests (services, auth/interceptor/guards, models, editor-mode logic);
3. the Playwright browser tests in [`tests-e2e/`](tests-e2e/README.md): every page loads, login, playing a game, what is uploaded
   as a track, and screenshot baselines. The API is mocked, so nothing touches production.

Not covered automatically: live multiplayer and the virtual environment (sockets), and native iOS/Android behaviour
(GPS, camera, voice recorder, QR scanner, file sharing). After each framework upgrade step, run the manual checklist in
[`tests-e2e/README.md`](tests-e2e/README.md#not-covered-live-sockets-manual-check-per-upgrade-step) on the Netlify deploy
preview and on a real device.

## Upgrade status and known caveats

The app is being upgraded one Angular major at a time (currently **15**; target is the newest Angular the native
apps can support), with Capacitor last. Each step is verified with `yarn verify` and a Netlify deploy preview.

Known mismatches that are deliberately left for now:

| Library | Mismatch | Why it stays, and the plan |
|---|---|---|
| `ngx-socket-io` 3.4 | declares Angular 12 | No release for newer Angular uses `socket.io-client` 2.x, which the web/native app and the API (socket.io 2.5) currently use. Newer wrapper versions need `socket.io-client` 4 and RxJS 7, and a v4 client cannot talk to a v2 server. Order: upgrade the server to socket.io 4 with `allowEIO3: true` (so already-installed apps keep working), then move the wrapper. Must be done before Angular 16, which drops the compatibility compiler (`ngcc`) this library relies on. The Unity virtual environment uses a separate Socket.IO v4 client library; check how it behaves against the upgraded server before deploying it. |
| Angular Material 15 *legacy* components | `table`, `paginator`, `form-field`, `input`, `select`, `button` and `dialog` are imported from `@angular/material/legacy-*` (4 files: `material.module.ts`, `user-management`, `game-tracks`, `download-track-dialog`) | Angular 15 moved Material to new MDC components and kept the old ones as `legacy-*`, which keep the exact old look. Material 15 ships no prebuilt legacy theme, so `src/theme/material-legacy.scss` recreates the indigo-pink one. **Angular Material 17 removes the legacy components**, so these four files must move to the new components before the Angular 17 step; the screenshots in `tests-e2e/specs/material.spec.ts-snapshots` will show the visual changes to review. |
| Capacitor 2.5, `@ionic-native` 5 | old native layer | Handled in the last step (Capacitor 3+), together with the manual device checks. |

`@ngx-translate/core` (14.0.0) and `http-loader` (7.0.0) are pinned to the last releases that support Angular 15 and 16 together; newer ones need Angular 16 or later. `tests-e2e/specs/language.spec.ts` covers language selection end to end.

Task texts written by game authors are rendered with a small own pipe (`src/app/pipes/markdown.pipe.ts`: `marked` plus Angular's
HTML sanitizer) instead of `ngx-markdown`, whose newer releases pull in `mermaid`, KaTeX, Prism and about 65 more packages
the app never used. The Lottie animations use a small own directive (`src/app/components/lottie`) on `lottie-web` instead of `ngx-lottie`, whose newer releases add `@scarf/scarf`, an install-time analytics script. `marked` is on 4.x; newer majors change output details, so move it deliberately with the markdown tests as the check.

`package.json` has one `resolutions` entry: it makes the Angular builder use `browserslist` 4.21.10. Angular CLI 15 pins
4.21.5, which yarn pairs with a 2026 `caniuse-lite` it cannot read (`Unknown version … of edge`, the build fails). The
combination 4.21.10 uses is the one the project has always built with, so the browser targets are unchanged. Try removing the
entry when updating the CLI past 15.

### Browser storage lifetime

Unfinished tracks (`savedTracksData`) and draft games (`game`) now live only in
`GameSessionService` memory. They survive navigation/rejoin within the running app,
but disappear when the app is closed or reloaded. At startup, the two old Ionic
storage keys are discarded; authentication tokens and language preferences are
not cleared. Games/tracks already uploaded to the server are unchanged.

The companion Unity project's **GeoGami WebGL template** manages its own asset
cache: entries expire 24 hours after download, and least-recently-used entries
are evicted above 512 MiB. The UI cannot clear the WebGL origin's storage (a
different port/domain). Rebuild and serve the Unity WebGL build to enable this
policy. For an existing full `localhost` cache that prevents login, perform a
one-time Firefox site-data cleanup first; old build ports are not automatically
accessible to the new build's cleanup code.
Keep the WebGL serving port fixed across development rebuilds so the cache policy
can reach and expire the previous build's files.

## Project structure

```
src/app/
├── pages/
│   ├── play-game/           # Real-world & virtual game playback
│   ├── create-game/         # Author new games (real + VR)
│   ├── edit-game/           # Modify existing games
│   ├── analyze-game/        # Track listing + dashboard launcher
│   ├── multiplayer/         # Real-time multiplayer flows
│   ├── user/                # Login, register, profile, verify-email,
│   │                        # reset-password, user-management (admin)
│   ├── showroom/            # Map / task / world demos
│   └── handbook/            # In-app help
├── services/                # AuthService, UtilService, …
├── models/                  # TypeScript interfaces and shared models
└── interceptors/            # JWT refresh handling
```

## Building for mobile (iOS / Android)

```bash
ionic capacitor build ios       # opens the Xcode project
ionic capacitor build android   # opens Android Studio
```

The `ios/` and `android/` folders are tracked in this repo so push notifications, plugins, and signing settings stay reproducible.

## Internationalisation

Translation files live at `src/assets/i18n/<locale>.json`. Currently shipped: `en`, `de`, `fr`, `pt`, `ar`. Add a new key under the appropriate namespace; the UI uses Angular `| translate` pipes everywhere, including dynamic strings such as toasts.

## Class QR codes (instructor sharing)

A logged-in user viewing a **single-player** game can open a **Class QR code** (the QR button in the game-detail header). The QR/link encodes the game plus the sharing user's id and display name, so it doubles as a classroom hand-out:

- A student who scans it (phone camera or the in-app scanner) lands on the game with it pre-selected.
- Data-sharing consent is **forced on and locked**, with a note naming the instructor — the play must be shared for the teacher to receive it.
- When the session ends, the track is saved with that user as its **instructor**, so the play appears in the **instructor's** dashboard rather than the game creator's.

Multiplayer games are unchanged — they keep their existing room-based QR (limited, fixed participant count). Normal solo plays (no instructor in the link) still attribute to the game creator as before. Who can see which track, and per-track sharing, are handled server-side — see the server README's "Class sharing (instructor QR) & track access" section.

## Contributing

- Branch from `dev` (PRs target `master`), open a PR, and reference an issue when applicable.
- Please run `yarn verify` before pushing (there is no lint step at the moment).
- Bug reports and feature requests: <https://github.com/geogami-team/geogami/issues>.

---

## Map Features and Task Types in GeoGami

The sections below describe the gameplay primitives the UI exposes — useful both for new players and for contributors implementing changes to game authoring or playback.

### Task types

GeoGami groups task types into **Navigation tasks** and **Thematic tasks**, plus a standalone **Information** module that lets game creators give the player hints, rules, or context before play.

#### Navigation tasks

> Navigation tasks direct the player to a new location.

| Navigation to flag | Navigation with arrow | Navigation via text | Navigation via photo |
| ------------------ | --------------------- | ------------------- | -------------------- |

#### Thematic tasks

> Thematic tasks are location-specific tasks that probe specific spatial skills.

| Self-location | Object location | Direction determination | Free task |
| ------------- | --------------- | ----------------------- | --------- |

#### Free tasks

> Free tasks let game creators freely combine question and answer types to build quizzes or custom thematic challenges.

**Supported question types**

| Type | Description |
| --- | --- |
| `TEXT` | Plain text question |
| `MAP_FEATURE` | Question referencing a map feature |
| `MAP_FEATURE_FREE` | Free-form map-feature question |
| `MAP_FEATURE_PHOTO` | Map-feature question with a photo |
| `MAP_TARGET` | Question targeting a specific map location |
| `MAP_DIRECTION` | Question about a map direction |
| `MAP_DIRECTION_MARKER` | Direction question shown via a map marker |
| `MAP_DIRECTION_PHOTO` | Direction question shown via a photo |
| `NAV_INSTRUCTION` | Navigation instruction prompt |
| `NAV_INSTRUCTION_PHOTO` | Navigation instruction shown via a photo |
| `PHOTO` | Photo-based question |
| `INFO` | Informational prompt (no question) |

**Supported answer types**

| Type | Description |
| --- | --- |
| `POSITION` | Player provides their current position |
| `MAP_POINT` | Player picks a point on the map |
| `DIRECTION` | Player indicates a direction |
| `MAP_DIRECTION` | Player indicates a direction on the map |
| `PHOTO` | Player submits a photo |
| `DRAW` | Player draws on the map |
| `MULTIPLE_CHOICE` | Multiple-choice answer |
| `MULTIPLE_CHOICE_TEXT` | Multiple-choice with text options |
| `TEXT` | Free-text answer |
| `NUMBER` | Numeric answer |
| `INFO` | Informational acknowledgement (no answer) |

### Map features

Each task can be configured with a combination of **map settings** and **marker / overlay settings**.

#### Map settings

| Setting | Options |
| --- | --- |
| `Zoom` | manual · zoom to task · zoom to game · off |
| `Map Section` | movable · automatically-centered · static |
| `Map Rotation` | manual · automatic · automatic on-demand · fixed to north |
| `Map Type` | standard · map selection · satellite · satellite on-demand · satellite swipe · 3D · 3D on-demand · blank · blank + satellite swipe |
| `Reduced Information` | strips non-essential map details to test orientation in minimal-information settings |
| `Switch Layer` (virtual worlds) | toggles between map material and satellite layer inside the Unity virtual environment |

#### Marker / overlay settings

| Setting | What it does | Modes |
| --- | --- | --- |
| `Location Marker` | Shows the player's current position | on · on-demand · at start of task · off |
| `View Direction Marker` | Shows the device's current heading | on · on-demand · at start of task · off |
| `Track Recording` | Records the player's route | for the entire game · for the current task · also for the next task |
| `Buffer` | Reveals a circular section of the map around the player | configurable diameter, **20–100 m** |
| `Highlight Landmarks` | Highlights landmarks near the destination (with optional explicit `landmarkFeatures` list) | on · off |
| `Highlight Street Section` | Highlights the street segment at the destination | on · off |

### Game environments

GeoGami games can be played in two environments:

- **Real world** — outdoor play using the device's GPS and compass.
- **Virtual world** — indoor / remote play in a Unity-based 3D environment.

Both environments support **single-player** and **multiplayer** modes, with the same task and map-feature catalogue.

---

## Contact

**Spatial Intelligence Lab (SIL)** — Institute for Geoinformatics, University of Münster

| | |
| --- | --- |
| Address | Heisenbergstraße 2, 48149 Münster |
| Email | geogami(at)uni-muenster.de |
| Website | <https://geogami.uni-muenster.de> |
| Team | <https://geogami.uni-muenster.de/kontakt.html#team> |

## License

GeoGami is published under the **MIT License**. © 2026 — GeoGami. See the root project for full attribution and citation information.
