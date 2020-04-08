import {
    Component, OnInit, Input, OnChanges, SimpleChanges
} from "@angular/core";

import { AnswerType } from './../../../../models/types'


@Component({
    selector: "answer-type",
    templateUrl: "./answer-type.component.html",
})
export class AnswerTypeComponent implements OnInit, OnChanges {
    @Input() answer: any;

    answerTypeEnum = AnswerType

    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes)
    }

    ngOnInit() {
        // console.log(this.answer)
    }
}
