import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { EditorFeatureDirective } from "./editor-feature.directive";
import { EditorModeSwitchComponent } from "./editor-mode-switch.component";

/**
 * The Simple / Advanced switch and the directive that shows/hides controls.
 * Import it wherever a template uses `<app-editor-mode-switch>` or `*editorFeature`.
 */
@NgModule({
  imports: [CommonModule, IonicModule, TranslateModule],
  declarations: [EditorModeSwitchComponent, EditorFeatureDirective],
  exports: [EditorModeSwitchComponent, EditorFeatureDirective],
})
export class EditorVisibilityModule {}
