import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environments/environment";
import { compiledDefaultFeatures } from "../../helpers/editor-visibility";
import { AuthService } from "../../services/auth-service.service";
import { EditorModeService } from "../../services/editor-mode.service";
import { EditorVisibilityService } from "../../services/editor-visibility.service";
import { EditorVisibilityModule } from "./editor-visibility.module";
import { EditorModeSwitchComponent } from "./editor-mode-switch.component";

@Component({
  template: `
    <ng-container *editorFeature="'map.zoom'"><span id="zoom">zoom</span></ng-container>
    <ng-container *editorFeature="'task.feedback'"><span id="feedback">feedback</span></ng-container>
    <ng-container *editorFeature="'task.instruction'"><span id="instruction">instruction</span></ng-container>
    <ng-container *editorFeature="'map.type'; keep: keepType"><span id="type">type</span></ng-container>
  `,
})
class HostComponent {
  keepType = false;
}

function configure(declarations: any[] = [], imports: any[] = []) {
  const user$ = new BehaviorSubject<any>({ _id: "u1" });
  TestBed.configureTestingModule({
    declarations,
    imports: [
      IonicModule.forRoot(),
      TranslateModule.forRoot(),
      HttpClientTestingModule,
      EditorVisibilityModule,
      ...imports,
    ],
    providers: [
      {
        provide: AuthService,
        useValue: { getUser: () => user$.asObservable(), createHeaders: () => ({}) },
      },
    ],
  });
}

const clearStored = () =>
  Object.keys(localStorage)
    .filter((k) => k.indexOf("geogami.editor") === 0)
    .forEach((k) => localStorage.removeItem(k));

