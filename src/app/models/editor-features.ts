/**
 * Catalogue of the authoring controls that take part in the Simple / Advanced
 * editor views.
 *
 * Simple shows the essential tools for creating games and tasks; Advanced shows
 * everything the user is allowed to use anyway (Advanced never overrides role
 * restrictions). One global policy — set by an admin, stored on the
 * server — decides which *optional* controls Simple shows. This file is the one
 * place that lists them; it drives the admin page ("Editor visibility") and every
 * visibility decision in the editors.
 *
 * Rules for this list:
 *  - `id` is a stable key. Never rename or reuse a shipped id — the policy on the
 *    server refers to it.
 *  - Optional entries are `configurable` and have a compiled `default`:
 *      "both"     → shown in Simple and Advanced
 *      "advanced" → shown in Advanced only
 *    An entry that is not listed here is never hidden.
 *  - Essential entries are not configurable ("Always shown"). They are listed so
 *    admins can see them, and so required inputs can never be made inaccessible.
 *  - The ids and defaults must match the contract file shared with geogami-server
 *    (editor-visibility.contract.json). A test compares them.
 *
 * Hiding is presentation only: a hidden control keeps its value, and nothing in
 * the task or game model depends on what is currently shown.
 */

export type EditorMode = "simple" | "advanced";

/** What an admin chooses for an optional control. */
export type EditorClassification = "both" | "advanced";

export type EditorFeatureGroup =
  | "game"
  | "navigation"
  | "thematic"
  | "information"
  | "map"
  | "virtual"
  | "shared";

/** The screen or dialog an author meets a control on. */
export type EditorScreen =
  | "gameSave"
  | "taskDialog"
  | "infoDialog"
  | "mapFeaturesDialog"
  | "editor";

export const DEFAULT_EDITOR_MODE: EditorMode = "simple";

/** Roles that may open the "Editor visibility" page and change the policy (a contentAdmin may not). */
export const EDITOR_VISIBILITY_MANAGER_ROLES: ReadonlyArray<string> = ["admin"];

export interface EditorFeature {
  /** Stable key, e.g. "map.zoom". */
  id: string;
  group: EditorFeatureGroup;
  /** Where authors meet it. */
  screens: ReadonlyArray<EditorScreen>;
  /** Translation keys (see assets/i18n → EditorFeatures.items). */
  labelKey: string;
  descriptionKey: string;
  /** false = essential: always shown, not part of the policy. */
  configurable: boolean;
  /** Compiled default classification (configurable entries only). */
  default?: EditorClassification;
}

/** Groups in the order the admin page lists them. */
export const EDITOR_FEATURE_GROUPS: ReadonlyArray<{
  id: EditorFeatureGroup;
  labelKey: string;
}> = [
  { id: "game", labelKey: "EditorFeatures.groups.game" },
  { id: "navigation", labelKey: "EditorFeatures.groups.navigation" },
  { id: "thematic", labelKey: "EditorFeatures.groups.thematic" },
  { id: "information", labelKey: "EditorFeatures.groups.information" },
  { id: "map", labelKey: "EditorFeatures.groups.map" },
  { id: "virtual", labelKey: "EditorFeatures.groups.virtual" },
  { id: "shared", labelKey: "EditorFeatures.groups.shared" },
];

/** "navigation.type.flag" → "navigationTypeFlag" (JSON keys must not contain dots). */
export function editorFeatureKey(id: string): string {
  return id
    .split(".")
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
}

function entry(
  id: string,
  group: EditorFeatureGroup,
  screens: EditorScreen[],
  configurable: boolean,
  defaultClassification?: EditorClassification
): EditorFeature {
  const key = editorFeatureKey(id);
  return {
    id,
    group,
    screens,
    labelKey: `EditorFeatures.items.${key}.label`,
    descriptionKey: `EditorFeatures.items.${key}.description`,
    configurable,
    default: defaultClassification,
  };
}

const optional = (
  id: string,
  group: EditorFeatureGroup,
  screens: EditorScreen[],
  defaultClassification: EditorClassification
) => entry(id, group, screens, true, defaultClassification);

const alwaysShown = (id: string, group: EditorFeatureGroup, screens: EditorScreen[]) =>
  entry(id, group, screens, false);

