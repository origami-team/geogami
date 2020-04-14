import {
    Component, OnInit, Input, OnChanges, SimpleChanges
} from "@angular/core";

import { AnswerType } from './../../../../models/types'
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';


@Component({
    selector: "answer-type",
    templateUrl: "./answer-type.component.html",
})
export class AnswerTypeComponent implements OnInit, OnChanges {
    @Input() answer: any;

    answerTypeEnum = AnswerType

    constructor(public popoverController: PopoverController) { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes)
    }

    ngOnInit() {
        // console.log(this.answer)
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
