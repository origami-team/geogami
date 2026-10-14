import { EDITOR_FEATURES, editorOptionFeatureId } from "../models/editor-features";
import { navtasks } from "../models/navigation-tasks";
import { navtasksMultiplayers2 } from "../models/navigation-tasks-multi_2_players";
import { navtasksMultiplayers3 } from "../models/navigation-tasks-multi_3_players";
import { themetasks } from "../models/theme-tasks";
import { AnswerType, QuestionType } from "../models/types";
import {
  OptionSpec,
  classificationOf,
  compiledDefaultFeatures,
  defaultPolicy,
  filterVisibleOptions,
  isAdvancedOnlyOption,
  isFeatureVisible,
  parsePolicy,
} from "./editor-visibility";

// The controls agreed to be Advanced only at the start.
const ADVANCED_ONLY_AT_START = [
  "navigation.type.text", "navigation.type.exploration", "navigation.keepFlag", "navigation.accuracy",
  "map.zoom", "map.pan", "map.rotation", "map.type", "map.directionMarker", "map.track",
  "map.streetHighlight", "map.locationBuffer", "map.landmarks",
  "free.question.mapMarking", "free.question.photo", "free.answer.drawing",
  "direction.question.arrow", "direction.question.photo",
  "thematic.multipleAttempts", "thematic.mapFeatures", "thematic.searchArea", "information.mapFeatures",
  "game.boundary", "game.disableDataConsent",
  "virtual.initialPose", "virtual.avatarSpeed", "virtual.disableRotation",
  "virtual.environmentSettings", "virtual.mapSize",
];

// Controls that must stay visible in Simple.
const VISIBLE_IN_SIMPLE = [
  "map.locationMarker", "map.switchLayer", "game.navigationPin", "task.feedback", "task.confirmation",
  "task.autoPlayAudio", "navigation.showFlag", "navigation.type.arrow", "navigation.type.photo",
  "thematic.type.object", "thematic.type.direction", "thematic.type.free",
  "virtual.cameraClip", "virtual.pathVisualization", "virtual.landmarkSelection",
];

