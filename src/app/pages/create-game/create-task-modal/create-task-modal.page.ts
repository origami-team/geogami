import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { ModalController } from "@ionic/angular";
import { cloneDeep } from 'lodash';


import { navtasks } from "../../../models/navigation-tasks";
import { themetasks } from "./../../../models/theme-tasks";

import { standardMapFeatures } from "./../../../models/mapFeatures"

// import { FieldConfig } from "./../../../dynamic-form/models/field-config";
// import { DynamicFormComponent } from "./../../../dynamic-form/container/dynamic-form.component";
import { MapFeaturesModalPage } from "./../map-features-modal/map-features-modal.page";
import { QuestionType, AnswerType } from 'src/app/models/types';

@Component({
  selector: "app-create-task-modal",
  templateUrl: "./create-task-modal.page.html",
  styleUrls: ["./create-task-modal.page.scss"]
})
export class CreateTaskModalPage implements OnInit {
  @Input() gameName: string = "";
  @Input() type: string = "nav";
  @Input() task: any = {};

  tasks: any[] = [];

  mapFeatures: any = this.task.mapFeatures;

  step: number = 5;

  objectQuestionSelect: any[] = []
  objectAnswerSelect: any[] = []

  taskTypes: any[] = [
    {
      type: 1,
      text: "Selbst-Lokalisation"
    }, {
      type: 2,
      text: "Objektsuche"
    }, {
      type: 3,
      text: "Richtungssuche"
    }
  ]

  selectedTaskType: any;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    if (this.type == "nav") {
      this.tasks = cloneDeep(navtasks)
    } else {
      this.tasks = cloneDeep(themetasks)
    }

    if (!this.task) {
      this.task = this.tasks[0]
      this.selectedTaskType = this.taskTypes[0]
    } else {
      if (this.task.type.includes('self')) {
        this.selectedTaskType = this.taskTypes[0]
      }
      if (this.task.type.includes('object')) {
        this.selectedTaskType = this.taskTypes[1]
      }
      if (this.task.type.includes('direction')) {
        this.selectedTaskType = this.taskTypes[2]
      }
    }
    this.onTaskSelected(this.task);
  }

  onTaskTypeChange(taskType) {
    if (taskType.type == 1) {
      this.task = this.tasks[0]
    } else if (taskType.type == 2) {
      this.task = this.tasks[1]
    } else {
      this.task = this.tasks[7]
    }
    console.log(this.tasks)
    this.onTaskSelected(this.task)
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

    this.objectQuestionSelect = Array.from(new Set(this.tasks.filter(t => t.type == this.task.type).map(t => t.question.type))).map(t => ({ type: t as QuestionType, text: t }))

    const similarTypes = cloneDeep(themetasks).filter(t => t.type == this.task.type)

    console.log(similarTypes)

    const similarQ = similarTypes.filter(t => t.question.type == this.task.question.type)

    console.log(similarQ)

    this.objectAnswerSelect = Array.from(new Set(similarQ.map(t => ({ type: t.answer.type as AnswerType, text: t.answer.type }))))
  }

  onObjectQuestionSelectChange() {
    const similarTypes = cloneDeep(themetasks).filter(t => t.type == this.task.type)

    console.log(similarTypes)

    const similarQ = similarTypes.filter(t => t.question.type == this.task.question.type)

    console.log(similarQ)

    this.onTaskSelected(similarQ[0])

    this.objectAnswerSelect = Array.from(new Set(similarQ.map(t => ({ type: t.answer.type as AnswerType, text: t.answer.type }))))
  }

  onObjectAnswerSelectChange() {
    const similarTypes = cloneDeep(themetasks).filter(t => t.type == this.task.type)

    console.log(similarTypes)

    const similarQ = similarTypes.filter(t => t.question.type == this.task.question.type && t.answer.type == this.task.answer.type)

    console.log(similarQ)

    this.onTaskSelected(similarQ[0])
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

  taskTypeCompare(task1, task2) {
    if (task1 == null || task2 == null) {
      return false
    }
    return task1.type == task2.type
  }

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

    if (this.mapFeatures == undefined) {
      this.mapFeatures = cloneDeep(standardMapFeatures)
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
