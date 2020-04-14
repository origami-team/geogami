import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GamesService } from "../../../services/games.service";
import { OsmService } from "../../../services/osm.service";
import { TrackerService } from "../../../services/tracker.service";
import { Device } from "@ionic-native/device/ngx";
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
import { Insomnia } from "@ionic-native/insomnia/ngx";
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

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { mappings } from './../../../pipes/keywords.js'

import { OrigamiGeolocationService } from './../../../services/origami-geolocation.service';
import { AnswerType, TaskMode, QuestionType } from 'src/app/models/types';

import { cloneDeep } from 'lodash';
import { standardMapFeatures } from "./../../../models/mapFeatures"



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
export class PlayingGamePage implements OnInit, OnDestroy {
  @ViewChild("mapWrapper", { static: false }) mapWrapper;
  @ViewChild("map", { static: false }) mapContainer;
  @ViewChild("swipeMap", { static: false }) swipeMapContainer;
  @ViewChild('panel', { static: false }) panel;

  game: Game;

  map: mapboxgl.Map;
  waypointMarker: mapboxgl.Marker;
  waypointMarkerDuplicate: mapboxgl.Marker;
  zoomControl: mapboxgl.NavigationControl = new mapboxgl.NavigationControl();

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
  public lottieConfig: Object;

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
    private device: Device,
    private insomnia: Insomnia,
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
          if (
            this.userDidArrive(waypoint) &&
            !this.task.settings.confirmation
          ) {
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

      if (this.task && this.task.answer.type == AnswerType.MAP_DIRECTION) {
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
    });

    this.map.on("load", () => {
      this.rotationControl = new RotationControl(this.map)
      this.viewDirectionControl = new ViewDirectionControl(this.map, this.deviceOrientation, this.geolocationService)
      this.landmarkControl = new LandmarkControl(this.map)
      this.streetSectionControl = new StreetSectionControl(this.map, this.OSMService, this.geolocationService);
      this.layerControl = new LayerControl(this.map, this.mapWrapper, this.deviceOrientation, this.alertController, this.platform);
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

    this.map.on("click", e => {
      this.trackerService.addEvent({
        type: "ON_MAP_CLICKED",
        clickPosition: {
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng
        }
      });

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
          this.clickDirection - this.map.getBearing()
        );
      }
    });

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

