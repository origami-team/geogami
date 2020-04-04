import {
    Component, OnInit, Input, OnChanges, SimpleChanges
} from "@angular/core";

@Component({
    selector: "question-type",
    template: `<p>{{ question.text | json }}</p>`,
})
export class QuestionTypeComponent implements OnInit, OnChanges {
    @Input() question: any;

    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes)
    }

    ngOnInit() {
        console.log(this.question)
    }
}
