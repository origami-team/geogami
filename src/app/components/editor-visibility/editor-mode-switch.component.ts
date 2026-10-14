import { Component, HostBinding, Input } from "@angular/core";
import { EditorMode } from "../../models/editor-features";
import { EditorModeService } from "../../services/editor-mode.service";

let nextInfoId = 0;

/**
 * The Simple / Advanced switch, placed at the top of the save screens and the
 * task, information and Map features dialogs (the task lists do not need it). It is a view switch within the same editor: it changes what is shown,
 * never what is stored.
 *
 * Next to the switch is an information button that explains the two views. When
 * the thing being edited uses settings that only Advanced shows, a notice with a
 * "Review settings" button points them out (`advancedInUse`, see
 * helpers/editor-advanced-usage.ts) — otherwise those settings would be invisible.
 */
@Component({
  selector: "app-editor-mode-switch",
  templateUrl: "./editor-mode-switch.component.html",
  styleUrls: ["./editor-mode-switch.component.scss"],
})
export class EditorModeSwitchComponent {
  /** Catalogue ids the edited task/game uses that Simple hides. */
  @Input() advancedInUse: string[] = [];
  /** What the notice talks about. */
  @Input() subject: "task" | "game" = "task";
  /**
   * Keeps the switch (and its explanation) at the top of the scrolling area, so the
   * view can be changed after scrolling down. For an `ion-content` with the default
   * padding, i.e. the dialogs. Usable as a bare attribute: `<app-editor-mode-switch sticky>`.
   */
  @Input() sticky: boolean | "" = false;

  @HostBinding("class.sticky") get isSticky(): boolean {
    return this.sticky === true || this.sticky === "";
  }

  infoOpen = false;
  readonly infoId = `editor-mode-info-${nextInfoId++}`;

  constructor(public editorMode: EditorModeService) {}

  get mode(): EditorMode {
    return this.editorMode.mode;
  }

  get showNotice(): boolean {
    return this.mode === "simple" && !!this.advancedInUse && this.advancedInUse.length > 0;
  }

  onModeChange(event: any): void {
    const value = event && event.detail ? event.detail.value : undefined;
    if (value === "simple" || value === "advanced") {
      this.editorMode.setMode(value);
    }
  }

  toggleInfo(): void {
    this.infoOpen = !this.infoOpen;
  }

  /** Switches to Advanced where the notice's settings can be reviewed; nothing is lost. */
  reviewSettings(): void {
    this.editorMode.setMode("advanced");
  }
}
