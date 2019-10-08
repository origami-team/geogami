import { Component, OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl';

import { ModalController } from '@ionic/angular';

import { GameFactoryService } from '../../../services/game-factory.service'

import { CreateTaskModalPage } from './../create-task-modal/create-task-modal.page'

import { CreateModuleModalPage } from './../create-module-modal/create-module-modal.page'

@Component({
  selector: 'app-create-game-list',
  templateUrl: './create-game-list.page.html',
  styleUrls: ['./create-game-list.page.scss'],
})
export class CreateGameListPage implements OnInit {

  name: String = ''
  tasks: any[] = []

  game: any

  constructor(private gameFactory: GameFactoryService, public modalController: ModalController) { }

  ngOnInit() {
    if (this.gameFactory.game != null) {
      this.game = this.gameFactory.game
      this.name = this.game.name
    }
  }

  ionViewWillEnter() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';

    const map = new mapboxgl.Map({
      container: 'create-game-map',
      style: 'mapbox://styles/mapbox/streets-v9',
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
    })
    map.addControl(geolocate);

    // let watch = this.geolocation.watchPosition();
    // watch.subscribe((data) => {
    //   console.log(data)
    // });

    // Add geolocate control to the map.

    map.on('load', () => {
      geolocate.trigger();
    })

  }

  doReorder(ev: any) {
    // Before complete is called with the items they will remain in the
    // order before the drag
    console.log('Before complete', this.game.tasks);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    this.game.tasks = ev.detail.complete(this.game.tasks);

    // After complete is called the items will be in the new order
    console.log('After complete', this.game.tasks);
  }

  async presentTaskModal(type: string = "nav") {
    console.log(type)
    const modal = await this.modalController.create({
      component: CreateTaskModalPage,
      componentProps: {
        gameName: this.name,
        type: type
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data)
    this.game.tasks.push(data.data.task)
    return
  }

  addTaskToGame(task) {
    this.gameFactory.addTask(task)

    this.tasks = this.gameFactory.game.tasks

    console.log(this.tasks)
  }
}
