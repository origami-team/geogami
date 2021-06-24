import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-multiple-choice-text',
  templateUrl: './multiple-choice-text.component.html',
  styleUrls: ['./multiple-choice-text.component.scss'],
})
export class MultipleChoiceTextComponent implements OnInit {

  @Input() answers: String[] = ['', '', '', ''];

  @Output() answersChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if (this.answers == undefined) {
      this.answers = ['', '', '', ''];
    }
  }

  onChange() {
    this.answersChange.emit(this.answers);
  }
}
