import { cloneDeep } from "lodash";
import { explorationTask, navtasks } from "../models/navigation-tasks";
import { standardMapFeatures } from "../models/standardMapFeatures";
import { themetasks } from "../models/theme-tasks";
import { AnswerType, QuestionType } from "../models/types";
import { VirEnvHeaders } from "../models/virEnvsHeader";
import {
  DEFAULT_TASK_ACCURACY,
  detectGameAdvancedUsage,
  detectMapFeaturesAdvancedUsage,
  detectTaskAdvancedUsage,
} from "./editor-advanced-usage";
import { defaultPolicy, isFeatureVisible } from "./editor-visibility";

describe("advanced settings in use (notice)", () => {
  const policy = defaultPolicy();
  // What Simple hides under the compiled defaults.
  const hidden = (id: string) => !isFeatureVisible(policy, "simple", id);

  const navTask = (type: string, settings: any = {}) => {
    const template = cloneDeep(navtasks.find((t) => t.type === type)) as any;
    template.settings = {
      feedback: true, multipleTries: true, confirmation: false, accuracy: DEFAULT_TASK_ACCURACY,
      showMarker: true, keepMarker: false, keepDrawing: "current", drawPointOnly: false,
      autoPlayAudio: false, ...settings,
    };
    template.mapFeatures = cloneDeep(standardMapFeatures);
    return template;
  };
  const themeTask = (type: string, question: string, answer: string, settings: any = {}) => {
    const template = cloneDeep(themetasks.find((t) => t.type === type && t.question.type === question && t.answer.type === answer)) as any;
    template.settings = { feedback: true, multipleTries: true, confirmation: true, accuracy: DEFAULT_TASK_ACCURACY, ...settings };
    template.mapFeatures = cloneDeep(standardMapFeatures);
    return template;
  };
  const used = (task: any, extra: any = {}) => detectTaskAdvancedUsage({ task, ...extra }, hidden);

  describe("does not cry wolf", () => {
    it("reports nothing for a new task with only default settings", () => {
      expect(used(navTask("nav-flag"))).toEqual([]);
      expect(used(navTask("nav-arrow"))).toEqual([]);
      expect(used(themeTask("theme-loc", QuestionType.TEXT, AnswerType.MAP_POINT))).toEqual([]);
    });

    it("reports nothing when the task has no settings or map features yet", () => {
      const bare = cloneDeep(navtasks[0]) as any;
      expect(used(bare)).toEqual([]);
      expect(used(null)).toEqual([]);
    });

    it("ignores unset map features and values equal to the standard map", () => {
      expect(detectMapFeaturesAdvancedUsage({}, hidden)).toEqual([]);
      expect(detectMapFeaturesAdvancedUsage(cloneDeep(standardMapFeatures), hidden)).toEqual([]);
    });
  });

  describe("Advanced-only selections", () => {
    it("flags navigation via text and exploration tasks", () => {
      expect(used(navTask("nav-text"))).toEqual(["navigation.type.text"]);
      expect(used(cloneDeep(explorationTask))).toEqual(["navigation.type.exploration"]);
    });

    it("flags the free-task question and answer types and the direction question types", () => {
      const plainFree: any = { category: "theme", type: "free", question: { type: QuestionType.TEXT }, answer: { type: AnswerType.MULTIPLE_CHOICE }, settings: {} };
      expect(used(plainFree)).toEqual([]);
      const free: any = { category: "theme", type: "free", question: { type: QuestionType.PHOTO }, answer: { type: AnswerType.DRAW }, settings: {} };
      expect(used(free).sort()).toEqual(["free.answer.drawing", "free.question.photo"]);
      const arrow = themeTask("theme-direction", QuestionType.MAP_DIRECTION, AnswerType.DIRECTION, { multipleTries: false });
      expect(used(arrow)).toEqual(["direction.question.arrow"]);
      const photo = themeTask("theme-direction", QuestionType.MAP_DIRECTION_PHOTO, AnswerType.MAP_DIRECTION);
      expect(used(photo)).toEqual(["direction.question.photo"]);
    });

    it("does not confuse the answer that shares a name with the hidden arrow question", () => {
      const viewing = themeTask("theme-direction", QuestionType.TEXT, AnswerType.MAP_DIRECTION);
      expect(used(viewing)).toEqual([]);
    });
  });

  describe("meaningful values that differ from the defaults", () => {
    it("flags a custom arrival accuracy, but not the default one", () => {
      expect(used(navTask("nav-flag", { accuracy: 20 }))).toEqual(["navigation.accuracy"]);
      expect(used(navTask("nav-flag", { accuracy: DEFAULT_TASK_ACCURACY }))).toEqual([]);
      // The self-location task's accuracy is not a navigation setting.
      expect(used(themeTask("theme-loc", QuestionType.TEXT, AnswerType.MAP_POINT, { accuracy: 20 }))).toEqual([]);
    });

    it("flags keeping the flag, where the setting applies", () => {
      expect(used(navTask("nav-flag", { keepMarker: true }))).toEqual(["navigation.keepFlag"]);
      expect(used(navTask("nav-arrow", { keepMarker: true }))).toEqual([]);
      expect(used(navTask("nav-flag", { keepMarker: true, showMarker: false }))).toEqual([]);
    });

    it("flags switched-off multiple attempts in a thematic task, where they apply", () => {
      const markObject = themeTask("theme-object", QuestionType.TEXT, AnswerType.MAP_POINT, { multipleTries: false });
      expect(used(markObject)).toEqual(["thematic.multipleAttempts"]);
      // Off because feedback is off: not a deliberate choice.
      const noFeedback = themeTask("theme-object", QuestionType.TEXT, AnswerType.MAP_POINT, { feedback: false, multipleTries: false });
      expect(used(noFeedback)).toEqual([]);
      // Photo answers never offer multiple attempts.
      const photoAnswer = themeTask("theme-object", QuestionType.TEXT, AnswerType.PHOTO, { multipleTries: false });
      expect(used(photoAnswer)).toEqual([]);
    });

    it("flags a search area", () => {
      const task = themeTask("theme-loc", QuestionType.TEXT, AnswerType.MAP_POINT);
      task.question.area = { type: "FeatureCollection", features: [{ type: "Feature" }] };
      expect(used(task)).toEqual(["thematic.searchArea"]);
      task.question.area = { type: "FeatureCollection", features: [] };
      expect(used(task)).toEqual([]);
    });
  });

  describe("map features", () => {
    it("names the controls that differ from the standard map", () => {
      const features = {
        ...cloneDeep(standardMapFeatures), zoombar: "task", rotation: "auto", track: true,
        landmarks: true, reducedInformation: true, streetSection: true, material: "sat", direction: "true", pan: "static",
      } as any;
      expect(detectMapFeaturesAdvancedUsage(features, hidden).sort()).toEqual([
        "map.directionMarker", "map.landmarks", "map.locationBuffer", "map.pan",
        "map.rotation", "map.streetHighlight", "map.track", "map.type", "map.zoom",
      ]);
    });

    it("never counts the location marker, which stays visible", () => {
      const features = { ...cloneDeep(standardMapFeatures), position: "true" } as any;
      expect(detectMapFeaturesAdvancedUsage(features, hidden)).toEqual([]);
    });

    it("counts a control only when the policy hides it", () => {
      const features = { ...cloneDeep(standardMapFeatures), zoombar: "task" } as any;
      expect(detectMapFeaturesAdvancedUsage(features, () => false)).toEqual([]);
    });

    it("counts every changed control of a thematic task whose map features entry is hidden", () => {
      const task = themeTask("theme-loc", QuestionType.TEXT, AnswerType.MAP_POINT);
      task.mapFeatures.position = "true"; // stays visible in Simple, but...
      task.mapFeatures.zoombar = "task";
      const visibleZoom = (id: string) => id === "thematic.mapFeatures"; // only the dialog entry is hidden
      expect(detectTaskAdvancedUsage({ task }, visibleZoom)).toEqual(["map.zoom"]);
    });

    it("uses the dialog's own, newer map features when given", () => {
      const task = navTask("nav-flag");
      const edited = { ...cloneDeep(standardMapFeatures), track: true } as any;
      expect(detectTaskAdvancedUsage({ task, mapFeatures: edited }, hidden)).toEqual(["map.track"]);
    });
  });

  describe("virtual environments", () => {
    const envType = VirEnvHeaders[0].layerName;
    const virtualNav = (settings: any = {}) => navTask("nav-flag", settings);
    const usedInVirtual = (task: any, extra: any = {}) =>
      detectTaskAdvancedUsage({ task, isVirtualWorld: true, virEnvType: envType, ...extra }, hidden);

    it("reports nothing for default virtual settings", () => {
      expect(usedInVirtual(virtualNav({ mapSize: "3" }))).toEqual([]);
    });

    it("flags changed avatar settings", () => {
      const task = virtualNav({ avatarSpeed: 99, disableAvatarRotation: true, showEnvSettings: true, mapSize: "5" });
      expect(usedInVirtual(task).sort()).toEqual([
        "virtual.avatarSpeed", "virtual.disableRotation", "virtual.environmentSettings", "virtual.mapSize",
      ]);
    });

    it("flags a start pose and a start floor", () => {
      const withPose = virtualNav();
      withPose.question.initialAvatarPosition = { position: { geometry: { coordinates: [0, 0] } }, bearing: 10 };
      expect(usedInVirtual(withPose)).toEqual(["virtual.initialPose"]);
      expect(usedInVirtual(virtualNav(), { initialFloor: "F2" })).toEqual(["virtual.initialPose"]);
      expect(usedInVirtual(virtualNav(), { initialFloor: "Select floor" })).toEqual([]);
    });

    it("is silent about virtual settings outside virtual worlds", () => {
      expect(used(virtualNav({ avatarSpeed: 99, mapSize: "5" }))).toEqual([]);
    });

    it("keeps the task floor out of it: a task's required floor is not an avatar start floor", () => {
      const task = virtualNav();
      task.floor = "F3";
      expect(usedInVirtual(task)).toEqual([]);
    });
  });

  describe("multiplayer tasks", () => {
    it("reads the first player's question and answer", () => {
      const task: any = {
        category: "theme", type: "free",
        question: [{ type: QuestionType.PHOTO }, { type: QuestionType.TEXT }],
        answer: [{ type: AnswerType.DRAW }, { type: AnswerType.DRAW }],
        settings: {},
      };
      expect(used(task).sort()).toEqual(["free.answer.drawing", "free.question.photo"]);
    });
  });

  describe("games", () => {
    it("flags a boundary and a switched-off consent question", () => {
      expect(detectGameAdvancedUsage({ hasBoundary: true, disableShareData: true }, hidden).sort())
        .toEqual(["game.boundary", "game.disableDataConsent"]);
    });

    it("reports nothing for a plain game", () => {
      expect(detectGameAdvancedUsage({ hasBoundary: false, disableShareData: false }, hidden)).toEqual([]);
      expect(detectGameAdvancedUsage({ hasBoundary: false }, hidden)).toEqual([]);
    });

    it("counts only what the policy hides", () => {
      expect(detectGameAdvancedUsage({ hasBoundary: true, disableShareData: true }, () => false)).toEqual([]);
    });
  });
});
