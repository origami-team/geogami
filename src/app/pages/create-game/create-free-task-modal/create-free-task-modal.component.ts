



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
import { QuestionType, AnswerType, TaskMode } from 'src/app/models/types';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';


@Component({
  selector: 'app-create-free-task-modal',
  templateUrl: './create-free-task-modal.component.html',
  styleUrls: ['./create-free-task-modal.component.scss'],
})
export class CreateFreeTaskModalComponent implements OnInit {
  @Input() gameName: string = "";
  @Input() task: any = {};

  tasks: any[] = [];

  mapFeatures: any = this.task.mapFeatures;

  showFeedback: boolean = true;
  showMultipleTries: boolean = true;

  selectedTaskType: any;

  objectQuestionSelect: any[] = [QuestionType.TEXT, QuestionType.MAP_FEATURE]
  objectAnswerSelect: any[] = [AnswerType.MULTIPLE_CHOICE, AnswerType.PHOTO]

  constructor(public modalController: ModalController, public popoverController: PopoverController) { }

  ngOnInit() {
    if (this.task == null) {
      this.task = {
        name: "Freie Aufgabe",
        type: "free",
        category: "free",
        question: {
          type: QuestionType.TEXT,
          text: ""
        },
        answer: {
          type: AnswerType.MULTIPLE_CHOICE,
        }
      }

      this.task.settings = {
        feedback: true,
        multipleTries: true,
        confirmation: this.task.category.includes('theme'),
        accuracy: 10,
        showMarker: true,
      }

      console.log(this.task)

      // this.settingsChange();

    }
  }

  feedbackChange() {
    this.task.settings.multipleTries = this.task.settings.feedback
    if (this.task.category == 'nav' && !this.task.settings.confirmation) {
      this.showMultipleTries = false;
      this.task.settings.multipleTries = false;
    }
  }

  settingsChange(event: any = undefined) {
    this.showFeedback = true;
    this.showMultipleTries = true;

    if (this.task.category == 'nav' && !this.task.settings.confirmation) {
      this.showMultipleTries = false;
      this.task.settings.multipleTries = false;
    }

    if (this.task.category == 'nav' && event === true) {
      this.showMultipleTries = true;
      this.task.settings.multipleTries = true;
    }

    if (this.task.answer.type == AnswerType.PHOTO) {
      this.task.settings.feedback = false;

      this.showFeedback = false;
      this.showMultipleTries = false;
    }

    if (this.task.answer.mode == TaskMode.NAV_ARROW ||
      this.task.question.type == QuestionType.NAV_INSTRUCTION ||
      this.task.answer.type == AnswerType.PHOTO ||
      this.task.type == 'nav-flag' && !this.task.settings.confirmation) {
      this.task.settings.multipleTries = false;

      this.showMultipleTries = false;
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
  }

  async showPopover(ev: any, text: string) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }
}