const GAME: EditorScreen[] = ["gameSave"];
const TASK: EditorScreen[] = ["taskDialog"];
const TASK_AND_INFO: EditorScreen[] = ["taskDialog", "infoDialog"];
const MAP_DIALOG: EditorScreen[] = ["mapFeaturesDialog"];

export const EDITOR_FEATURES: ReadonlyArray<EditorFeature> = [
  // ── Game (save screen) ────────────────────────────────────────────────────
  alwaysShown("game.nameAndPlace", "game", GAME),
  optional("game.boundary", "game", GAME, "advanced"),
  optional("game.disableDataConsent", "game", GAME, "advanced"),
  optional("game.navigationPin", "game", GAME, "both"),

  // ── Navigation tasks ──────────────────────────────────────────────────────
  alwaysShown("navigation.type.flag", "navigation", TASK),
  optional("navigation.type.arrow", "navigation", TASK, "both"),
  optional("navigation.type.photo", "navigation", TASK, "both"),
  optional("navigation.type.text", "navigation", TASK, "advanced"),
  optional("navigation.type.exploration", "navigation", TASK, "advanced"),
  optional("navigation.showFlag", "navigation", TASK, "both"),
  optional("navigation.keepFlag", "navigation", TASK, "advanced"),
  optional("navigation.accuracy", "navigation", TASK, "advanced"),

  // ── Thematic tasks (incl. free and direction tasks) ───────────────────────
  alwaysShown("thematic.type.selfLocation", "thematic", TASK),
  optional("thematic.type.object", "thematic", TASK, "both"),
  optional("thematic.type.direction", "thematic", TASK, "both"),
  optional("thematic.type.free", "thematic", TASK, "both"),
  optional("free.question.mapMarking", "thematic", TASK, "advanced"),
  optional("free.question.photo", "thematic", TASK, "advanced"),
  optional("free.answer.drawing", "thematic", TASK, "advanced"),
  optional("direction.question.arrow", "thematic", TASK, "advanced"),
  optional("direction.question.photo", "thematic", TASK, "advanced"),
  optional("thematic.multipleAttempts", "thematic", TASK, "advanced"),
  optional("thematic.searchArea", "thematic", TASK, "advanced"),
  optional("thematic.mapFeatures", "thematic", TASK, "advanced"),

  // ── Information tasks ─────────────────────────────────────────────────────
  alwaysShown("information.content", "information", ["infoDialog"]),
  optional("information.mapFeatures", "information", ["infoDialog"], "advanced"),

  // ── Map features dialog ───────────────────────────────────────────────────
  optional("map.zoom", "map", MAP_DIALOG, "advanced"),
  optional("map.pan", "map", MAP_DIALOG, "advanced"),
  optional("map.rotation", "map", MAP_DIALOG, "advanced"),
  optional("map.type", "map", MAP_DIALOG, "advanced"),
  optional("map.switchLayer", "map", MAP_DIALOG, "both"),
  optional("map.locationMarker", "map", MAP_DIALOG, "both"),
  optional("map.directionMarker", "map", MAP_DIALOG, "advanced"),
  optional("map.track", "map", MAP_DIALOG, "advanced"),
  optional("map.streetHighlight", "map", MAP_DIALOG, "advanced"),
  optional("map.locationBuffer", "map", MAP_DIALOG, "advanced"),
  optional("map.landmarks", "map", MAP_DIALOG, "advanced"),

  // ── Virtual environments (task and information dialogs) ───────────────────
  alwaysShown("virtual.environmentChoice", "virtual", TASK_AND_INFO),
  alwaysShown("virtual.taskFloor", "virtual", TASK),
  optional("virtual.initialPose", "virtual", TASK_AND_INFO, "advanced"),
  optional("virtual.avatarSpeed", "virtual", TASK_AND_INFO, "advanced"),
  optional("virtual.cameraClip", "virtual", TASK_AND_INFO, "both"),
  optional("virtual.disableRotation", "virtual", TASK_AND_INFO, "advanced"),
  optional("virtual.environmentSettings", "virtual", TASK_AND_INFO, "advanced"),
  optional("virtual.pathVisualization", "virtual", TASK_AND_INFO, "both"),
  optional("virtual.mapSize", "virtual", TASK_AND_INFO, "advanced"),
  optional("virtual.landmarkSelection", "virtual", TASK_AND_INFO, "both"),

  // ── Shared across editors ─────────────────────────────────────────────────
  alwaysShown("editor.modeSwitch", "shared", ["editor"]),
  alwaysShown("task.instruction", "shared", TASK),
  alwaysShown("task.destination", "shared", TASK),
  alwaysShown("task.explorationSettings", "shared", TASK),
  alwaysShown("task.collaborationMethod", "shared", TASK),
  optional("task.confirmation", "shared", TASK, "both"),
  optional("task.feedback", "shared", TASK, "both"),
  optional("task.autoPlayAudio", "shared", TASK_AND_INFO, "both"),
];

