import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { DEFAULT_EDITOR_MODE, EditorMode } from "../models/editor-features";
import { AuthService } from "./auth-service.service";

/**
 * The author's Simple / Advanced choice.
 *
 * One shared preference for the whole authoring flow: the pages, the task and
 * information dialogs and the map features dialog all read and change this same
 * value, so a dialog always starts in its parent's mode and a change made inside
 * a dialog is there when the author comes back.
 *
 * Without a stored choice the editor starts in Simple. The choice is kept in this
 * browser only, per signed-in user and per API environment; it is not shared
 * across devices. Switching accounts never carries a choice over, and storage
 * that is unavailable (private windows, blocked site data) just means the choice
 * lasts until the page is closed.
 */
@Injectable({
  providedIn: "root",
})
export class EditorModeService {
  private readonly modeSubject = new BehaviorSubject<EditorMode>(DEFAULT_EDITOR_MODE);
  private userId: string | null = null;

  /** Emits the current mode on subscribe, then whenever it changes. */
  readonly mode$: Observable<EditorMode> = this.modeSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService.getUser().subscribe((user) => this.onUserChanged(user));
  }

  get mode(): EditorMode {
    return this.modeSubject.value;
  }

  get isAdvanced(): boolean {
    return this.mode === "advanced";
  }

  setMode(mode: EditorMode): void {
    if ((mode !== "simple" && mode !== "advanced") || mode === this.mode) {
      return;
    }
    this.modeSubject.next(mode);
    this.persist(mode);
  }

  private onUserChanged(user: any): void {
    const id = user && user._id ? String(user._id) : null;
    if (id === this.userId) {
      // Same account (e.g. its profile was refreshed): keep the current choice.
      return;
    }
    this.userId = id;
    // A different account, or none: forget the previous account's choice at once.
    this.modeSubject.next(id ? this.read(id) : DEFAULT_EDITOR_MODE);
  }

  private storageKey(userId: string): string {
    return `geogami.editorMode.v1:${environment.apiURL}:${userId}`;
  }

  private storage(): Storage | null {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  private read(userId: string): EditorMode {
    try {
      const store = this.storage();
      const stored = store ? store.getItem(this.storageKey(userId)) : null;
      return stored === "simple" || stored === "advanced" ? stored : DEFAULT_EDITOR_MODE;
    } catch (error) {
      return DEFAULT_EDITOR_MODE;
    }
  }

  private persist(mode: EditorMode): void {
    if (!this.userId) {
      return;
    }
    try {
      const store = this.storage();
      if (store) {
        store.setItem(this.storageKey(this.userId), mode);
      }
    } catch (error) {
      // Storage is unavailable or full: the choice stays valid for this session.
    }
  }
}
