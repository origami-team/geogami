import { Component, Input, OnInit, SimpleChanges, ViewChild, AfterViewInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

import navtasks from "../../../models/navtasks.js";
import themetasks from "./../../../models/themetasks.json";

import { FieldConfig } from './../../../dynamic-form/models/field-config'
import { DynamicFormComponent } from './../../../dynamic-form/container/dynamic-form.component';
import { MapFeaturesModalPage } from './../map-features-modal/map-features-modal.page';

@Component({
  selector: "app-create-task-modal",
  templateUrl: "./create-task-modal.page.html",
  styleUrls: ["./create-task-modal.page.scss"]
})
export class CreateTaskModalPage implements AfterViewInit {
  @Input() gameName: string = "";
  @Input() type: string = "nav";
  @Input() task: any;

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  config: FieldConfig[]

  tasks: any[]
  selectedTask: any
  confirmation: boolean = true
  mapFeatures: any[]

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    this.tasks = this.type == "nav" ? navtasks : themetasks;

    if (this.task) {
      this.onTaskSelected(this.task)
    } else {
      this.onTaskSelected(this.tasks[0]);
    }
  }

  onTaskSelected(newValue) {
    this.selectedTask = newValue;
    console.log(this.selectedTask);
    this.config = this.selectedTask.developer
  }

  ngAfterViewInit() {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });
  }

  submit(value: { [name: string]: any }) {
    console.log(value);
  }

  async presentMapFeaturesModal() {
    const modal = await this.modalController.create({
      component: MapFeaturesModalPage,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    this.mapFeatures = data.data
    return;
  }

  dismissModal(dismissType: string = 'null') {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }

    // console.log(this.external)
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true,
      data: {
        ...this.selectedTask,
        settings: {
          ...this.form.value,
          confirmation: this.confirmation,
          mapFeatures: this.mapFeatures
        }
      }
    });
  }
}