export const EDITOR_FEATURE_BY_ID: { readonly [id: string]: EditorFeature } =
  EDITOR_FEATURES.reduce((byId, feature) => {
    byId[feature.id] = feature;
    return byId;
  }, {} as { [id: string]: EditorFeature });

// ── Contract shared with geogami-server ─────────────────────────────────────

export interface EditorContract {
  version: number;
  configurable: { id: string; default: EditorClassification }[];
  locked: string[];
}

export const EDITOR_CONTRACT_VERSION = 1;

const byCodeUnit = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** The ids and defaults the server validates against (sorted, deterministic). */
export function buildEditorContract(
  features: ReadonlyArray<EditorFeature> = EDITOR_FEATURES
): EditorContract {
  return {
    version: EDITOR_CONTRACT_VERSION,
    configurable: features
      .filter((f) => f.configurable)
      .map((f) => ({ id: f.id, default: f.default as EditorClassification }))
      .sort((a, b) => byCodeUnit(a.id, b.id)),
    locked: features
      .filter((f) => !f.configurable)
      .map((f) => f.id)
      .sort(byCodeUnit),
  };
}

/** Small deterministic hash (FNV-1a) — identical to the server's `contractDigest`. */
export function editorContractDigest(contract: EditorContract): string {
  const canonical =
    `v${contract.version}|` +
    contract.configurable.map((e) => `${e.id}=${e.default}`).join(",") +
    "|" +
    contract.locked.join(",");
  let hash = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  let hex = hash.toString(16);
  while (hex.length < 8) {
    hex = "0" + hex;
  }
  return hex;
}

export const EDITOR_CATALOGUE_DIGEST = editorContractDigest(buildEditorContract());

// ── Which catalogue entry governs a selectable option ───────────────────────

/** A dropdown whose options are individually classified. */
export type EditorOptionSlot = "taskType" | "question" | "answer";

/**
 * slot → scope → option value → feature id.
 *
 * The scope is what makes the mapping context-specific: the same value means
 * different things in different tasks (QuestionType.PHOTO exists for free tasks
 * only, but QuestionType.MAP_DIRECTION and AnswerType.MAP_DIRECTION share a name
 * and only the question is classified). Options that are not listed here are
 * never hidden.
 *
 * Scopes: "nav" / "theme" for the task-type selectors (theme options are the
 * numeric type of the thematic selector as a string), otherwise the task type.
 */
const EDITOR_OPTION_FEATURES: {
  [slot: string]: { [scope: string]: { [value: string]: string } };
} = {
  taskType: {
    nav: {
      "nav-arrow": "navigation.type.arrow",
      "nav-photo": "navigation.type.photo",
      "nav-text": "navigation.type.text",
      "nav-exploration": "navigation.type.exploration",
    },
    theme: {
      "2": "thematic.type.object",
      "3": "thematic.type.direction",
      "4": "thematic.type.free",
    },
  },
  question: {
    free: {
      MAP_FEATURE_FREE: "free.question.mapMarking",
      PHOTO: "free.question.photo",
    },
    "theme-direction": {
      MAP_DIRECTION: "direction.question.arrow",
      MAP_DIRECTION_PHOTO: "direction.question.photo",
    },
  },
  answer: {
    free: {
      DRAW: "free.answer.drawing",
    },
  },
};

export function editorOptionFeatureId(
  slot: EditorOptionSlot,
  scope: string,
  value: string | number
): string | undefined {
  const scopes = EDITOR_OPTION_FEATURES[slot];
  const values = scopes && scopes[scope];
  return values ? values[String(value)] : undefined;
}
