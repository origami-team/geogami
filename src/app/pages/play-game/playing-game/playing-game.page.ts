import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GamesService } from "../../../services/games.service";
import { OsmService } from "../../../services/osm.service";
import { TrackerService } from "../../../services/tracker.service";
import osmtogeojson from "osmtogeojson";
import { Device } from "@ionic-native/device/ngx";

import mapboxgl from "mapbox-gl";
import MapboxCompare from "mapbox-gl-compare";

import { Geolocation, Geoposition } from "@ionic-native/geolocation/ngx";
import {
  DeviceOrientation,
  DeviceOrientationCompassHeading
} from "@ionic-native/device-orientation/ngx";

import {
  ModalController,
  NavController,
  ToastController
} from "@ionic/angular";
import { environment } from "src/environments/environment";
import { Game } from "src/app/models/game";
import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
import { Subscription } from "rxjs";

@Component({
  selector: "app-playing-game",
  templateUrl: "./playing-game.page.html",
  styleUrls: ["./playing-game.page.scss"]
})
export class PlayingGamePage implements OnInit {
  @ViewChild("map", { static: false }) mapContainer;
  @ViewChild("swipeMap", { static: false }) swipeMapContainer;

  game: Game;

  map: mapboxgl.Map;
  userSelectMarker: mapboxgl.Marker;
  zoomControl: mapboxgl.NavigationControl = new mapboxgl.NavigationControl();

  // map features
  panCenter: boolean = false;
  styleSwitcherControl: MapboxStyleSwitcherControl = new MapboxStyleSwitcherControl();
  autoRotate: boolean = false;
  directionArrow: boolean = false;
  swipe: boolean = false;

  _orientTo = (e: DeviceOrientationEvent) => {
    if (e.beta <= 60 && e.beta >= 0) {
      this.map.setPitch(e.beta);
    }
  };

  // tasks
  task: any;
  taskIndex: number = 0;

