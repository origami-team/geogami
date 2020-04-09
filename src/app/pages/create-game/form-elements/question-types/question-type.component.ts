import {
    Component, OnInit, Input, OnChanges, SimpleChanges
} from "@angular/core";

import { QuestionType } from './../../../../models/types'
import { PopoverComponent } from 'src/app/popover/popover.component';
import { PopoverController } from '@ionic/angular';


@Component({
    selector: "question-type",
    templateUrl: "./question-type.component.html",
})
export class QuestionTypeComponent implements OnInit, OnChanges {
    @Input() question: any;

    questionTypeEnum = QuestionType

    constructor(public popoverController: PopoverController) { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes)
    }

    ngOnInit() {
        // console.log(this.question)
    }

    async showPopover(ev: any, text: string) {
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
