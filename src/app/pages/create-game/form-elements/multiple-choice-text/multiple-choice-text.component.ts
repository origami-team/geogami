import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from "@angular/core";

@Component({
  selector: "app-multiple-choice-text",
  templateUrl: "./multiple-choice-text.component.html",
  styleUrls: ["./multiple-choice-text.component.scss"],
})
export class MultipleChoiceTextComponent implements OnInit {
  @Input() answers: String[] = ["", "", "", ""];
  @Input() hints?: String[] = [
    "",
    "Probiere es noch einmal.",
    "Probiere es noch einmal.",
    "Probiere es noch einmal.",
  ];
  @Input() feedback: boolean;

  @Output() answersChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() hintsChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {
    if (this.answers == undefined) {
      this.answers = ["", "", "", ""];
    }
    if (this.hints == undefined) {
      this.hints = [
        "Probiere es noch einmal.",
        "Probiere es noch einmal.",
        "Probiere es noch einmal.",
        "Probiere es noch einmal.",
      ];
    }
  }

  onChange() {
    this.answersChange.emit(this.answers);
    this.hintsChange.emit(this.hints);
  }
}
