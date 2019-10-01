import { Component, OnInit } from "@angular/core";

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
  tasks: any[];
  game: Game;

  constructor(
    private gameFactory: GameFactoryService,
    public modalController: ModalController
  ) {}

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

  async presentTaskModal(type: string = "nav") {
    console.log(type);
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
      this.addTaskToGame(data.data.task);
    }
    return;
  }

  addTaskToGame(task) {
    this.gameFactory.addTask({ ...task, id: Math.floor(Date.now() / 1000) });
    this.game = this.gameFactory.getGame();
    console.log(this.game);
    // this.tasks = this.gameFactory.game.tasks;

    // console.log(this.tasks);
  }

  deleteTask(taskID) {
    console.log("deleting", taskID);
    this.game = this.gameFactory.removeTask(taskID);
  }
}
