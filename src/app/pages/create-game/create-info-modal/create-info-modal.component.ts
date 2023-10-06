import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ModalController, PopoverController } from "@ionic/angular";
import { MapFeaturesModalPage } from "./../map-features-modal/map-features-modal.page";
import { QuestionType, AnswerType } from "src/app/models/types";
import { standardMapFeatures } from "src/app/models/standardMapFeatures";
import { cloneDeep } from "lodash";
import { PopoverComponent } from "src/app/popover/popover.component";
import { TranslateService } from "@ngx-translate/core";
import { VirEnvHeaders } from "src/app/models/virEnvsHeader";

@Component({
  selector: "app-create-info-modal",
  templateUrl: "./create-info-modal.component.html",
  styleUrls: ["./create-info-modal.component.scss"],
})
export class CreateInfoModalComponent implements OnInit, OnChanges {
  @Input() task: any;
  // @Input() question: any;

  // VR world
  @Input() isVirtualWorld: boolean;
  @Input() isVRMirrored: boolean;
  @Input() virEnvType: string;
  initialAvatarPositionStatus = false;

  //* get virual environment headers
  virEnvTypesList = VirEnvHeaders;

  @Output() taskChange: EventEmitter<any> = new EventEmitter<any>(true);

  uploading = false;

  constructor(
    public modalController: ModalController,
    public popoverController: PopoverController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    if (this.task == null) {
      this.task = {
        category: "info",
        question: {
          type: QuestionType.INFO,
          text: "",
          photo: "",
          audio: undefined,
        },
        answer: {
          type: AnswerType.INFO,
        },
        settings: {
          confirmation: true,
        },
        mapFeatures: null,
      };
    }

    if (
      this.isVirtualWorld &&
      this.task.question &&
      this.task.question.initialAvatarPosition
    ) {
      this.initialAvatarPositionStatus = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.taskChange.emit(this.task);
  }

  async presentMapFeaturesModal() {
    const modal = await this.modalController.create({
      component: MapFeaturesModalPage,
      backdropDismiss: false,
      componentProps: {
        features: this.task.mapFeatures,
        isVirtualWorld: this.isVirtualWorld,
        isVRMirrored: this.isVRMirrored,
        virEnvType: this.virEnvType,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    this.task.mapFeatures = data.data;
    return;
  }

  dismissModal(dismissType: string = "null") {
    if (this.uploading) {
      return;
    }
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }

    if (this.task.mapFeatures == undefined) {
      this.task.mapFeatures = cloneDeep(standardMapFeatures);
    }

    this.modalController.dismiss({
      dismissed: true,
      data: this.task,
    });

    //* inlclude vir. env. type in task data
    if (this.isVirtualWorld) {
      this.task.virEnvType = this.virEnvType;
    }
  }

  initialAvatarPosToggleChange() {
    //* to remove object from db (when deleting initial position)
    if (
      this.task.question.initialAvatarPosition
    ) {
      this.task.question.initialAvatarPosition = undefined;
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
