import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EnvTypeQuestionTextComponent } from './env-type-question-text.component';


@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ],
    declarations: [EnvTypeQuestionTextComponent],
    providers: [],
    exports: [EnvTypeQuestionTextComponent]
})
export class EnvTypeQuestionTextModule { }
