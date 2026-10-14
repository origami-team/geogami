import { editorOptionFeatureId } from "../models/editor-features";
import { standardMapFeatures } from "../models/standardMapFeatures";
import { AnswerType, QuestionType } from "../models/types";
import { virEnvLayers } from "../models/virEnvsLayers";

/**
 * Finds the settings of a task or game that only the Advanced view shows, so the
 * Simple view can say "This task uses advanced settings" instead of hiding them
 * silently. A setting only counts when it is
 *   - an Advanced-only selection (task type, question or answer type), or
 *   - a meaningful value that differs from the existing default,
 * and the policy hides it in Simple. Values that merely equal the defaults never
 * trigger the notice. Pure: nothing here changes the task.
 */

/** The accuracy every new task gets (see CreateTaskModalPage). */
export const DEFAULT_TASK_ACCURACY = 5;

export interface TaskAdvancedUsageInput {
  /** Single-player (objects) or multiplayer (question/answer arrays) task. */
  task: any;
  /** The map features the dialog currently holds (may be newer than task.mapFeatures). */
  mapFeatures?: any;
  isVirtualWorld?: boolean;
  virEnvType?: string;
  /** The avatar's initial floor as the dialog holds it ("Select floor" = none). */
  initialFloor?: string;
}

const first = (value: any) => (Array.isArray(value) ? value[0] : value);
const isSet = (value: unknown) => value !== undefined && value !== null && value !== "";
const hasFeatures = (collection: any) =>
  !!collection && Array.isArray(collection.features) && collection.features.length > 0;

// Thematic task types are numbered in the type selector.
function thematicTypeNumber(type: string): number {
  if (type === "theme-object") return 2;
  if (type === "theme-direction") return 3;
  if (type === "free") return 4;
  return 1;
}

/**
 * Map-feature controls whose value differs from the standard map and that Simple
 * hides. `entryHidden` is true when the dialog itself is not offered in Simple
 * (thematic and information tasks), which hides every control in it.
 */
export function detectMapFeaturesAdvancedUsage(
  mapFeatures: any,
  isHiddenInSimple: (featureId: string) => boolean,
  entryHidden = false
): string[] {
  const used: string[] = [];
  if (!mapFeatures) {
    return used;
  }
  const std: any = standardMapFeatures;
  const differs = (key: string) => isSet(mapFeatures[key]) && mapFeatures[key] !== std[key];
  const mapNote = (featureId: string, condition: boolean) => {
    if (condition && (entryHidden || isHiddenInSimple(featureId))) {
      used.push(featureId);
    }
  };

  mapNote("map.zoom", differs("zoombar"));
  mapNote("map.pan", differs("pan"));
  mapNote("map.rotation", differs("rotation"));
  mapNote("map.type", differs("material"));
  mapNote("map.directionMarker", differs("direction"));
  mapNote("map.track", mapFeatures.track === true);
  mapNote("map.streetHighlight", mapFeatures.streetSection === true);
  mapNote("map.locationBuffer", mapFeatures.reducedInformation === true);
  mapNote("map.landmarks", mapFeatures.landmarks === true);
  return used;
}

/**
 * @param isHiddenInSimple whether the policy hides a feature in the Simple view
 * @returns catalogue ids, each at most once
 */
