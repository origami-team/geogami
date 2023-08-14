import { Component, OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl';

// import { Geolocation } from '@ionic-native/geolocation/ngx';

import { ModalController } from '@ionic/angular';

import { GameFactoryService } from '../../../services/game-factory.service';

import { CreateTaskModalPage } from './../create-task-modal/create-task-modal.page';

import { CreateModuleModalPage } from './../create-module-modal/create-module-modal.page';


@Component({
  selector: 'app-create-game-map',
  templateUrl: './create-game-map.page.html',
  styleUrls: ['./create-game-map.page.scss'],
})
export class CreateGameMapPage implements OnInit {

  name: String;
  waypoints: any[];
  addMarker: boolean;

  constructor(private gameFactory: GameFactoryService, public modalController: ModalController) {
    this.waypoints = [];
  }

  ngOnInit() {
    this.name = this.gameFactory.game ? this.gameFactory.game.name : '';
    this.addMarker = true;
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
        offset: [0, -100],
        maxZoom: 14
      },
      trackUserLocation: true
    });
    map.addControl(geolocate);

    // let watch = this.geolocation.watchPosition();
    // watch.subscribe((data) => {
    // console.log(data)
    // });

    // Add geolocate control to the map.

    map.on('load', () => {
      geolocate.trigger();
    });

    map.on('click', e => {
      if (this.addMarker) {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'mymarker';
        el.innerHTML = `<p>${this.waypoints.length + 1}</p>`;
        const newMarker = new mapboxgl.Marker({
          element: el,
          offset: [0, -16],
          draggable: true,
        }).setLngLat(e.lngLat).addTo(map);
        this.waypoints.push({
          marker: newMarker,
          tasks: []
        });
      console.log(this.waypoints);
        this.toggleAddMarker();
        this.presentTaskModal(this.waypoints.length - 1);
      }
    });

  }

  async presentTaskModal(index: Number) {
  console.log(index);
    const modal = await this.modalController.create({
      component: CreateTaskModalPage,
      backdropDismiss: false,
      componentProps: {
        gameName: this.name
      }
    });
    return await modal.present();
  }

  async presentModuleModal() {
    const modal = await this.modalController.create({
      component: CreateModuleModalPage,
      backdropDismiss: false,
      componentProps: {
        gameName: this.name
      }
    });
    return await modal.present();
  }

  toggleAddMarker() {
    this.addMarker = !this.addMarker;
  }


}
