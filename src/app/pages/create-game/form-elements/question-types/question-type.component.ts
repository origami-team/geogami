import {
    Component, OnInit, Input, OnChanges, SimpleChanges
} from "@angular/core";

import { QuestionType } from './../../../../models/types'


@Component({
    selector: "question-type",
    templateUrl: "./question-type.component.html",
})
export class QuestionTypeComponent implements OnInit, OnChanges {
    @Input() question: any;

    questionTypeEnum = QuestionType

    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes)
    }

    ngOnInit() {
        // console.log(this.question)
    }
}
