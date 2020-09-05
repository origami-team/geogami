import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from "@angular/core";
import { ModalController } from "@ionic/angular";
import { cloneDeep } from 'lodash';


import { navtasks } from "../../../models/navigation-tasks";
import { themetasks } from "./../../../models/theme-tasks";

import { standardMapFeatures } from "../../../models/standardMapFeatures"

// import { FieldConfig } from "./../../../dynamic-form/models/field-config";
// import { DynamicFormComponent } from "./../../../dynamic-form/container/dynamic-form.component";
import { MapFeaturesModalPage } from "./../map-features-modal/map-features-modal.page";
import { QuestionType, AnswerType, TaskMode } from 'src/app/models/types';
import { PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/popover/popover.component';
import { AddBeaconPage } from '../../ibeacon/beacon-settings/add-beacon/add-beacon.page';
import { GamesService } from 'src/app/services/games.service';
import { BeaconInfo } from 'src/app/models/ibeacon/beaconInfo';
import { Storage } from '@ionic/storage';


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

  showFeedback: boolean = true;
  showMultipleTries: boolean = true;

  step: number = 5;

  objectQuestionSelect: any[] = []
  objectAnswerSelect: any[] = []

  freeQuestionSelect: any[] = [QuestionType.TEXT, QuestionType.MAP_FEATURE_FREE, QuestionType.PHOTO]
  freeAnswerSelect: any[] = [AnswerType.MULTIPLE_CHOICE, AnswerType.PHOTO, AnswerType.MULTIPLE_CHOICE_TEXT, AnswerType.TEXT, AnswerType.NUMBER]

  taskTypes: any[] = [
    {
      type: 1,
      text: "Selbst-Lokalisation"
    }, {
      type: 2,
      text: "Objekt-Lokalisation"
    }, {
      type: 3,
      text: "Richtungsbestimmung"
    }, {
      type: 4,
      text: "Freie Aufgabe"
    }
  ]

  selectedTaskType: any;

  objectQuestionTemplate = [QuestionType.MAP_FEATURE, QuestionType.MAP_FEATURE_PHOTO, QuestionType.MAP_DIRECTION_MARKER, QuestionType.MAP_DIRECTION, QuestionType.MAP_DIRECTION_PHOTO, QuestionType.TEXT]

  viewDirectionSetPosition: boolean = false;
  /*  */
  beaconsStoredList: BeaconInfo[];
  /*  */


  constructor(
    public modalController: ModalController,
    public popoverController: PopoverController,
    private gameService: GamesService,
    public storage: Storage,
    private changeDetectorRef: ChangeDetectorRef

  ) { }

  ngOnInit() {
    if (this.type == "nav") {
      this.tasks = cloneDeep(navtasks)
    } else {
      this.tasks = cloneDeep(themetasks)
    }

    if (this.task == null) {
      this.task = this.tasks[0]
      this.selectedTaskType = this.taskTypes[0]

      this.task.settings = {
        feedback: true,
        multipleTries: true,
        confirmation: this.task.category.includes('theme'),
        accuracy: 10,
        showMarker: true,
        keepMarker: false
      }

      this.settingsChange();

    } else {
      if (this.task.type.includes('loc')) {
        this.selectedTaskType = this.taskTypes[0]
      }
      if (this.task.type.includes('object')) {
        this.selectedTaskType = this.taskTypes[1]
      }
      if (this.task.type.includes('direction')) {
        this.selectedTaskType = this.taskTypes[2]
      }
      if (this.task.type.includes('free')) {
        this.selectedTaskType = this.taskTypes[3]
      }
    }
    // this.onTaskSelected(this.task);
    this.onTaskSelected(cloneDeep(this.task));
  }

  ionViewWillEnter() {
    // Update beacon list
    this.getBeaconInfoFromServer();
  }

  onTaskTypeChange(taskType) {
    if (taskType.type == 1) {
      this.task = this.tasks[0]
    } else if (taskType.type == 2) {
      this.task = this.tasks[1]
    } else if (taskType.type == 3) {
      this.task = this.tasks[7]
    } else {
      this.task = {
        name: "Freie Aufgabe",
        type: "free",
        category: "theme",
        question: {
          type: QuestionType.TEXT,
          text: ""
        },
        answer: {
          type: AnswerType.MULTIPLE_CHOICE,
        }
      }
    }
    this.onTaskSelected(this.task)
  }

  onTaskSelected(newValue) {
    this.task = newValue;

    if (!this.task.settings || Object.keys(this.task.settings).length == 0) {
      this.task.settings = {
        feedback: true,
        multipleTries: true,
        confirmation: this.task.category.includes('theme'),
        accuracy: 10,
        showMarker: true,
        keepMarker: false
      }
    }

    this.settingsChange()

    this.mapFeatures = this.task.mapFeatures

    if (this.task.type == "free") {
      this.objectQuestionSelect = this.freeQuestionSelect.map(t => ({ type: t as QuestionType, text: t }))
      this.objectAnswerSelect = this.freeAnswerSelect.map(t => ({ type: t as AnswerType, text: t }))

      if (this.task.answer.type == AnswerType.PHOTO || this.task.answer.type == AnswerType.TEXT) {
        this.task.settings.feedback = false;
        this.task.settings.multipleTries = false;
        this.showFeedback = false;
        this.showMultipleTries = false;
      }

    } else {
      this.objectQuestionSelect = Array.from(new Set(this.tasks.filter(t => t.type == this.task.type).map(t => t.question.type)))
        .map(t => ({ type: t as QuestionType, text: t }))
        .sort((a, b) => (this.objectQuestionTemplate.indexOf(a.type) - this.objectQuestionTemplate.indexOf(b.type)))

      const similarTypes = cloneDeep(themetasks).filter(t => t.type == this.task.type)

      const similarQ = similarTypes.filter(t => t.question.type == this.task.question.type)

      this.objectAnswerSelect = Array.from(new Set(similarQ.map(t => ({ type: t.answer.type as AnswerType, text: t.answer.type }))))
    }

    if (this.task.type == 'theme-direction' && this.task.question.type == 'TEXT' && this.task.answer.type == 'MAP_DIRECTION') {
      if (this.task.question.direction == undefined) {
        this.task.question.direction = {}
      }
      if (this.task.question.direction.position != undefined) {
        this.viewDirectionSetPosition = true;
      } else {
        this.viewDirectionSetPosition = false
      }
    }

  }

  onObjectQuestionSelectChange() {
    if (this.task.type != 'free') {
      const similarTypes = cloneDeep(themetasks).filter(t => t.type == this.task.type)

      const similarQ = similarTypes.filter(t => t.question.type == this.task.question.type)

      this.onTaskSelected(similarQ[0])

      this.objectAnswerSelect = Array.from(new Set(similarQ.map(t => ({ type: t.answer.type as AnswerType, text: t.answer.type }))))
    }
  }

  onObjectAnswerSelectChange() {
    if (this.task.type != 'free') {
      const similarTypes = cloneDeep(themetasks).filter(t => t.type == this.task.type)

      const similarQ = similarTypes.filter(t => t.question.type == this.task.question.type && t.answer.type == this.task.answer.type)

      this.onTaskSelected(similarQ[0])
    }

    if (this.task.answer.type == AnswerType.PHOTO || this.task.answer.type == AnswerType.TEXT) {
      this.task.settings.feedback = false;
      this.task.settings.multipleTries = false;
      this.showFeedback = false;
      this.showMultipleTries = false;
    } else {
      this.task.settings.feedback = true;
      this.task.settings.multipleTries = true;
      this.showFeedback = true;
      this.showMultipleTries = true;
    }
  }

  rangeChange() {
    this.step = this.task.settings.accuracy <= 5 ? 1 : 5;
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

    if (this.task.type == 'nav-text' && !this.task.settings.showMarker) {
      this.task.settings.keepMarker = false
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

    if (this.task.settings.accuracy > 5 && this.task.settings.accuracy < 10) {
      this.task.settings.accuracy = 5
    }

    if (this.task.question.area?.features?.length <= 0) {
      this.task.question.area = undefined
    }

    if (this.task.type == 'theme-direction' && this.task.question.type == 'TEXT' && this.task.answer.type == 'MAP_DIRECTION') {
      if (this.viewDirectionSetPosition == false) {
        this.task.question.direction.position = undefined;
      }
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

  /* iBeacon */
  async presentAddBeaconInfo() {
    const modal = await this.modalController.create({
      component: AddBeaconPage,
      backdropDismiss: false,
      componentProps: {
        //features: this.mapFeatures
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

    this.getBeaconInfoFromServer();

    //if (data != undefined) {
    //this.mapFeatures = data.data;
    //}
    return;
  }

  onBeaconSelected() {
    if (this.task.iBeacon) {
      this.getBeaconInfoFromServer()
    }
  }

  onBeaconInfoSelectChange(event) {
    console.log('this.task.minor', this.task.beaconInfo.minor)
  }

  selectCompareBeacon(task1, task2) {
    return task1 && task2 ? task1.id == task2.id : task1 == task2;
  }

  getBeaconInfoFromServer() {
    console.info('getBeaconInfoFromServer');
    // Retrieve beacons info from server
    this.gameService.getBeaconInfo()
      .then(data => {
        console.log('data: length ', data.length)
        if (data != null && data.length > 0) {
          this.beaconsStoredList = data;

          // Store info in local storage
          this.storage.set('beacon_info_list', this.beaconsStoredList);
        }
      }).catch(e => {
        console.error('(strored-beacons-page), ', e['error'].message);
      }).finally(() => {

        if (this.task.beaconInfo.minor != undefined) {
          // Make selected beacon info first 
          let temp = this.beaconsStoredList.find(i => (i.minor == this.task.beaconInfo.minor))
          this.beaconsStoredList.splice(this.beaconsStoredList.indexOf(temp), 1)
          this.beaconsStoredList.unshift(temp)
        } else if (this.beaconsStoredList.length > 0 ) {
            this.task.beaconInfo = this.beaconsStoredList[0]
          }
      });
  }
  /*  */
}