  // position
  geolocateControl: mapboxgl.GeolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    fitBoundsOptions: {
      maxZoom: 18
    },
    trackUserLocation: false,
    showUserLocation: false
  });
  lastKnownPosition: Geoposition;

  track: boolean = false;
  path: any;

  streetSection: boolean = false;

  // treshold to trigger location arrive
  triggerTreshold: Number = 10;

  // degree for nav-arrow
  heading: number = 0;
  compassHeading: number = 0;
  targetHeading: number = 0;
  targetDistance: number = 0;
  directionBearing: number = 0;

  showSuccess: boolean = false;
  public lottieConfig: Object;

  Math: Math = Math;

  uploadDone: boolean = false;

  positionWatch: any;
  deviceOrientationSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalController: ModalController,
    public toastController: ToastController,
    private gamesService: GamesService,
    public navCtrl: NavController,
    private deviceOrientation: DeviceOrientation,
    private changeDetectorRef: ChangeDetectorRef,
    private OSMService: OsmService,
    private trackerService: TrackerService,
    private device: Device
  ) {
    this.lottieConfig = {
      path: "assets/lottie/star-success.json",
      renderer: "canvas",
      autoplay: true,
      loop: true
    };
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.route.params.subscribe(params => {
      this.gamesService
        .getGame(params.id)
        .then(games => {
          this.game = games[0];
        })
        .finally(() => {});
    });

    mapboxgl.accessToken = environment.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: document.body.classList.contains("dark")
        ? "mapbox://styles/mapbox/dark-v9"
        : "mapbox://styles/mapbox/streets-v9",
      center: [8, 51.8],
      zoom: 2
    });

    // const watch = this.geolocation.watchPosition();

    // watch.subscribe(async pos => {
    this.positionWatch = window.navigator.geolocation.watchPosition(
      pos => {
        this.trackerService.addWaypoint({
          position: {
            coordinates: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude,
              accuracy: pos.coords.accuracy,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed
            },
            timestamp: pos.timestamp
          },
          compassHeading: this.compassHeading
        });
        this.lastKnownPosition = pos;
        if (this.task) {
          if (this.task.type.includes("nav")) {
            const waypoint = this.task.settings.point.geometry.coordinates;
            if (
              this.userDidArrive(waypoint) &&
              !this.task.settings.confirmation
            ) {
              this.onWaypointReached();
            }

            if (this.task.type == "nav-arrow") {
              const destCoords = this.task.settings.point.geometry.coordinates;
              const bearing = this.bearing(
                pos.coords.latitude,
                pos.coords.longitude,
                destCoords[1],
                destCoords[0]
              );
              this.heading = bearing;
            }
          }
        }

        if (this.panCenter) {
          this.map.setCenter(pos.coords);
        }

        if (this.track) {
          this.path.geometry.coordinates.push([
            pos.coords.longitude,
            pos.coords.latitude
          ]);

          if (this.map.getSource("track") == undefined) {
            this.map.addSource("track", { type: "geojson", data: this.path });
            this.map.addLayer({
              id: "track",
              type: "line",
              source: "track",
              paint: {
                "line-color": "cyan",
                "line-opacity": 0.5,
                "line-width": 5
              },
              layout: {
                "line-cap": "round"
              }
            });
          } else {
            this.map.getSource("track").setData(this.path);
          }
        }

        if (this.streetSection) {
          this.OSMService.getStreetCoordinates(
            pos.coords.latitude,
            pos.coords.longitude
          ).then(data => {
            const geometries = osmtogeojson(data);
            console.log(geometries);

            if (this.map.getSource("section") == undefined) {
              this.map.addSource("section", {
                type: "geojson",
                data: geometries
              });
              this.map.addLayer({
                id: "section",
                type: "line",
                source: "section",
                paint: {
                  "line-color": "red",
                  "line-opacity": 0.5,
                  "line-width": 10
                },
                layout: {
                  "line-cap": "round"
                }
              });
            } else {
              this.map.getSource("section").setData(geometries);
            }
          });
        }
      },
      err => console.log(err),
      {
        enableHighAccuracy: true
      }
    );

    this.map.on("load", () => {
      // this.map.addControl(this.geolocateControl);
      // this.geolocateControl.trigger();
      this.initGame();
    });

    this.map.on("click", e => {
      console.log(e);
      console.log("click");
      this.trackerService.addEvent({
        type: "ON_MAP_CLICKED",
        position: {
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng
        }
      });
      if (
        this.task.type == "theme-loc" ||
        (this.task.settings["answer-type"] &&
          this.task.settings["answer-type"].name == "set-point") ||
        (this.task.type == "theme-object" &&
          this.task.settings["question-type"].name == "photo") ||
        this.task.type == "theme-direction"
      ) {
        const pointFeature = this._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);
        if (this.userSelectMarker) {
          this.userSelectMarker.setLngLat(e.lngLat);
        } else {
          this.userSelectMarker = new mapboxgl.Marker({
            color: "green",
            draggable: true
          })
            .setLngLat(pointFeature.geometry.coordinates)
            .addTo(this.map);
          this.userSelectMarker.on("dragend", () => {
            // TODO: implement
          });
        }
      }
    });

    // rotation
    this.deviceOrientationSubscription = this.deviceOrientation
      .watchHeading()
      .subscribe((data: DeviceOrientationCompassHeading) => {
        this.compassHeading = data.magneticHeading;
        this.targetHeading = 360 - (this.compassHeading - this.heading);

        if (this.autoRotate) {
          // this.map.rotateTo(data.magneticHeading, { duration: 10 });
          this.map.setBearing(data.magneticHeading);
        }
        if (this.directionArrow) {
          if (
            this.map.getSource("viewDirection") == undefined &&
            !this.map.hasImage("view-direction")
          ) {
            this.map.loadImage(
              "/assets/icons/direction.png",
              (error, image) => {
                if (error) throw error;
                this.map.addImage("view-direction", image);

                this.map.addSource("viewDirection", {
                  type: "geojson",
                  data: {
                    type: "Point",
                    coordinates: [
                      this.lastKnownPosition.coords.longitude,
                      this.lastKnownPosition.coords.latitude
                    ]
                  }
                });

                this.map.addLayer({
                  id: "viewDirection",
                  source: "viewDirection",
                  type: "symbol",
                  layout: {
                    "icon-image": "view-direction",
                    "icon-size": 1,
                    "icon-offset": [0, -25]
                  }
                });
                this.map.setLayoutProperty(
                  "viewDirection",
                  "icon-rotate",
                  data.magneticHeading
                );
              }
            );
          } else {
            this.map.getSource("viewDirection").setData({
              type: "Point",
              coordinates: [
                this.lastKnownPosition.coords.longitude,
                this.lastKnownPosition.coords.latitude
              ]
            });
            this.map.setLayoutProperty(
              "viewDirection",
              "icon-rotate",
              data.magneticHeading
            );
          }
        }
      });

    this.path = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: []
      }
    };
  }

  initGame() {
    const tasks = this.game.tasks;

    var bounds = new mapboxgl.LngLatBounds();

    tasks.forEach(task => {
      if (task.settings.point)
        bounds.extend(task.settings.point.geometry.coordinates);
    });

    try {
      this.map.fitBounds(bounds, { padding: 40, duration: 2000 });
    } catch (e) {
      console.log("Warning: Can not set bounds", bounds);
    }
    this.task = tasks[this.taskIndex];
    console.log("initializing trackerService");
    this.trackerService.init(this.game._id, this.device);
    this.trackerService.addEvent({
      type: "INIT_GAME"
    });
    this.initTask();
  }

  initTask() {
    console.log("Current task: ", this.task);
    this._initMapFeatures();
    this.trackerService.addEvent({
      type: "INIT_TASK",
      task: this.task
    });

    if (this.task.type.includes("theme")) {
      this.task.settings.text = this.task.settings[
        "question-type"
      ].settings.text;
    }
    if (!this.task.type.includes("theme")) {
      if (this.task.settings.point != null) {
        new mapboxgl.Marker()
          .setLngLat(
            this.game.tasks[this.taskIndex].settings.point.geometry.coordinates
          )
          .addTo(this.map);
      }
    }

    if (this.task.type == "theme-direction") {
      console.log(this.task.settings["question-type"].settings.direction);
      this.directionBearing = this.task.settings[
        "question-type"
      ].settings.direction;
    }
  }

  onWaypointReached() {
    this.trackerService.addEvent({
      type: "WAYPOINT_REACHED"
    });
    this.nextTask();
  }

  nextTask() {
    this.taskIndex++;
    if (this.taskIndex > this.game.tasks.length - 1) {
      this.showSuccess = true;
      this.trackerService.addEvent({
        type: "FINISHED_GAME"
      });
      this.trackerService.uploadTrack().then(res => {
        if (res.status == 200) {
          console.log(res);
          this.uploadDone = true;
        }
      });
      navigator.vibrate([300, 300, 300]);
      return;
    }

    this.task = this.game.tasks[this.taskIndex];
    this.initTask();
    console.log(this.taskIndex, this.task);
    navigator.vibrate([100, 100, 100]);
  }

  async onOkClicked() {
    if (this.task.type == "theme-loc") {
      this.nextTask();
    } else if (
      this.task.type == "theme-object" &&
      this.task.settings["question-type"].name == "photo"
    ) {
      const targetPosition = this.task.settings["question-type"].settings.point
        .geometry.coordinates;
      const clickPosition = this.userSelectMarker._lngLat;

      const distance = this.getDistanceFromLatLonInM(
        targetPosition[1],
        targetPosition[0],
        clickPosition.lat,
        clickPosition.lng
      );

      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          distance: distance
        }
      });

      if (distance < 20) {
        this.nextTask();
      } else {
        const toast = await this.toastController.create({
          message: "Deine Eingabe ist falsch. Versuche es erneut",
          color: "dark",
          showCloseButton: true,
          duration: 2000
        });
        toast.present();
      }
    } else if (
      this.task.type == "theme-object" &&
      this.task.settings["question-type"].name == "description"
    ) {
      const targetPosition = this.task.settings["question-type"].settings[
        "answer-type"
      ].settings.point.geometry.coordinates;
      const clickPosition = this.userSelectMarker._lngLat;

      const distance = this.getDistanceFromLatLonInM(
        targetPosition[1],
        targetPosition[0],
        clickPosition.lat,
        clickPosition.lng
      );

      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          distance: distance
        }
      });

      if (distance < 20) {
        this.nextTask();
      } else {
        const toast = await this.toastController.create({
          message: "Deine Eingabe ist falsch. Versuche es erneut",
          color: "dark",
          showCloseButton: true,
          duration: 2000
        });
        toast.present();
      }
    } else if (this.task.type == "info") {
      this.nextTask();
    } else if (this.task.type == "theme-direction") {
      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          direction: this.compassHeading
        }
      });
      console.log(this.directionBearing + 360, this.compassHeading);
      if (
        this.Math.abs(this.directionBearing + 360 - this.compassHeading) > 45
      ) {
        const toast = await this.toastController.create({
          message: "Bitte drehe dich zur angezeigten Blickrichtung",
          color: "dark",
          showCloseButton: true,
          duration: 2000
        });
        toast.present();
      } else {
        this.nextTask();
      }
    } else {
      // TODO: disable button
      const waypoint = this.task.settings.point.geometry.coordinates;
      if (this.userDidArrive(waypoint)) {
        this.onWaypointReached();
      } else {
        const toast = await this.toastController.create({
          message: "Deine Eingabe ist falsch. Versuche es erneut",
          color: "dark",
          showCloseButton: true,
          duration: 2000
        });
        toast.present();
      }
    }
  }

  userDidArrive(waypoint) {
    this.targetDistance = this.getDistanceFromLatLonInM(
      waypoint[1],
      waypoint[0],
      this.lastKnownPosition.coords.latitude,
      this.lastKnownPosition.coords.longitude
    );
    return this.targetDistance < this.triggerTreshold;
    // return this.geolocation.getCurrentPosition().then(pos => {
    // })
  }

  navigateHome() {
    navigator.geolocation.clearWatch(this.positionWatch);
    this.deviceOrientationSubscription.unsubscribe();
    this.navCtrl.navigateRoot("/");
  }

  getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in km
    return d; // distance in m
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Converts from radians to degrees.
  toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }

  bearing(startLat, startLng, destLat, destLng) {
    startLat = this.deg2rad(startLat);
    startLng = this.deg2rad(startLng);
    destLat = this.deg2rad(destLat);
    destLng = this.deg2rad(destLng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = Math.atan2(y, x);
    const brngDeg = this.toDegrees(brng);
    return (brngDeg + 360) % 360;
  }

  _initMapFeatures() {
    const mapFeatures = this.task.settings.mapFeatures;
    console.log(mapFeatures);
    if (mapFeatures != undefined) {
      for (let key in mapFeatures) {
        if (mapFeatures.hasOwnProperty(key)) {
          console.log(key + " -> " + mapFeatures[key]);
          switch (key) {
            case "zoombar":
              if (mapFeatures[key]) {
                this.map.addControl(this.zoomControl);
              } else {
                try {
                  // this.map.remove(this.zoomControl);
                } catch (e) {
                  console.log("Error: Remove zoomControl", e);
                }
              }
              break;
            case "pan":
              this.panCenter = false; // Reset value
              if (mapFeatures[key] == "true") {
                this.map.dragPan.enable();
              } else if (mapFeatures[key] == "center") {
                this.panCenter = true;
              } else if (mapFeatures[key] == "static") {
                this.map.dragPan.disable();
                this.map.scrollZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.touchZoomRotate.disable();
              }
              break;
            case "rotation":
              this.autoRotate = false;

              if (mapFeatures[key] == "manual") {
                // // disable map rotation using right click + drag
                // this.map.dragRotate.enable();
                // // disable map rotation using touch rotation gesture
                // this.map.touchZoomRotate.enableRotation();
                // this.map.doubleClickZoom.enable();
              } else if (mapFeatures[key] == "auto") {
                this.autoRotate = true;
              } else if (mapFeatures[key] == "button") {
                // TODO: implememt
              } else if (mapFeatures[key] == "north") {
                this.map.setBearing(0);
                this.map.dragRotate.disable();
                this.map.touchZoomRotate.disableRotation();
              }
              break;
            case "material":
              this.swipe = false;

              const elem = document.getElementsByClassName("mapboxgl-compare");
              while (elem.length > 0) elem[0].remove();
              this.autoRotate = false;
              if (mapFeatures[key] == "standard") {
                if (document.body.classList.contains("dark")) {
                  this.map.setStyle("mapbox://styles/mapbox/dark-v9");
                } else {
                  this.map.setStyle("mapbox://styles/mapbox/streets-v9");
                }
              } else if (mapFeatures[key] == "selection") {
                this.map.addControl(this.styleSwitcherControl);
              } else if (mapFeatures[key] == "sat") {
                this.map.setStyle("mapbox://styles/mapbox/satellite-v9");
              } else if (mapFeatures[key] == "sat-button") {
                // TODO: implememt
              } else if (mapFeatures[key] == "sat-swipe") {
                this.swipe = true;
                this.changeDetectorRef.detectChanges();
                const satMap = new mapboxgl.Map({
                  container: this.swipeMapContainer.nativeElement,
                  style: "mapbox://styles/mapbox/satellite-v9",
                  center: [8, 51.8],
                  zoom: 2
                });
                new MapboxCompare(this.map, satMap);
              } else if (mapFeatures[key] == "3D") {
                this.autoRotate = true;
                addEventListener("deviceorientation", this._orientTo, false);
                this._add3DBuildingsLayer();
              } else if (mapFeatures[key] == "3D-button") {
                this._add3DBuildingsLayer();
              }
              break;
            case "position":
              if (mapFeatures[key] == "none") {
                // TODO: implement ?
              } else if (mapFeatures[key] == "true") {
                this.map.addControl(this.geolocateControl);
                this.geolocateControl.trigger();
              } else if (mapFeatures[key] == "button") {
                // TODO: implement
              } else if (mapFeatures[key] == "start") {
                // TODO: implement
              }
              break;
            case "direction":
              this.directionArrow = false;
              if (mapFeatures[key] == "none") {
                // TODO: implement ?
              } else if (mapFeatures[key] == "true") {
                this.directionArrow = true;
              } else if (mapFeatures[key] == "button") {
                // TODO: implement
              } else if (mapFeatures[key] == "start") {
                // TODO: implement
              }
              break;
            case "track":
              if (mapFeatures[key]) {
                this.track = true;
              } else {
                this.track = false;
              }
              break;
            case "streetSection":
              if (mapFeatures[key]) {
                this.streetSection = true;
              } else {
                this.streetSection = false;
              }
          }
        }
      }
    }
  }

  _add3DBuildingsLayer(): void {
    // Add 3D buildungs
    // Insert the layer beneath any symbol layer.
    var layers = this.map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    this.map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"]
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"]
          ],
          "fill-extrusion-opacity": 0.6
        }
      },
      labelLayerId
    );
  }

  _toGeoJSONPoint = (lng, lat): GeoJSON.Feature<GeoJSON.Point> =>
    JSON.parse(`
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [${lng}, ${lat}]
    }
  }`);
}