    this.insomnia.keepAwake().then(
      () => console.log("insomnia keep awake success"),
      () => console.log("insomnia keep awake error")
    );
  }

  zoomBounds() {
    var bounds = new mapboxgl.LngLatBounds();

    this.game.tasks.forEach(task => {
      if (task.answer.position)
        bounds.extend(task.answer.position.geometry.coordinates);
      // if (task.settings['question-type'] &&
      //   task.settings['question-type'].settings &&
      //   task.settings['question-type'].settings.polygon != undefined) {
      //   task.settings['question-type'].settings.polygon.forEach(e => {
      //     e.geometry.coordinates.forEach(c => {
      //       c.forEach(coords => {
      //         bounds.extend(coords)
      //       })
      //     })
      //   })
      // }
    });

    this.changeDetectorRef.detectChanges()
    const panelHeight = this.panel.nativeElement.children[0].offsetHeight;

    console.log("zooming bounds ", panelHeight)

    try {
      this.map.fitBounds(bounds, {
        padding: {
          top: 80,
          bottom: panelHeight < 250 ? 280 : panelHeight + 40,
          left: 40,
          right: 40
        }, duration: 1000
      });
    } catch (e) {
      console.log("Warning: Can not set bounds", bounds);
    }
  }

  async initGame() {
    this.task = this.game.tasks[this.taskIndex];
    await this.trackerService.init(this.game._id, this.map);
    this.trackerService.addEvent({
      type: "INIT_GAME"
    });
    this.initTask();
  }

  initTask() {
    this.panelMinimized = false;

    if (Capacitor.isNative) {
      Plugins.Haptics.vibrate();
    }
    this.audioPlayer.play()
    console.log("Current task: ", this.task);

    this.trackerService.addEvent({
      type: "INIT_TASK",
      task: this.task
    });

    if (this.task.settings && this.task.settings.accuracy) {
      this.triggerTreshold = this.task.settings.accuracy
    } else {
      this.triggerTreshold = 10;
    }

    if (this.map.getSource('marker-point')) {
      this.map.removeSource('marker-point')
    }

    if (this.map.getLayer('marker-point')) {
      this.map.removeLayer('marker-point')
    }

    if (this.waypointMarker) {
      this.waypointMarker.remove();
      this.waypointMarker = null;
      this.waypointMarkerDuplicate = null;
    }

    if (this.map.getStyle().layers.filter(e => e.id == 'viewDirectionTask').length > 0) {
      this.map.removeLayer('viewDirectionTask');
      this.map.removeSource('viewDirectionTask');
      // this.viewDirectionTaskGeolocateSubscription.unsubscribe();
    }

    if (this.map.getStyle().layers.filter(e => e.id == 'viewDirectionClick').length > 0) {
      this.map.removeLayer('viewDirectionClick');
      this.map.removeSource('viewDirectionClick');
    }

    this.landmarkControl.remove();

    this._initMapFeatures();

    this.photo = '';
    this.photoURL = '';
    this.clickDirection = 0;


    if (this.task.answer.type == AnswerType.POSITION) {
      if (this.task.answer.position != null && this.task.settings.showMarker) {
        const el = document.createElement('div');
        el.className = 'waypoint-marker';

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
      }
    }

    if (this.task.question.type == QuestionType.MAP_DIRECTION) {
      this.directionBearing = this.task.question.direction.bearing
    }

    if (this.task.question.type == QuestionType.MAP_DIRECTION_MARKER) {
      this.directionBearing = this.task.question.direction.bearing

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
      this.geolocateControl.setType(GeolocateType.Continuous)
    }

    if (this.task.question.type == QuestionType.MAP_FEATURE && this.task.answer.mode != TaskMode.NO_FEATURE) {
      this.landmarkControl.setQTLandmark(this.task.question.geometry.features[0])
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
      type = FeedbackType.Saved
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
    }
    this.showFeedback = true

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
      }
      this.insomnia.allowSleepAgain().then(
        () => console.log("insomnia allow sleep again success"),
        () => console.log("insomnia allow sleep again error")
      );
      return;
    }

    this.task = this.game.tasks[this.taskIndex];
    this.initTask();
  }

  async onMultipleChoiceSelected(item, event) {
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

  async onOkClicked() {
    let isCorrect: boolean = true;

    if (this.task.answer.type == AnswerType.POSITION) {
      const waypoint = this.task.answer.position.geometry.coordinates;
      const arrived = this.userDidArrive(waypoint);
      if (!arrived) {
        this.initFeedback(false)
        isCorrect = false;
      } else {
        this.onWaypointReached();
        isCorrect = true;
      }
    }

    if (this.task.type == "theme-loc") {
      const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;
      const distance = this.helperService.getDistanceFromLatLonInM(clickPosition[1], clickPosition[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)
      this.initFeedback(distance < this.triggerTreshold)
      isCorrect = distance < this.triggerTreshold;
    }

    if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {
      if (this.selectedPhoto != null) {
        this.initFeedback(this.isCorrectPhotoSelected);
        isCorrect = this.isCorrectPhotoSelected
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
      } else {
        this.trackerService.addAnswer({
          task: this.task,
          answer: {
            photo: this.photoURL
          }
        });
        this.initFeedback(true);
        isCorrect = true;
        this.photo = "";
        this.photoURL = "";
      }
    }

    if (this.task.answer.type == AnswerType.MAP_POINT) {
      const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;

      const isInPolygon = booleanPointInPolygon(clickPosition, this.task.question.geometry.features[0])
      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          inPolygon: isInPolygon
        }
      });
      this.initFeedback(isInPolygon);
      isCorrect = isInPolygon;
    }

    if (this.task.answer.type == AnswerType.DIRECTION) {
      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          direction: this.compassHeading
        }
      });
      this.initFeedback(this.Math.abs(this.directionBearing - this.compassHeading) <= 45);
      isCorrect = this.Math.abs(this.directionBearing - this.compassHeading) <= 45;
    }

    if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
      this.trackerService.addAnswer({
        task: this.task,
        answer: {
          direction: this.compassHeading
        }
      });
      this.initFeedback(this.Math.abs(this.clickDirection - this.compassHeading) <= 45);
      isCorrect = this.Math.abs(this.clickDirection - this.compassHeading) <= 45;
    }

    this.trackerService.addEvent({
      type: "ON_OK_CLICKED",
      compassHeading: this.compassHeading,
      correct: isCorrect
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
              if (this.waypointMarkerDuplicate) {
                setTimeout(() => {
                  this.layerControl.passMarkers({ waypointMarker: this.waypointMarkerDuplicate }, (marker) => {
                  })
                }, 2000)
              }
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

