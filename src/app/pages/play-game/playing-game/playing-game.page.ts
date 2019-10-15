import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from '../../../services/games.service'


import mapboxgl from 'mapbox-gl';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';


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
  userSelectMarker: mapboxgl.Marker

  task: any;
  taskIndex: number = 0

  // treshold to trigger location arrive
  triggerTreshold: Number = 10

  // degree for nav-arrow
  heading: number = 0
  compassHeading: number = 0
  targetHeading: number = 0
  targetDistance: number = 0

  showSuccess: boolean = false
  public lottieConfig: Object;

  Math: Math = Math

  constructor(
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalController: ModalController,
    private gamesService: GamesService,
    public navCtrl: NavController,
    private deviceOrientation: DeviceOrientation
  ) {
    this.lottieConfig = {
      path: 'assets/lottie/star-success.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };

  }

  ngOnInit() {
    console.log(this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => {
        this.compassHeading = data.magneticHeading
        this.targetHeading = 360 - (this.compassHeading - this.heading)
      }
    ))
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

    watch.subscribe(async (pos) => {
      if (this.task) {
        if (this.task.type.includes('nav')) {
          const waypoint = this.task.settings.point.geometry.coordinates
          if (await this.userDidArrive(waypoint) && !this.task.settings.confirmation) {
            this.onWaypointReached();
          }

          if (this.task.type == "nav-arrow") {
            const destCoords = this.task.settings.point.geometry.coordinates
            const bearing = this.bearing(pos.coords.latitude, pos.coords.longitude, destCoords[1], destCoords[0])
            this.heading = bearing

          }
        }
      }
    });

    this.map.on('load', () => {
      geolocate.trigger();
      this.initGame()
    })

    this.map.on('click', e => {
      console.log("click")
      if (this.task.type == 'theme-loc') {
        const pointFeature = this._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat)
        if (this.userSelectMarker) {

        } else {
          this.userSelectMarker = new mapboxgl.Marker()
            .setLngLat(pointFeature.geometry.coordinates)
            .addTo(this.map);
        }
      }
    })
  }

  initGame() {
    this.task = this.game.tasks[this.taskIndex]
    this.initTask();
  }

  initTask() {
    console.log("Current task: ", this.game.tasks[this.taskIndex])
    if (!['theme-loc'].includes(this.task.type))
      new mapboxgl.Marker()
        .setLngLat(this.game.tasks[this.taskIndex].settings.point.geometry.coordinates)
        .addTo(this.map);

  }

  onWaypointReached() {
    this.nextTask()
  }

  nextTask() {
    this.taskIndex++
    if (this.taskIndex > this.game.tasks.length - 1) {
      this.showSuccess = true
      navigator.vibrate([300, 300, 300]);
      return
    }

    this.task = this.game.tasks[this.taskIndex]
    this.initTask()
    console.log(this.taskIndex, this.task)
    navigator.vibrate([100, 100, 100]);
  }

  async onOkClicked() {
    if (this.task.type == 'theme-loc') {
      this.nextTask()
    } else {
      // TODO: disable button
      const waypoint = this.task.settings.point.geometry.coordinates
      if (await this.userDidArrive(waypoint)) {
        this.onWaypointReached();
      }
    }
  }

  async userDidArrive(waypoint): Promise<boolean> {
    return this.geolocation.getCurrentPosition().then(pos => {
      this.targetDistance = this.getDistanceFromLatLonInM(waypoint[1], waypoint[0], pos.coords.latitude, pos.coords.longitude)
      return this.targetDistance < this.triggerTreshold
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

  // Converts from radians to degrees.
  toDegrees(radians) {
    return radians * 180 / Math.PI;
  }


  bearing(startLat, startLng, destLat, destLng) {
    startLat = this.deg2rad(startLat);
    startLng = this.deg2rad(startLng);
    destLat = this.deg2rad(destLat);
    destLng = this.deg2rad(destLng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = Math.atan2(y, x);
    const brngDeg = this.toDegrees(brng);
    return (brngDeg + 360) % 360;
  }

  _toGeoJSONPoint = (lng, lat): GeoJSON.Feature<GeoJSON.Point> => JSON.parse(`
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [${lng}, ${lat}]
    }
  }`)
}
