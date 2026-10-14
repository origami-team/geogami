import { cloneDeep } from "lodash";
import { BehaviorSubject } from "rxjs";
import { standardMapFeatures } from "../../../models/standardMapFeatures";
import { virEnvLayers } from "../../../models/virEnvsLayers";
import { EditorModeService } from "../../../services/editor-mode.service";
import { EditorVisibilityService } from "../../../services/editor-visibility.service";
import { MapFeaturesModalPage } from "./map-features-modal.page";

const LANDMARKS = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [7.6, 51.9] } }],
};
const EMPTY = { type: "FeatureCollection", features: [] };

// A virtual environment that has a satellite layer, and one that does not.
const WITH_SATELLITE = Object.keys(virEnvLayers).find((key) => !!(virEnvLayers as any)[key].satellite);
const WITHOUT_SATELLITE = Object.keys(virEnvLayers).find((key) => !(virEnvLayers as any)[key].satellite);

describe("MapFeaturesModalPage — Simple and Advanced views", () => {
  let modes: EditorModeService;
  let ev: EditorVisibilityService;
  let dismiss: jasmine.Spy;

  beforeEach(() => {
    Object.keys(localStorage)
      .filter((key) => key.indexOf("geogami.editor") === 0)
      .forEach((key) => localStorage.removeItem(key));
    const auth: any = { getUser: () => new BehaviorSubject<any>(null).asObservable() };
    modes = new EditorModeService(auth);
    ev = new EditorVisibilityService({} as any, auth, modes);
    dismiss = jasmine.createSpy("dismiss");
  });

  function modal(options: { features?: any; env?: string; ready?: boolean; drawing?: any } = {}): any {
    const page: any = Object.create(MapFeaturesModalPage.prototype);
    page.features = options.features || cloneDeep(standardMapFeatures);
    page.isVirtualWorld = !!options.env;
    page.virEnvType = options.env;
    page.virEnvLayers_data = virEnvLayers;
    page.ev = ev;
    page.lastAdvancedInUse = []; // a field initialiser, which Object.create skips
    page.landmarksReady = !!options.ready;
    page.draw = { getAll: () => options.drawing || EMPTY };
    page.modalController = { dismiss };
    return page;
  }

  const saved = () => dismiss.calls.mostRecent().args[0].data;

  describe("headings", () => {
    it("leaves out 'Map settings' in Simple when every control under it is Advanced only", () => {
      const page = modal();
      expect(page.showMapSettingsHeading).toBe(false);
      expect(page.showMarkerSettingsHeading).toBe(true); // the location marker stays
      modes.setMode("advanced");
      expect(page.showMapSettingsHeading).toBe(true);
    });

    it("keeps 'Map settings' where the satellite switch is offered", () => {
      expect(WITH_SATELLITE).toBeDefined();
      const page = modal({ env: WITH_SATELLITE });
      expect(page.showSwitchLayer).toBe(true);
      expect(page.showMapSettingsHeading).toBe(true);
    });

    it("offers the satellite switch only in virtual worlds that have a satellite layer", () => {
      expect(WITHOUT_SATELLITE).toBeDefined();
      expect(modal({ env: WITHOUT_SATELLITE }).showSwitchLayer).toBe(false);
      expect(modal().showSwitchLayer).toBe(false); // real world
    });
  });

  describe("saving", () => {
    it("keeps the stored landmarks when the landmark map has not loaded — for example because Simple hid it", () => {
      const features = { ...cloneDeep(standardMapFeatures), landmarks: true, landmarkFeatures: cloneDeep(LANDMARKS) };
      const page = modal({ features, ready: false, drawing: EMPTY });
      page.dismissModal(null);
      expect(saved().landmarkFeatures).toEqual(LANDMARKS as any);
      expect(saved().landmarks).toBe(true);
    });

    it("takes the landmarks from the drawing once the map has loaded them", () => {
      const edited = { type: "FeatureCollection", features: [...LANDMARKS.features, ...LANDMARKS.features] };
      const features = { ...cloneDeep(standardMapFeatures), landmarkFeatures: cloneDeep(LANDMARKS) };
      modal({ features, ready: true, drawing: edited }).dismissModal(null);
      expect(saved().landmarkFeatures).toEqual(edited as any);
    });

    it("saves an empty drawing as an empty collection, as before", () => {
      modal({ ready: true }).dismissModal(null);
      expect(saved().landmarkFeatures).toEqual(EMPTY as any);
      dismiss.calls.reset();
      modal({ ready: false }).dismissModal(null);
      expect(saved().landmarkFeatures).toEqual(EMPTY as any);
    });

    it("keeps every other map setting exactly as it was", () => {
      const features = {
        ...cloneDeep(standardMapFeatures), zoombar: "task", pan: "static", rotation: "auto", material: "sat",
        direction: "true", track: true, keepTrack: "all", streetSection: true, reducedInformation: true,
        reducedMapSectionDiameter: 60, switchLayer: "true", position: "true",
      };
      modal({ features: cloneDeep(features) }).dismissModal(null);
      expect(saved()).toEqual({ ...features, landmarkFeatures: EMPTY } as any);
    });

    it("closing without saving hands back nothing", () => {
      modal().dismissModal("close");
      expect(dismiss).toHaveBeenCalledWith();
    });
  });

  describe("notice about advanced settings", () => {
    it("names the changed controls Simple hides", () => {
      const features = { ...cloneDeep(standardMapFeatures), zoombar: "task", track: true, position: "true" };
      expect(modal({ features }).advancedInUse.sort()).toEqual(["map.track", "map.zoom"]);
    });

    it("is empty for the standard map and in Advanced", () => {
      expect(modal().advancedInUse).toEqual([]);
      modes.setMode("advanced");
      expect(modal({ features: { ...cloneDeep(standardMapFeatures), zoombar: "task" } }).advancedInUse).toEqual([]);
    });
  });
});
