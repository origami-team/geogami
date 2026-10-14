import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { merge, Observable, Subject } from "rxjs";
import { environment } from "../../environments/environment";
import {
  EditorPolicy,
  OptionSpec,
  defaultPolicy,
  filterVisibleOptions,
  isAdvancedOnlyOption,
  isFeatureVisible,
  parsePolicy,
} from "../helpers/editor-visibility";
import { EditorClassification, EditorMode } from "../models/editor-features";
import { AuthService } from "./auth-service.service";
import { EditorModeService } from "./editor-mode.service";

// How long starting an authoring session waits for the server before it carries
// on with the last known policy.
const SESSION_FETCH_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Decides which authoring controls are shown.
 *
 * Combines the author's Simple / Advanced choice (EditorModeService) with the
 * global policy that an admin maintains on the server.
 *
 * Authoring sessions: a game that is being created or edited keeps working on one
 * snapshot of the policy — taken when the author enters the editor — through all
 * its dialogs and the final save screen. If an admin saves a new policy meanwhile,
 * nothing changes under the author's hands; the next time an editor is entered a
 * fresh snapshot is taken. Switching Simple / Advanced stays immediate.
 *
 * If the policy cannot be loaded, authoring carries on with the last valid policy
 * from this browser's cache, or with the compiled defaults. Advanced is always
 * reachable, so no control is ever out of reach.
 */
@Injectable({
  providedIn: "root",
})
export class EditorVisibilityService {
  // Newest policy known: loaded from the server, else cached, else the defaults.
  private latest: EditorPolicy;
  // Frozen policy of the authoring session in progress (if any).
  private sessionPolicy: EditorPolicy | null = null;
  private readonly policyChanged = new Subject<void>();

  /** Emits (also on subscribe) when the mode, the policy or the snapshot changes. */
  readonly changes$: Observable<unknown>;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private editorMode: EditorModeService
  ) {
    this.latest = this.readCache() || defaultPolicy();
    this.changes$ = merge(this.editorMode.mode$, this.policyChanged);
  }

  get mode(): EditorMode {
    return this.editorMode.mode;
  }

  /** The policy decisions are currently based on. */
  get policy(): EditorPolicy {
    return this.sessionPolicy || this.latest;
  }

  /**
   * Whether a control should be shown. Callers keep their existing permission and
   * context conditions; `keep` marks a control that is needed to represent or
   * validate the current selection.
   */
  isVisible(featureId: string, keep = false): boolean {
    return isFeatureVisible(this.policy, this.mode, featureId, keep);
  }

  /** Whether the policy hides a control in Simple, whatever mode is active now. */
  isHiddenInSimple(featureId: string): boolean {
    return !isFeatureVisible(this.policy, "simple", featureId, false);
  }

  anyVisible(featureIds: string[]): boolean {
    return featureIds.some((id) => this.isVisible(id));
  }

  filterOptions<T>(options: ReadonlyArray<T>, spec: OptionSpec<T>): T[] {
    return filterVisibleOptions(options, (id, keep) => this.isVisible(id, keep), spec);
  }

  /** True for an option shown only because it is the current (Advanced-only) value. */
  isAdvancedOption<T>(option: T, spec: OptionSpec<T>): boolean {
    return isAdvancedOnlyOption(option, (id, keep) => this.isVisible(id, keep), spec);
  }

  // ── Authoring sessions ────────────────────────────────────────────────────

  /**
   * Takes the policy snapshot for an authoring session. Editors call this when the
   * author enters them (`force`: fetch the latest policy and replace the snapshot);
   * pages further into the flow pass `force = false` to join the running session.
   */
  async startSession(force = true): Promise<void> {
    if (this.sessionPolicy && !force) {
      return;
    }
    let policy: EditorPolicy;
    try {
      policy = await withTimeout(this.fetchPolicy(), SESSION_FETCH_TIMEOUT_MS);
    } catch (error) {
      // Offline, signed out, a server that predates the endpoint, ...: carry on
      // with the last valid policy.
      policy = this.latest;
    }
    this.sessionPolicy = policy;
    this.policyChanged.next();
  }

  // ── Server ────────────────────────────────────────────────────────────────

  private get url(): string {
    return `${environment.apiURL}/editor-visibility`;
  }

  /**
   * The saved policy, straight from the server. Rejects when it cannot be loaded —
   * the admin page uses this so a fallback is never mistaken for the saved policy.
   */
  async fetchPolicy(): Promise<EditorPolicy> {
    const raw = await this.http
      .get(this.url, { headers: this.authService.createHeaders() })
      .toPromise();
    return this.accept(raw);
  }

  /**
   * Saves classifications. `expectedRevision` is the revision the caller loaded; a
   * newer one on the server rejects with HTTP 409 (the body carries the current
   * policy).
   */
  async savePolicy(
    expectedRevision: number,
    features: { [id: string]: EditorClassification }
  ): Promise<EditorPolicy> {
    const raw = await this.http
      .put(
        this.url,
        { expectedRevision, features },
        { headers: this.authService.createHeaders() }
      )
      .toPromise();
    return this.accept(raw);
  }

  private accept(raw: unknown): EditorPolicy {
    const policy = parsePolicy(raw, "server");
    if (!policy) {
      throw new Error("Unexpected editor visibility response");
    }
    this.latest = policy;
    this.writeCache(policy);
    this.policyChanged.next();
    return policy;
  }

  // ── Cache of the last valid policy (this browser only) ───────────────────

  private get cacheKey(): string {
    return `geogami.editorPolicy.v1:${environment.apiURL}`;
  }

  private readCache(): EditorPolicy | null {
    try {
      const stored = window.localStorage.getItem(this.cacheKey);
      return stored ? parsePolicy(JSON.parse(stored), "cache") : null;
    } catch (error) {
      return null;
    }
  }

  private writeCache(policy: EditorPolicy): void {
    try {
      window.localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          revision: policy.revision,
          features: policy.features,
          updatedAt: policy.updatedAt,
          catalogue: policy.catalogue,
        })
      );
    } catch (error) {
      // Storage unavailable: the policy simply is not cached.
    }
  }
}
