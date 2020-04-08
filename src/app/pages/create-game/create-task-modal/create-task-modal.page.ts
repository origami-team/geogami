import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { ModalController } from "@ionic/angular";

import { navtasks } from "../../../models/navigation-tasks";
import themetasks from "./../../../models/theme-tasks";

// import { FieldConfig } from "./../../../dynamic-form/models/field-config";
// import { DynamicFormComponent } from "./../../../dynamic-form/container/dynamic-form.component";
import { MapFeaturesModalPage } from "./../map-features-modal/map-features-modal.page";

@Component({
  selector: "app-create-task-modal",
  templateUrl: "./create-task-modal.page.html",
  styleUrls: ["./create-task-modal.page.scss"]
})
export class CreateTaskModalPage implements OnInit, AfterViewInit {
  @Input() gameName: string = "";
  @Input() type: string = "nav";
  @Input() task: any = {};

  tasks: ReadonlyArray<any>;

  mapFeatures: any = this.task.mapFeatures;

  step: number = 5;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    this.tasks = this.type == "nav" ? navtasks : themetasks;

    if (!this.task) {
      this.task = this.tasks[0]
    }
    this.onTaskSelected(this.task);

    // console.log('qts', new Set(this.tasks.filter(e => e.category === "objectLocalization").map(e => e.questionType)))
    // console.log('ats', new Set(this.tasks.filter(e => e.category === "objectLocalization").map(e => e.answerType)))
  }

  onTaskSelected(newValue) {
    this.task = newValue;

    this.task.settings = {
      feedback: true,
      multipleTries: true,
      confirmation: false,
      accuracy: 10,
      showMarker: true,
      ...this.task.settings
    }

    console.log(this.task);

    this.mapFeatures = this.task.mapFeatures

    if (this.task.category.includes('theme')) {
      this.task.settings.confirmation = true;
    } else {
      this.task.settings.confirmation = false;
    }
  }

  rangeChange() {
    this.step = this.task.settings.accuracy <= 5 ? 1 : 5;
  }

  feedbackChange() {
    if (!this.task.settings.feedback) {
      this.task.settings.multipleTries = false
    }
  }

  selectCompare(task1, task2) {
    if (task1 == null || task2 == null) {
      return false
    }
    return task1.type == task2.type
  }

  ngAfterViewInit() {
    //   let previousValid = this.form.valid;
    //   this.form.changes.subscribe(() => {
    //     if (this.form.valid !== previousValid) {
    //       previousValid = this.form.valid;
    //       this.form.setDisabled("submit", !previousValid);
    //     }
    //   });
  }

  // submit(value: { [name: string]: any }) {
  //   console.log(value);
  // }

  async presentMapFeaturesModal() {
    const modal = await this.modalController.create({
      component: MapFeaturesModalPage,
      backdropDismiss: false,
      componentProps: {
        features: this.mapFeatures
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data != undefined) {
      this.mapFeatures = data.data;
    }
    return;
  }

  dismissModal(dismissType: string = "null") {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }

    this.modalController.dismiss({
      dismissed: true,
      data: {
        ...this.task,
        mapFeatures: this.mapFeatures
      }
    })

    // console.log(this.form.value);

    // this.modalController.dismiss({
    //   dismissed: true,
    //   data: {
    //     ...this.selectedTask,
    //     settings: {
    //       ...this.form.value,
    //       ["answer-type"]: this.form.value["question-type"]
    //         ? this.form.value["question-type"].settings["answer-type"]
    //         : null,
    //       confirmation: this.confirmation,
    //       showMarker: this.showMarker,
    //       mapFeatures: this.mapFeatures,
    //       feedback: this.feedback,
    //       multipleTries: this.multipleTries,
    //       accuracy: this.accuracy
    //     }
    //   }
    // });
  }
}
