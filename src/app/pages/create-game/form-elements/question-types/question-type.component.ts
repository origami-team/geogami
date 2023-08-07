import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";

import { QuestionType, TaskMode } from "./../../../../models/types";
import { PopoverComponent } from "src/app/popover/popover.component";
import { PopoverController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "question-type",
  templateUrl: "./question-type.component.html",
})
export class QuestionTypeComponent implements OnInit, OnChanges {
  @Input() question: any;
  @Input() taskType: string;

  // VR world
  @Input() isVirtualWorld: boolean;
  @Input() isVRMirrored: boolean;
  @Input() virEnvType: string;

  // Multi-player Mode
  @Input() numPlayers: Number;
  @Input() isSingleMode: Number;
  @Input() collaborationType: any;

  @Output() questionChange: EventEmitter<any> = new EventEmitter<any>(true);

  questionTypeEnum = QuestionType;
  taskModeEnum = TaskMode;

  initialAvatarPositionStatus = false;

  constructor(
    public popoverController: PopoverController,
    private translate: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes (changes): ", changes);
    if (this.isSingleMode) {
      // console.log("changes (changes.question.currentValue): ", changes.question.currentValue);
      if (changes.question) {
        this.questionChange.emit(changes.question.currentValue);
      }
    } else {
      // console.log("changes (changes.question.currentValue): ", changes);
      if (changes.question) {
        this.questionChange.emit(changes.question.currentValue);
      }
    }
  }

  /* multi-player */
  onCollTypeChange(collType: any) {
    console.log("collType:", collType);
  }

  ngOnInit() {
    if (
      this.isVirtualWorld &&
      this.question &&
      this.question.initialAvatarPosition
    ) {
      console.log("----question: ", this.question);
      this.initialAvatarPositionStatus = true;
    }
  }

  initialAvatarPosToggleChange() {
    //* to remove object from db (when deleting initial position)
    if (
      !this.initialAvatarPositionStatus &&
      this.question.initialAvatarPosition
    ) {
      this.question.initialAvatarPosition = undefined;
    }
  }

  async showPopover(ev: any, key: string) {
    let text = this.translate.instant(key);
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text },
    });
    return await popover.present();
  }
}
