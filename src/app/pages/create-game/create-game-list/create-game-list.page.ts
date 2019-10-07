import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { IonReorderGroup } from '@ionic/angular';


import mapboxgl from "mapbox-gl";

import { ModalController } from "@ionic/angular";

import { GameFactoryService } from "../../../services/game-factory.service";

import { CreateTaskModalPage } from "./../create-task-modal/create-task-modal.page";

import { CreateModuleModalPage } from "./../create-module-modal/create-module-modal.page";
import { Game } from "src/app/models/game";

@Component({
  selector: "app-create-game-list",
  templateUrl: "./create-game-list.page.html",
  styleUrls: ["./create-game-list.page.scss"]
})
export class CreateGameListPage implements OnInit {
  name: String;
  tasks: any[] = [];
  game: Game;

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  // dismiss modal on hardware back button
  @HostListener('document:ionBackButton', ['$event'])
  private async overrideHardwareBackAction($event: any) {
    await this.modalController.dismiss();
  }

  constructor(
    private gameFactory: GameFactoryService,
    public modalController: ModalController
  ) { }


  ngOnInit() {
    this.game = this.gameFactory.getGame();
    this.name = this.gameFactory.game ? this.gameFactory.game.name : "";

    console.log(this.gameFactory.game);
  }

  ionViewWillEnter() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA";

    const map = new mapboxgl.Map({
      container: "create-game-map",
      style: "mapbox://styles/mapbox/streets-v9",
      center: [8, 51.8],
      zoom: 2
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      fitBoundsOptions: {
        maxZoom: 14
      },
      trackUserLocation: true
    });
    map.addControl(geolocate);

    // let watch = this.geolocation.watchPosition();
    // watch.subscribe((data) => {
    //   console.log(data)
    // });

    // Add geolocate control to the map.

    map.on("load", () => {
      geolocate.trigger();
    });
  }

  async presentTaskModal(type: string = "nav", index: number) {
    const modal = await this.modalController.create({
      component: CreateTaskModalPage,
      componentProps: {
        gameName: this.name,
        type: type
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if (data != undefined) {
      this.addTaskToGame(data.data.task, index);
    }
    return;
  }

  addTaskToGame(task, index) {
    this.gameFactory.addTask(
      { ...task, id: Math.floor(Date.now() / 1000) },
      index
    );
    this.game = this.gameFactory.getGame();

    this._generateTaskArray();

    console.log(this.tasks);
  }

  deleteTask(taskID) {
    console.log("deleting", taskID);
    this.game = this.gameFactory.removeTask(taskID);

    this._generateTaskArray();
  }

  _generateTaskArray() {
    let tempTasksArr = [];
    let lastNavTask = null;
    this.tasks = [];

    this.game.tasks.forEach((task, key, arr) => {
      if (task.type.includes("nav")) {
        // first element
        if (Object.is(0, key)) {
          lastNavTask = task;
        } else {
          this.tasks.push({ ...lastNavTask, tasks: tempTasksArr });
          lastNavTask = task;
          tempTasksArr = [];
        }
      }

      if (task.type.includes("theme")) {
        tempTasksArr.push(task);
      }
      // last element
      if (Object.is(this.game.tasks.length - 1, key)) {
        this.tasks.push({ ...lastNavTask, tasks: tempTasksArr });
        return;
      }
    });

    // for (let i = 0; i <= this.game.tasks.length; i++) {
    //   const task = this.game.tasks[i];
    //   if (task.type.includes("nav")) {
    //     this.tasks.push({ ...lastNavTask, tasks: tempTasksArr });
    //     lastNavTask = task;
    //     tempTasksArr = [];
    //     // if last element is nav task without theme tasks
    //     if (i == this.game.tasks.length) {
    //       this.tasks.push({ ...lastNavTask, tasks: tempTasksArr });
    //     }
    //   }
    //   if (task.type.includes("theme")) {
    //     tempTasksArr.push(task);
    //   }
    // }
  }

  doReorder(ev: any) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

    // Before complete is called with the items they will remain in the
    // order before the drag
    console.log('Before complete', this.game.tasks);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    // this.game.tasks = ev.detail.complete(this.game.tasks);

    ev.detail.complete(true);

    // After complete is called the items will be in the new order
    console.log('After complete', this.game.tasks);
  }
}
