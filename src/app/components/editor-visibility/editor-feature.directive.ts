import {
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { EditorVisibilityService } from "../../services/editor-visibility.service";

/**
 * Shows a control only when the Simple / Advanced view and the policy allow it:
 *
 *   <ion-item *editorFeature="'map.zoom'"> … </ion-item>
 *
 * It only adds the view filter. The control's own `*ngIf` (role, task type, …)
 * stays where it is — put this on a wrapping `<ng-container>` — so Advanced can
 * never reveal something the existing conditions hide.
 *
 * `editorFeatureKeep` marks a control that must stay when the current value needs
 * it (see EditorVisibilityService.isVisible). Hiding only removes the control from
 * the page: the value it edits lives in the task/game model and is not touched.
 */
@Directive({
  selector: "[editorFeature]",
})
export class EditorFeatureDirective implements OnInit, OnChanges, OnDestroy {
  @Input("editorFeature") featureId: string;
  @Input("editorFeatureKeep") keep = false;

  private subscription: Subscription;
  private shown = false;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private visibility: EditorVisibilityService
  ) {}

  ngOnInit(): void {
    this.subscription = this.visibility.changes$.subscribe(() => this.update());
  }

  ngOnChanges(): void {
    this.update();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private update(): void {
    const visible = this.visibility.isVisible(this.featureId, this.keep);
    if (visible && !this.shown) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.shown = true;
    } else if (!visible && this.shown) {
      this.viewContainer.clear();
      this.shown = false;
    }
  }
}
