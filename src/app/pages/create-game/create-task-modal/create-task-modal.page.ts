import { Component, Input, OnInit, SimpleChanges, ViewChild, AfterViewInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

import navtasks from "./../../../models/navtasks.json";
import themetasks from "./../../../models/themetasks.json";

import { FormGroup, FormControl } from "@angular/forms";

import { Validators } from '@angular/forms';

import { FieldConfig } from './../../../dynamic-form/models/field-config'
import { DynamicFormComponent } from './../../../dynamic-form/container/dynamic-form.component';

@Component({
  selector: "app-create-task-modal",
  templateUrl: "./create-task-modal.page.html",
  styleUrls: ["./create-task-modal.page.scss"]
})
export class CreateTaskModalPage implements AfterViewInit {
  @Input() gameName: string = "";
  @Input() type: string = "nav";

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  config: FieldConfig[] = [
    {
      type: 'map',
      label: 'Map one',
      name: 'map-one',
    },
    {
      type: 'input',
      label: 'input one',
      name: 'input-one',
      placeholder: 'Enter your name',
      validation: [Validators.required, Validators.minLength(4)]
    },
    {
      type: 'map',
      label: 'Map two',
      name: 'map-two',
    },
  ];

  constructor(public modalController: ModalController) { }

  // ngOnInit() {
  //   this.tasks = this.type == "nav" ? navtasks : themetasks;

  //   this.onTaskSelected(this.tasks[0]);
  // }

  // onTaskSelected(newValue) {
  //   this.selectedTask = newValue;
  //   console.log(this.selectedTask);

  //   this.elements = this.selectedTask.developer;

  //   this.taskForm = new FormGroup({
  //     taskType: new FormControl(""),
  //     taskName: new FormControl(""),
  //     ...this.elements
  //       .filter(e => e.type != "info")
  //       .reduce((obj, item) => {
  //         obj[item.type] = new FormControl("");
  //         return obj;
  //       }, {})
  //   });

  //   console.log(this.taskForm);
  // }

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
      data: null
    });
  }
}
