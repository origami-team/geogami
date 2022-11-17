import {
    Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter
} from '@angular/core';

import { QuestionType, TaskMode } from './../../../../models/types';
import { PopoverComponent } from 'src/app/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'question-type',
    templateUrl: './question-type.component.html',
})
export class QuestionTypeComponent implements OnInit, OnChanges {
    @Input() question: any;
    @Input() taskType: string;

    // VR world
    @Input() isVirtualWorld: boolean;
    @Input() isVRMirrored: boolean;

    @Output() questionChange: EventEmitter<any> = new EventEmitter<any>(true);

    questionTypeEnum = QuestionType;
    taskModeEnum = TaskMode;

    constructor(public popoverController: PopoverController, private translate: TranslateService) { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        this.questionChange.emit(changes.question.currentValue);
    }

    ngOnInit() {

    }

    async showPopover(ev: any, key: string) {
        let text = this.translate.instant(key);
        // console.log(ev);
        const popover = await this.popoverController.create({
            component: PopoverComponent,
            event: ev,
            translucent: true,
            componentProps: { text }
        });
        return await popover.present();
    }
}