describe("editor visibility rules", () => {
  const policy = defaultPolicy();

  describe("initial classification", () => {
    it("makes exactly the agreed controls Advanced only", () => {
      const advancedOnly = EDITOR_FEATURES.filter((f) => f.configurable && f.default === "advanced")
        .map((f) => f.id)
        .sort();
      expect(advancedOnly).toEqual([...ADVANCED_ONLY_AT_START].sort());
    });

    it("hides those controls in Simple and shows them in Advanced", () => {
      for (const id of ADVANCED_ONLY_AT_START) {
        expect(isFeatureVisible(policy, "simple", id)).toBe(false, id);
        expect(isFeatureVisible(policy, "advanced", id)).toBe(true, id);
      }
    });

    it("keeps every other control visible in Simple", () => {
      for (const id of VISIBLE_IN_SIMPLE) {
        expect(isFeatureVisible(policy, "simple", id)).toBe(true, id);
      }
      for (const feature of EDITOR_FEATURES) {
        if (!ADVANCED_ONLY_AT_START.includes(feature.id)) {
          expect(isFeatureVisible(policy, "simple", feature.id)).toBe(true, feature.id);
        }
      }
    });

    it("never hides an essential control, whatever the policy says", () => {
      const hostile = { ...policy, features: { ...policy.features, "task.instruction": "advanced" as any } };
      for (const feature of EDITOR_FEATURES.filter((f) => !f.configurable)) {
        expect(isFeatureVisible(hostile, "simple", feature.id)).toBe(true, feature.id);
      }
    });
  });

  describe("visibility", () => {
    it("shows a control that is not in the catalogue until it is deliberately classified", () => {
      expect(isFeatureVisible(policy, "simple", "some.future.control")).toBe(true);
      expect(classificationOf(policy, "some.future.control")).toBeUndefined();
    });

    it("follows the policy", () => {
      const custom = {
        ...policy,
        features: { ...policy.features, "map.zoom": "both" as const, "task.feedback": "advanced" as const },
      };
      expect(isFeatureVisible(custom, "simple", "map.zoom")).toBe(true);
      expect(isFeatureVisible(custom, "simple", "task.feedback")).toBe(false);
      expect(isFeatureVisible(custom, "advanced", "task.feedback")).toBe(true);
    });

    it("keeps a hidden control while the current selection needs it", () => {
      expect(isFeatureVisible(policy, "simple", "navigation.type.text", true)).toBe(true);
      expect(isFeatureVisible(policy, "simple", "navigation.type.text", false)).toBe(false);
    });
  });

  describe("policy from the server", () => {
    const valid = () => ({
      revision: 3,
      updatedAt: "2026-10-13T10:00:00.000Z",
      updatedBy: "an-admin",
      catalogue: "20f2dcdf",
      features: { ...compiledDefaultFeatures(), "map.zoom": "both" },
    });

    it("accepts a well-formed policy", () => {
      const parsed = parsePolicy(valid(), "server");
      expect(parsed.revision).toBe(3);
      expect(parsed.features["map.zoom"]).toBe("both");
      expect(parsed.source).toBe("server");
      expect(parsed.updatedBy).toBe("an-admin");
    });

    it("keeps the compiled default for ids the response leaves out or gets wrong", () => {
      const raw: any = valid();
      delete raw.features["map.pan"];
      raw.features["map.rotation"] = "hidden";
      raw.features["feature.from.the.future"] = "both";
      const parsed = parsePolicy(raw, "server");
      expect(parsed.features["map.pan"]).toBe("advanced");
      expect(parsed.features["map.rotation"]).toBe("advanced");
      expect("feature.from.the.future" in parsed.features).toBe(false);
    });

    it("rejects anything malformed so callers fall back deliberately", () => {
      const bad: any[] = [
        null, undefined, "x", [], {}, { revision: -1, features: {} }, { revision: 1.5, features: {} },
        { revision: "1", features: {} }, { revision: 1 }, { revision: 1, features: [] }, { revision: 1, features: null },
      ];
      for (const raw of bad) {
        expect(parsePolicy(raw, "server")).toBeNull();
      }
    });

    it("starts from compiled defaults that are not mistaken for a saved policy", () => {
      expect(defaultPolicy().source).toBe("defaults");
      expect(defaultPolicy().revision).toBe(0);
    });
  });

  describe("option lists", () => {
    const visible = (id: string, keep: boolean) => isFeatureVisible(policy, "simple", id, keep);
    const advanced = (id: string, keep: boolean) => isFeatureVisible(policy, "advanced", id, keep);

    const navSpec = (current: string): OptionSpec<any> => ({
      featureOf: (t) => editorOptionFeatureId("taskType", "nav", t.type),
      isCurrent: (t) => t.type === current,
    });

    it("keeps flag, arrow and photo navigation in Simple, and drops text and exploration", () => {
      for (const list of [navtasks, navtasksMultiplayers2, navtasksMultiplayers3]) {
        const shown = filterVisibleOptions(list, visible, navSpec("nav-flag")).map((t) => t.type);
        expect(shown).toEqual(["nav-flag", "nav-arrow", "nav-photo"]);
      }
    });

    it("lists everything in Advanced", () => {
      const shown = filterVisibleOptions(navtasks, advanced, navSpec("nav-flag")).map((t) => t.type);
      expect(shown).toEqual(navtasks.map((t) => t.type));
    });

    it("keeps an Advanced-only type that is the task's current type, and marks it", () => {
      const spec = navSpec("nav-text");
      const shown = filterVisibleOptions(navtasks, visible, spec);
      expect(shown.map((t) => t.type)).toEqual(["nav-flag", "nav-arrow", "nav-text", "nav-photo"]);
      const text = navtasks.find((t) => t.type === "nav-text");
      const flag = navtasks.find((t) => t.type === "nav-flag");
      expect(isAdvancedOnlyOption(text, visible, spec)).toBe(true);
      expect(isAdvancedOnlyOption(flag, visible, spec)).toBe(false);
      // Not marked once Advanced is on.
      expect(isAdvancedOnlyOption(text, advanced, spec)).toBe(false);
    });

    it("does not change the source list or the option objects", () => {
      const before = navtasks.map((t) => t);
      const copy = JSON.stringify(navtasks);
      const shown = filterVisibleOptions(navtasks, visible, navSpec("nav-flag"));
      expect(navtasks.length).toBe(before.length);
      navtasks.forEach((t, i) => expect(t).toBe(before[i]));
      expect(JSON.stringify(navtasks)).toBe(copy);
      shown.forEach((t) => expect(navtasks).toContain(t));
    });

    describe("free tasks", () => {
      const freeQuestions = [QuestionType.TEXT, QuestionType.MAP_FEATURE_FREE, QuestionType.PHOTO].map((type) => ({ type }));
      const freeAnswers = [
        AnswerType.MULTIPLE_CHOICE, AnswerType.PHOTO, AnswerType.MULTIPLE_CHOICE_TEXT,
        AnswerType.TEXT, AnswerType.NUMBER, AnswerType.DRAW,
      ].map((type) => ({ type }));
      const questionSpec = (current: string): OptionSpec<any> => ({
        featureOf: (o) => editorOptionFeatureId("question", "free", o.type),
        isCurrent: (o) => o.type === current,
      });
      const answerSpec = (current: string): OptionSpec<any> => ({
        featureOf: (o) => editorOptionFeatureId("answer", "free", o.type),
        isCurrent: (o) => o.type === current,
      });

      it("hides the map-marking and photo questions but keeps the text question", () => {
        const shown = filterVisibleOptions(freeQuestions, visible, questionSpec(QuestionType.TEXT));
        expect(shown.map((o) => o.type)).toEqual([QuestionType.TEXT]);
      });

      it("hides only the drawing answer — photo and text answers stay", () => {
        const shown = filterVisibleOptions(freeAnswers, visible, answerSpec(AnswerType.TEXT)).map((o) => o.type);
        expect(shown).not.toContain(AnswerType.DRAW);
        expect(shown).toContain(AnswerType.PHOTO);
        expect(shown).toContain(AnswerType.TEXT);
        expect(shown.length).toBe(freeAnswers.length - 1);
      });

      it("keeps the current Advanced-only choices so nothing is silently replaced", () => {
        const shownQuestions = filterVisibleOptions(freeQuestions, visible, questionSpec(QuestionType.PHOTO));
        expect(shownQuestions.map((o) => o.type)).toEqual([QuestionType.TEXT, QuestionType.PHOTO]);
        const shownAnswers = filterVisibleOptions(freeAnswers, visible, answerSpec(AnswerType.DRAW)).map((o) => o.type);
        expect(shownAnswers).toContain(AnswerType.DRAW);
      });
    });

    describe("direction tasks", () => {
      // The options the dialog derives from the real templates.
      const directionQuestions = Array.from(
        new Set(themetasks.filter((t) => t.type === "theme-direction").map((t) => t.question.type))
      ).map((type) => ({ type }));
      const directionAnswers = (question: string) =>
        Array.from(
          new Set(
            themetasks
              .filter((t) => t.type === "theme-direction" && t.question.type === question)
              .map((t) => t.answer.type)
          )
        ).map((type) => ({ type }));

      const questionSpec = (current: string): OptionSpec<any> => ({
        featureOf: (o) => editorOptionFeatureId("question", "theme-direction", o.type),
        isCurrent: (o) => o.type === current,
      });
      const answerSpec = (current: string): OptionSpec<any> => ({
        featureOf: (o) => editorOptionFeatureId("answer", "theme-direction", o.type),
        isCurrent: (o) => o.type === current,
      });

      it("keeps the map-marker and the viewing-direction questions, and hides arrow and photo", () => {
        const shown = filterVisibleOptions(directionQuestions, visible, questionSpec(QuestionType.TEXT)).map((o) => o.type);
        expect(shown).toContain(QuestionType.MAP_DIRECTION_MARKER);
        expect(shown).toContain(QuestionType.TEXT);
        expect(shown).not.toContain(QuestionType.MAP_DIRECTION);
        expect(shown).not.toContain(QuestionType.MAP_DIRECTION_PHOTO);
      });

      it("never hides the answer that shares a name with the hidden arrow question", () => {
        // AnswerType.MAP_DIRECTION answers the viewing-direction (TEXT) question.
        const answers = directionAnswers(QuestionType.TEXT);
        expect(answers.map((a) => a.type)).toContain(AnswerType.MAP_DIRECTION);
        const shown = filterVisibleOptions(answers, visible, answerSpec(AnswerType.MAP_DIRECTION));
        expect(shown.map((a) => a.type)).toEqual(answers.map((a) => a.type));
      });

      it("leaves every question type with at least one answer to choose", () => {
        for (const question of directionQuestions) {
          const shown = filterVisibleOptions(directionAnswers(question.type), visible, answerSpec(undefined));
          expect(shown.length).toBeGreaterThan(0, question.type);
        }
      });
    });
  });
});
