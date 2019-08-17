import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from '../../../services/games.service'


import mapboxgl from 'mapbox-gl';

import { Geolocation } from '@ionic-native/geolocation/ngx';
// import { Geofence } from '@ionic-native/geofence/ngx';


import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-playing-game',
  templateUrl: './playing-game.page.html',
  styleUrls: ['./playing-game.page.scss'],
})
export class PlayingGamePage implements OnInit {

  game: any
  currentWaypoint: any
  currentTask: any
  map: any
  waypointIndex: number = 0
  taskIndex: number = 0
  triggerTreshold: number = 10

  constructor(
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    // private geofence: Geofence,
    public modalController: ModalController,
    private gamesService: GamesService
  ) {
    // geofence.initialize().then(
    //   // resolved promise does not return a value
    //   () => console.log('Geofence Plugin Ready'),
    //   (err) => console.log(err)
    // )
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.route.params.subscribe(params => {
      this.gamesService.getGame(params.id)
        .then(games => {
          this.game = games[0]
          this.initGame();
        })
        .finally(() => {

        })
    });

    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';

    this.map = new mapboxgl.Map({
      container: 'playing-game-map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [8, 51.8],
      zoom: 2
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      fitBoundsOptions: {
        // offset: [0, -100],
        maxZoom: 14
      },
      trackUserLocation: true
    })
    this.map.addControl(geolocate);

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      if (this.currentWaypoint) {
        const distance = this.getDistanceFromLatLonInM(this.currentWaypoint.lat, this.currentWaypoint.lng, data.coords.latitude, data.coords.longitude)
        console.log(distance)
        if (distance < this.triggerTreshold) {
          // alert("You reached the point")
          this.onWaypointReached();
        }
      }
    });

    // Add geolocate control to the map.

    this.map.on('load', () => {
      geolocate.trigger();
    })

    // add marker to map

  }

  onWaypointReached() {
    console.log("onWacpointReached")
    if (this.currentWaypoint.tasks.length > 0) {
      this.currentTask = this.currentWaypoint.tasks[this.taskIndex]
      console.log(this.currentTask)
    } else {
      this.goToNextWaypoint()
    }
  }

  nextTask() {
    this.taskIndex++
    if (this.taskIndex > this.currentWaypoint.tasks.length - 1) {
      this.goToNextWaypoint();
      this.taskIndex = 0
      this.currentTask = undefined
      return
    }

    this.currentTask = this.currentWaypoint.tasks[this.taskIndex]
    console.log(this.taskIndex, this.currentTask)
  }

  goToNextWaypoint() {
    this.waypointIndex++;
    if (this.waypointIndex > this.game.waypoints.length - 1) {
      console.log("Finished")
      this.currentTask = undefined
      this.currentWaypoint = undefined
      return
    }
    this.initGame()
  }

  initGame() {
    this.currentWaypoint = this.game.waypoints[this.waypointIndex]
    this.initWaypoint();
  }

  initWaypoint() {
    new mapboxgl.Marker()
      .setLngLat([this.currentWaypoint.lng, this.currentWaypoint.lat])
      .addTo(this.map);
  }

  getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in km
    return d; // distance in m
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

}
