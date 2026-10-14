import { BehaviorSubject } from "rxjs";
import { EditGameOverviewPage } from "./edit-game-overview.page";
import { CreateGameOverviewPage } from "../../create-game/create-game-overview/create-game-overview.page";
import { EditorModeService } from "../../../services/editor-mode.service";
import { EditorVisibilityService } from "../../../services/editor-visibility.service";

const POLYGON = {
  type: "Feature",
  properties: {},
  geometry: { type: "Polygon", coordinates: [[[7.6, 51.9], [7.7, 51.9], [7.7, 52.0], [7.6, 51.9]]] },
};
const BOUNDARY = { type: "FeatureCollection", features: [POLYGON] };
const EMPTY = { type: "FeatureCollection", features: [] };

function visibilityService(): { ev: EditorVisibilityService; modes: EditorModeService } {
  Object.keys(localStorage)
    .filter((key) => key.indexOf("geogami.editor") === 0)
    .forEach((key) => localStorage.removeItem(key));
  const auth: any = { getUser: () => new BehaviorSubject<any>(null).asObservable() };
  const modes = new EditorModeService(auth);
  return { ev: new EditorVisibilityService({} as any, auth, modes), modes };
}

describe("saving a game's boundary", () => {
  describe("on the edit page", () => {
    function page(options: { ready: boolean; drawing: any; mapSection?: boolean }) {
      const saved: any[] = [];
      const edit: any = Object.create(EditGameOverviewPage.prototype);
      edit.game = { name: "A game", place: "Münster", tasks: [], bbox: JSON.parse(JSON.stringify(BOUNDARY)) };
      edit.mapSection = options.mapSection !== false;
      edit.mapSectionVisible = true;
      edit.geofence = true;
      edit.disableShareData = true;
      edit.skipTaskPin = "1234";
      edit.boundaryReady = options.ready;
      edit.draw = { getAll: () => options.drawing };
      edit.utilService = { getIsOnlineValue: () => true, showValidationError: jasmine.createSpy("validation") };
      edit.translate = { instant: (key: string) => key };
      edit.gameFactory = {
        addGameInformation: (info: any) => saved.push(info),
        game: { tasks: [] },
        flushGame: () => {},
      };
      edit.gamesService = { updateGame: () => new Promise(() => {}) };
      return { edit, saved };
    }

    it("keeps the stored boundary when the map was never loaded — for example because Simple hid it", () => {
      // The drawing widget exists from the start but is still empty.
      const { edit, saved } = page({ ready: false, drawing: EMPTY });
      edit.uploadGame();
      expect(saved[0].bbox).toEqual(BOUNDARY as any);
      expect(saved[0].mapSectionVisible).toBe(true);
      expect(saved[0].geofence).toBe(true);
      expect(saved[0].disableShareData).toBe(true);
      expect(saved[0].skipTaskPin).toBe("1234");
    });

    it("takes the boundary from the drawing once the map has loaded it, including edits", () => {
      const edited = { type: "FeatureCollection", features: [POLYGON, { ...POLYGON, id: "second" }] };
      const { edit, saved } = page({ ready: true, drawing: edited });
      edit.uploadGame();
      expect(saved[0].bbox).toEqual(edited as any);
    });

    it("saves an emptied boundary when the author deleted it on a loaded map", () => {
      const { edit, saved } = page({ ready: true, drawing: EMPTY });
      edit.uploadGame();
      expect(saved[0].bbox).toEqual(EMPTY as any);
    });

    it("saves no boundary when the map section is switched off", () => {
      const { edit, saved } = page({ ready: false, drawing: EMPTY, mapSection: false });
      edit.uploadGame();
      expect(saved[0].bbox).toBeNull();
    });
  });

  describe("on the create page", () => {
    function page(options: { ready: boolean; draw: any; bbox?: any }) {
      const saved: any[] = [];
      const create: any = Object.create(CreateGameOverviewPage.prototype);
      create.game = { name: "New game", place: "", tasks: [], bbox: options.bbox };
      create.mapSection = true;
      create.mapSectionVisible = true;
      create.geofence = false;
      create.disableShareData = false;
      create.skipTaskPin = "";
      create.boundaryReady = options.ready;
      create.draw = options.draw;
      create.utilService = { getIsOnlineValue: () => true, showValidationError: jasmine.createSpy("validation") };
      create.translate = { instant: (key: string) => key };
      create.gameFactory = { addGameInformation: (info: any) => saved.push(info), game: { tasks: [] } };
      create.gamesService = { postGame: () => new Promise(() => {}) };
      create.numPlayers = 1;
      create.isSingleMode = true;
      return { create, saved };
    }

    it("does not crash when the map section is on but its map has not loaded", () => {
      const { create, saved } = page({ ready: false, draw: undefined });
      expect(() => create.uploadGame()).not.toThrow();
      expect(saved[0].bbox).toEqual(EMPTY as any);
    });

    it("keeps a boundary the game already carries while the map has not loaded", () => {
      const { create, saved } = page({ ready: false, draw: { getAll: () => EMPTY }, bbox: BOUNDARY });
      create.uploadGame();
      expect(saved[0].bbox).toEqual(BOUNDARY as any);
    });

    it("takes the drawn boundary once the map has loaded", () => {
      const { create, saved } = page({ ready: true, draw: { getAll: () => BOUNDARY } });
      create.uploadGame();
      expect(saved[0].bbox).toEqual(BOUNDARY as any);
    });
  });

  describe("the notice about advanced game settings", () => {
    it("mentions a boundary and a switched-off consent question in Simple only", () => {
      const { ev, modes } = visibilityService();
      const edit: any = Object.create(EditGameOverviewPage.prototype);
      edit.ev = ev;
      edit.lastAdvancedInUse = []; // a field initialiser, which Object.create skips
      edit.mapSection = true;
      edit.disableShareData = true;
      expect(edit.advancedInUse.sort()).toEqual(["game.boundary", "game.disableDataConsent"]);
      modes.setMode("advanced");
      expect(edit.advancedInUse).toEqual([]);
    });
  });
});
