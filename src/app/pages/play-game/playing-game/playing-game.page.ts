import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GamesService } from "../../../services/games.service";
import { OsmService } from "../../../services/osm.service";
import { TrackerService } from "../../../services/tracker.service";
import mapboxgl from "mapbox-gl";
import { Plugins, GeolocationPosition, Capacitor, CameraResultType, CameraSource } from '@capacitor/core';

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
import { Subscription, Observable, Subscriber } from "rxjs";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { RotationControl, RotationType } from './../../../mapControllers/rotation-control'
import { ViewDirectionControl, ViewDirectionType } from './../../../mapControllers/view-direction-control';
import { LandmarkControl } from 'src/app/mapControllers/landmark-control';
import { StreetSectionControl, StreetSectionType } from './../../../mapControllers/street-section-control'
import { LayerControl, LayerType } from 'src/app/mapControllers/layer-control';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';
import { TrackControl, TrackType } from 'src/app/mapControllers/track-control';
import { GeolocateControl, GeolocateType } from 'src/app/mapControllers/geolocate-control';
import { PanControl, PanType } from 'src/app/mapControllers/pan-control';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { mappings } from './../../../pipes/keywords.js'

import { OrigamiGeolocationService } from './../../../services/origami-geolocation.service';
import { AnswerType, TaskMode, QuestionType } from 'src/app/models/types';

import { cloneDeep } from 'lodash';
import { standardMapFeatures } from "./../../../models/mapFeatures"

import { AnimationOptions } from 'ngx-lottie';
import bbox from '@turf/bbox';


enum FeedbackType {
  Correct,
  Wrong,
  TryAgain,
  Saved,
  Success
}

@Component({
  selector: "app-playing-game",
  templateUrl: "./playing-game.page.html",
  styleUrls: ["./playing-game.page.scss"]
})
export class PlayingGamePage implements OnInit, OnDestroy {
  @ViewChild("mapWrapper") mapWrapper;
  @ViewChild("map") mapContainer;
  @ViewChild("swipeMap") swipeMapContainer;
  @ViewChild('panel') panel;

  game: Game;

  map: mapboxgl.Map;
  waypointMarker: mapboxgl.Marker;
  waypointMarkerDuplicate: mapboxgl.Marker;
  // zoomControl: mapboxgl.NavigationControl = new mapboxgl.NavigationControl();

  // map features
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


  positionSubscription: Subscription;
  lastKnownPosition: GeolocationPosition;

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
  public lottieConfig: AnimationOptions;

  showFeedback: boolean = false;
  feedback: any = {
    text: '',
    icon: ''
  }
  feedbackRetry: boolean = false;

  Math: Math = Math;

  uploadDone: boolean = false;

  positionWatch: any;
  deviceOrientationSubscription: Subscription;

  photo: SafeResourceUrl;
  photoURL: string;

  // multiple choice
  selectedPhoto: string;
  isCorrectPhotoSelected: boolean;

  // multiple choice text
  selectedChoice: string;
  isCorrectChoiceSelected: boolean;

  primaryColor: string;
  secondaryColor: string;

  panelMinimized: boolean = false;

  viewDirectionTaskGeolocateSubscription: Subscription;

  private audioPlayer: HTMLAudioElement = new Audio();