describe("*editorFeature", () => {
  let fixture: ComponentFixture<HostComponent>;
  let modes: EditorModeService;
  let visibility: EditorVisibilityService;
  const present = (id: string) => !!fixture.nativeElement.querySelector(`#${id}`);

  beforeEach(() => {
    clearStored();
    configure([HostComponent]);
    modes = TestBed.inject(EditorModeService);
    visibility = TestBed.inject(EditorVisibilityService);
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    clearStored();
  });

  it("shows only the controls Simple offers, and always the essential ones", () => {
    expect(present("zoom")).toBe(false);
    expect(present("feedback")).toBe(true);
    expect(present("instruction")).toBe(true);
  });

  it("shows everything in Advanced and hides it again when going back to Simple", () => {
    modes.setMode("advanced");
    fixture.detectChanges();
    expect(present("zoom")).toBe(true);
    expect(present("type")).toBe(true);
    modes.setMode("simple");
    fixture.detectChanges();
    expect(present("zoom")).toBe(false);
    expect(present("type")).toBe(false);
  });

  it("keeps a control when the current selection needs it", () => {
    expect(present("type")).toBe(false);
    fixture.componentInstance.keepType = true;
    fixture.detectChanges();
    expect(present("type")).toBe(true);
  });

  it("follows a policy that becomes known", async () => {
    const loaded = visibility.fetchPolicy();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiURL}/editor-visibility`)
      .flush({
        revision: 1,
        features: { ...compiledDefaultFeatures(), "map.zoom": "both", "task.feedback": "advanced" },
      });
    await loaded;
    fixture.detectChanges();
    expect(present("zoom")).toBe(true);
    expect(present("feedback")).toBe(false);
  });

  it("stops listening when it is destroyed", () => {
    fixture.destroy();
    expect(() => modes.setMode("advanced")).not.toThrow();
  });
});

describe("EditorModeSwitchComponent", () => {
  let fixture: ComponentFixture<EditorModeSwitchComponent>;
  let modes: EditorModeService;
  const el = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const text = () => fixture.nativeElement.textContent as string;

  beforeEach(() => {
    clearStored();
    configure();
    modes = TestBed.inject(EditorModeService);
    fixture = TestBed.createComponent(EditorModeSwitchComponent);
    fixture.detectChanges();
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    clearStored();
  });

  it("offers Simple and Advanced as a labelled segmented control", () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll("ion-segment-button")) as HTMLElement[];
    expect(buttons.map((b) => b.getAttribute("value"))).toEqual(["simple", "advanced"]);
    expect(text()).toContain("EditorMode.simple");
    expect(text()).toContain("EditorMode.advanced");
    expect(el("ion-segment").getAttribute("aria-label")).toBe("EditorMode.switchLabel");
  });

  it("starts in Simple and shows the current mode as selected", () => {
    expect(fixture.componentInstance.mode).toBe("simple");
    expect((el("ion-segment") as any).value).toBe("simple");
  });

  it("changes the shared mode when the author picks a view", () => {
    el("ion-segment").dispatchEvent(new CustomEvent("ionChange", { detail: { value: "advanced" } }));
    fixture.detectChanges();
    expect(modes.mode).toBe("advanced");
    expect((el("ion-segment") as any).value).toBe("advanced");
  });

  it("follows a change made elsewhere, such as in a dialog", () => {
    modes.setMode("advanced");
    fixture.detectChanges();
    expect((el("ion-segment") as any).value).toBe("advanced");
  });

  it("ignores values that are not a view", () => {
    el("ion-segment").dispatchEvent(new CustomEvent("ionChange", { detail: { value: "expert" } }));
    el("ion-segment").dispatchEvent(new CustomEvent("ionChange", { detail: {} }));
    expect(modes.mode).toBe("simple");
  });

  it("explains the two views behind an information button", () => {
    const button = el(".editor-mode-info");
    expect(button.getAttribute("aria-label")).toBe("EditorMode.infoButton");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(text()).not.toContain("EditorMode.explanation");

    button.click();
    fixture.detectChanges();
    expect(text()).toContain("EditorMode.explanation");
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const explanation = el(".editor-mode-explanation");
    expect(button.getAttribute("aria-controls")).toBe(explanation.id);

    button.click();
    fixture.detectChanges();
    expect(text()).not.toContain("EditorMode.explanation");
  });

  describe("staying on screen in dialogs", () => {
    const isSticky = () => (fixture.nativeElement as HTMLElement).classList.contains("sticky");

    it("scrolls with the page unless asked to stay", () => {
      expect(isSticky()).toBe(false);
    });

    it("stays at the top of the dialog when `sticky` is set, as a property or a bare attribute", () => {
      fixture.componentInstance.sticky = true;
      fixture.detectChanges();
      expect(isSticky()).toBe(true);

      fixture.componentInstance.sticky = "";
      fixture.detectChanges();
      expect(isSticky()).toBe(true);

      fixture.componentInstance.sticky = false;
      fixture.detectChanges();
      expect(isSticky()).toBe(false);
    });

    it("keeps the switch and its explanation in the bar, and the notice outside it", () => {
      fixture.componentInstance.advancedInUse = ["navigation.accuracy"];
      el(".editor-mode-info").click();
      fixture.detectChanges();
      const bar = el(".editor-mode-bar");
      expect(bar.contains(el("ion-segment"))).toBe(true);
      expect(bar.contains(el(".editor-mode-info"))).toBe(true);
      expect(bar.contains(el(".editor-mode-explanation"))).toBe(true);
      expect(bar.contains(el(".editor-mode-notice"))).toBe(false);
    });
  });

  describe("notice about settings only Advanced shows", () => {
    it("stays away unless the task uses such settings", () => {
      expect(el(".editor-mode-notice")).toBeNull();
      fixture.componentInstance.advancedInUse = [];
      fixture.detectChanges();
      expect(el(".editor-mode-notice")).toBeNull();
    });

    it("appears in Simple, says what it is about, and offers to review", () => {
      fixture.componentInstance.advancedInUse = ["navigation.accuracy"];
      fixture.detectChanges();
      expect(el(".editor-mode-notice")).not.toBeNull();
      expect(text()).toContain("EditorMode.noticeTask");
      expect(text()).toContain("EditorMode.reviewSettings");

      fixture.componentInstance.subject = "game";
      fixture.detectChanges();
      expect(text()).toContain("EditorMode.noticeGame");
    });

    it("is not shown in Advanced, where nothing is hidden", () => {
      fixture.componentInstance.advancedInUse = ["navigation.accuracy"];
      modes.setMode("advanced");
      fixture.detectChanges();
      expect(el(".editor-mode-notice")).toBeNull();
    });

    it("switches to Advanced without leaving the page when the author wants to review", () => {
      fixture.componentInstance.advancedInUse = ["navigation.accuracy"];
      fixture.detectChanges();
      (el(".editor-mode-notice ion-button") as HTMLElement).click();
      fixture.detectChanges();
      expect(modes.mode).toBe("advanced");
      expect(el(".editor-mode-notice")).toBeNull();
    });
  });
});
