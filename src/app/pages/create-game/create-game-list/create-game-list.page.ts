import { Component, OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl';

import { Geolocation } from '@ionic-native/geolocation/ngx';

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

  name: String

  constructor(private geolocation: Geolocation, private gameFactory: GameFactoryService, public modalController: ModalController) { }

  ngOnInit() {
    this.name = this.gameFactory.game ? this.gameFactory.game.name : ''
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

  async presentTaskModal(type: string = "nav") {
    console.log(type)
    const modal = await this.modalController.create({
      component: CreateTaskModalPage,
      componentProps: {
        gameName: this.name,

      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data)
    return
  }

}
