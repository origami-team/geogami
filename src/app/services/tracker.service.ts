import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Plugins, DeviceInfo, GeolocationPosition } from "@capacitor/core";

import { environment } from "../../environments/environment";
import { OrigamiGeolocationService } from './origami-geolocation.service';
import { Subscription } from 'rxjs';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';

@Injectable({
  providedIn: "root"
})
export class TrackerService {
  private game: string;
  private gameName: string;
  private device: DeviceInfo;
  private waypoints: any[];
  private events: any[];

  private start: String;

  private players: string[]

  private position: GeolocationPosition
  private positionWatch: Subscription;
  private deviceOrientationSubscription: Subscription
  private compassHeading: number;

  private map: any;

  private task: any;

  private panCounter: number = 0;
  private zoomCounter: number = 0;
  private rotationCounter: number = 0;
  private lastHeading: number = undefined;

  constructor(
    private http: HttpClient,
    private geolocateService: OrigamiGeolocationService,
    private deviceOrientation: DeviceOrientation
  ) { }

  async init(gameID, name, map: any, players: string[]) {
    this.positionWatch = this.geolocateService.geolocationSubscription.subscribe(position => {
      this.position = position
    })

    this.deviceOrientationSubscription = this.deviceOrientation
      .watchHeading()
      .subscribe((data: DeviceOrientationCompassHeading) => {
        if (this.lastHeading === undefined) {
          this.lastHeading = data.magneticHeading
        }

        let diff = Math.abs(this.lastHeading - data.magneticHeading)
        diff = Math.abs((diff + 180) % 360 - 180)
        if (diff > 15) {
          this.rotationCounter += diff
          this.lastHeading = data.magneticHeading
        }

        this.compassHeading = data.magneticHeading;
      });

    this.map = map;
    this.map.on('moveend', moveEvent => {
      if (moveEvent.type == "moveend" && moveEvent.originalEvent) {
        this.panCounter++
      }
    })

    this.map.on('zoomend', zoomEvent => {
      if (zoomEvent.type == "zoomend" && zoomEvent.originalEvent) {
        this.zoomCounter++
      }
    })

    this.game = gameID;
    this.gameName = name;
    this.device = await Plugins.Device.getInfo().then(device => device)
    this.waypoints = [];
    this.events = [];
    this.start = new Date().toISOString()
    this.players = players
    this.task = undefined;
  }

  setTask(task) {
    this.task = task;
    this.panCounter = 0;
    this.zoomCounter = 0;
    this.rotationCounter = 0;
  }

  addWaypoint(waypoint) {
    if (this.waypoints != undefined) {
      this.waypoints.push({
        ...waypoint,
        timestamp: new Date().toISOString(),
        position: this.position,
        mapViewport: {
          bounds: this.map.getBounds(),
          center: this.map.getCenter(),
          zoom: this.map.getZoom(),
          bearing: this.map.getBearing(),
          pitch: this.map.getPitch()
        },
        compassHeading: this.compassHeading,
        interaction: {
          panCount: this.panCounter,
          zoomCount: this.zoomCounter / 2,
          rotation: this.rotationCounter
        }
      });
    }
  }

  addEvent(event) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
      position: this.position,
      mapViewport: {
        bounds: this.map.getBounds(),
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch()
      },
      compassHeading: this.compassHeading,
      task: this.task,
      interaction: {
        panCount: this.panCounter,
        zoomCount: this.zoomCounter / 2,
        rotationCount: this.rotationCounter
      }
    });
    console.log(this.events)
  }

  uploadTrack() {
    const data = {
      game: this.game,
      name: this.gameName,
      start: this.start,
      end: new Date().toISOString(),
      device: this.device,
      waypoints: this.waypoints,
      events: this.events,
      answers: null,
      players: this.players,
      playersCount: this.players.length
    };

    console.log(data);

    // Plugins.Geolocation.clearWatch({ id: this.positionWatch });
    this.deviceOrientationSubscription.unsubscribe();
    this.positionWatch.unsubscribe();

    return this.http
      .post(`${environment.apiURL}/track`, data, { observe: "response" })
      .toPromise();
  }
}
