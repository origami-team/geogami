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
import { VirEnvHeaders } from "src/app/models/virEnvsHeader";
import { UtilService } from "src/app/services/util.service";
import { virEnvLayers } from "src/app/models/virEnvsLayers";
import { VEBuildingUtilService } from "src/app/services/ve-building-util.service";

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
  @Input() isSingleMode: boolean;

  // VE building
  public isVEBuilding = false;
  @Input() selectedFloor;
  @Output() selectedFloorChange = new EventEmitter();
  //* get virual environment headers
  virEnvLayers = virEnvLayers;

  //* get virual environment headers
  virEnvTypesList = VirEnvHeaders;

  @Output() taskChange: EventEmitter<any> = new EventEmitter<any>(true);

  uploading = false;

  constructor(
    public modalController: ModalController,
    public popoverController: PopoverController,
    public utilService: UtilService,
    private veBuildingUtilService: VEBuildingUtilService
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

    // Set default avatar-speed and building floor of new tasks
    if (this.isVirtualWorld) {
      if (!this.task.settings.avatarSpeed) {
        this.task.settings.avatarSpeed =
          virEnvLayers[this.virEnvType].defaultAvatarSpeed ?? 2;
      }
      // check wether selected VE is a building
      this.isVEBuilding = this.veBuildingUtilService.checkVEBuilding(
        this.virEnvType
      );
      // set default floor for new tasks only (not stored ones/when editing a task)
      if (this.isVEBuilding && !this.selectedFloor) {
        this.selectedFloor = this.veBuildingUtilService.setInitialFloor(
          this.virEnvType
        );
      }
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

    //* inlclude is building properties in task data
    if (this.isVEBuilding) {
      this.task.isVEBuilding = this.isVEBuilding;
      this.task.floor = this.selectedFloor;
    }
  }

  // TODO: Do we sill need it??
  initialAvatarPosToggleChange() {
    //* to remove object from db (when deleting initial position)
    if (this.task.question.initialAvatarPosition) {
      this.task.question.initialAvatarPosition = undefined;
    }
  }
  
  onFloorChanged(){
    this.selectedFloorChange.emit(this.selectedFloor);
  }
}
