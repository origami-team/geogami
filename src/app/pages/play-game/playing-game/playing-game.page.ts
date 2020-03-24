import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GamesService } from "../../../services/games.service";
import { OsmService } from "../../../services/osm.service";
import { TrackerService } from "../../../services/tracker.service";
import { Device } from "@ionic-native/device/ngx";
import mapboxgl from "mapbox-gl";
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Geoposition } from "@ionic-native/geolocation/ngx";
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
import { Subscription } from "rxjs";
import { Insomnia } from "@ionic-native/insomnia/ngx";
import { Vibration } from "@ionic-native/vibration/ngx";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { RotationControl, RotationType } from './../../../components/rotation-control.component'
import { ViewDirectionControl, ViewDirectionType } from './../../../components/view-direction-control.component';
import { LandmarkControl } from 'src/app/components/landmark-control.component';
import { StreetSectionControl, StreetSectionType } from './../../../components/street-section-control.component'
import { LayerControl, LayerType } from 'src/app/components/layer-control.component';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';
import { TrackControl, TrackType } from 'src/app/components/track-control.component';
import { GeolocateControl, GeolocateType } from 'src/app/components/geolocate-control.component';
import { PanControl, PanType } from 'src/app/components/pan-control.component';

import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

enum FeedbackType {
  Correct,
  Wrong,
  TryAgain,
  Saved
}

@Component({
  selector: "app-playing-game",
  templateUrl: "./playing-game.page.html",
  styleUrls: ["./playing-game.page.scss"]
})
export class PlayingGamePage implements OnInit {
  @ViewChild("mapWrapper", { static: false }) mapWrapper;
  @ViewChild("map", { static: false }) mapContainer;
  @ViewChild("swipeMap", { static: false }) swipeMapContainer;

  game: Game;

  map: mapboxgl.Map;
  userSelectMarker: mapboxgl.Marker;
  waypointMarker: mapboxgl.Marker;
  zoomControl: mapboxgl.NavigationControl = new mapboxgl.NavigationControl();

  // map features
  panCenter: boolean = false;
  directionArrow: boolean = false;
  swipe: boolean = false;

  clickDirection = 0;

  rotationControl: RotationControl;
  viewDirectionControl: ViewDirectionControl;
  landmarkControl: LandmarkControl;
  streetSectionControl: StreetSectionControl;
  layerControl: LayerControl
  trackControl: TrackControl
  geolocateControl: GeolocateControl
  panControl: PanControl

  // tasks
  task: any;
  taskIndex: number = 0;

  // position
  /* geolocateControl: mapboxgl.GeolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserLocation: true
  }); */
  lastKnownPosition: Geoposition;

  // treshold to trigger location arrive
  triggerTreshold: Number = 20;

  // degree for nav-arrow
  heading: number = 0;
  compassHeading: number = 0;
  targetHeading: number = 0;
  targetDistance: number = 0;
  directionBearing: number = 0;
  indicatedDirection: number = 0;

  showSuccess: boolean = false;
  public lottieConfig: Object;

  showFeedback: boolean = false;
  feedbackText: string;
  feedbackRetry: boolean = false;

  Math: Math = Math;

  uploadDone: boolean = false;

  positionWatch: any;
  deviceOrientationSubscription: Subscription;