export function detectTaskAdvancedUsage(
  input: TaskAdvancedUsageInput,
  isHiddenInSimple: (featureId: string) => boolean
): string[] {
  const task = input.task;
  const used: string[] = [];
  if (!task) {
    return used;
  }

  const note = (featureId: string, condition: boolean, hidden = isHiddenInSimple(featureId)) => {
    if (condition && hidden && used.indexOf(featureId) === -1) {
      used.push(featureId);
    }
  };

  const question = first(task.question) || {};
  const answer = first(task.answer) || {};
  const settings = task.settings || {};
  const category: string = task.category;
  const type: string = task.type;

  // Advanced-only selections.
  const typeFeature =
    category === "nav"
      ? editorOptionFeatureId("taskType", "nav", type)
      : category === "theme"
      ? editorOptionFeatureId("taskType", "theme", thematicTypeNumber(type))
      : undefined;
  if (typeFeature) note(typeFeature, true);

  const questionFeature = editorOptionFeatureId("question", type, question.type);
  if (questionFeature) note(questionFeature, true);
  const answerFeature = editorOptionFeatureId("answer", type, answer.type);
  if (answerFeature) note(answerFeature, true);

  // Navigation settings.
  if (category === "nav") {
    note(
      "navigation.keepFlag",
      settings.keepMarker === true && !!settings.showMarker && type !== "nav-arrow"
    );
    note(
      "navigation.accuracy",
      type !== "nav-exploration" &&
        isSet(settings.accuracy) &&
        Number(settings.accuracy) !== DEFAULT_TASK_ACCURACY
    );
  }

  // Thematic settings. "Multiple attempts" only applies to answers that can be
  // marked right or wrong, and defaults to on there.
  if (category === "theme") {
    const attemptsApply =
      answer.type !== AnswerType.PHOTO &&
      answer.type !== AnswerType.TEXT &&
      answer.type !== AnswerType.DRAW &&
      question.type !== QuestionType.MAP_DIRECTION;
    note(
      "thematic.multipleAttempts",
      attemptsApply && settings.feedback !== false && settings.multipleTries === false
    );
    if (type === "theme-loc" || type === "theme-object") {
      note("thematic.searchArea", hasFeatures(task.question && task.question.area));
    }
  }

  // Map features: a control counts when its value differs from the standard map
  // and either it, or the whole dialog entry of this kind of task, is hidden.
  const mapFeatures = input.mapFeatures || task.mapFeatures;
  if (mapFeatures) {
    const entryFeature =
      category === "theme"
        ? "thematic.mapFeatures"
        : category === "info"
        ? "information.mapFeatures"
        : undefined;
    const entryHidden = entryFeature ? isHiddenInSimple(entryFeature) : false;
    for (const featureId of detectMapFeaturesAdvancedUsage(
      mapFeatures,
      isHiddenInSimple,
      entryHidden
    )) {
      if (used.indexOf(featureId) === -1) used.push(featureId);
    }
  }

  // Virtual environments.
  if (input.isVirtualWorld) {
    const environment: any = virEnvLayers[input.virEnvType || task.virEnvType];
    const defaultSpeed =
      environment && environment.defaultAvatarSpeed != null ? environment.defaultAvatarSpeed : 5;
    const initialFloor = input.initialFloor || task.initialFloor;
    const rawQuestion = task.question;
    note(
      "virtual.initialPose",
      !!(
        (rawQuestion && rawQuestion.initialAvatarPosition) ||
        question.initialAvatarPosition ||
        (initialFloor && initialFloor !== "Select floor")
      )
    );
    note(
      "virtual.avatarSpeed",
      isSet(settings.avatarSpeed) && Number(settings.avatarSpeed) !== defaultSpeed
    );
    note("virtual.disableRotation", settings.disableAvatarRotation === true);
    note("virtual.environmentSettings", settings.showEnvSettings === true);
    note("virtual.mapSize", isSet(settings.mapSize) && String(settings.mapSize) !== "3");
  }

  return used;
}

export interface GameAdvancedUsageInput {
  /** A game boundary (map section) is switched on. */
  hasBoundary: boolean;
  disableShareData?: boolean;
}

export function detectGameAdvancedUsage(
  input: GameAdvancedUsageInput,
  isHiddenInSimple: (featureId: string) => boolean
): string[] {
  const used: string[] = [];
  if (input.hasBoundary && isHiddenInSimple("game.boundary")) {
    used.push("game.boundary");
  }
  if (input.disableShareData === true && isHiddenInSimple("game.disableDataConsent")) {
    used.push("game.disableDataConsent");
  }
  return used;
}
