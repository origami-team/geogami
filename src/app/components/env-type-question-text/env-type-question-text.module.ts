import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EnvTypeQuestionTextComponent } from './env-type-question-text.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        TranslateModule
    ],
    declarations: [EnvTypeQuestionTextComponent],
    providers: [],
    exports: [EnvTypeQuestionTextComponent]
})
export class EnvTypeQuestionTextModule { }
