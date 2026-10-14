import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { EditorPolicy, compiledDefaultFeatures } from "../../../helpers/editor-visibility";
import { EDITOR_CATALOGUE_DIGEST, EDITOR_FEATURES } from "../../../models/editor-features";
import { EditorVisibilityService } from "../../../services/editor-visibility.service";
import { UtilService } from "../../../services/util.service";
import { EditorVisibilityPage } from "./editor-visibility.page";

describe("EditorVisibilityPage", () => {
  let fixture: ComponentFixture<EditorVisibilityPage>;
  let page: EditorVisibilityPage;
  let service: { fetchPolicy: jasmine.Spy; savePolicy: jasmine.Spy };
  let util: { showToast: jasmine.Spy; showValidationError: jasmine.Spy };

  const policy = (revision: number, overrides: { [id: string]: string } = {}, extra: Partial<EditorPolicy> = {}): EditorPolicy => ({
    revision,
    features: { ...compiledDefaultFeatures(), ...overrides } as any,
    updatedAt: revision ? "2026-10-13T10:00:00.000Z" : null,
    updatedBy: revision ? "an-admin" : null,
    catalogue: EDITOR_CATALOGUE_DIGEST,
    source: "server",
    ...extra,
  });
  const text = () => (fixture.nativeElement.textContent || "").replace(/\s+/g, " ");
  const rows = () => Array.from(fixture.nativeElement.querySelectorAll("ion-item")) as HTMLElement[];
  const selects = () => Array.from(fixture.nativeElement.querySelectorAll("select.classification")) as HTMLSelectElement[];
  const button = (label: string): any =>
    (Array.from(fixture.nativeElement.querySelectorAll("ion-footer ion-button")) as HTMLElement[]).find(
      (b) => (b.textContent || "").indexOf(label) !== -1
    );
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  async function open(first: Promise<EditorPolicy> | EditorPolicy) {
    service.fetchPolicy.and.returnValue(Promise.resolve(first));
    fixture = TestBed.createComponent(EditorVisibilityPage);
    page = fixture.componentInstance;
    await settle();
  }

  beforeEach(() => {
    service = { fetchPolicy: jasmine.createSpy("fetchPolicy"), savePolicy: jasmine.createSpy("savePolicy") };
    util = { showToast: jasmine.createSpy("toast"), showValidationError: jasmine.createSpy("validation") };
    TestBed.configureTestingModule({
      declarations: [EditorVisibilityPage],
      imports: [IonicModule.forRoot(), FormsModule, TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: EditorVisibilityService, useValue: service },
        { provide: UtilService, useValue: util },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  describe("loading", () => {
    it("lists every control, grouped, with locked ones marked 'always shown'", async () => {
      await open(policy(0));
      expect(selects().length).toBe(EDITOR_FEATURES.filter((f) => f.configurable).length);
      expect(text()).toContain("EditorVisibility.alwaysShown");
      expect(text()).toContain("EditorFeatures.groups.navigation");
      expect(text()).toContain("EditorFeatures.items.mapZoom.label");
      expect(text()).toContain("EditorVisibility.notSavedYet");
    });

    it("shows what each control is for, and where authors meet it", async () => {
      await open(policy(0));
      expect(text()).toContain("EditorFeatures.items.mapZoom.description");
      expect(text()).toContain("EditorVisibility.screens.mapFeaturesDialog");
    });

    it("keeps everything in one centred column, groups as cards, and the buttons in the same column", async () => {
      await open(policy(0));
      const column = fixture.nativeElement.querySelector("ion-content > .page-column") as HTMLElement;
      expect(column).not.toBeNull();
      expect(column.querySelector("ion-searchbar")).not.toBeNull();
      expect(column.querySelectorAll("ion-card.group").length).toBe(page.groups.length);
      expect(column.querySelectorAll("li.feature").length).toBe(EDITOR_FEATURES.length);
      expect(fixture.nativeElement.querySelector("ion-footer .page-column")).not.toBeNull();
    });

    it("gives each setting an accessible name", async () => {
      await open(policy(0));
      for (const select of selects()) {
        expect(select.getAttribute("aria-label")).toMatch(/^EditorFeatures\.items\./);
      }
    });

    it("says the saved configuration could not be loaded instead of showing a fallback as if it were saved", async () => {
      service.fetchPolicy.and.returnValue(Promise.reject(new Error("offline")));
      fixture = TestBed.createComponent(EditorVisibilityPage);
      page = fixture.componentInstance;
      await settle();
      expect(text()).toContain("EditorVisibility.loadFailed");
      expect(text()).toContain("EditorVisibility.retry");
      expect(selects().length).toBe(0);
      expect(page.saved).toBeNull();
      expect(page.canSave).toBe(false);
      expect(fixture.nativeElement.querySelector("ion-footer")).toBeNull();
    });

    it("can try again", async () => {
      service.fetchPolicy.and.returnValue(Promise.reject(new Error("offline")));
      fixture = TestBed.createComponent(EditorVisibilityPage);
      page = fixture.componentInstance;
      await settle();
      service.fetchPolicy.and.returnValue(Promise.resolve(policy(2)));
      await page.load();
      await settle();
      expect(page.loadError).toBe(false);
      expect(selects().length).toBeGreaterThan(0);
      expect(text()).toContain("EditorVisibility.lastSaved");
    });

    it("keeps saving off while the app and the server list different controls", async () => {
      await open(policy(1, {}, { catalogue: "deadbeef" }));
      page.setClassification("map.zoom", "both");
      expect(page.dirty).toBe(true);
      expect(page.catalogueMismatch).toBe(true);
      expect(page.canSave).toBe(false);
      expect(text()).toContain("EditorVisibility.catalogueMismatch");
    });
  });

  describe("editing a draft", () => {
    it("starts clean, and marks what was changed", async () => {
      await open(policy(1));
      expect(page.dirty).toBe(false);
      expect(page.canSave).toBe(false);
      page.setClassification("map.zoom", "both");
      await settle();
      expect(page.dirty).toBe(true);
      expect(page.changedCount).toBe(1);
      expect(text()).toContain("EditorVisibility.changed");
    });

    it("never touches the server until Save", async () => {
      await open(policy(1));
      page.setClassification("map.zoom", "both");
      page.restoreDefaults();
      page.discard();
      expect(service.savePolicy).not.toHaveBeenCalled();
    });

    it("discards the draft back to the saved policy", async () => {
      await open(policy(1, { "map.pan": "both" }));
      page.setClassification("map.zoom", "both");
      page.setClassification("map.pan", "advanced");
      page.discard();
      expect(page.dirty).toBe(false);
      expect(page.draft["map.pan"]).toBe("both");
      expect(page.draft["map.zoom"]).toBe("advanced");
    });

    it("restores the defaults into the draft only, and they take effect after Save", async () => {
      await open(policy(3, { "map.pan": "both", "task.feedback": "advanced" }));
      page.restoreDefaults();
      expect(page.draft).toEqual(compiledDefaultFeatures() as any);
      expect(page.isAtDefaults).toBe(true);
      expect(page.dirty).toBe(true); // differs from what is saved
      expect(page.saved.features["map.pan"]).toBe("both"); // the saved policy is untouched
      expect(service.savePolicy).not.toHaveBeenCalled();
    });

    it("filters the list by what the author searches for", async () => {
      await open(policy(1));
      const all = page.groups.reduce((n, g) => n + g.rows.length, 0);
      expect(all).toBe(EDITOR_FEATURES.length);
      page.query = "map.zoom";
      const filtered = page.groups.reduce((n, g) => n + g.rows.length, 0);
      expect(filtered).toBe(1);
      page.query = "no such setting anywhere";
      expect(page.groups.length).toBe(0);
      await settle();
      expect(text()).toContain("EditorVisibility.noResults");
    });

    it("previews what Simple will show under the draft", async () => {
      await open(policy(1));
      const before = page.previewCount;
      expect(before).toBe(EDITOR_FEATURES.filter((f) => !f.configurable || f.default === "both").length);
      page.setClassification("map.zoom", "both");
      expect(page.previewCount).toBe(before + 1);
      page.setClassification("task.feedback", "advanced");
      expect(page.previewCount).toBe(before);
      expect(page.preview.some((g) => g.rows.some((f) => f.id === "task.instruction"))).toBe(true);
    });
  });

  describe("saving", () => {
    it("sends the revision it loaded with the whole draft, then adopts the result", async () => {
      await open(policy(4));
      page.setClassification("map.zoom", "both");
      service.savePolicy.and.returnValue(Promise.resolve(policy(5, { "map.zoom": "both" })));
      await page.save();
      expect(service.savePolicy).toHaveBeenCalledTimes(1);
      const [revision, features] = service.savePolicy.calls.mostRecent().args;
      expect(revision).toBe(4);
      expect(features).toEqual({ ...compiledDefaultFeatures(), "map.zoom": "both" } as any);
      expect(page.saved.revision).toBe(5);
      expect(page.dirty).toBe(false);
      expect(util.showToast).toHaveBeenCalledWith("EditorVisibility.saved", "success");
    });

    it("keeps the draft and reports no success when saving fails", async () => {
      await open(policy(4));
      page.setClassification("map.zoom", "both");
      service.savePolicy.and.returnValue(Promise.reject({ status: 500 }));
      await page.save();
      expect(page.dirty).toBe(true);
      expect(page.draft["map.zoom"]).toBe("both");
      expect(page.saved.revision).toBe(4);
      expect(page.conflict).toBe(false);
      expect(util.showValidationError).toHaveBeenCalledWith("EditorVisibility.saveFailed");
      expect(util.showToast).not.toHaveBeenCalled();
      expect(page.saving).toBe(false);
    });

    it("does not save twice at once, or when nothing changed", async () => {
      await open(policy(4));
      await page.save();
      expect(service.savePolicy).not.toHaveBeenCalled();
      page.setClassification("map.zoom", "both");
      let finish: (p: EditorPolicy) => void;
      service.savePolicy.and.returnValue(new Promise((resolve) => (finish = resolve)));
      const first = page.save();
      await page.save();
      expect(service.savePolicy).toHaveBeenCalledTimes(1);
      finish(policy(5, { "map.zoom": "both" }));
      await first;
    });
  });

  describe("when someone else saved first", () => {
    it("keeps the draft, says so, and reloads only when the admin asks — re-applying their changes", async () => {
      await open(policy(4));
      page.setClassification("map.zoom", "both");
      service.savePolicy.and.returnValue(Promise.reject({ status: 409, error: { current: policy(5) } }));
      await page.save();

      expect(page.conflict).toBe(true);
      expect(page.draft["map.zoom"]).toBe("both"); // the draft is retained
      expect(page.saved.revision).toBe(4);
      expect(util.showValidationError).toHaveBeenCalledWith("EditorVisibility.conflictToast");
      expect(util.showToast).not.toHaveBeenCalled();
      await settle();
      expect(text()).toContain("EditorVisibility.reloadLatest");

      // the other admin made a different change; on reload the draft is rebuilt on top of it
      service.fetchPolicy.and.returnValue(Promise.resolve(policy(5, { "task.feedback": "advanced" })));
      await page.reloadAfterConflict();
      expect(page.conflict).toBe(false);
      expect(page.saved.revision).toBe(5);
      expect(page.draft["task.feedback"]).toBe("advanced"); // theirs, now the base
      expect(page.draft["map.zoom"]).toBe("both"); // mine, re-applied
      expect(page.changedCount).toBe(1); // only my change is still unsaved
    });

    it("keeps the draft and the notice if the reload itself fails", async () => {
      await open(policy(4));
      page.setClassification("map.zoom", "both");
      service.savePolicy.and.returnValue(Promise.reject({ status: 409 }));
      await page.save();
      service.fetchPolicy.and.returnValue(Promise.reject(new Error("offline")));
      await page.reloadAfterConflict();
      expect(page.conflict).toBe(true);
      expect(page.draft["map.zoom"]).toBe("both");
      expect(util.showValidationError).toHaveBeenCalledWith("EditorVisibility.loadFailed");
    });
  });
});
