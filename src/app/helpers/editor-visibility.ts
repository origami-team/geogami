import {
  EDITOR_FEATURES,
  EDITOR_FEATURE_BY_ID,
  EditorClassification,
  EditorMode,
} from "../models/editor-features";

/**
 * Pure logic of the Simple / Advanced editor views — no Angular, no I/O.
 *
 * A control is shown when the existing permission and context conditions allow
 * it (the templates keep those) AND one of these holds:
 *   - the mode is Advanced,
 *   - the control is essential or not listed in the catalogue,
 *   - the policy classifies it "both" (Simple + Advanced), or
 *   - it is needed to represent or validate the current selection (`keep`).
 * Advanced never overrides a role restriction; it only lifts the Simple filter.
 */

export type EditorPolicySource = "server" | "cache" | "defaults";

export interface EditorPolicy {
  revision: number;
  /** Effective classification of every configurable feature. */
  features: { [id: string]: EditorClassification };
  updatedAt: string | null;
  /** Who saved this revision (the server only tells admins). */
  updatedBy: string | null;
  /** Digest of the catalogue the server validated against. */
  catalogue: string | null;
  /** Where this policy came from — a fallback is never presented as the saved one. */
  source: EditorPolicySource;
}

/** The compiled defaults of every configurable feature. */
export function compiledDefaultFeatures(): { [id: string]: EditorClassification } {
  const features: { [id: string]: EditorClassification } = {};
  for (const feature of EDITOR_FEATURES) {
    if (feature.configurable) {
      features[feature.id] = feature.default as EditorClassification;
    }
  }
  return features;
}

/** Used when no policy is available: authoring keeps working on these. */
export function defaultPolicy(): EditorPolicy {
  return {
    revision: 0,
    features: compiledDefaultFeatures(),
    updatedAt: null,
    updatedBy: null,
    catalogue: null,
    source: "defaults",
  };
}

const isClassification = (value: unknown): value is EditorClassification =>
  value === "both" || value === "advanced";

/**
 * Validates a policy received from the server (or the local cache).
 * Returns null for anything malformed so callers fall back deliberately instead
 * of working with half a policy. Ids this app does not know are ignored; known
 * ids the response lacks keep their compiled default.
 */
export function parsePolicy(raw: any, source: EditorPolicySource): EditorPolicy | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  if (!Number.isInteger(raw.revision) || raw.revision < 0) {
    return null;
  }
  if (!raw.features || typeof raw.features !== "object" || Array.isArray(raw.features)) {
    return null;
  }
  const features = compiledDefaultFeatures();
  for (const id of Object.keys(features)) {
    const value = raw.features[id];
    if (isClassification(value)) {
      features[id] = value;
    }
  }
  return {
    revision: raw.revision,
    features,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    updatedBy: typeof raw.updatedBy === "string" ? raw.updatedBy : null,
    catalogue: typeof raw.catalogue === "string" ? raw.catalogue : null,
    source,
  };
}

/** The classification of a configurable feature, or undefined for essential/unlisted ones. */
export function classificationOf(
  policy: EditorPolicy,
  featureId: string
): EditorClassification | undefined {
  const feature = EDITOR_FEATURE_BY_ID[featureId];
  if (!feature || !feature.configurable) {
    return undefined;
  }
  return policy.features[featureId] || feature.default;
}

export function isFeatureVisible(
  policy: EditorPolicy,
  mode: EditorMode,
  featureId: string,
  keep = false
): boolean {
  if (mode === "advanced" || keep) {
    return true;
  }
  const classification = classificationOf(policy, featureId);
  // Essential and unlisted features are never hidden.
  return classification === undefined || classification === "both";
}

export interface OptionSpec<T> {
  /** The catalogue entry that classifies this option, if any. */
  featureOf: (option: T) => string | undefined;
  /** True for the option that represents the current value. */
  isCurrent: (option: T) => boolean;
}

/**
 * The options a dropdown should offer. Order and identity are those of the source
 * list (which is left untouched). The current value stays in the list even when it
 * is Advanced only, so a selector never shows a different value than the model holds.
 */
export function filterVisibleOptions<T>(
  options: ReadonlyArray<T>,
  isVisible: (featureId: string, keep: boolean) => boolean,
  spec: OptionSpec<T>
): T[] {
  return options.filter((option) => {
    const featureId = spec.featureOf(option);
    return !featureId || isVisible(featureId, spec.isCurrent(option));
  });
}

/** True for an option that is only offered because it is the current value. */
export function isAdvancedOnlyOption<T>(
  option: T,
  isVisible: (featureId: string, keep: boolean) => boolean,
  spec: OptionSpec<T>
): boolean {
  const featureId = spec.featureOf(option);
  return !!featureId && spec.isCurrent(option) && !isVisible(featureId, false);
}