  uploading: boolean = false;

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
    public alertController: AlertController,
    public platform: Platform,
    public helperService: HelperService,
    private transfer: FileTransfer,
    private sanitizer: DomSanitizer,
    private geolocationService: OrigamiGeolocationService
  ) {
    this.lottieConfig = {
      path: "assets/lottie/star-success.json",
      renderer: "canvas",
      autoplay: true,
      loop: true
    };
    this.audioPlayer.src = 'assets/sounds/zapsplat_multimedia_alert_musical_warm_arp_005_46194.mp3'
    this.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
    this.secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-secondary');
  }

  ngOnInit() { }

  ionViewWillEnter() {
    mapboxgl.accessToken = environment.mapboxAccessToken;

    let mapStyle;
    // if (environment.production) {
    mapStyle = {
      'version': 8,
      "metadata": {
        "mapbox:autocomposite": true,
        "mapbox:type": "template"
      },
      'sources': {
        'raster-tiles': {
          'type': 'raster',
          'tiles': [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          'tileSize': 256,
        },
        "mapbox": {
          "url": "mapbox://mapbox.mapbox-streets-v7",
          "type": "vector"
        }
      },
      'layers': [
        {
          'id': 'simple-tiles',
          'type': 'raster',
          'source': 'raster-tiles',
          'minzoom': 0,
          'maxzoom': 22
        },
        {
          "id": "building",
          "type": "fill",
          "source": "mapbox",
          "source-layer": "building",
          "paint": {
            "fill-color": "#d6d6d6",
            "fill-opacity": 0,
          },
          "interactive": true
        },
      ]
    }
    // } else {
    //   mapStyle = document.body.classList.contains("dark")
    //     ? "mapbox://styles/mapbox/dark-v9"
    //     : "mapbox://styles/mapbox/streets-v9"
    // }

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: mapStyle,
      center: [8, 51.8],
      zoom: 2,
      maxZoom: 18
    });

    this.geolocationService.init();

    this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(position => {
      this.trackerService.addWaypoint({});

      this.lastKnownPosition = position;

      if (this.task && !this.showSuccess) {
        if (this.task.answer.type == AnswerType.POSITION) {

          const waypoint = this.task.answer.position.geometry.coordinates;

          if (this.userDidArrive(waypoint) && !this.task.settings.confirmation && !this.showFeedback) {
            this.onWaypointReached();
          }

          if (this.task.answer.mode == TaskMode.NAV_ARROW) {
            const destCoords = this.task.answer.position.geometry.coordinates;
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
    });

    this.map.on("load", () => {
      this.rotationControl = new RotationControl(this.map)
      this.viewDirectionControl = new ViewDirectionControl(this.map, this.deviceOrientation, this.geolocationService)
      this.landmarkControl = new LandmarkControl(this.map)
      this.streetSectionControl = new StreetSectionControl(this.map, this.OSMService, this.geolocationService);
      this.layerControl = new LayerControl(this.map, this.mapWrapper, this.deviceOrientation, this.alertController, this.platform)
      this.trackControl = new TrackControl(this.map, this.geolocationService)
      this.geolocateControl = new GeolocateControl(this.map, this.geolocationService)
      this.panControl = new PanControl(this.map, this.geolocationService)

      this.map.loadImage(
        "/assets/icons/directionv2-richtung.png",
        (error, image) => {
          if (error) throw error;

          this.map.addImage("view-direction-task", image);
        })

      this.map.loadImage(
        "/assets/icons/marker-editor.png",
        (error, image) => {
          if (error) throw error;

          this.map.addImage("marker-editor", image);
        })

      this.map.loadImage(
        "/assets/icons/position.png",
        (error, image) => {
          if (error) throw error;

          this.map.addImage("view-direction-click-geolocate", image);
        })

      this.game = null;
      this.game = new Game(0, "Loading...", false, []);
      this.route.params.subscribe(params => {
        this.gamesService
          .getGame(params.id)
          .then(games => {
            this.game = games[0];
          })
          .finally(async () => {
            await this.initGame();
          });
      });
    });

    this.map.on("click", e => this.onMapClick(e, "standard"));

    this.map.on('rotate', () => {
      if (this.map.getLayer('viewDirectionTask')) {
        this.map.setLayoutProperty(
          "viewDirectionTask",
          "icon-rotate",
          this.directionBearing - this.map.getBearing()
        );
      }

      if (this.map.getLayer('viewDirectionClick')) {
        this.map.setLayoutProperty(
          "viewDirectionClick",
          "icon-rotate",
          this.clickDirection - this.map.getBearing()
        );
      }
    })

    // rotation
    this.deviceOrientationSubscription = this.deviceOrientation
      .watchHeading()
      .subscribe((data: DeviceOrientationCompassHeading) => {
        this.compassHeading = data.magneticHeading;
        this.targetHeading = 360 - (this.compassHeading - this.heading);
        this.indicatedDirection = this.compassHeading - this.directionBearing;
      });

    if (Capacitor.isNative) {
      Plugins.CapacitorKeepScreenOn.enable()
    }
  }

  onMapClick(e, mapType) {
    console.log(e)
    let clickDirection = undefined;

    if (this.task.answer.type == AnswerType.MAP_POINT) {
      const pointFeature = this.helperService._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);

      if (this.map.getSource('marker-point')) {
        this.map.getSource('marker-point').setData(pointFeature)
      } else {
        this.map.addSource('marker-point', {
          'type': 'geojson',
          'data': pointFeature
        });
      }

      if (!this.map.getLayer('marker-point')) {
        this.map.addLayer({
          'id': 'marker-point',
          'type': 'symbol',
          'source': 'marker-point',
          'layout': {
            "icon-image": "marker-editor",
            "icon-size": 0.65,
            "icon-anchor": 'bottom'
          }
        });
      }
    }

    if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
      if (this.task.question.direction?.position) {
        this.clickDirection = this.helperService.bearing(
          this.task.question.direction.position.geometry.coordinates[1],
          this.task.question.direction.position.geometry.coordinates[0],
          e.lngLat.lat,
          e.lngLat.lng
        )
      } else {
        this.clickDirection = this.helperService.bearing(
          this.lastKnownPosition.coords.latitude,
          this.lastKnownPosition.coords.longitude,
          e.lngLat.lat,
          e.lngLat.lng
        )
      }
      clickDirection = this.clickDirection;
      if (!this.map.getLayer('viewDirectionClick')) {
        if (this.task.question.direction?.position) {
          this.map.addSource("viewDirectionClick", {
            type: "geojson",
            data: {
              type: "Point",
              coordinates: this.task.question.direction.position.geometry.coordinates
            }
          });
        } else {
          this.map.addSource("viewDirectionClick", {
            type: "geojson",
            data: {
              type: "Point",
              coordinates: [this.lastKnownPosition.coords.longitude, this.lastKnownPosition.coords.latitude]
            }
          });
        }
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
        if (this.map.getLayer('viewDirectionClickGeolocate')) {
          this.map.removeLayer('viewDirectionClickGeolocate')
          this.map.removeSource('viewDirectionClickGeolocate')
        } else {
          this.geolocateControl.setType(GeolocateType.None)
        }
      }
      this.map.setLayoutProperty(
        "viewDirectionClick",
        "icon-rotate",
        this.clickDirection - this.map.getBearing()
      );
    }

    this.trackerService.addEvent({
      type: "ON_MAP_CLICKED",
      clickPosition: {
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng
      },
      clickDirection: clickDirection,
      map: mapType
    });
  }

  zoomBounds() {
    var bounds = new mapboxgl.LngLatBounds();

    this.game.tasks.forEach(task => {
      if (task.answer.position) {
        try {
          bounds.extend(task.answer.position.geometry.coordinates);
        } catch (e) {

        }
      }

      if (task.question.geometry) {
        try {
          bounds.extend(bbox(task.question.geometry))
        } catch (e) {

        }
      }

      if (task.question.direction) {
        try {
          bounds.extend(task.question.direction.position.geometry.coordinates)
        } catch (e) {

        }
      }

      if (task.mapFeatures?.landmarkFeatures && task.mapFeatures?.landmarkFeatures.features.length > 0) {
        try {
          bounds.extend(bbox(task.mapFeatures.landmarkFeatures))
        } catch (e) {

        }
      }

    });

    const prom = new Promise((resolve, reject) => {
      this.map.once('moveend', () => resolve('ok'))

      if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds, {
          padding: {
            top: 80,
            bottom: 280,
            left: 40,
            right: 40
          }, duration: 1000
        });
      } else {
        reject('bounds are empty')
      }
    })

    return prom;
  }

  async initGame() {
    this.task = this.game.tasks[this.taskIndex];
    await this.trackerService.init(this.game._id, this.game.name, this.map);
    this.trackerService.addEvent({
      type: "INIT_GAME"
    });
    this.initTask();
  }

  async initTask() {
    this.panelMinimized = false;

    console.log("Current task: ", this.task);

    this.trackerService.setTask(this.task)

    this.trackerService.addEvent({
      type: "INIT_TASK"
    });

    if (this.task.settings?.accuracy) {
      this.triggerTreshold = this.task.settings.accuracy
    } else {
      this.triggerTreshold = 10;
    }

    if (this.map.getLayer('marker-point')) {
      this.map.removeLayer('marker-point')
    }

    if (this.map.getSource('marker-point')) {
      this.map.removeSource('marker-point')
    }

    if (this.waypointMarker) {
      this.waypointMarker.remove();
      this.waypointMarker = null;
      this.waypointMarkerDuplicate.remove();
      this.waypointMarkerDuplicate = null;
    }

    if (this.map.getLayer('viewDirectionTask')) {
      this.map.removeLayer('viewDirectionTask');
      this.map.removeSource('viewDirectionTask');
    }

    if (this.map.getLayer('viewDirectionClick')) {
      this.map.removeLayer('viewDirectionClick');
      this.map.removeSource('viewDirectionClick');
    }

    if (this.map.getLayer('viewDirectionClickGeolocate')) {
      this.map.removeLayer('viewDirectionClickGeolocate')
      this.map.removeSource('viewDirectionClickGeolocate')
    }

    try {
      await this.zoomBounds()
    } catch (e) {
      console.log(e)
    }

    this._initMapFeatures();
    this.landmarkControl.removeQT();


    this.photo = '';
    this.photoURL = '';
    this.clickDirection = 0;


    if (this.task.answer.type == AnswerType.POSITION) {
      if (this.task.answer.position != null && this.task.settings.showMarker) {
        const el = document.createElement('div');
        el.className = 'waypoint-marker';

        // remove maybe existing waypointMarker
        if (this.waypointMarker) {
          this.waypointMarker.remove();
          this.waypointMarker = null;
          this.waypointMarkerDuplicate.remove();
          this.waypointMarkerDuplicate = null;
        }

        this.waypointMarker = new mapboxgl.Marker(el, {
          anchor: 'bottom',
          offset: [15, 0]
        })
          .setLngLat(
            this.task.answer.position.geometry.coordinates
          )
          .addTo(this.map);

        // create a duplicate for the swipe map
        const elDuplicate = document.createElement('div');
        elDuplicate.className = 'waypoint-marker';

        this.waypointMarkerDuplicate = new mapboxgl.Marker(elDuplicate, {
          anchor: 'bottom',
          offset: [15, 0]
        })
          .setLngLat(
            this.task.answer.position.geometry.coordinates
          )

        this.layerControl.passMarkers({ waypointMarker: this.waypointMarkerDuplicate })
      }
    }

    if (this.task.question.type == QuestionType.MAP_DIRECTION) {
      this.directionBearing = this.task.question.direction.bearing || 0
    }

    if (this.task.question.type == QuestionType.MAP_DIRECTION_MARKER) {
      this.directionBearing = this.task.question.direction.bearing || 0

      this.map.addSource("viewDirectionTask", {
        type: "geojson",
        data: this.task.question.direction.position.geometry
      });
      this.map.addLayer({
        id: "viewDirectionTask",
        source: "viewDirectionTask",
        type: "symbol",
        layout: {
          "icon-image": "view-direction-task",
          "icon-size": 0.65,
          "icon-offset": [0, -8],
          "icon-rotate": this.directionBearing - this.map.getBearing()
        }
      });
    }

    if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
      if (this.task.question.direction?.position) {
        this.map.addSource("viewDirectionClickGeolocate", {
          type: "geojson",
          data: this.task.question.direction.position.geometry
        });
        this.map.addLayer({
          id: "viewDirectionClickGeolocate",
          source: "viewDirectionClickGeolocate",
          type: "symbol",
          layout: {
            "icon-image": "view-direction-click-geolocate",
            "icon-size": 0.4,
            "icon-offset": [0, 0],
          }
        });
      } else {
        this.geolocateControl.setType(GeolocateType.Continuous)
      }
    }

    if (this.task.question.type == QuestionType.MAP_FEATURE && this.task.answer.mode != TaskMode.NO_FEATURE) {
      this.landmarkControl.setQTLandmark(this.task.question.geometry.features[0])
    }
  }

  onWaypointReached() {
    this.trackerService.addEvent({
      type: "WAYPOINT_REACHED"
    });
    this.initFeedback(true);
  }

  initFeedback(correct: boolean) {
    // feedback is already showing. 
    if (this.showFeedback) {
      return;
    }

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
      if (this.task.category == 'nav' && !this.task.settings.confirmation) {
        type = FeedbackType.Success
      } else {
        type = FeedbackType.Saved
      }
    }

    switch (type) {
      case FeedbackType.Correct:
        this.feedback.icon = "😊"
        this.feedback.text = "Du hast die Aufgabe richtig gelöst!"
        break;
      case FeedbackType.Wrong:
        this.feedback.icon = "😕"
        this.feedback.text = "Da ist etwas schief gegangen! Weiter geht es mit der nächsten Aufgabe!"
        break;
      case FeedbackType.TryAgain:
        this.feedback.icon = "😕"
        this.feedback.text = "Probiere es noch einmal!"
        this.feedbackRetry = true;
        break;
      case FeedbackType.Saved:
        this.feedback.icon = ""
        this.feedback.text = "Deine Antwort wurde gespeichert!"
        break;
      case FeedbackType.Success:
        this.feedback.icon = ""
        this.feedback.text = "Ziel erreicht!"
        break;
    }
    this.showFeedback = true

    if (type != FeedbackType.TryAgain) {
      if (Capacitor.isNative) {
        Plugins.Haptics.vibrate();
      }
      this.audioPlayer.play()
    }

    if (this.task.settings.multipleTries) {
      setTimeout(() => {
        this.dismissFeedback()
        if (type !== FeedbackType.TryAgain) {
          this.nextTask()
        }
      }, 2000)
    }

    if (!this.task.settings.feedback) {
      setTimeout(() => {
        this.dismissFeedback()
        this.nextTask()
      }, 2000)
    }
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
          this.uploadDone = true;
        }
      });
      if (Capacitor.isNative) {
        Plugins.Haptics.vibrate();
        Plugins.CapacitorKeepScreenOn.disable()
      }

      return;
    }

    this.task = this.game.tasks[this.taskIndex];
    this.initTask();
  }

  async onMultipleChoicePhotoSelected(item, event) {
    this.selectedPhoto = item;
    this.isCorrectPhotoSelected = item.key === "0";

    Array.from(document.getElementsByClassName('multiple-choize-img')).forEach(elem => {
      elem.classList.remove('selected')
    })
    event.target.classList.add('selected')

    this.trackerService.addEvent({
      type: "PHOTO_SELECTED",
      answer: {
        photo: item.value,
        correct: this.isCorrectPhotoSelected,
      }
    });
  }

  onMultipleChoiceSelected(item, event) {
    this.selectedChoice = item;
    this.isCorrectChoiceSelected = item.key === "0";

    Array.from(document.getElementsByClassName('choice')).forEach(elem => {
      elem.classList.remove('selected')
    })
    event.target.classList.add('selected')

    this.trackerService.addEvent({
      type: "MULTIPLE_CHOICE_SELECTED",
      answer: {
        photo: item.value,
        correct: this.isCorrectChoiceSelected,
      }
    });
  }

  async onOkClicked() {
    let isCorrect: boolean = true;
    let answer: any = {}

    if (this.task.answer.type == AnswerType.POSITION) {
      const waypoint = this.task.answer.position.geometry.coordinates;
      const arrived = this.userDidArrive(waypoint);
      answer = {
        target: waypoint,
        position: this.lastKnownPosition,
        distance: this.helperService.getDistanceFromLatLonInM(waypoint[1], waypoint[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude),
        correct: arrived
      }
      isCorrect = arrived
      if (!arrived) {
        this.initFeedback(false)
      } else {
        this.onWaypointReached();
      }
    }

    if (this.task.type == "theme-loc") {
      if (this.map.getSource('marker-point')) {
        const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;
        const distance = this.helperService.getDistanceFromLatLonInM(clickPosition[1], clickPosition[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)
        isCorrect = distance < this.triggerTreshold;
        answer = {
          clickPosition: clickPosition,
          distance: distance,
          correct: isCorrect
        }

        this.initFeedback(distance < this.triggerTreshold)
      } else {
        const toast = await this.toastController.create({
          message: "Bitte setze zuerst deine Position",
          color: "dark",
          // showCloseButton: true,
          duration: 2000
        });
        toast.present();

        isCorrect = false;
        answer = {
          clickPosition: undefined,
          distance: undefined,
          correct: isCorrect
        }
      }
    }

    if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {
      if (this.selectedPhoto != null) {
        this.initFeedback(this.isCorrectPhotoSelected);
        isCorrect = this.isCorrectPhotoSelected
        answer = {
          selectedPhoto: this.selectedPhoto,
          correct: isCorrect
        }
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
        isCorrect = false;
        answer = {
          selectedPhoto: null,
          correct: isCorrect
        }
      }
    }

    if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE_TEXT) {
      if (this.selectedChoice != null) {
        this.initFeedback(this.isCorrectChoiceSelected);
        isCorrect = this.isCorrectChoiceSelected
        answer = {
          selectedChoice: this.selectedChoice,
          correct: isCorrect
        }
        if (this.isCorrectChoiceSelected) {
          this.isCorrectChoiceSelected = null;
          this.selectedChoice = null;
        }
      } else {
        const toast = await this.toastController.create({
          message: "Bitte wähle zuerst eine Antwort",
          color: "dark",
          // showCloseButton: true,
          duration: 2000
        });
        toast.present();
        isCorrect = false;
        answer = {
          selectedChoice: null,
          correct: isCorrect
        }
      }
    }

    if (this.task.answer.type == AnswerType.PHOTO) {
      if (this.photo == "") {
        const toast = await this.toastController.create({
          message: "Bitte mache ein Foto",
          color: "dark",
          // showCloseButton: true,
          duration: 2000
        });
        toast.present();

        isCorrect = false;
        answer = {
          photo: null,
          correct: isCorrect
        }
      } else {
        this.initFeedback(true);
        isCorrect = true;
        answer = {
          photo: this.photo,
          correct: isCorrect
        }
        this.photo = "";
        this.photoURL = "";
      }
    }

    if (this.task.answer.type == AnswerType.MAP_POINT && this.task.type != "theme-loc") {
      if (this.map.getSource('marker-point')) {
        const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;
        const isInPolygon = booleanPointInPolygon(clickPosition, this.task.question.geometry.features[0])
        this.initFeedback(isInPolygon);
        isCorrect = isInPolygon;
        answer = {
          clickPosition: clickPosition,
          correct: isCorrect
        }
      } else {
        const toast = await this.toastController.create({
          message: "Bitte setze zuerst einen Punkt auf der Karte",
          color: "dark",
          // showCloseButton: true,
          duration: 2000
        });
        toast.present();
        isCorrect = false;
        answer = {
          clickPosition: undefined,
          correct: isCorrect
        }
      }
    }

    if (this.task.answer.type == AnswerType.DIRECTION) {
      this.initFeedback(this.Math.abs(this.directionBearing - this.compassHeading) <= 45);
      isCorrect = this.Math.abs(this.directionBearing - this.compassHeading) <= 45;
      answer = {
        compassHeading: this.compassHeading,
        correct: isCorrect
      }
    }

    if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
      if (this.clickDirection != 0) {
        if (this.task.question.type == QuestionType.MAP_DIRECTION_PHOTO) {
          this.initFeedback(this.Math.abs(this.clickDirection - this.task.question.direction.bearing) <= 45);
          isCorrect = this.Math.abs(this.clickDirection - this.task.question.direction.bearing) <= 45;
        } else {
          this.initFeedback(this.Math.abs(this.clickDirection - this.compassHeading) <= 45);
          isCorrect = this.Math.abs(this.clickDirection - this.compassHeading) <= 45;
        }
        answer = {
          clickDirection: this.clickDirection,
          correct: isCorrect
        }
      } else {
        const toast = await this.toastController.create({
          message: "Bitte setze zuerst deine Blickrichtung",
          color: "dark",
          // showCloseButton: true,
          duration: 2000
        });
        toast.present();
        isCorrect = false;
        answer = {
          compassHeading: undefined,
          correct: isCorrect
        }
      }
    }

    this.trackerService.addEvent({
      type: "ON_OK_CLICKED",
      correct: isCorrect,
      answer: answer
    });

    if (this.task.category == "info") {
      this.nextTask()
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

  ngOnDestroy() {

  }

  navigateHome() {
    this.positionSubscription.unsubscribe();
    this.geolocationService.clear()
    this.deviceOrientationSubscription.unsubscribe();

    this.rotationControl.remove();
    this.viewDirectionControl.remove()
    this.landmarkControl.remove()
    this.streetSectionControl.remove()
    this.layerControl.remove()
    this.trackControl.remove()
    this.geolocateControl.remove()
    this.panControl.remove();

    // this.map.remove();
    this.navCtrl.navigateRoot("/");
    this.streetSectionControl.remove();
  }

  togglePanel() {
    this.panelMinimized = !this.panelMinimized;
  }

  async capturePhoto() {
    this.photo = '';
    this.photoURL = '';

    const image = await Plugins.Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      width: 500
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);

    this.uploading = true;

    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.upload(image.path, `${environment.apiURL}/upload`).then(res => {
      const filename = JSON.parse(res.response).filename
      this.photoURL = `${environment.apiURL}/file/${filename}`
      this.uploading = false;

      this.trackerService.addEvent({
        type: "PHOTO_TAKEN",
        photo: `${environment.apiURL}/file/${filename}`
      })
    })
      .catch(err => {
        console.log(err)
        this.uploading = false;
      })
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
    let mapFeatures = this.task.mapFeatures;
    if (mapFeatures == undefined) {
      mapFeatures = cloneDeep(standardMapFeatures)
    }
    for (let key in mapFeatures) {
      if (mapFeatures.hasOwnProperty(key)) {
        switch (key) {
          case "zoombar":
            if (mapFeatures[key]) {
              this.map.scrollZoom.enable();
              this.map.boxZoom.enable();
              this.map.doubleClickZoom.enable();
              this.map.touchZoomRotate.enable();
            } else {
              this.map.scrollZoom.disable();
              this.map.boxZoom.disable();
              this.map.doubleClickZoom.disable();
              this.map.touchZoomRotate.disable();
            }
            break;
          case "pan":
            if (mapFeatures[key] == "true") {
              this.panControl.setType(PanType.True)
            } else if (mapFeatures[key] == "center") {
              this.panControl.setType(PanType.Center)
            } else if (mapFeatures[key] == "static") {
              this.panControl.setType(PanType.Static)
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
              this.layerControl.swipeClickSubscription.subscribe(e => this.onMapClick(e, "swipe"))
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
              if (this.task.mapFeatures.direction != "true") {
                // only show position marker when there is no direction marker
                this.geolocateControl.setType(GeolocateType.Continuous)
              }
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

  isKey(key: string) {
    return mappings.filter(m => {
      if (key == null) {
        return
      }
      return key.includes(m.tag)
    }).length > 0
  }
}

