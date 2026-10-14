import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { BehaviorSubject } from "rxjs";
import { EditorVisibilityModule } from "../../../../components/editor-visibility/editor-visibility.module";
import { VirEnvHeaders } from "../../../../models/virEnvsHeader";
import { AuthService } from "../../../../services/auth-service.service";
import { EditorModeService } from "../../../../services/editor-mode.service";
import { QuestionTypeComponent } from "./question-type.component";

const POSE = { position: { type: "Feature", geometry: { type: "Point", coordinates: [7.6, 51.9] } }, bearing: 135 };
const POSE_TEXT = "Set avatar initial position and direction";

describe("QuestionTypeComponent — avatar start pose in Simple and Advanced", () => {
  let fixture: ComponentFixture<QuestionTypeComponent>;
  let component: QuestionTypeComponent;
  let modes: EditorModeService;

  const clearStored = () =>
    Object.keys(localStorage)
      .filter((k) => k.indexOf("geogami.editor") === 0)
      .forEach((k) => localStorage.removeItem(k));
  const page = () => (fixture.nativeElement.textContent || "").replace(/\s+/g, " ");

  beforeEach(() => {
    clearStored();
    const user$ = new BehaviorSubject<any>({ _id: "u1" });
    TestBed.configureTestingModule({
      declarations: [QuestionTypeComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        EditorVisibilityModule,
      ],
      providers: [
        { provide: AuthService, useValue: { getUser: () => user$.asObservable(), createHeaders: () => ({}) } },
      ],
      schemas: [NO_ERRORS_SCHEMA], // maps, photo upload and audio recorder have their own specs
    });
    modes = TestBed.inject(EditorModeService);
  });
  afterEach(clearStored);

  function open(question: any, options: { single?: boolean; players?: number } = {}) {
    fixture = TestBed.createComponent(QuestionTypeComponent);
    component = fixture.componentInstance;
    component.question = question;
    component.taskType = "nav";
    component.isVirtualWorld = true;
    component.virEnvType = VirEnvHeaders[0].layerName;
    component.isVEBuilding = false;
    component.initialFloor = "Select floor";
    component.isSingleMode = (options.single !== false) as any;
    component.numPlayers = options.players || 1;
    component.collaborationType = options.single === false ? "1-1" : undefined;
    fixture.detectChanges();
  }

  async function show(mode: "simple" | "advanced") {
    modes.setMode(mode);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  describe("single player", () => {
    const question = () => ({ type: "TEXT", text: "Walk to the flag.", initialAvatarPosition: cloneDeep(POSE) });

    it("hides the start pose controls in Simple and shows them in Advanced", async () => {
      open(question());
      expect(page()).not.toContain(POSE_TEXT);
      await show("advanced");
      expect(page()).toContain(POSE_TEXT);
      await show("simple");
      expect(page()).not.toContain(POSE_TEXT);
    });

    it("leaves the stored pose, the toggle state and the handlers alone", async () => {
      open(question());
      const toggle = spyOn(component, "initialAvatarPosToggleChange").and.callThrough();
      const text = spyOn(component, "checkAndUpdateQuestionText").and.callThrough();
      const status = component.initialAvatarPositionStatus;
      const before = JSON.stringify(component.question);
      expect(status).toBe(true);

      for (const mode of ["advanced", "simple", "advanced", "simple"] as const) {
        await show(mode);
      }

      expect(toggle).not.toHaveBeenCalled();
      expect(text).not.toHaveBeenCalled();
      expect(component.initialAvatarPositionStatus).toBe(status);
      expect(JSON.stringify(component.question)).toBe(before);
      expect(component.question.initialAvatarPosition).toEqual(POSE as any);
    });

    it("does not switch the toggle on for a task that never had a pose", async () => {
      open({ type: "TEXT", text: "Walk to the flag." });
      await show("advanced");
      await show("simple");
      expect(component.question.initialAvatarPosition).toBeUndefined();
    });

    it("keeps the author's unsaved choice to place a pose while switching views", async () => {
      open({ type: "TEXT", text: "Walk to the flag." });
      await show("advanced");
      component.initialAvatarPositionStatus = true; // the author switched the pose on, but has not placed it yet
      await show("simple");
      await show("advanced");
      expect(component.initialAvatarPositionStatus).toBe(true);
    });
  });

  describe("multiplayer", () => {
    it("hides the start pose card in Simple, and the stored pose and players' content survive", async () => {
      const questions: any = [
        { type: "TEXT", text: "Player one." },
        { type: "TEXT", text: "Player two." },
      ];
      questions.initialAvatarPosition = cloneDeep(POSE);
      open(questions, { single: false, players: 2 });
      expect(page()).not.toContain(POSE_TEXT);
      await show("advanced");
      expect(page()).toContain(POSE_TEXT);
      await show("simple");
      expect(page()).not.toContain(POSE_TEXT);
      expect(component.question.length).toBe(2);
      expect(component.question[0].text).toBe("Player one.");
      expect(component.question[1].text).toBe("Player two.");
      expect(component.question.initialAvatarPosition).toEqual(POSE as any);
    });
  });
});
