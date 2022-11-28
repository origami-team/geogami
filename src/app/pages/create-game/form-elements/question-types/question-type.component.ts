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

    // Multi-player Mode
    @Input() numPlayers: Number;
    @Input() isSinlgeMode: Number;
    @Input() collaborationType: any;

    @Output() questionChange: EventEmitter<any> = new EventEmitter<any>(true);

    questionTypeEnum = QuestionType;
    taskModeEnum = TaskMode;

    constructor(public popoverController: PopoverController, private translate: TranslateService) { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log("changes (QuestionTypeComponent): ", changes);
        if (this.isSinlgeMode) {
            console.log("changes (changes.question.currentValue): ", changes.question.currentValue);
            this.questionChange.emit(changes.question.currentValue);
        } else {
            console.log("changes (changes.question.currentValue): ", changes);
            if(changes.question){
                this.questionChange.emit(changes.question.currentValue);
            } else if (changes.collaborationType){
                // this.onCollTypeChange(changes.collaborationType.currentValue);
            }

        }

    }

    /* multi-player */
    onCollTypeChange(collType: any){
        console.log("collType:", collType)
        if (collType == '1-1') {
            // this.question[0].allHaveSameInstruction = false;
/*             this.question[0].allHasSameInstPhoto = false;
            this.question[0].allHasSameAudio = false;
            this.question[0].allHasSameMarkObj = false; */
        } else if (collType == 'sequential') {
            /* this.question[0].allHaveSameInstruction = true;
            this.question[0].allHasSameInstPhoto = true;
            this.question[0].allHasSameAudio = true;
            this.question[0].allHasSameMarkObj = true; */
        }

    }

    ngOnInit() {

    }

    async showPopover(ev: any, key: string) {
        let text = this.translate.instant(key);
        console.log(ev);
        const popover = await this.popoverController.create({
            component: PopoverComponent,
            event: ev,
            translucent: true,
            componentProps: { text }
        });
        return await popover.present();
    }
}