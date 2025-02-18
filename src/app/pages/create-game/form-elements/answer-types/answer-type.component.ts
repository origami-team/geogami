import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";

import { AnswerType } from "./../../../../models/types";
import { PopoverController } from "@ionic/angular";
import { PopoverComponent } from "src/app/popover/popover.component";
import { TranslateService } from "@ngx-translate/core";
import { virEnvLayers } from "src/app/models/virEnvsLayers";


@Component({
  selector: "answer-type",
  templateUrl: "./answer-type.component.html",
})
export class AnswerTypeComponent implements OnInit, OnChanges {
  @Input() answer: any;
  @Input() taskType: any;
  @Input() settings: any;

  // VR world
  @Input() isVirtualWorld: boolean;
  @Input() isVRMirrored: boolean;
  @Input() virEnvType: string;

  // VE building 
  @Input() isVEBuilding: boolean;
  @Input() selectedFloor: string;
  // Note: used to notify parrent comp. when there's a change in child
  // see: https://stackoverflow.com/questions/57707055/angular-changing-input-from-child-component-doesnt-notify-the-parent-that-i
  @Output() selectedFloorChange=new EventEmitter();

  //* Get virtual environment layers
  virEnvLayers = virEnvLayers;

  // Multi-player Mode
  @Input() numPlayers: Number;
  @Input() isSingleMode: boolean;
  @Input() collaborationType: any;

  @Output() answerChange: EventEmitter<any> = new EventEmitter<any>(true);

  answerTypeEnum = AnswerType;

  constructor(public popoverController: PopoverController, private translate: TranslateService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isSingleMode) {
      // // console.log("changes (answerTypeComponent): ", changes);
      if (changes.answer) {
        this.answerChange.emit(changes.answer.currentValue);
      }
    } else {
      if (changes.answer) {
        this.answerChange.emit(changes.answer.currentValue);
      }
    }
  }

  ngOnInit() { }

  async showPopover(ev: any, key: string) {
    let text = this.translate.instant(key);

  // console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

  onFloorChanged(){
    this.selectedFloorChange.emit(this.selectedFloor);
  }
}
