import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { IonicModule, ModalController } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../../environments/environment";
import { EditorVisibilityModule } from "../../../components/editor-visibility/editor-visibility.module";
import { compiledDefaultFeatures } from "../../../helpers/editor-visibility";
import { navtasks } from "../../../models/navigation-tasks";
import { navtasksMultiplayers2 } from "../../../models/navigation-tasks-multi_2_players";
import { standardMapFeatures } from "../../../models/standardMapFeatures";
import { themetasks } from "../../../models/theme-tasks";
import { AnswerType, QuestionType } from "../../../models/types";
import { VirEnvHeaders } from "../../../models/virEnvsHeader";
import { TypeToTextPipe } from "../../../pipes/typeToText.pipe";
import { AuthService } from "../../../services/auth-service.service";
import { EditorModeService } from "../../../services/editor-mode.service";
import { EditorVisibilityService } from "../../../services/editor-visibility.service";
import { UtilService } from "../../../services/util.service";
import { CreateTaskModalPage } from "./create-task-modal.page";

const POINT = { type: "Feature", geometry: { type: "Point", coordinates: [7.6, 51.9] } };

describe("CreateTaskModalPage — Simple and Advanced views", () => {
  let fixture: ComponentFixture<CreateTaskModalPage>;
  let component: CreateTaskModalPage;
  let modes: EditorModeService;
  let visibility: EditorVisibilityService;
  let http: HttpTestingController;
  let utilService: any;
  let dismiss: jasmine.Spy;

  const clearStored = () =>
    Object.keys(localStorage)
      .filter((k) => k.indexOf("geogami.editor") === 0)
      .forEach((k) => localStorage.removeItem(k));

  beforeEach(() => {
    clearStored();
    const user$ = new BehaviorSubject<any>({ _id: "u1" });
    utilService = { showValidationError: jasmine.createSpy("validation"), showToast: jasmine.createSpy("toast") };
    TestBed.configureTestingModule({
      declarations: [CreateTaskModalPage, TypeToTextPipe],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        EditorVisibilityModule,
      ],
      providers: [
        { provide: AuthService, useValue: { getUser: () => user$.asObservable(), createHeaders: () => ({}) } },
        { provide: UtilService, useValue: utilService },
      ],
      // the question/answer/map widgets are separate components with their own specs
      schemas: [NO_ERRORS_SCHEMA],
    });
    modes = TestBed.inject(EditorModeService);
    visibility = TestBed.inject(EditorVisibilityService);
    http = TestBed.inject(HttpTestingController);
    // The dialog controller is one shared service: watch it once for the whole test.
    dismiss = spyOn(TestBed.inject(ModalController), "dismiss");
  });
  afterEach(() => {
    http.verify();
    clearStored();
  });

  // ── fixtures ─────────────────────────────────────────────────────────────

  /** A saved "navigation via text" task with settings and map features that Simple does not show. */
  function savedNavText(): any {
    const task = cloneDeep(navtasks.find((t) => t.type === "nav-text")) as any;
    task.question.text = "Walk to the fountain.";
    task.answer.position = cloneDeep(POINT);
    task.settings = {
      feedback: true, multipleTries: false, confirmation: true, accuracy: 20, showMarker: true,
      keepMarker: true, keepDrawing: "current", drawPointOnly: false, autoPlayAudio: true,
      someFutureSetting: { nested: [1, 2, 3] },
    };
    task.mapFeatures = {
      ...cloneDeep(standardMapFeatures), zoombar: "task", rotation: "auto", track: true, keepTrack: "all",
      landmarks: true, landmarkFeatures: { type: "FeatureCollection", features: [cloneDeep(POINT)] },
    };
    return task;
  }

  function savedSelfLocation(): any {
    const task = cloneDeep(themetasks.find((t) => t.type === "theme-loc")) as any;
    task.question.text = "Where are you?";
    task.settings = { feedback: true, multipleTries: true, confirmation: true, accuracy: 20 };
    task.mapFeatures = cloneDeep(standardMapFeatures);
    return task;
  }

  function savedFree(question: string, answer: string): any {
    return {
      name: "Tasktypes.freeTask", type: "free", category: "theme",
      question: { type: question, text: "Describe what you see." },
      answer: { type: answer },
      settings: { feedback: false, multipleTries: false, confirmation: true, accuracy: 5 },
      mapFeatures: cloneDeep(standardMapFeatures),
    };
  }

  function open(task: any, options: { type?: string; virtualEnv?: boolean; singleMode?: boolean; players?: number } = {}) {
    fixture = TestBed.createComponent(CreateTaskModalPage);
    component = fixture.componentInstance;
    component.type = options.type || (task.category === "nav" ? "nav" : "theme");
    component.isSingleMode = options.singleMode !== false;
    component.numPlayers = options.players || 1;
    if (options.virtualEnv) {
      component.isVirtualWorld = true;
      component.virEnvType = VirEnvHeaders[0].layerName;
    }
    component.task = cloneDeep(task);
    fixture.detectChanges();
  }

  function selects(): HTMLSelectElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll("select"));
  }
  const optionTexts = (select: HTMLSelectElement) =>
    Array.from(select.options).map((o) => (o.textContent || "").replace(/\s+/g, " ").trim());
  const page = () => (fixture.nativeElement.textContent || "").replace(/\s+/g, " ");
  const accuracySlider = () => fixture.nativeElement.querySelector("ion-item.item-range");

  async function show(mode: "simple" | "advanced") {
    modes.setMode(mode);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const HANDLERS = [
    "onTaskSelected", "onThemeTaskTypeChange", "onObjectQuestionSelectChange", "onObjectAnswerSelectChange",
    "settingsChange", "feedbackChange", "checkAndUpdateQuestionText", "updatePlayersAnswers",
  ];
  function watchHandlers(): { [name: string]: jasmine.Spy } {
    const spies: { [name: string]: jasmine.Spy } = {};
    for (const name of HANDLERS) spies[name] = spyOn(component as any, name).and.callThrough();
    return spies;
  }

  function save(): any {
    dismiss.calls.reset();
    component.dismissModal(null);
    expect(utilService.showValidationError).not.toHaveBeenCalled();
    expect(dismiss).toHaveBeenCalledTimes(1);
    return dismiss.calls.mostRecent().args[0];
  }

  // ── what each view shows ─────────────────────────────────────────────────

  describe("navigation tasks", () => {
    it("starts in Simple and offers flag, arrow and photo navigation for a new task", () => {
      component = undefined;
      fixture = TestBed.createComponent(CreateTaskModalPage);
      component = fixture.componentInstance;
      component.type = "nav";
      component.isSingleMode = true;
      component.task = null; // a new task
      fixture.detectChanges();
      expect(modes.mode).toBe("simple");
      const texts = optionTexts(selects()[0]);
      expect(texts.length).toBe(3);
      expect(texts.join("|")).not.toContain("EditorMode.advancedOption");
      expect(texts.join("|")).not.toContain("navigationViaText");
      expect(texts.join("|")).not.toContain("explorationTask");
      expect(component.task.type).toBe("nav-flag");
    });

    it("keeps an existing Advanced-only type in the selector, marked, instead of replacing it", () => {
      open(savedNavText());
      const texts = optionTexts(selects()[0]);
      expect(texts.length).toBe(4);
      expect(texts.filter((t) => t.indexOf("EditorMode.advancedOption") !== -1)).toEqual([
        "Tasktypes.navigationViaText (EditorMode.advancedOption)",
      ]);
      expect(texts.join("|")).not.toContain("explorationTask");
      expect(component.task.type).toBe("nav-text");
    });

    it("offers every navigation type in Advanced", async () => {
      open(savedNavText());
      await show("advanced");
      const texts = optionTexts(selects()[0]);
      expect(texts.length).toBe(5);
      expect(texts.join("|")).not.toContain("EditorMode.advancedOption");
    });

    it("keeps an existing exploration task and its inputs in Simple", () => {
      open(cloneDeep(navtasks.find((t) => t.type === "nav-exploration")) as any);
      expect(optionTexts(selects()[0]).join("|")).toContain("Tasktypes.explorationTask (EditorMode.advancedOption)");
      expect(page()).toContain("CreateGame.explorationSettings");
      expect(component.task.type).toBe("nav-exploration");
    });

    it("hides arrival accuracy and keep-the-flag in Simple, shows them in Advanced", async () => {
      open(savedNavText());
      expect(accuracySlider()).toBeNull();
      expect(page()).not.toContain("CreateGame.keepFlag");
      // unmarked settings stay: confirmation, show flag, feedback, audio autoplay
      expect(page()).toContain("CreateGame.confirmation");
      expect(page()).toContain("CreateGame.showFlag");
      expect(page()).toContain("CreateGame.feedback");
      expect(page()).toContain("CreateGame.autoPlayAudio");

      await show("advanced");
      expect(accuracySlider()).not.toBeNull();
      expect(page()).toContain("CreateGame.keepFlag");
    });

    it("keeps the Map features entry for navigation tasks in Simple", () => {
      open(savedNavText());
      expect(page()).toContain("General.mapfeatures");
    });

    it("says the task uses advanced settings, and not when it only has defaults", () => {
      open(savedNavText());
      expect(component.advancedInUse.sort()).toEqual([
        "map.landmarks", "map.rotation", "map.track", "map.zoom",
        "navigation.accuracy", "navigation.keepFlag", "navigation.type.text",
      ]);
      const plain = cloneDeep(navtasks.find((t) => t.type === "nav-flag")) as any;
      plain.settings = { feedback: true, multipleTries: false, confirmation: false, accuracy: 5, showMarker: true, keepMarker: false };
      open(plain);
      expect(component.advancedInUse).toEqual([]);
    });
  });

  describe("thematic tasks", () => {
    it("keeps the self-location accuracy slider in Simple but hides multiple attempts, search area and the Map features entry", async () => {
      open(savedSelfLocation());
      expect(accuracySlider()).not.toBeNull();
      expect(page()).not.toContain("CreateGame.severalTrials");
      expect(page()).not.toContain("CreateGame.searchArea");
      expect(page()).not.toContain("General.mapfeatures");
      expect(page()).toContain("CreateGame.feedback");

      await show("advanced");
      expect(page()).toContain("CreateGame.severalTrials");
      expect(page()).toContain("CreateGame.searchArea");
      expect(page()).toContain("General.mapfeatures");
    });

    it("offers only the text question for a free task, and every answer but drawing", () => {
      open(savedFree(QuestionType.TEXT, AnswerType.TEXT));
      const [typeSelect, questionSelect, answerSelect] = selects();
      expect(optionTexts(typeSelect).length).toBe(4); // all four thematic types stay
      expect(optionTexts(questionSelect)).toEqual(["QuestionType.text"]);
      const answers = optionTexts(answerSelect);
      expect(answers.length).toBe(5);
      expect(answers.join("|")).not.toContain("QuestionType.byMapping");
      expect(answers.join("|")).toContain("QuestionType.byTakingPhoto"); // photo answers are not affected
    });

    it("keeps the current Advanced-only question and answer of a free task, marked", () => {
      open(savedFree(QuestionType.PHOTO, AnswerType.DRAW));
      const [, questionSelect, answerSelect] = selects();
      expect(optionTexts(questionSelect)).toEqual([
        "QuestionType.text",
        "QuestionType.textPhoto (EditorMode.advancedOption)",
      ]);
      expect(optionTexts(answerSelect).join("|")).toContain("QuestionType.byMapping (EditorMode.advancedOption)");
      expect(component.task.question.type).toBe(QuestionType.PHOTO);
      expect(component.task.answer.type).toBe(AnswerType.DRAW);
      // the settings that belong to the drawing answer stay reachable
      expect(page()).toContain("DrawSetting.drawPointOnly");
    });

    it("keeps the viewing-direction question and its answer in a direction task", () => {
      const task = cloneDeep(
        themetasks.find((t) => t.type === "theme-direction" && t.question.type === QuestionType.TEXT)
      ) as any;
      task.question.text = "Where are you looking?";
      task.question.direction = {};
      task.settings = { feedback: true, multipleTries: true, confirmation: true, accuracy: 5 };
      task.mapFeatures = cloneDeep(standardMapFeatures);
      open(task);
      const [typeSelect, questionSelect, answerSelect] = selects();
      const questions = optionTexts(questionSelect);
      expect(questions).toContain("QuestionType.isShownOnMap");
      expect(questions).toContain("QuestionType.correspondToDirection");
      expect(questions.join("|")).not.toContain("QuestionType.isIndicatedByArrow");
      expect(questions.join("|")).not.toContain("QuestionType.isDisplayedWithPhoto");
      expect(optionTexts(answerSelect)).toEqual(["QuestionType.byMarkingDirectionOnMap"]);
    });
  });

  describe("virtual worlds", () => {
    const withSettings = () => {
      const task = cloneDeep(navtasks.find((t) => t.type === "nav-flag")) as any;
      task.question.text = "Go to the flag.";
      task.answer.position = cloneDeep(POINT);
      task.settings = {
        feedback: true, multipleTries: false, confirmation: true, accuracy: 5, showMarker: true, keepMarker: false,
        avatarSpeed: 3, mapSize: "5", disableAvatarRotation: true, showEnvSettings: true, cameraFarClipPlane: 400,
      };
      task.question.initialAvatarPosition = { position: cloneDeep(POINT), bearing: 90 };
      task.mapFeatures = cloneDeep(standardMapFeatures);
      return task;
    };

    it("shows only the unmarked virtual settings in Simple, and all of them in Advanced", async () => {
      open(withSettings(), { virtualEnv: true });
      expect(page()).toContain("CreateGame.virEnvSettings");
      expect(page()).toContain("CreateGame.customCameraFarClipPlane");
      expect(page()).not.toContain("CreateGame.avatarSpeed");
      expect(page()).not.toContain("CreateGame.disableAvatarRotation");
      expect(page()).not.toContain("CreateGame.showEnvSettings");
      expect(page()).not.toContain("Choose map size");

      await show("advanced");
      expect(page()).toContain("CreateGame.avatarSpeed");
      expect(page()).toContain("CreateGame.disableAvatarRotation");
      expect(page()).toContain("CreateGame.showEnvSettings");
      expect(page()).toContain("Choose map size");
    });

    it("hides the whole section, heading included, when none of its controls is shown", async () => {
      const everythingAdvanced: any = {};
      Object.keys(compiledDefaultFeatures()).forEach((id) => (everythingAdvanced[id] = "advanced"));
      const loaded = visibility.fetchPolicy();
      http.expectOne(`${environment.apiURL}/editor-visibility`).flush({ revision: 1, features: everythingAdvanced });
      await loaded;
      // no confirmation → a navigation task has no "several trials" switch either
      const quiet = withSettings();
      quiet.settings.confirmation = false;
      open(quiet, { virtualEnv: true });
      expect(page()).not.toContain("CreateGame.virEnvSettings");
      expect(page()).not.toContain("CreateGame.addSettings"); // nothing left under "Additional settings" either
      await show("advanced");
      expect(page()).toContain("CreateGame.virEnvSettings");
      expect(page()).toContain("CreateGame.addSettings");
    });

    it("counts the avatar start pose and the changed avatar settings as advanced settings in use", () => {
      open(withSettings(), { virtualEnv: true });
      expect(component.advancedInUse.sort()).toEqual([
        "virtual.avatarSpeed", "virtual.disableRotation", "virtual.environmentSettings",
        "virtual.initialPose", "virtual.mapSize",
      ]);
    });
  });

  // ── switching the view changes presentation only ─────────────────────────

  describe("switching between the views", () => {
    const scenarios: [string, () => void][] = [
      ["a navigation task", () => open(savedNavText())],
      ["a self-location task", () => open(savedSelfLocation())],
      ["a free task with a drawing answer", () => open(savedFree(QuestionType.PHOTO, AnswerType.DRAW))],
      ["a virtual-world task", () => {
        const task = savedNavText();
        task.question.initialAvatarPosition = { position: cloneDeep(POINT), bearing: 45 };
        task.settings.avatarSpeed = 2;
        task.settings.mapSize = "5";
        open(task, { virtualEnv: true });
      }],
    ];
    for (const [name, create] of scenarios) {
      it(`runs no handler and changes nothing — ${name}`, async () => {
        create();
        await fixture.whenStable();
        fixture.detectChanges();
        const spies = watchHandlers();
        const before = JSON.stringify({ task: component.task, features: component.mapFeatures, floor: component.initialFloor });

        for (const mode of ["advanced", "simple", "advanced", "simple"] as const) {
          await show(mode);
        }

        for (const name of HANDLERS) {
          expect(spies[name]).not.toHaveBeenCalled();
        }
        expect(JSON.stringify({ task: component.task, features: component.mapFeatures, floor: component.initialFloor })).toBe(before);
      });
    }

    it("does not run a handler when a switch that carries one is re-created by the view change", async () => {
      // Make every switch that has a change handler Advanced only, so each one is
      // removed and re-created whenever the view changes.
      const policy: any = { ...compiledDefaultFeatures() };
      ["task.confirmation", "task.feedback", "navigation.showFlag", "task.autoPlayAudio"].forEach(
        (id) => (policy[id] = "advanced")
      );
      const loaded = visibility.fetchPolicy();
      http.expectOne(`${environment.apiURL}/editor-visibility`).flush({ revision: 1, features: policy });
      await loaded;

      open(savedNavText());
      expect(page()).not.toContain("CreateGame.confirmation");
      expect(page()).not.toContain("CreateGame.feedback");
      const spies = watchHandlers();
      const before = JSON.stringify(component.task.settings);

      for (const mode of ["advanced", "simple", "advanced", "simple", "advanced"] as const) {
        await show(mode);
        expect(page().indexOf("CreateGame.confirmation") !== -1).toBe(mode === "advanced");
      }

      for (const name of HANDLERS) {
        expect(spies[name]).not.toHaveBeenCalled();
      }
      expect(JSON.stringify(component.task.settings)).toBe(before);
    });

    it("leaves the source option lists intact while filtering what is offered", async () => {
      open(savedFree(QuestionType.TEXT, AnswerType.TEXT));
      const questions = JSON.stringify(component.objectQuestionSelect);
      const answers = JSON.stringify(component.objectAnswerSelect);
      const types = JSON.stringify(component.taskTypes);
      await show("advanced");
      await show("simple");
      expect(JSON.stringify(component.objectQuestionSelect)).toBe(questions);
      expect(JSON.stringify(component.objectAnswerSelect)).toBe(answers);
      expect(JSON.stringify(component.taskTypes)).toBe(types);
      expect(component.objectQuestionSelect.length).toBe(3);
      expect(component.objectAnswerSelect.length).toBe(6);
      expect(component.visibleQuestionOptions.length).toBe(1);
    });
  });

  // ── saving ───────────────────────────────────────────────────────────────

  describe("saving in Simple", () => {
    it("sends the same task an Advanced save would, with nothing hidden lost", async () => {
      open(savedNavText());
      component.task.question.text = "Walk to the fountain, then stop.";
      const simple = save();

      await show("advanced");
      open(savedNavText());
      component.task.question.text = "Walk to the fountain, then stop.";
      const advanced = save();

      expect(simple).toEqual(advanced);
      const data = simple.data;
      expect(data.type).toBe("nav-text");
      expect(data.question.text).toBe("Walk to the fountain, then stop.");
      expect(data.settings.accuracy).toBe(20);
      expect(data.settings.keepMarker).toBe(true);
      expect(data.settings.autoPlayAudio).toBe(true);
      expect(data.settings.someFutureSetting).toEqual({ nested: [1, 2, 3] });
      expect(data.mapFeatures.zoombar).toBe("task");
      expect(data.mapFeatures.track).toBe(true);
      expect(data.mapFeatures.landmarkFeatures.features.length).toBe(1);
      expect(data.answer.position).toEqual(POINT as any);
    });

    it("keeps the start pose, avatar settings and drawing answer", async () => {
      const task = savedNavText();
      task.question.initialAvatarPosition = { position: cloneDeep(POINT), bearing: 45 };
      task.settings.avatarSpeed = 2;
      task.settings.mapSize = "5";
      task.settings.disableAvatarRotation = true;
      task.settings.cameraFarClipPlane = 400;
      open(task, { virtualEnv: true });
      const simple = save();
      expect(simple.data.question.initialAvatarPosition).toEqual({ position: POINT as any, bearing: 45 });
      expect(simple.data.settings.avatarSpeed).toBe(2);
      expect(simple.data.settings.mapSize).toBe("5");
      expect(simple.data.settings.disableAvatarRotation).toBe(true);
      expect(simple.data.settings.cameraFarClipPlane).toBe(400);

      const free = savedFree(QuestionType.PHOTO, AnswerType.DRAW);
      free.settings.keepDrawing = "all";
      free.settings.drawPointOnly = true;
      open(free);
      const savedFreeTask = save().data;
      expect(savedFreeTask.question.type).toBe(QuestionType.PHOTO);
      expect(savedFreeTask.answer.type).toBe(AnswerType.DRAW);
      expect(savedFreeTask.settings.keepDrawing).toBe("all");
      expect(savedFreeTask.settings.drawPointOnly).toBe(true);
    });

    it("keeps every player's own content in a multiplayer task", async () => {
      const task = cloneDeep(navtasksMultiplayers2.find((t) => t.type === "nav-text")) as any;
      task.collaborationType = "1-1";
      task.question[0].text = "Player one: go left.";
      task.question[1].text = "Player two: go right.";
      task.answer[0].position = cloneDeep(POINT);
      task.answer[1].position = { ...cloneDeep(POINT), geometry: { type: "Point", coordinates: [7.7, 51.8] } };
      task.settings = { feedback: true, multipleTries: false, confirmation: true, accuracy: 20, showMarker: true, keepMarker: true };
      task.mapFeatures = cloneDeep(standardMapFeatures);

      open(task, { singleMode: false, players: 2 });
      const simple = save();
      await show("advanced");
      open(task, { singleMode: false, players: 2 });
      const advanced = save();

      expect(simple).toEqual(advanced);
      expect(Array.isArray(simple.data.question)).toBe(true);
      expect(simple.data.question.map((q: any) => q.text)).toEqual(["Player one: go left.", "Player two: go right."]);
      expect(simple.data.answer[1].position.geometry.coordinates).toEqual([7.7, 51.8]);
      expect(simple.data.collaborationType).toBe("1-1");
      expect(simple.data.settings.accuracy).toBe(20);
    });

    it("still stops a save that is missing its destination, and says why", async () => {
      const task = savedNavText();
      task.answer.position = undefined;
      open(task);
      component.dismissModal(null);
      expect(dismiss).not.toHaveBeenCalled();
      expect(utilService.showValidationError).toHaveBeenCalledTimes(1);
    });

    it("still stops a save without an instruction and an exploration without a duration", () => {
      const noText = savedNavText();
      noText.question.text = "";
      open(noText);
      component.dismissModal(null);
      expect(dismiss).not.toHaveBeenCalled();
      expect(utilService.showValidationError).toHaveBeenCalledTimes(1);

      const exploration = cloneDeep(navtasks.find((t) => t.type === "nav-exploration")) as any;
      exploration.question.text = "Explore.";
      exploration.settings.durationSeconds = 0;
      open(exploration);
      component.dismissModal(null);
      expect(dismiss).not.toHaveBeenCalled();
      expect(utilService.showValidationError).toHaveBeenCalledTimes(2);
    });
  });

  describe("choosing a task type that has no default question text", () => {
    const template = (list: ReadonlyArray<any>, type: string) => cloneDeep(list.find((t) => t.type === type)) as any;

    it("navigation via text can be chosen: no error, an empty instruction for the author to write, and the usual default settings", () => {
      open(template(navtasks, "nav-flag"));
      const viaText = template(navtasks, "nav-text");
      expect(viaText.question.key).toBeUndefined(); // that is why there is nothing to translate
      expect(() => component.onTaskSelected(viaText)).not.toThrow();
      expect(component.task.question.text).toBe("");
      expect(component.task.settings.feedback).toBe(true);
      expect(component.task.settings.accuracy).toBe(component.defaultTaskAccuracy);
    });

    it("types that have a default text still get it", () => {
      open(template(navtasks, "nav-text"));
      component.onTaskSelected(template(navtasks, "nav-flag"));
      expect(component.task.question.text).toBe("QuestionText.goToFlag");
      component.onTaskSelected(template(navtasks, "nav-arrow"));
      expect(component.task.question.text).toBe("QuestionText.followTheArrow");
    });

    it("keeps a text the author has already written", () => {
      open(template(navtasks, "nav-flag"));
      const written = template(navtasks, "nav-flag");
      written.question.text = "Go to the old oak.";
      component.onTaskSelected(written);
      expect(component.task.question.text).toBe("Go to the old oak.");
    });

    it("works the same in multiplayer: nothing to translate for navigation via text, defaults for the others", () => {
      // Only the choice itself is under test, so the dialog is not rendered.
      component = TestBed.createComponent(CreateTaskModalPage).componentInstance;
      component.type = "nav";
      component.isSingleMode = false;
      component.numPlayers = 2;
      component.task = template(navtasksMultiplayers2, "nav-flag");
      const viaText = template(navtasksMultiplayers2, "nav-text");
      expect(() => component.onTaskSelected(viaText)).not.toThrow();
      expect((component.task.question as any[]).every((q) => q.text === "")).toBe(true);

      const flag = template(navtasksMultiplayers2, "nav-flag");
      component.onTaskSelected(flag);
      expect((component.task.question as any[]).every((q) => typeof q.text === "string" && q.text.length > 0)).toBe(true);
    });
  });
});
