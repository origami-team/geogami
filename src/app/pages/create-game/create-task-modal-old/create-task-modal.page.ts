import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ModalController } from "@ionic/angular";

import navtasks from "./../../../models/navtasks.json";
import themetasks from "./../../../models/themetasks.json";

import { FormGroup, FormControl } from "@angular/forms";

@Component({
  selector: "app-create-task-modal",
  templateUrl: "./create-task-modal.page.html",
  styleUrls: ["./create-task-modal.page.scss"]
})
export class CreateTaskModalPage implements OnInit {
  @Input() gameName: string = "";
  @Input() type: string = "nav";

  tasks: any;
  selectedTask: any;
  elements: any[];

  taskForm: FormGroup;

  external: any

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    this.tasks = this.type == "nav" ? navtasks : themetasks;

    this.onTaskSelected(this.tasks[0]);
  }

  onTaskSelected(newValue) {
    this.selectedTask = newValue;
    console.log(this.selectedTask);

    this.elements = this.selectedTask.developer;

    this.taskForm = new FormGroup({
      taskType: new FormControl(""),
      taskName: new FormControl(""),
      ...this.elements
        .filter(e => e.type != "info")
        .reduce((obj, item) => {
          obj[item.type] = new FormControl("");
          return obj;
        }, {})
    });

    console.log(this.taskForm);
  }

  dismissModal(dismissType: string = 'null') {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }

    console.log(this.external)
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true,
      data: {
        task: this.selectedTask,
        information: this.taskForm
      }
    });
  }
}