  baseOptions: CameraOptions = {
    quality: environment.photoQuality,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  cameraOptions: CameraOptions = {
    ...this.baseOptions,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  photo: SafeResourceUrl;
  photoURL: string;

  // multiple choice
  selectedPhoto: string;
  isCorrectPhotoSelected: boolean;

  primaryColor: string;
  secondaryColor: string;

  panelMinimized: boolean = false;

  viewDirectionTaskGeolocateSubscription: number;



  constructor(
    private route: ActivatedRoute,
    public modalController: ModalController,
    public toastController: ToastController,
    private gamesService: GamesService,
    public navCtrl: NavController,
    private deviceOrientation: DeviceOrientation,
    private changeDetectorRef: ChangeDetectorRef,
    private OSMService: OsmService,
    private trackerService: TrackerService,
    private device: Device,
    private insomnia: Insomnia,
    private vibration: Vibration,
    private camera: Camera,
    public alertController: AlertController,
    public platform: Platform,
    public helperService: HelperService,
    private nativeAudio: NativeAudio,
    private transfer: FileTransfer,
    private file: File,
    private webview: WebView,
    private sanitizer: DomSanitizer
  ) {
    this.lottieConfig = {
      path: "assets/lottie/star-success.json",
      renderer: "canvas",
      autoplay: true,
      loop: true
    };
    this.nativeAudio.preloadSimple('sound', 'assets/sounds/zapsplat_multimedia_alert_musical_warm_arp_005_46194.mp3')
      .then(() => console.log("loaded sound"),
        (e) => console.log("sound load error ", e));
    this.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    this.secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-secondary');
  }

  ngOnInit() { }

  ionViewWillEnter() {
    mapboxgl.accessToken = environment.mapboxAccessToken;

    let mapStyle;
    if (environment.production) {
      mapStyle = {
        'version': 8,
        'sources': {
          'raster-tiles': {
            'type': 'raster',
            'tiles': [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            'tileSize': 256,
          }
        },
        'layers': [
          {
            'id': 'simple-tiles',
            'type': 'raster',
            'source': 'raster-tiles',
            'minzoom': 0,
            'maxzoom': 22
          }
        ]
      }
    } else {
      mapStyle = document.body.classList.contains("dark")
        ? "mapbox://styles/mapbox/dark-v9"
        : "mapbox://styles/mapbox/streets-v9"
    }

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: mapStyle,
      center: [8, 51.8],
      zoom: 2,
      maxZoom: 18
    });

    this.positionWatch = window.navigator.geolocation.watchPosition(
      position => {
        this.trackerService.addWaypoint({
          position: {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            },
            timestamp: position.timestamp
          },
          compassHeading: this.compassHeading,
          mapViewport: {
            bounds: this.map.getBounds(),
            center: this.map.getCenter(),
            zoom: this.map.getZoom(),
            // style: this.map.getStyle(),
            bearing: this.map.getBearing(),
            pitch: this.map.getPitch()
          }
        });
        this.lastKnownPosition = position;
        if (this.task && !this.showSuccess) {
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
              const bearing = this.helperService.bearing(
                position.coords.latitude,
                position.coords.longitude,
                destCoords[1],
                destCoords[0]
              );
              this.heading = bearing;
            }
          }
        }

        if (this.panCenter) {
          this.map.setCenter(position.coords);
        }

        if (this.task && this.task.type == "theme-direction" &&
          ((this.task.settings["question-type"].name == "question-type-current-direction") || (this.task.settings["question-type"].name == "photo"))) {
          if (this.map.getSource('viewDirectionClick')) {
            this.map.getSource('viewDirectionClick').setData({
              type: "Point",
              coordinates: [
                position.coords.longitude,
                position.coords.latitude
              ]
            })
          }
        }
      },
      err => console.log(err),
      {
        enableHighAccuracy: true
      }
    );

    this.map.on("load", () => {
      this.rotationControl = new RotationControl(this.map)
      this.viewDirectionControl = new ViewDirectionControl(this.map, this.deviceOrientation)
      this.landmarkControl = new LandmarkControl(this.map)
      this.streetSectionControl = new StreetSectionControl(this.map, this.OSMService);
      this.layerControl = new LayerControl(this.map, this.mapWrapper, this.deviceOrientation, this.alertController, this.platform);
      this.trackControl = new TrackControl(this.map)
      this.geolocateControl = new GeolocateControl(this.map)
      this.panControl = new PanControl(this.map)

      this.map.loadImage(
        "/assets/icons/directionv2-richtung.png",
        (error, image) => {
          if (error) throw error;

          this.map.addImage("view-direction-task", image);
        })

      this.game = null;
      this.game = new Game(0, "Loading...", false, []);
      this.route.params.subscribe(params => {
        this.gamesService
          .getGame(params.id)
          .then(games => {
            this.game = games[0];
          })
          .finally(() => {
            this.initGame();
          });
      });
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
      if (this.task.type == "theme-direction" &&
        ((this.task.settings["question-type"].name == "question-type-current-direction") ||
          (this.task.settings["question-type"].name == "photo"))) {

        this.clickDirection = this.helperService.bearing(this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude, e.lngLat.lat, e.lngLat.lng)

        if (!this.map.getLayer('viewDirectionClick')) {
          this.map.addSource("viewDirectionClick", {
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
            id: "viewDirectionClick",
            source: "viewDirectionClick",
            type: "symbol",
            layout: {
              "icon-image": "view-direction-task",
              "icon-size": 0.65,
              "icon-offset": [0, -8]
            }
          });
          this.geolocateControl.setType(GeolocateType.None)
        }
        this.map.setLayoutProperty(
          "viewDirectionClick",
          "icon-rotate",
          this.clickDirection
        );
      } else if (
        this.task.type == "theme-loc" ||
        (this.task.settings["answer-type"] &&
          this.task.settings["answer-type"].name == "set-point") ||
        (this.task.type == "theme-object" &&
          this.task.settings["question-type"].name == "photo") ||
        (this.task.type == "theme-direction" && this.task.settings["question-type"].name != "question-type-arrow" && this.task.settings["answer-type"].name != "rotateTo")
      ) {
        const pointFeature = this.helperService._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);
        if (this.userSelectMarker) {
          this.userSelectMarker.setLngLat(e.lngLat);
        } else {
          this.userSelectMarker = new mapboxgl.Marker({
            color: this.secondaryColor,
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
        this.indicatedDirection = this.compassHeading - this.directionBearing;
      });


    this.insomnia.keepAwake().then(
      () => console.log("insomnia keep awake success"),
      () => console.log("insomnia keep awake error")
    );
  }

  zoomBounds() {
    var bounds = new mapboxgl.LngLatBounds();

    this.game.tasks.forEach(task => {
      if (task.settings.point)
        bounds.extend(task.settings.point.geometry.coordinates);
      if (task.settings['question-type'] &&
        task.settings['question-type'].settings &&
        task.settings['question-type'].settings.polygon != undefined) {
        console.log(task.settings['question-type'].settings.polygon)
        task.settings['question-type'].settings.polygon.forEach(e => {
          e.geometry.coordinates.forEach(c => {
            c.forEach(coords => {
              console.log(coords)
              bounds.extend(coords)
            })
          })
        })
      }
    });

    try {
      console.log("setting bounds", bounds)
      this.map.fitBounds(bounds, {
        padding: {
          top: 40,
          bottom: 160,
          left: 40,
          right: 40
        }, duration: 1000
      });
    } catch (e) {
      console.log("Warning: Can not set bounds", bounds);
    }
  }

  initGame() {
    this.task = this.game.tasks[this.taskIndex];
    console.log("initializing trackerService");
    this.trackerService.init(this.game._id, this.device);
    this.trackerService.addEvent({
      type: "INIT_GAME"
    });
    this.initTask();
  }

  initTask() {
    this.vibration.vibrate([100, 100, 100]);
    this.nativeAudio.play('sound');
    console.log("Current task: ", this.task);
    this._initMapFeatures();
    this.trackerService.addEvent({
      type: "INIT_TASK",
      task: this.task
    });

    if (this.task.settings.accuracy) {
      this.triggerTreshold = this.task.settings.accuracy
    } else {
      this.triggerTreshold = 10;
    }

    if (this.userSelectMarker) {
      this.userSelectMarker.remove();
      this.userSelectMarker = null;
    }

    if (this.waypointMarker) {
      this.waypointMarker.remove();
      this.waypointMarker = null;
    }

    if (this.map.getStyle().layers.filter(e => e.id == 'viewDirectionTask').length > 0) {
      this.map.removeLayer('viewDirectionTask');
      this.map.removeSource('viewDirectionTask');
      navigator.geolocation.clearWatch(this.viewDirectionTaskGeolocateSubscription);
    }

    if (this.map.getStyle().layers.filter(e => e.id == 'viewDirectionClick').length > 0) {
      this.map.removeLayer('viewDirectionClick');
      this.map.removeSource('viewDirectionClick');
    }

    this.clickDirection = 0;

    if (
      this.task.type.includes("theme") &&
      this.task.settings["question-type"] != undefined
    ) {
      this.task.settings.text = this.task.settings[
        "question-type"
      ].settings.text;
    }
    if (!this.task.type.includes("theme")) {
      if (this.task.settings.point != null && this.task.settings.showMarker) {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'waypoint-marker';

        this.waypointMarker = new mapboxgl.Marker(el, {
          anchor: 'bottom',
          offset: [15, 0]
        })
          .setLngLat(
            this.game.tasks[this.taskIndex].settings.point.geometry.coordinates
          )
          .addTo(this.map);
      }
    }

    if (this.task.type == "theme-direction" &&
      ((this.task.settings["question-type"].name == "question-type-current-direction") ||
        (this.task.settings["question-type"].name == "photo"))) {

      this.geolocateControl.setType(GeolocateType.Continuous)
      // further stuff is one on map click
    } else if (this.task.type == "theme-direction" && this.task.settings["question-type"].name == "question-type-photo") {

    } else if (this.task.type == "theme-direction" && this.task.settings["question-type"].name == "question-type-map") {
      this.directionBearing = this.task.settings[
        "question-type"
      ].settings.direction;

      this.viewDirectionTaskGeolocateSubscription = navigator.geolocation.watchPosition(position => {
        if (this.map.getSource('viewDirectionTask')) {
          this.map.getSource('viewDirectionTask').setData({
            type: "Point",
            coordinates: [
              position.coords.longitude,
              position.coords.latitude
            ]
          })
        } else {
          this.map.addSource("viewDirectionTask", {
            type: "geojson",
            data: {
              type: "Point",
              coordinates: [
                position.coords.longitude,
                position.coords.latitude
              ]
            }
          });
          this.map.addLayer({
            id: "viewDirectionTask",
            source: "viewDirectionTask",
            type: "symbol",
            layout: {
              "icon-image": "view-direction-task",
              "icon-size": 0.65,
              "icon-offset": [0, -8],
              "icon-rotate": this.directionBearing
            }
          });
        }
      })
    }
    if (this.task.type == "theme-direction") {
      console.log(this.task.settings["question-type"].settings.direction);
      this.directionBearing = this.task.settings[
        "question-type"
      ].settings.direction;
    }


    if (
      this.task.type == "theme-object" &&
      this.task.settings["question-type"].name == "question-type-map"
    ) {
      console.log(this.task.settings["question-type"].settings);
      this.landmarkControl.setQTLandmark(this.task.settings["question-type"].settings.polygon[0])
    }

    this.zoomBounds()
  }

  onWaypointReached() {
    this.trackerService.addEvent({
      type: "WAYPOINT_REACHED"
    });
    this.initFeedback(true);
  }

  initFeedback(correct: boolean) {
    let type: FeedbackType;

    if (this.task.settings.feedback) {
      if (correct) {
        type = FeedbackType.Correct;
      } else if (this.task.settings.multipleTries) {
        type = FeedbackType.TryAgain;
      } else {
        type = FeedbackType.Wrong;
      }
    } else {
      type = FeedbackType.Saved
    }

    switch (type) {
      case FeedbackType.Correct:
        this.feedbackText = "Du hast die Aufgabe richtig gelöst!"
        break;
      case FeedbackType.Wrong:
        this.feedbackText = "Das war leider nicht richtig!"
        break;
      case FeedbackType.TryAgain:
        this.feedbackText = "Probiere es noch einmal!"
        this.feedbackRetry = true;
        break;
      case FeedbackType.Saved:
        this.feedbackText = "Deine Antwort wurde gespeichert!"
        break;
    }
    this.showFeedback = true
  }

  dismissFeedback() {
    this.showFeedback = false;
    this.feedbackRetry = false;
  }

  nextTask() {
    this.showFeedback = false;
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
      this.vibration.vibrate([300, 300, 300]);
      this.insomnia.allowSleepAgain().then(
        () => console.log("insomnia allow sleep again success"),
        () => console.log("insomnia allow sleep again error")
      );
      return;
    }

    this.task = this.game.tasks[this.taskIndex];
    this.initTask();
    console.log(this.taskIndex, this.task);
  }

  async onMultipleChoiceSelected(item, event) {
    this.selectedPhoto = item;
    this.isCorrectPhotoSelected = item.key === "photo-0";
    Array.from(document.getElementsByClassName('multiple-choize-img')).forEach(elem => {
      elem.classList.remove('selected')
    })
    event.target.classList.add('selected')
    this.trackerService.addAnswer({
      task: this.task,
      answer: {
        "multiple-choice": item.key,
        correct: this.isCorrectPhotoSelected,
      }
    });
  }

  async onOkClicked() {
    this.trackerService.addEvent({
      type: "ON_OK_CLICKED",
      position: {
        coordinates: {
          latitude: this.lastKnownPosition.coords.latitude,
          longitude: this.lastKnownPosition.coords.longitude,
          altitude: this.lastKnownPosition.coords.altitude,
          accuracy: this.lastKnownPosition.coords.accuracy,
          altitudeAccuracy: this.lastKnownPosition.coords.altitudeAccuracy,
          heading: this.lastKnownPosition.coords.heading,
          speed: this.lastKnownPosition.coords.speed
        },
        timestamp: this.lastKnownPosition.timestamp
      },
      compassHeading: this.compassHeading,
      mapViewport: {
        bounds: this.map.getBounds(),
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
        // style: this.map.getStyle(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch()
      }
    });
    if (this.task.type == "theme-loc") {
      const clickPosition = [
        this.userSelectMarker._lngLat.lng,
        this.userSelectMarker._lngLat.lat
      ];
      const distance = this.helperService.getDistanceFromLatLonInM(clickPosition[1], clickPosition[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)

      this.initFeedback(distance < this.triggerTreshold)

    } else if (
      this.task.type == "theme-object" &&
      this.task.settings["question-type"].name == "photo"
    ) {
      const clickPosition = [
        this.userSelectMarker._lngLat.lng,
        this.userSelectMarker._lngLat.lat
      ];

      const isInPolygon = booleanPointInPolygon(clickPosition, this.task.settings["question-type"].settings.polygon[0])

      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          inPolygon: isInPolygon
        }
      });
      this.initFeedback(isInPolygon);
    } else if (
      this.task.type == "theme-object" &&
      this.task.settings["question-type"].name == "description"
    ) {
      if (
        this.task.settings["answer-type"] &&
        this.task.settings["answer-type"].name == "take-photo"
      ) {
        if (this.photo == "") {
          const toast = await this.toastController.create({
            message: "Bitte mache ein Foto",
            color: "dark",
            // showCloseButton: true,
            duration: 2000
          });
          toast.present();
        } else {
          this.trackerService.addAnswer({
            task: this.task,
            answer: {
              photo: this.photoURL
            }
          });
          this.initFeedback(true);
          this.photo = "";
          this.photoURL = "";
        }
      } else if (
        this.task.settings["answer-type"] &&
        this.task.settings["answer-type"].name == "multiple-choice"
      ) {
        if (this.selectedPhoto != null) {
          this.initFeedback(this.isCorrectPhotoSelected);
          if (this.isCorrectPhotoSelected) {
            this.isCorrectPhotoSelected = null;
            this.selectedPhoto = null;
          }
        } else {
          const toast = await this.toastController.create({
            message: "Bitte wähle zuerst ein Foto",
            color: "dark",
            // showCloseButton: true,
            duration: 2000
          });
          toast.present();
        }
      } else {
        if (
          this.task.settings["question-type"].settings["answer-type"].settings
            .polygon
        ) {
          const clickPosition = [
            this.userSelectMarker._lngLat.lng,
            this.userSelectMarker._lngLat.lat
          ];
          const polygon = this.task.settings["question-type"].settings[
            "answer-type"
          ].settings.polygon[0];

          const correct = booleanPointInPolygon(clickPosition, polygon);

          this.initFeedback(correct);
        } else {
          const targetPosition = this.task.settings["question-type"].settings[
            "answer-type"
          ].settings.point.geometry.coordinates;
          const clickPosition = this.userSelectMarker._lngLat;

          const distance = this.helperService.getDistanceFromLatLonInM(
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
          this.initFeedback(distance < this.triggerTreshold);
        }
      }
    } else if (
      this.task.type == "info" ||
      (this.task.settings["answer-type"] != null &&
        this.task.settings["answer-type"].name == "take-photo")
    ) {
      this.initFeedback(true);
    }
    else if (this.task.type == "theme-direction" &&
      this.task.settings["question-type"].name == "question-type-arrow") {
      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          direction: this.compassHeading
        }
      });
      console.log(this.directionBearing, this.compassHeading);
      this.initFeedback(this.Math.abs(this.directionBearing - this.compassHeading) <= 45);
    }
    else if (this.task.type == "theme-direction" &&
      this.task.settings["question-type"].name != "question-type-current-direction" &&
      this.task.settings["question-type"].name != "photo" &&
      this.task.settings["answer-type"].name != "multiple-choice") {
      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          direction: this.compassHeading
        }
      });
      console.log(this.directionBearing, this.compassHeading);
      this.initFeedback(this.Math.abs(this.directionBearing - this.compassHeading) <= 45);
    } else if (this.task.type == "theme-direction" && this.task.settings["question-type"].name == "question-type-current-direction") {
      console.log(this.clickDirection, this.compassHeading)
      const correct = this.Math.abs(this.directionBearing - this.compassHeading) <= 45;
      this.initFeedback(correct);
      if (correct) {
        this.map.removeLayer('viewDirectionTask');
        navigator.geolocation.clearWatch(this.viewDirectionTaskGeolocateSubscription);
      }
    }
    else if (this.task.type == "theme-direction" && this.task.settings["question-type"].name == "question-type-map" && this.task.settings["answer-type"].name != "multiple-choice") {
      console.log(this.clickDirection, this.compassHeading)
      const correct = this.Math.abs(this.directionBearing - this.compassHeading) <= 45;
      this.initFeedback(correct);
      if (correct) {
        this.map.removeLayer('viewDirectionTask');
        navigator.geolocation.clearWatch(this.viewDirectionTaskGeolocateSubscription);
      }
    } else if (this.task.type == "theme-direction" && this.task.settings["question-type"].name == "photo") {
      const myTargetHeading = this.task.settings["question-type"].settings.direction
      console.log(this.clickDirection, myTargetHeading)
      const correct = this.Math.abs(this.clickDirection - myTargetHeading) <= 45;
      this.initFeedback(correct);
      if (correct) {
        this.map.removeLayer('viewDirectionTask');
        navigator.geolocation.clearWatch(this.viewDirectionTaskGeolocateSubscription);
      }
    } else if (
      this.task.settings["answer-type"] &&
      this.task.settings["answer-type"].name == "multiple-choice"
    ) {
      if (this.selectedPhoto != null) {
        this.initFeedback(this.isCorrectPhotoSelected);
        if (this.isCorrectPhotoSelected) {
          this.isCorrectPhotoSelected = null;
          this.selectedPhoto = null;
        }
      } else {
        const toast = await this.toastController.create({
          message: "Bitte wähle zuerst ein Foto",
          color: "dark",
          // showCloseButton: true,
          duration: 2000
        });
        toast.present();
      }
    } else {
      // TODO: disable button
      const waypoint = this.task.settings.point.geometry.coordinates;
      const arrived = this.userDidArrive(waypoint);
      if (!arrived) {
        this.initFeedback(false)
      } else {
        this.onWaypointReached();
      }
    }
  }

  userDidArrive(waypoint) {
    this.targetDistance = this.helperService.getDistanceFromLatLonInM(
      waypoint[1],
      waypoint[0],
      this.lastKnownPosition.coords.latitude,
      this.lastKnownPosition.coords.longitude
    );
    return this.targetDistance < this.triggerTreshold;
  }

  navigateHome() {
    navigator.geolocation.clearWatch(this.positionWatch);
    this.deviceOrientationSubscription.unsubscribe();
    this.navCtrl.navigateRoot("/");
    this.streetSectionControl.remove();
    this.map.remove();
  }

  togglePanel() {
    this.panelMinimized = !this.panelMinimized;
  }

  capturePhoto() {
    this.photo = '';
    this.photoURL = '';
    this.camera.getPicture(this.cameraOptions).then(
      imageData => {
        const filePath = this.webview.convertFileSrc(imageData)
        this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);

        const fileTransfer: FileTransferObject = this.transfer.create();
        fileTransfer.upload(imageData, `${environment.apiURL}/upload`).then(res => {
          console.log(JSON.parse(res.response))
          const filename = JSON.parse(res.response).filename
          this.photoURL = `${environment.apiURL}/file/${filename}`
        })
          .catch(err => console.log(err))
      },
      async err => {
        const toast = await this.toastController.create({
          header: 'Error',
          message: err,
          color: "danger",
          // showCloseButton: true,
          duration: 2000
        });
        toast.present();
      }
    );
  }

  toggleRotate() {
    this.rotationControl.toggle();
  }

  toggleSat() {
    this.layerControl.toggleSat();
  }

  toggle3D() {
    this.layerControl.toggle3D();
  }

  toggleDirection() {
    this.viewDirectionControl.toggle();
  }

  toggleGeolocate() {
    this.geolocateControl.toggle();
  }

  _initMapFeatures() {
    let mapFeatures = this.task.settings.mapFeatures;
    console.log("MapFeatures: ", mapFeatures);
    if (mapFeatures != undefined) {
      for (let key in mapFeatures) {
        if (mapFeatures.hasOwnProperty(key)) {
          switch (key) {
            case "zoombar":
              if (mapFeatures[key]) {
                this.map.scrollZoom.enable();
                this.map.doubleClickZoom.enable();
                this.map.touchZoomRotate.enable();
                this.map.addControl(this.zoomControl);
              } else {
                this.map.scrollZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.touchZoomRotate.disable();
              }
              break;
            case "pan":
              this.panCenter = false; // Reset value
              if (mapFeatures[key] == "true") {
                this.panControl.setType(PanType.True)
                /* this.map.dragPan.enable(); */
              } else if (mapFeatures[key] == "center") {
                this.panControl.setType(PanType.Center)
                /* this.panCenter = true; */
              } else if (mapFeatures[key] == "static") {
                this.panControl.setType(PanType.Static)
                /* this.map.dragPan.disable();
                this.map.scrollZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.touchZoomRotate.disable(); */
              }
              break;
            case "rotation":
              if (mapFeatures[key] == "manual") {
                this.rotationControl.setType(RotationType.Manual)
              } else if (mapFeatures[key] == "auto") {
                this.rotationControl.setType(RotationType.Auto)
              } else if (mapFeatures[key] == "button") {
                this.rotationControl.setType(RotationType.Button)
              } else if (mapFeatures[key] == "north") {
                this.rotationControl.setType(RotationType.North)
              }
              break;
            case "material":
              this.swipe = false;
              if (this.map.getLayer("satellite")) {
                this.map.removeLayer("satellite");
              }

              const elem = document.getElementsByClassName("mapboxgl-compare");
              while (elem.length > 0) elem[0].remove();

              if (mapFeatures[key] == "standard") {
                this.layerControl.setType(LayerType.Standard)
              } else if (mapFeatures[key] == "selection") {
                this.layerControl.setType(LayerType.Selection)
              } else if (mapFeatures[key] == "sat") {
                this.layerControl.setType(LayerType.Satellite)
              } else if (mapFeatures[key] == "sat-button") {
                // TODO: implememt
                this.layerControl.setType(LayerType.SatelliteButton)
              } else if (mapFeatures[key] == "sat-swipe") {
                this.swipe = true;
                this.changeDetectorRef.detectChanges();
                this.layerControl.setType(LayerType.Swipe, this.swipeMapContainer)
              } else if (mapFeatures[key] == "3D") {
                this.layerControl.setType(LayerType.ThreeDimension)
              } else if (mapFeatures[key] == "3D-button") {
                this.layerControl.setType(LayerType.ThreeDimensionButton)
              }
              break;
            case "position":
              if (mapFeatures[key] == "none") {
                this.geolocateControl.setType(GeolocateType.None)
              } else if (mapFeatures[key] == "true") {
                this.geolocateControl.setType(GeolocateType.Continuous)
              } else if (mapFeatures[key] == "button") {
                // TODO: implement
              } else if (mapFeatures[key] == "start") {
                // TODO: implement
              }
              break;
            case "direction":
              this.directionArrow = false;
              if (mapFeatures[key] == "none") {
                this.viewDirectionControl.setType(ViewDirectionType.None)
              } else if (mapFeatures[key] == "true") {
                this.viewDirectionControl.setType(ViewDirectionType.Continuous)
              } else if (mapFeatures[key] == "button") {
                // TODO: implement
              } else if (mapFeatures[key] == "start") {
                // TODO: implement
              }
              break;
            case "track":
              if (mapFeatures[key]) {
                this.trackControl.setType(TrackType.Enabled)
              } else {
                this.trackControl.setType(TrackType.Disabled)
              }
              break;
            case "streetSection":
              if (mapFeatures[key]) {
                this.streetSectionControl.setType(StreetSectionType.Enabled)
              } else {
                this.streetSectionControl.setType(StreetSectionType.Disabled)
              }
              break;
            case "landmarks":
              if (mapFeatures[key]) {
                this.landmarkControl.setLandmark(mapFeatures.landmarkFeatures)
              } else {
                this.landmarkControl.remove()
              }
              break;
          }
        }
      }
    }
  }

  /**
   * Shuffles array in place. ES6 version
   * @param {Array} a items An array containing the items.
   */
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

