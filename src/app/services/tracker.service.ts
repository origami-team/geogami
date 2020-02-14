import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Device } from "@ionic-native/device/ngx";

import { environment } from "../../environments/environment";
import { IfStmt } from "@angular/compiler";

@Injectable({
  providedIn: "root"
})
export class TrackerService {
  private game: string;
  private device: Device;
  private waypoints: any[];
  private events: any[];
  private answers: any[];

  constructor(private http: HttpClient) { }

  init(gameID, device: Device) {
    this.game = gameID;
    this.device = device;
    this.waypoints = [];
    this.events = [];
    this.answers = [];
  }

  addWaypoint(waypoint) {
    if (this.waypoints != undefined) {
      this.waypoints.push({
        ...waypoint,
        timestamp: new Date().toISOString()
      });
    }
  }

  addEvent(event) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString()
    });
  }

  addAnswer(answer) {
    this.answers.push({
      ...answer,
      timestamp: new Date().toISOString()
    });
  }

  uploadTrack() {
    const data = {
      game: this.game,
      device: {
        cordova: this.device.cordova,
        isVirtual: this.device.isVirtual,
        manufacturer: this.device.manufacturer,
        model: this.device.model,
        platform: this.device.platform,
        serial: this.device.serial,
        uuid: this.device.uuid,
        version: this.device.version
      },
      waypoints: this.waypoints,
      events: this.events,
      answers: this.answers
    };

    console.log(data);

    return this.http
      .post(`${environment.apiURL}/track`, data, { observe: "response" })
      .toPromise();
  }
}
