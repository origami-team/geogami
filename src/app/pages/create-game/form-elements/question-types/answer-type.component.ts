import {
    Component, OnInit, Input, OnChanges, SimpleChanges
} from "@angular/core";

@Component({
    selector: "answer-type",
    template: `<div>
    <app-map></app-map>
    <p>{{ answer | json}}</p>
    </div>`,
})
export class AnswerTypeComponent implements OnInit, OnChanges {
    @Input() answer: any;

    constructor() { }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes)
    }

    ngOnInit() {
        console.log(this.answer)
    }
}
