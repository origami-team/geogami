import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from '../../../services/games.service'


import mapboxgl from 'mapbox-gl';

import { Geolocation } from '@ionic-native/geolocation/ngx';
// import { Geofence } from '@ionic-native/geofence/ngx';


import { ModalController, NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-playing-game',
  templateUrl: './playing-game.page.html',
  styleUrls: ['./playing-game.page.scss'],
})
export class PlayingGamePage implements OnInit {

  @ViewChild('map', { static: false }) mapContainer

  game: Game
  map: mapboxgl.Map
  task: any;
  taskIndex: number = 0
  triggerTreshold: Number = 10

  showSuccess: boolean = false
  public lottieConfig: Object;

  constructor(
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalController: ModalController,
    private gamesService: GamesService,
    public navCtrl: NavController
  ) {
    this.lottieConfig = {
      path: 'assets/lottie/star-success.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.route.params.subscribe(params => {
      this.gamesService.getGame(params.id)
        .then(games => {
          this.game = games[0]
        })
        .finally(() => {

        })
    });

    mapboxgl.accessToken = environment.mapboxAccessToken

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
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

    watch.subscribe(async (data) => {
      if (this.task) {
        const waypoint = this.task.settings.point.geometry.coordinates
        if (await this.userDidArrive(waypoint) && !this.task.settings.confirmation) {
          this.onWaypointReached();
        }
      }
    });

    this.map.on('load', () => {
      geolocate.trigger();
      this.initGame()
    })
  }

  initGame() {
    this.task = this.game.tasks[this.taskIndex]
    this.initTask();
  }

  initTask() {
    console.log("Current task: ", this.game.tasks[this.taskIndex])
    // Don't add marker when user has to click OK button
    if (!this.task.settings.confirmation) {
      new mapboxgl.Marker()
        .setLngLat(this.game.tasks[this.taskIndex].settings.point.geometry.coordinates)
        .addTo(this.map);
    }
  }

  onWaypointReached() {
    this.nextTask()
  }

  nextTask() {
    this.taskIndex++
    if (this.taskIndex > this.game.tasks.length - 1) {
      this.showSuccess = true
      return
    }

    this.task = this.game.tasks[this.taskIndex]
    this.initTask()
    console.log(this.taskIndex, this.task)
  }

  async onOkClicked() {
    const waypoint = this.task.settings.point.geometry.coordinates
    if (await this.userDidArrive(waypoint)) {
      this.onWaypointReached();
    }
  }

  async userDidArrive(waypoint): Promise<boolean> {
    return this.geolocation.getCurrentPosition().then(pos => {
      const distance = this.getDistanceFromLatLonInM(waypoint[1], waypoint[0], pos.coords.latitude, pos.coords.longitude)
      return distance < this.triggerTreshold
    })
  }


  navigateHome() {
    this.navCtrl.navigateRoot('/')
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
