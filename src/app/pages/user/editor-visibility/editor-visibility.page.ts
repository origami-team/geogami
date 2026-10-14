import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { EditorPolicy, compiledDefaultFeatures } from "src/app/helpers/editor-visibility";
import {
  EDITOR_CATALOGUE_DIGEST,
  EDITOR_FEATURES,
  EDITOR_FEATURE_GROUPS,
  EditorClassification,
  EditorFeature,
  EditorFeatureGroup,
} from "src/app/models/editor-features";
import { EditorVisibilityService } from "src/app/services/editor-visibility.service";
import { UtilService } from "src/app/services/util.service";

interface GroupRows {
  id: EditorFeatureGroup;
  labelKey: string;
  rows: EditorFeature[];
}

/**
 * "Editor visibility": where an admin decides which optional
 * authoring controls the Simple editor view shows.
 *
 * The page edits a local draft. Nothing reaches the server until Save; Cancel
 * (discard) and Restore defaults only change the draft. The saved policy is always
 * the one read from the server — if it cannot be loaded the page says so and offers
 * a retry instead of showing a fallback as if it were the saved policy, and saving
 * is impossible until a load has succeeded.
 */
@Component({
  selector: "app-editor-visibility",
  templateUrl: "./editor-visibility.page.html",
  styleUrls: ["./editor-visibility.page.scss"],
})
export class EditorVisibilityPage implements OnInit {
  loading = true;
  loadError = false;

  /** The policy as last read from the server (the base of the draft). */
  saved: EditorPolicy | null = null;
  /** The classification of every configurable feature as currently edited. */
  draft: { [id: string]: EditorClassification } = {};

  query = "";
  previewOpen = false;
  saving = false;
  /** Someone else saved while this draft was open; the draft is kept. */
  conflict = false;
  /** The app and the server disagree on the list of controls. */
  catalogueMismatch = false;

  constructor(
    private visibility: EditorVisibilityService,
    private translate: TranslateService,
    private utilService: UtilService
  ) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.loadError = false;
    try {
      this.adopt(await this.visibility.fetchPolicy());
    } catch (error) {
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  /** Makes a policy read from the server the new base of the draft. */
  private adopt(policy: EditorPolicy) {
    this.saved = policy;
    this.draft = { ...policy.features };
    this.conflict = false;
    this.catalogueMismatch =
      policy.catalogue !== null && policy.catalogue !== EDITOR_CATALOGUE_DIGEST;
  }

  // ── Draft ────────────────────────────────────────────────────────────────

  setClassification(featureId: string, value: EditorClassification) {
    this.draft = { ...this.draft, [featureId]: value };
  }

  isChanged(feature: EditorFeature): boolean {
    return (
      !!this.saved &&
      feature.configurable &&
      this.draft[feature.id] !== this.saved.features[feature.id]
    );
  }

  private get configurable(): EditorFeature[] {
    return EDITOR_FEATURES.filter((f) => f.configurable);
  }

  get changedCount(): number {
    return this.configurable.filter((f) => this.isChanged(f)).length;
  }

  get dirty(): boolean {
    return this.changedCount > 0;
  }

  get isAtDefaults(): boolean {
    const defaults = compiledDefaultFeatures();
    return this.configurable.every((f) => this.draft[f.id] === defaults[f.id]);
  }

  get canSave(): boolean {
    return !!this.saved && this.dirty && !this.saving && !this.catalogueMismatch;
  }

  /** Throws the edits away; the draft is the saved policy again. */
  discard() {
    if (this.saved) {
      this.draft = { ...this.saved.features };
    }
  }

  /** Puts the built-in defaults into the draft. They apply only after Save. */
  restoreDefaults() {
    this.draft = { ...compiledDefaultFeatures() };
  }

  // ── Saving ───────────────────────────────────────────────────────────────

  async save() {
    if (!this.canSave) {
      return;
    }
    this.saving = true;
    try {
      this.adopt(await this.visibility.savePolicy(this.saved.revision, this.draft));
      this.utilService.showToast(this.translate.instant("EditorVisibility.saved"), "success");
    } catch (error) {
      // The draft stays exactly as it is, and nothing is reported as saved.
      if (error && error.status === 409) {
        this.conflict = true;
        this.utilService.showValidationError(
          this.translate.instant("EditorVisibility.conflictToast")
        );
      } else {
        this.utilService.showValidationError(
          this.translate.instant("EditorVisibility.saveFailed")
        );
      }
    } finally {
      this.saving = false;
    }
  }

  /**
   * After a conflict: load what is on the server now and re-apply this draft's own
   * changes on top of it, so nothing the admin edited is lost.
   */
  async reloadAfterConflict() {
    const mine = this.configurable
      .filter((f) => this.isChanged(f))
      .map((f) => ({ id: f.id, value: this.draft[f.id] }));
    try {
      const latest = await this.visibility.fetchPolicy();
      this.adopt(latest);
      for (const change of mine) {
        this.draft[change.id] = change.value;
      }
      this.utilService.showToast(this.translate.instant("EditorVisibility.reloaded"), "dark");
    } catch (error) {
      this.utilService.showValidationError(this.translate.instant("EditorVisibility.loadFailed"));
    }
  }

  // ── List ─────────────────────────────────────────────────────────────────

  private matches(feature: EditorFeature, group: { labelKey: string }): boolean {
    const needle = this.query.trim().toLowerCase();
    if (!needle) {
      return true;
    }
    const haystack = [
      feature.id,
      this.translate.instant(feature.labelKey),
      this.translate.instant(feature.descriptionKey),
      this.translate.instant(group.labelKey),
      ...feature.screens.map((screen) => this.translate.instant("EditorVisibility.screens." + screen)),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(needle) !== -1;
  }

  get groups(): GroupRows[] {
    return EDITOR_FEATURE_GROUPS.map((group) => ({
      id: group.id,
      labelKey: group.labelKey,
      rows: EDITOR_FEATURES.filter((f) => f.group === group.id && this.matches(f, group)),
    })).filter((group) => group.rows.length > 0);
  }

  // ── Preview of the Simple view under the draft ───────────────────────────

  get preview(): GroupRows[] {
    return EDITOR_FEATURE_GROUPS.map((group) => ({
      id: group.id,
      labelKey: group.labelKey,
      rows: EDITOR_FEATURES.filter(
        (f) => f.group === group.id && (!f.configurable || this.draft[f.id] === "both")
      ),
    })).filter((group) => group.rows.length > 0);
  }

  get previewCount(): number {
    return this.preview.reduce((sum, group) => sum + group.rows.length, 0);
  }

  togglePreview() {
    this.previewOpen = !this.previewOpen;
  }

  trackById(_index: number, item: { id: string }) {
    return item.id;
  }
}
