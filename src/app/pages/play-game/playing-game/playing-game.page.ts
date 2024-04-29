import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GamesService } from "../../../services/games.service";
import { OsmService } from "../../../services/osm.service";
import { TrackerService } from "../../../services/tracker.service";
import mapboxgl from "mapbox-gl";

import {
  Plugins,
  GeolocationPosition,
  Capacitor,
  CameraResultType,
  CameraSource,
  AppState,
} from "@capacitor/core";
// const {App} = Plugins;

import {
  ModalController,
  NavController,
  ToastController,
} from "@ionic/angular";
import { environment } from "src/environments/environment";
import { Game } from "src/app/models/game";
import { interval, Observable, Subscription } from "rxjs";
import {
  RotationControl,
  RotationType,
} from "./../../../mapControllers/rotation-control";
import {
  ViewDirectionControl,
  ViewDirectionType,
} from "./../../../mapControllers/view-direction-control";
import { LandmarkControl } from "src/app/mapControllers/landmark-control";
import {
  StreetSectionControl,
  StreetSectionType,
} from "./../../../mapControllers/street-section-control";
import { LayerControl, LayerType } from "src/app/mapControllers/layer-control";
import { AlertController } from "@ionic/angular";
import { Platform } from "@ionic/angular";
import { HelperService } from "src/app/services/helper.service";
import { TrackControl, TrackType } from "src/app/mapControllers/track-control";
import {
  GeolocateControl,
  GeolocateType,
} from "src/app/mapControllers/geolocate-control";
import { MaskControl, MaskType } from "src/app/mapControllers/mask-control";
import { PanControl, PanType } from "src/app/mapControllers/pan-control";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { mappings } from "./../../../pipes/keywords.js";
import { OrigamiGeolocationService } from "./../../../services/origami-geolocation.service";
import { AnswerType, TaskMode, QuestionType } from "src/app/models/types";
import { cloneDeep } from "lodash";
import { standardMapFeatures } from "../../../models/standardMapFeatures";
import { AnimationOptions } from "ngx-lottie";
import bbox from "@turf/bbox";
import buffer from "@turf/buffer";
import { Task } from "src/app/models/task";
import { point } from "@turf/helpers";
import booleanWithin from "@turf/boolean-within";
import { OrigamiOrientationService } from "src/app/services/origami-orientation.service";
import { throttle } from "rxjs/operators";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { SocketService } from "src/app/services/socket.service";
import { AvatarPosition } from "src/app/models/avatarPosition";
import { Coords } from "src/app/models/coords";
import { TranslateService } from "@ngx-translate/core";
import { UtilService } from "src/app/services/util.service";

import { Storage } from "@ionic/storage";
import { virEnvLayers } from "src/app/models/virEnvsLayers";

@Component({
  selector: "app-playing-game",
  templateUrl: "./playing-game.page.html",
  styleUrls: ["./playing-game.page.scss"],
})
export class PlayingGamePage implements OnInit, OnDestroy {
  // treshold to trigger location arrive
  public static triggerTreshold: number = 20;

  public static showSuccess = false;
  geofenceAlert: boolean;
  @ViewChild("mapWrapper") mapWrapper;
  @ViewChild("map") mapContainer;
  @ViewChild("swipeMap") swipeMapContainer;
  @ViewChild("panel") panel;
  @ViewChild("feedback") feedbackControl;

  game: Game;
  playersNames: string[] = [""];
  // showPlayersNames = true;

  map: mapboxgl.Map;
  waypointMarker: mapboxgl.Marker;
  waypointMarkerDuplicate: mapboxgl.Marker;

  // map features
  directionArrow = false;
  swipe = false;

  clickDirection = 0;

  rotationControl: RotationControl;
  viewDirectionControl: ViewDirectionControl;
  landmarkControl: LandmarkControl;
  streetSectionControl: StreetSectionControl;
  layerControl: LayerControl;
  trackControl: TrackControl;
  geolocateControl: GeolocateControl;
  panControl: PanControl;
  maskControl: MaskControl;

  // tasks
  task: Task;
  taskIndex = 0;

  positionSubscription: Subscription;
  lastKnownPosition: GeolocationPosition;

  // VR world
  isVirtualWorld: boolean = false;
  isVRMirrored: boolean = false; // for multi VR designs
  virEnvType: string = null;
  avatarPositionSubscription: Subscription;
  avatarLastKnownPosition: AvatarPosition;
  avatarOrientationSubscription: Subscription;
  initialAvatarLoc: any;
  initialAvatarDir: number;
  currentSecond: number = 0;
  gameCode: string = "";
  //* created for solving: https://github.com/origami-team/geogami-virtual-environment-dev/issues/59
  previousTaskAavatarLastKnownPosition: AvatarPosition;

  // degree for nav-arrow
  heading = 0;
  compassHeading = 0;
  targetHeading = 0;
  targetDistance = 0;
  directionBearing = 0;
  indicatedDirection = 0;
  public lottieConfig: AnimationOptions;

  lastPointInBboxDirection: number = undefined;

  Math: Math = Math;

  uploadDone = false;

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

  isZoomedToTaskMapPoint = false;
  showCorrectPositionModal = false;

  numberInput: number;
  textInput: string;

  primaryColor: string;
  secondaryColor: string;

  panelMinimized = false;

  viewDirectionTaskGeolocateSubscription: Subscription;

  // private audioPlayer: HTMLAudioElement = new Audio();

  uploading = false;
  loaded = false;

  // to disable on-demand marker for some seconds after pressing
  geolocateButton = true;

  // to hold either all draw controls enabled or only point
  DrawControl: any;

  // share data approval
  shareDataBox = true;

  // Draw control all enabled
  DrawControl_all = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      line_string: true,
      point: true,
      trash: true,
    },
    styles: [
      // ACTIVE (being drawn)
      // line stroke
      {
        id: "gl-draw-line",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["!=", "mode", "static"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": getComputedStyle(
            document.documentElement
          ).getPropertyValue("--ion-color-secondary"),
          "line-width": 5,
        },
      },
      // polygon fill
      {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        paint: {
          "fill-color": getComputedStyle(
            document.documentElement
          ).getPropertyValue("--ion-color-secondary"),
          "fill-outline-color": getComputedStyle(
            document.documentElement
          ).getPropertyValue("--ion-color-secondary"),
          "fill-opacity": 0.2,
        },
      },
      // polygon outline stroke
      // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
      {
        id: "gl-draw-polygon-stroke-active",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": getComputedStyle(
            document.documentElement
          ).getPropertyValue("--ion-color-secondary"),
          "line-width": 5,
        },
      },
      // vertex point halos
      {
        id: "gl-draw-polygon-and-line-vertex-halo-active",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 5,
          "circle-color": "#FFF",
        },
      },
      // vertex points
      {
        id: "gl-draw-polygon-and-line-vertex-active",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 3,
          "circle-color": getComputedStyle(
            document.documentElement
          ).getPropertyValue("--ion-color-secondary"),
        },
      },

      {
        id: "gl-draw-point-inactive",
        type: "circle",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 8,
          "circle-color": getComputedStyle(
            document.documentElement
          ).getPropertyValue("--ion-color-secondary"),
          "circle-stroke-width": 4,
          "circle-stroke-color": "#fff",
        },
      },
      {
        id: "gl-draw-point-active",
        type: "circle",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["!=", "meta", "midpoint"],
          ["==", "active", "true"],
        ],
        paint: {
          "circle-radius": 8,
          "circle-color": getComputedStyle(
            document.documentElement
          ).getPropertyValue("--ion-color-secondary"),
          "circle-stroke-width": 6,
          "circle-stroke-color": "#fff",
        },
      },

      // INACTIVE (static, already drawn)
      // line stroke
      {
        id: "gl-draw-line-static",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["==", "mode", "static"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      },
      // polygon fill
      {
        id: "gl-draw-polygon-fill-static",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
        paint: {
          "fill-color": "#000",
          "fill-outline-color": "#000",
          "fill-opacity": 0.5,
        },
      },
      // polygon outline
      {
        id: "gl-draw-polygon-stroke-static",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      },
    ],
  });

  // ToDo : update style source
  // Draw control only point enabled
  DrawControl_point = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      point: true,
      trash: true,
    },
    // styles:['../../../../assets/mapStyles/drawControlPoint.json'
    // styles: environment.mapStyle + 'drawControlPoint.json'
    styles: [
      {
        id: "gl-draw-point-inactive",
        type: "circle",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 8,
          "circle-color": "#3dc2ff",
          "circle-stroke-width": 4,
          "circle-stroke-color": "#fff",
        },
      },
      {
        id: "gl-draw-point-active",
        type: "circle",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["!=", "meta", "midpoint"],
          ["==", "active", "true"],
        ],
        paint: {
          "circle-radius": 8,
          "circle-color": "#3dc2ff",
          "circle-stroke-width": 6,
          "circle-stroke-color": "#fff",
        },
      },
    ],
  });

  /* multi-player */
  isSingleMode: boolean = true;
  numPlayers = 0;
  playerNo: number = 1;
  joinedPlayersCount = 0;
  trackDataStatus: any;
  storedGameTrack_id: string;
  waitPlayersPanel = false;
  isRejoin = false;
  sPlayerNo = 0;
  cJoindPlayersCount = 0;
  sTaskNo = 0;

  constructor(
    private route: ActivatedRoute,
    public modalController: ModalController,
    public toastController: ToastController,
    private gamesService: GamesService,
    public navCtrl: NavController,
    private changeDetectorRef: ChangeDetectorRef,
    private OSMService: OsmService,
    private trackerService: TrackerService,
    public alertController: AlertController,
    public platform: Platform,
    public helperService: HelperService,
    private sanitizer: DomSanitizer,
    private geolocationService: OrigamiGeolocationService,
    private orientationService: OrigamiOrientationService,
    private socketService: SocketService,
    private translate: TranslateService,
    private utilService: UtilService,
    private storage: Storage,
    private router: Router
  ) {
    this.lottieConfig = {
      path: "assets/lottie/star-success.json",
      renderer: "svg",
      autoplay: true,
      loop: true,
    };
    // this.audioPlayer.src = 'assets/sounds/zapsplat_multimedia_alert_musical_warm_arp_005_46194.mp3'
    this.primaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--ion-color-primary");
    this.secondaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--ion-color-secondary");
  }

  get staticShowSuccess() {
    return PlayingGamePage.showSuccess;
  }

  ngOnInit() {
    // // console.log('ngOnInit');
    if (Capacitor.platform !== "web") {
      Plugins.Keyboard.addListener("keyboardDidHide", async () => {
        this.map.resize();
        await this.zoomBounds();
      });

      /* Important to rejoin connection to socket server if app went to background */
      // To do for single mode and multi mode
      Plugins.App.removeAllListeners(); /* To avoid multiple listeners */
      Plugins.App.addListener("appStateChange", (state: AppState) => {
        /* info: (this.router.url.split('/')[2] == "playing-game") is to make sure this impl. only applied to play-game-page */
        /* info: (!this.isSingleMode) is to apply it only with multiplayer */
        if (
          !state.isActive &&
          this.router.url.split("/")[2] == "playing-game" &&
          !this.isSingleMode
        ) {
          // // console.log('App state changed. Is not active?');
          this.ionViewWillLeave();
          /* navigate home */
          this.navCtrl.navigateRoot("/");
        }
      });
    }

    PlayingGamePage.showSuccess = false;
  }

  /******************/
  ionViewWillEnter() {
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
    // console.log("(play-game) params.bundle", params.bundle);
      this.isVirtualWorld = JSON.parse(params.bundle).isVRWorld;
      this.isVRMirrored = JSON.parse(params.bundle).isVRMirrored;
      this.gameCode = JSON.parse(params.bundle).gameCode;
      this.isSingleMode = JSON.parse(params.bundle).isSingleMode;
      this.playersNames[0] = JSON.parse(params.bundle).playerName;
      this.shareDataBox = JSON.parse(params.bundle).shareData_cbox;
      this.isRejoin = JSON.parse(params.bundle).isRejoin;
      this.sPlayerNo = JSON.parse(params.bundle).sPlayerNo;
      this.cJoindPlayersCount = JSON.parse(params.bundle).cJoindPlayersCount;
      this.sTaskNo = JSON.parse(params.bundle).sTaskNo;
    });

    this.game = null;
    this.game = new Game(
      0,
      "Loading...",
      "",
      false,
      [],
      false,
      false,
      1,
      0,
      false,
      false,
      false,
      false,
      "",
      false,
      false
    );
    this.route.params.subscribe((params) => {
      this.gamesService
        .getGame(JSON.parse(params.bundle).id)
        .then((res) => res.content)
        .then((game) => {
          this.game = game;
          this.loaded = true;

          // VR world
          // Check game type either real or VR world
          // Set the intial avatar location (in either normal or mirrored version)
          if (this.isVirtualWorld) {
            //* set vir env type for old (where task type is not included in all tasks) and new games
            if (game.tasks[0] && game.tasks[0].virEnvType) {
              this.virEnvType = game.tasks[0].virEnvType;
            } else {
              this.virEnvType = game.virEnvType;
            }

            /* check first task initial location */
            if (
              this.game.tasks[0] &&
              this.game.tasks[0].question.initialAvatarPosition != undefined
            ) {
            // console.log("🚀 ~ PlayingGamePage ~ .then ~ initialAvatarLoc:");
              this.initialAvatarLoc = {
                lng: this.game.tasks[0].question.initialAvatarPosition.position
                  .geometry.coordinates[0],
                lat: this.game.tasks[0].question.initialAvatarPosition.position
                  .geometry.coordinates[1],
              };
              this.initialAvatarDir =
                this.game.tasks[0].question.initialAvatarPosition.bearing;
            } else {
              //* in case task doesn't have intitial positoin, use default one
              this.initialAvatarLoc =
                virEnvLayers[this.virEnvType].initialPosition;
              this.initialAvatarDir = 0;
            }
          }

          // Check game type either real or VR world
          if (game.isVRWorld !== undefined && game.isVRWorld != false) {
            this.connectSocketIO(this.game.tasks[0]);
          }

          /* only for multi-player game */
          if (!this.isSingleMode) {
            this.numPlayers = game.numPlayers;
            this.waitPlayersPanel = true;

            if (!this.isRejoin) {
              /* when join for first time */
              // connect to socket server
              this.joinGame_MultiPlayer();
            } else {
              /* when rejoin */
              this.playerNo = this.sPlayerNo;
              this.joinedPlayersCount = this.cJoindPlayersCount;
              this.taskIndex = this.sTaskNo;

              /* in case rejoin happens while waiting for players to join */
              if (this.joinedPlayersCount == this.numPlayers) {
                this.waitPlayersPanel = false;
              }

              /* (socket listener) on instructor request players real time location */
              this.onRequestPlayerLocationByInstructor();
              /* (socket listener) on joining game by other players */
              this.onPlayerJoinGame();
            }
          }

          /* Initialize map and subscribe location */
          this.initializeMap();
        });
    });

    /* Initialize map and subscribe location */
    // this.initializeMap();
  }

  /******************/
  ionViewWillLeave() {
    // Disconnect server when leaving playing-page
    if (!this.isSingleMode) {
      this.disconnectSocketIO_MultiPlayer();
    }

    /* if player left game without solving all tasks, save game events, waypoints and taskno (to be restored when resume game) */
    if (!PlayingGamePage.showSuccess) {
      let c_waypoints = this.trackerService.getWaypoints();
      let c_events = this.trackerService.getEvents();
      /* to store player no, name and room name */
      let c_playerInfo = {
        playerName: this.playersNames[0],
        playerNo: this.playerNo,
        roomName: this.gameCode,
      };
      this.storage.set("savedTracksData", {
        s_playerInfo: c_playerInfo,
        s_Waypoints: c_waypoints,
        s_events: c_events,
        s_taskNo: this.taskIndex,
      });
    }
  }

  ionViewDidLeave() {
    // // console.log("ionViewDidLeave")
  }

  ngOnDestroy() {
    // // console.log(" ngOnDestroy")
  }

  // With VR env only
  connectSocketIO(task) {
    /* Sinlge user V.E. impl. */
    // ToDo: with many envs you can use env. id instead
    if (this.isSingleMode) {
      this.socketService.socket.connect();
    }

    /* with Vir. Env. single mode the received game code is actually the player name, but with mutliplayer game code is the (teacherid+gameid) 
        - now vir env name is sent instead of boolion (mirroed or normal)
    */
    //* (with single & multiplayer -> here where user connect join a room )
    this.socketService.socket.emit("newGame", {
      gameCode: this.isSingleMode ? this.gameCode : this.playersNames[0],
      virEnvType: task.virEnvType ? task.virEnvType : this.virEnvType,
      isSingleMode: this.isSingleMode,
    });

    /* To update avatar initial position */
    // this.socketService.socket.on('requestAvatarInitialPosition', this.deliverInitialAvatarPosition);
    // this.socketService.socket.once('requestAvatarInitialPosition', () => {
    this.socketService.socket.on("requestAvatarInitialPosition", () => {
      // // console.log("🚀 ~ PlayingGamePage ~ this.socketService.socket.on ~ requestAvatarInitialPosition")
      if (this.avatarLastKnownPosition != undefined) {
        //* when reopen vir env app
        //* if task doesn't have initial positoin send default value and if no virenvtype is found send deafult one
        this.socketService.socket.emit("deliverInitialAvatarPositionByGeoApp", {
          initialPosition: [
            this.avatarLastKnownPosition.coords.longitude * 111000,
            this.avatarLastKnownPosition.coords.latitude * 112000,
          ],
          initialRotation: this.indicatedDirection, //* send lastknown dir
          virEnvType: this.task.virEnvType
            ? this.task.virEnvType
            : this.virEnvType,
        });
      } else {
        //* if task doesn't have initial positoin send default value and if no virenvtype is found send deafult one
        this.socketService.socket.emit("deliverInitialAvatarPositionByGeoApp", {
          initialPosition: this.task.question.initialAvatarPosition
            ? [
                this.task.question.initialAvatarPosition.position.geometry
                  .coordinates[0] * 111000,
                this.task.question.initialAvatarPosition.position.geometry
                  .coordinates[1] * 112000,
              ]
            : [
                virEnvLayers[this.virEnvType].initialPosition.lng * 111000,
                virEnvLayers[this.virEnvType].initialPosition.lat * 112000,
              ],
          initialRotation: this.task.question.initialAvatarPosition
            ? this.task.question.initialAvatarPosition.bearing
            : 0, //* send 0 as we only check if initial position equal null, in virEnv App
          virEnvType: this.task.virEnvType
            ? this.task.virEnvType
            : this.virEnvType,
        });
      }
    });
  }

  /********/
  /* initialize SocketIO (multiplayer) */
  joinGame_MultiPlayer() {
    if (!this.isRejoin) {
      /* (socket listener) on assign number to myself  */
      this.onAssignPlayerNumber();
    }

    /* on joining game by other players */
    this.onPlayerJoinGame();

    /* (socket listener) on instructor request players real time location */
    this.onRequestPlayerLocationByInstructor();

    /* if player is not rejoining */
    if (!this.isRejoin) {
      /* Join player in teacher's dedicated room */
      this.socketService.socket.emit("joinGame", {
        roomName: this.gameCode,
        playerName: this.playersNames[0],
      });
    }
  }

  disconnectSocketIO() {
    this.socketService.socket.disconnect();
  }

  disconnectSocketIO_MultiPlayer() {
    /* remove all listners to avoid duplicate listenres after rejoining game */
    this.socketService.socket.removeAllListeners();
    /*  dissconnect socket server*/
    this.socketService.socket.disconnect();
  }

  /* Initialize map and subscribe location */
  initializeMap() {
    mapboxgl.accessToken = environment.mapboxAccessToken;

    // if (environment.production) {

    // } else {
    //   mapStyle = document.body.classList.contains("dark")
    //     ? "mapbox://styles/mapbox/dark-v9"
    //     : "mapbox://styles/mapbox/streets-v9"
    // }

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: this.isVirtualWorld
        ? environment.mapStyle + this.virEnvType + ".json"
        : environment.mapStyle + "realWorld.json",
      center: this.isVirtualWorld
        ? virEnvLayers[this.virEnvType].center
        : [8, 51.8],
      zoom: this.isVirtualWorld ? virEnvLayers[this.virEnvType].zoom : 2,
      maxZoom: this.isVirtualWorld ? 19.5 : 18,
      maxBounds: this.isVirtualWorld
        ? virEnvLayers[this.virEnvType].bounds
        : null, // Sets bounds
    });

    this.geolocationService.init(this.isVirtualWorld);
    // Fix this issue
    this.orientationService.init(this.isVirtualWorld);

    if (!this.isVirtualWorld) {
      this.positionSubscription =
        this.geolocationService.geolocationSubscription.subscribe(
          (position) => {
            this.trackerService.addWaypoint({});

            this.lastKnownPosition = position;

            if (this.task && !PlayingGamePage.showSuccess) {
              if (this.task.answer.type == AnswerType.POSITION) {
                if (this.task.answer.mode == TaskMode.NAV_ARROW) {
                  const destCoords =
                    this.task.answer.position.geometry.coordinates;
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
          }
        );
    } else {
      // VR world
      this.avatarPositionSubscription =
        this.geolocationService.avatarGeolocationSubscription.subscribe(
          (avatarPosition) => {
            // Store waypoint every second
            if (this.currentSecond != new Date().getSeconds()) {
              this.currentSecond = new Date().getSeconds();
              this.trackerService.addWaypoint({});
            }

            if (this.avatarLastKnownPosition === undefined) {
              // Initial avatar's positoin to measure distance to target in nav-arrow tasks
              this.avatarLastKnownPosition = new AvatarPosition(
                0,
                new Coords(this.initialAvatarLoc.lat, this.initialAvatarLoc.lng)
              );
            } else {
              this.avatarLastKnownPosition = new AvatarPosition(
                0,
                new Coords(
                  parseFloat(avatarPosition["z"]) / 111200,
                  parseFloat(avatarPosition["x"]) / 111000
                )
              );
            }

            if (this.task && !PlayingGamePage.showSuccess) {
              if (this.task.answer.type == AnswerType.POSITION) {
                if (this.task.answer.mode == TaskMode.NAV_ARROW) {
                  const destCoords =
                    this.task.answer.position.geometry.coordinates;
                  const bearing = this.helperService.bearing(
                    parseFloat(avatarPosition["z"]) / 111200,
                    parseFloat(avatarPosition["x"]) / 111000,
                    destCoords[1],
                    destCoords[0]
                  );
                  this.heading = bearing;
                }
              }
            }
          }
        );
    }

    this.map.on("load", () => {
      this.rotationControl = new RotationControl(
        this.map,
        this.orientationService,
        this.isVirtualWorld
      );
      this.landmarkControl = new LandmarkControl(this.map);

      // Execute only with real world games
      if (!this.isVirtualWorld) {
        this.streetSectionControl = new StreetSectionControl(
          this.map,
          this.OSMService,
          this.geolocationService
        );
      }
      this.layerControl = new LayerControl(
        this.map,
        this.mapWrapper,
        this.alertController,
        this.platform
      );
      this.trackControl = new TrackControl(
        this.map,
        this.geolocationService,
        this.isVirtualWorld
      );
      this.geolocateControl = new GeolocateControl(
        this.map,
        this.geolocationService,
        this.isVirtualWorld,
        this.initialAvatarLoc
      );
      this.viewDirectionControl = new ViewDirectionControl(
        this.map,
        this.geolocationService,
        this.orientationService,
        this.isVirtualWorld,
        this.initialAvatarLoc,
        this.initialAvatarDir
      );
      this.panControl = new PanControl(
        this.map,
        this.geolocationService,
        this.isVirtualWorld
      );
      this.maskControl = new MaskControl(
        this.map,
        this.geolocationService,
        this.isVirtualWorld
      );

      this.feedbackControl.init(
        this.map,
        this.geolocationService,
        this.helperService,
        this.toastController,
        this.trackerService,
        this
      );

      this.map.loadImage(
        "/assets/icons/directionv2-richtung.png",
        (error, image) => {
          if (error) throw error;

          this.map.addImage("view-direction-task", image);
        }
      );

      this.map.loadImage("/assets/icons/marker-editor.png", (error, image) => {
        if (error) throw error;

        this.map.addImage("marker-editor", image);
      });

      this.map.loadImage("/assets/icons/position.png", (error, image) => {
        if (error) throw error;

        this.map.addImage("view-direction-click-geolocate", image);
      });
      this.map.loadImage(
        "/assets/icons/landmark-marker.png",
        (error, image) => {
          if (error) throw error;

          this.map.addImage("landmark-marker", image);
        }
      );

      // ToDO: update it using callback
      /* in case joined player is last */
      /* with rejoin playerno might no be last one to join therefore we use count received from socker server instead  */
      if (
        this.isSingleMode ||
        this.playerNo == this.numPlayers ||
        (this.isRejoin && this.joinedPlayersCount == this.numPlayers)
      ) {
        setTimeout(() => {
          this.startGame();
        }, 200);
      }
    });

    /* temp */
    this.map.on("zoom", () => {
      if (this.isVirtualWorld) {
        const currentZoom = this.map.getZoom();
        // console.log("🚀 ~ PlayingGamePage22222 ~ 3 levels: currentZoom:", currentZoom);

        //* (V.E.): each vir env. has a zoom 0 layer, this is for those which has another layer that is visible to show more details
        //* with 3 zoom levels
        if (
          virEnvLayers[this.virEnvType].zoomInLayer1 &&
          virEnvLayers[this.virEnvType].zoomInLayer2
        ) {
          if (
            // currentZoom <= zoomInLayer2
            currentZoom <= virEnvLayers[this.virEnvType].zoomThreashold2 &&
            this.map.getStyle().sources.overlay.url !=
              "assets/vir_envs_layers/" + this.virEnvType + "_zoom2.png"
          ) {
            this.updateMapStyleOverlayLayer(
              "assets/vir_envs_layers/" + this.virEnvType + "_zoom2.png",
              false
            );
            // this.map.setZoom(virEnvLayers[this.virEnvType].zoom);
          } else if (
            // currentZoom > zoomInLayer2 && currentZoom < zoomInLayer1
            currentZoom > virEnvLayers[this.virEnvType].zoomThreashold2 &&
            currentZoom < virEnvLayers[this.virEnvType].zoomThreashold &&
            this.map.getStyle().sources.overlay.url !=
              "assets/vir_envs_layers/" + this.virEnvType + ".png"
          ) {
            this.updateMapStyleOverlayLayer(
              "assets/vir_envs_layers/" + this.virEnvType + ".png",
              false
            );
            // this.map.setZoom(virEnvLayers[this.virEnvType].zoom);
          } else if (
            // currentZoom >= zoomInLayer1
            currentZoom >= virEnvLayers[this.virEnvType].zoomThreashold &&
            this.map.getStyle().sources.overlay.url !=
              "assets/vir_envs_layers/" + this.virEnvType + "_zoom1.png"
          ) {
            this.updateMapStyleOverlayLayer(
              "assets/vir_envs_layers/" + this.virEnvType + "_zoom1.png",
              false
            );
          }
        }
        //* with 2 zoom levels
        else if (virEnvLayers[this.virEnvType].zoomInLayer1) {
          if (
            // currentZoom < 17.2 &&
            currentZoom < virEnvLayers[this.virEnvType].zoomThreashold &&
            this.map.getStyle().sources.overlay.url !=
              "assets/vir_envs_layers/" + this.virEnvType + ".png"
          ) {
            this.updateMapStyleOverlayLayer(
              "assets/vir_envs_layers/" + this.virEnvType + ".png",
              false
            );
            // this.map.setZoom(virEnvLayers[this.virEnvType].zoom);
          } else if (
            // currentZoom > 17.5 &&
            currentZoom > virEnvLayers[this.virEnvType].zoomThreashold &&
            this.map.getStyle().sources.overlay.url !=
              "assets/vir_envs_layers/" + this.virEnvType + "_zoom1.png"
          ) {
            this.updateMapStyleOverlayLayer(
              "assets/vir_envs_layers/" + this.virEnvType + "_zoom1.png",
              false
            );
          }
        }
      }
    });

    /* (V.E.): to be able to reload marker when style is changed in realtime */
    this.map.on("style.load", () => {
    // console.log("🚀 ~ PlayingGamePage ~ this.map.on ~ style.load:");
    });
    /*  */

    this.map.on("click", (e) => {
      // console.log("🚀 ~ this.map.on map click~ e:", e.lngLat)
      this.onMapClick(e, "standard");
    });

    this.map.on("rotate", () => {
      if (this.map.getLayer("viewDirectionTask")) {
        this.map.setLayoutProperty(
          "viewDirectionTask",
          "icon-rotate",
          this.directionBearing - this.map.getBearing()
        );
      }

      if (this.map.getLayer("viewDirectionClick")) {
        this.map.setLayoutProperty(
          "viewDirectionClick",
          "icon-rotate",
          this.clickDirection - this.map.getBearing()
        );
      }
    });

    // reset zoomtotaskmapmpoint if zoomend is a user event (and no animation event)
    this.map.on("zoomend", ({ originalEvent }) => {
      if (originalEvent) {
        this.isZoomedToTaskMapPoint = false;
      }
    });

    // rotation
    if (!this.isVirtualWorld) {
      this.deviceOrientationSubscription =
        this.orientationService.orientationSubscription.subscribe(
          (heading: number) => {
            // // console.log("......deviceOrientationSubscription (heading): ",  heading);
            this.compassHeading = heading;
            this.targetHeading = 360 - (this.compassHeading - this.heading);
            this.indicatedDirection =
              this.compassHeading - this.directionBearing;
          }
        );
    } else {
      this.avatarOrientationSubscription =
        this.orientationService.avatarOrientationSubscription.subscribe(
          (avatarHeading: number) => {
            this.compassHeading = avatarHeading;
            this.targetHeading = 360 - (this.compassHeading - this.heading);
            this.indicatedDirection =
              this.compassHeading - this.directionBearing;
          }
        );
    }

    if (Capacitor.isNative) {
      /* To keep screen on */
      Plugins.CapacitorKeepScreenOn.enable();
    }

    // To disable map interations
    this.enableDisableMapInteraction(false);
  }

  /* (V.E.): to load view dir. marker after changing style */
  // ToDo: update it to include all markers and layers- maybe find a way to copy all layers form one ma style to another
  async updateMapStyleOverlayLayer(styleOverlayUrlPath, changeVirEnv) {
    let newStyle = this.map.getStyle();

    /* newStyle.sources.overlay.url =
      "assets/vir_envs_layers/" + this.virEnvType + ".png"; */

    if (changeVirEnv) {
      //* update layer dimensions
      newStyle.sources.overlay.coordinates =
        virEnvLayers[this.virEnvType].overlayCoords;
      //* update maxBounds
      this.map.setMaxBounds(virEnvLayers[this.virEnvType].bounds);
      //* update zoom level of the env.
      this.map.setZoom(virEnvLayers[this.virEnvType].zoom);
      //* update map center
      this.map.setCenter(virEnvLayers[this.virEnvType].center);
    }

    //* update layer image
    newStyle.sources.overlay.url = styleOverlayUrlPath;
    this.map.setStyle(newStyle);
  }

  /* To disable map interations until player press done */
  enableDisableMapInteraction(enable: boolean) {
    if (!enable) {
      this.map.scrollZoom.disable();
      this.map.boxZoom.disable();
      this.map.doubleClickZoom.disable();
      // disable map rotation using right click + drag
      this.map.dragRotate.disable();
      // disable map rotation using touch rotation gesture
      this.map.touchZoomRotate.disable();
      this.map.dragPan.disable();
      this.map.keyboard.disable();
      this.map.touchZoomRotate.disable();
    } else {
      this.map.scrollZoom.enable();
      this.map.boxZoom.enable();
      this.map.doubleClickZoom.enable();
      // disable map rotation using right click + drag
      this.map.dragRotate.enable();
      // disable map rotation using touch rotation gesture
      this.map.touchZoomRotate.enable();
      this.map.dragPan.enable();
      this.map.keyboard.enable();
      this.map.touchZoomRotate.enable();
    }
  }

  onMapClick(e, mapType) {
    // // console.log(e);

    /* Disable map click until player check 'share data box' and press done */
    if (!this.waitPlayersPanel) {
      let clickDirection;

      if (this.task.answer.type == AnswerType.MAP_POINT) {
        if (
          this.isZoomedToTaskMapPoint ||
          this.task.mapFeatures.zoombar != "task"
        ) {
          const pointFeature = this.helperService._toGeoJSONPoint(
            e.lngLat.lng,
            e.lngLat.lat
          );

          if (this.map.getSource("marker-point")) {
            this.map.getSource("marker-point").setData(pointFeature);
          } else {
            this.map.addSource("marker-point", {
              type: "geojson",
              data: pointFeature,
            });
          }

          if (!this.map.getLayer("marker-point")) {
            this.map.addLayer({
              id: "marker-point",
              type: "symbol",
              source: "marker-point",
              layout: {
                "icon-image": "marker-editor",
                "icon-size": 0.65,
                "icon-anchor": "bottom",
              },
            });
          }
        } else {
          this.isZoomedToTaskMapPoint = true;
          this.map.flyTo({
            center: [e.lngLat.lng, e.lngLat.lat],
            zoom: 18,
            // padding: {
            //   top: 80,
            //   bottom: 620,
            //   left: 40,
            //   right: 40
            // },
            // duration: 1000
          });
        }
      }

      if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
        if (
          this.isZoomedToTaskMapPoint ||
          this.task.mapFeatures.zoombar != "task"
        ) {
          if (this.task.question.direction?.position) {
            this.clickDirection = this.helperService.bearing(
              this.task.question.direction.position.geometry.coordinates[1],
              this.task.question.direction.position.geometry.coordinates[0],
              e.lngLat.lat,
              e.lngLat.lng
            );
          } else {
            this.clickDirection = this.helperService.bearing(
              this.isVirtualWorld
                ? this.avatarLastKnownPosition.coords.latitude
                : this.lastKnownPosition.coords.latitude,
              this.isVirtualWorld
                ? this.avatarLastKnownPosition.coords.longitude
                : this.lastKnownPosition.coords.longitude,
              e.lngLat.lat,
              e.lngLat.lng
            );
          }
          clickDirection = this.clickDirection;
          if (!this.map.getLayer("viewDirectionClick")) {
            if (this.task.question.direction?.position) {
              this.map.addSource("viewDirectionClick", {
                type: "geojson",
                data: {
                  type: "Point",
                  coordinates:
                    this.task.question.direction.position.geometry.coordinates,
                },
              });
            } else {
              //* To view location marker and direction on map click
              this.map.addSource("viewDirectionClick", {
                type: "geojson",
                data: {
                  type: "Point",
                  coordinates: [
                    this.isVirtualWorld
                      ? this.avatarLastKnownPosition.coords.longitude
                      : this.lastKnownPosition.coords.longitude,
                    this.isVirtualWorld
                      ? this.avatarLastKnownPosition.coords.latitude
                      : this.lastKnownPosition.coords.latitude,
                  ],
                },
              });
            }
            this.map.addLayer({
              id: "viewDirectionClick",
              source: "viewDirectionClick",
              type: "symbol",
              layout: {
                "icon-image": "view-direction-task",
                "icon-size": 0.65,
                "icon-offset": [0, -8],
              },
            });
            if (this.map.getLayer("viewDirectionClickGeolocate")) {
              this.map.removeLayer("viewDirectionClickGeolocate");
              this.map.removeSource("viewDirectionClickGeolocate");
            } else {
              this.geolocateControl.setType(GeolocateType.None);
            }
          }
          this.map.setLayoutProperty(
            "viewDirectionClick",
            "icon-rotate",
            this.clickDirection - this.map.getBearing()
          );
        } else {
          this.isZoomedToTaskMapPoint = true;
          const center = this.task.question.direction?.position
            ? this.task.question.direction.position.geometry.coordinates
            : [
                this.isVirtualWorld
                  ? this.avatarLastKnownPosition.coords.longitude
                  : this.lastKnownPosition.coords.longitude,
                this.isVirtualWorld
                  ? this.avatarLastKnownPosition.coords.latitude
                  : this.lastKnownPosition.coords.latitude,
              ];
          this.map.flyTo({
            center,
            zoom: 18,
            // padding: {
            //   top: 80,
            //   bottom: 620,
            //   left: 40,
            //   right: 40
            // },
            // duration: 1000
          });
        }
      }

      this.trackerService.addEvent({
        type: "ON_MAP_CLICKED",
        clickPosition: {
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng,
        },
        clickDirection,
        map: mapType,
        answer: this.feedbackControl.getMapClickAnswer(
          {
            selectedPhoto: this.selectedPhoto,
            isCorrectPhotoSelected: this.isCorrectPhotoSelected,
            selectedChoice: this.selectedChoice,
            isCorrectChoiceSelected: this.isCorrectChoiceSelected,
            photo: this.photo,
            photoURL: this.photoURL,
            directionBearing: this.directionBearing,
            compassHeading: this.compassHeading,
            clickDirection: this.clickDirection,
            numberInput: this.numberInput,
            textInput: this.textInput,
          },
          [e.lngLat.lng, e.lngLat.lat]
        ),
      });
    }
  }

  calcBounds(task: any): mapboxgl.LngLatBounds {
    const bounds = new mapboxgl.LngLatBounds();

    if (task.answer.position) {
      try {
        bounds.extend(task.answer.position.geometry.coordinates);
      } catch (e) {}
    }

    if (task.question.geometry) {
      try {
        bounds.extend(bbox(task.question.geometry));
      } catch (e) {}
    }

    if (task.question.area) {
      try {
        bounds.extend(bbox(task.question.area));
      } catch (e) {}
    }

    if (task.question.direction) {
      try {
        bounds.extend(task.question.direction.position.geometry.coordinates);
      } catch (e) {}
    }

    if (
      task.mapFeatures?.landmarkFeatures &&
      task.mapFeatures?.landmarkFeatures.features.length > 0
    ) {
      try {
        bounds.extend(bbox(task.mapFeatures.landmarkFeatures));
      } catch (e) {}
    }

    if (
      this.task.answer.type == AnswerType.MAP_DIRECTION ||
      this.task.type == "theme-loc"
    ) {
      const position = point([
        this.isVirtualWorld
          ? this.avatarLastKnownPosition.coords.longitude
          : this.lastKnownPosition.coords.longitude,
        this.isVirtualWorld
          ? this.avatarLastKnownPosition.coords.latitude
          : this.lastKnownPosition.coords.latitude,
      ]);
      if (this.game.bbox?.features?.length > 0) {
        const bbox = this.game.bbox?.features[0];
        if (booleanWithin(position, bbox)) {
          try {
            bounds.extend(position);
          } catch (e) {}
        }
      }
    }

    return bounds;
  }

  zoomBounds() {
    let bounds = new mapboxgl.LngLatBounds();

    if (this.taskIndex != 0 && this.task.mapFeatures.zoombar == "true") {
      return;
    }

    if (
      this.task.mapFeatures.zoombar == "task" &&
      this.task.answer.mode != TaskMode.NAV_ARROW &&
      this.task.answer.mode != TaskMode.DIRECTION_ARROW
    ) {
      // zoom to task
      bounds = this.calcBounds(this.task);

      // include position into bounds (only if position is in bbox bounds)
      if (
        this.task.mapFeatures.position == "true" ||
        this.task.mapFeatures.direction == "true"
      ) {
        const position = point([
          this.isVirtualWorld
            ? this.avatarLastKnownPosition.coords.longitude
            : this.lastKnownPosition.coords.longitude,
          this.isVirtualWorld
            ? this.avatarLastKnownPosition.coords.latitude
            : this.lastKnownPosition.coords.latitude,
        ]);
        const bbox = this.game.bbox.features[0];

        if (this.game.bbox?.features?.length > 0) {
          if (booleanWithin(position, bbox)) {
            bounds.extend(position.geometry.coordinates);
          }
        } else {
          bounds.extend(position.geometry.coordinates);
        }
      }

      // use default bounds when there are no bounds to identify in task
      if (bounds.isEmpty()) {
        this.game.tasks.forEach((task) => {
          bounds = bounds.extend(this.calcBounds(task));
        });
      }
    } else if (this.game.bbox?.features?.length > 0) {
      const bboxBuffer = bbox(this.game.bbox);
      bounds = bounds.extend(bboxBuffer);
    } else if (this.task.question.area?.features?.length > 0) {
      const searchAreaBuffer = bbox(this.task.question.area);
      bounds = bounds.extend(searchAreaBuffer);
    } else {
      this.game.tasks.forEach((task) => {
        bounds = bounds.extend(this.calcBounds(task));
      });
    }

    const prom = new Promise((resolve, reject) => {
      this.map.once("moveend", () => resolve("ok"));

      if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds, {
          padding: {
            top: 40,
            bottom: 400,
            left: 40,
            right: 40,
          },
          duration: 1000,
          maxZoom: 16,
        });
      } else {
        reject("bounds are empty");
      }
    });

    return prom;
  }

  zoomBbox() {
    if (this.game.bbox != undefined && this.game.bbox?.features?.length > 0) {
      const bboxBuffer = bbox(this.game.bbox);
      this.map.fitBounds(bboxBuffer, {
        padding: {
          top: 40,
          bottom: 400,
          left: 40,
          right: 40,
        },
      });
      this.isZoomedToTaskMapPoint = false;
    }
  }

  async initGame() {
    /* multiplayer */
    if (this.isSingleMode) {
      this.task = this.game.tasks[this.taskIndex];
    } else {
      // add to a function
      this.game.tasks.forEach((task) => {
        switch (task.collaborationType) {
          case "1-1":
            task.answer = task.answer[this.playerNo - 1];
            task.question = task.question[this.playerNo - 1];
            break;
          case "sequential":
            task.answer = task.answer[0];
            task.question = task.question[0];
            break;
          case "freeChoice":
            // with free choice start with assigning each player answer/questoin
            // as in (1-1) to avoid adding else condition in the following code
            let tempAnswer = task.answer[this.playerNo - 1];
            let tempQuestion = task.question[this.playerNo - 1];

            /* Question types */
            if (task.question[0].allHaveSameInstruction) {
              tempQuestion.text = task.question[0].text;
            }
            if (task.question[0].allHaveSameAudio) {
              tempQuestion.audio = task.question[0].audio;
            }
            if (task.question[0].allHasSameMarkObj) {
              tempQuestion.geometry = task.question[0].geometry;
            }
            if (task.question[0].allHasSameInstPhoto) {
              tempQuestion.text = task.question[0].text;
              tempQuestion.photo = task.question[0].photo;
            }
            if (task.question[0].allHasSameMapMark) {
              tempQuestion.geometry = task.question[0].geometry;
            }
            if (task.question[0].allHasSameMarkObjMode) {
              tempQuestion.geometry = task.question[0].geometry;
            }
            if (task.question[0].allHasSamePhotoMarkObj) {
              tempQuestion.geometry = task.question[0].geometry;
              tempQuestion.photo = task.question[0].photo;
            }
            if (task.question[0].allHasSameViewDirec) {
              tempQuestion.direction = task.question[0].direction;
            }

            if (task.question[0].allHasSameDirMap) {
              tempQuestion.direction = task.question[0].direction;
            }

            if (task.question[0].allHasSamePhotoDirMap) {
              tempQuestion.direction = task.question[0].direction;
              tempQuestion.photo = task.question[0].photo;
            }
            if (task.question[0].allHasSamePhotoTask) {
              tempQuestion.photo = task.question[0].photo;
            }

            /* Answer types */
            if (task.answer[0].allHasSameDes) {
              tempAnswer.position = task.answer[0].position;
            }
            if (task.answer[0].allHaveSameMultiChoicePhoto) {
              tempAnswer.hints = task.answer[0].hints;
              tempAnswer.photos = task.answer[0].photos;
            }
            if (task.answer[0].allHaveSameMultiChoiceText) {
              tempAnswer.hints = task.answer[0].hints;
              tempAnswer.choices = task.answer[0].choices;
            }
            if (task.answer[0].allHaveSameCorrAnswer) {
              tempAnswer.number = task.answer[0].number;
            }
            if (task.answer[0].allHaveSameDirfeedback) {
              tempAnswer.hints[0] = task.answer[0].hints[0];
              tempAnswer.hints[1] = task.answer[0].hints[1];
              tempAnswer.hints[2] = task.answer[0].hints[2];
            }

            // assign temp answer/question to task
            task.answer = tempAnswer;
            task.question = tempQuestion;
            break;
        }
      });

      this.task = this.game.tasks[this.taskIndex];
    }

    this.trackerService.updateTaskNo(this.taskIndex + 1, this.task.category); // to update taskNo stored in waypoints
    this.feedbackControl.setTask(this.task);
    await this.trackerService.init(
      this.game._id,
      this.game.name,
      this.map,
      this.playersNames,
      this.isVirtualWorld,
      this.initialAvatarLoc,
      this.isSingleMode, // multiplayer - track
      this.numPlayers,
      this.playerNo
    );
  // console.log(this.game);

    /* if rejoin game using previous game session data, use sotred events and waypoints */
    if (!this.isRejoin) {
      /* add init game event */
      this.trackerService.addEvent({
        type: "INIT_GAME",
      });
    } else {
      /* retreive tasks events and waypoints */
      this.storage.get("savedTracksData").then((data) => {
        if (data) {
        // console.log("(play-game) s_events: ", data.s_events);

          if (data && data.s_events) {
            this.trackerService.setEvents(data.s_events);
          // console.log("(play-game) s_events[0]: ", data.s_events[0]);
            this.trackerService.setWaypoints(data.s_Waypoints);
          }
        }
      });
    }

    await this.initTask();

    if (this.game.bbox != undefined && this.game.bbox?.features?.length > 0) {
      const bboxBuffer = bbox(buffer(this.game.bbox, 0.5));
      // this.map.setMaxBounds(bboxBuffer)

      // you are leaving the game area warning
      if (this.game.geofence) {
      // console.log("creating the subscription");
        this.geolocationService
          .initGeofence(this.game.bbox.features[0])
          .subscribe((inGameBbox) => {
            this.geofenceAlert = !inGameBbox;
          });
        // subscribe to the direction the user has to go
        this.geolocationService.lastPointInBboxDirection.subscribe(
          (lastPointInBboxDirection) => {
            this.lastPointInBboxDirection = lastPointInBboxDirection;
          }
        );
      }

      if (
        this.game.mapSectionVisible === true ||
        this.game.mapSectionVisible == undefined
      ) {
        this.map.addSource("bbox", {
          type: "geojson",
          data: this.game.bbox,
        });

        this.map.addLayer({
          id: "bbox",
          type: "line",
          source: "bbox",
          filter: ["all", ["==", ["geometry-type"], "Polygon"]],
          paint: {
            "line-color": getComputedStyle(
              document.documentElement
            ).getPropertyValue("--ion-color-warning"),
            "line-opacity": 0.5,
            "line-width": 10,
            "line-dasharray": [2, 1],
          },
        });
      }
    }
  }

  async initTask() {
    this.panelMinimized = false;

    // // console.log("Current task: ", this.task);

    this.trackerService.setTask(this.task);

    this.trackerService.addEvent({
      type: "INIT_TASK",
    });

    /* set avatar initial position */
    if (this.isVirtualWorld) {
      // console.log("🚀 ~ initTask ~ socketService:");
      // if (this.task.question.initialAvatarPosition != undefined || this.task.virEnvType != undefined) {

      //* update vir env map overlay layer
      if (
        this.task.virEnvType != undefined &&
        this.task.virEnvType != this.virEnvType
      ) {
        /* console.log(
          "🚀 ~-- initTask ~ this.task.virEnvType != this.virEnvType:"
        ); */
        this.virEnvType = this.task.virEnvType;
        //* update VR (layer, zoom, center, ..)
        this.updateMapStyleOverlayLayer(
          "assets/vir_envs_layers/" + this.task.virEnvType + ".png",
          true
        );
      }

      //* To overcome the issue where app waits for initial avatar point from VE app. https://github.com/origami-team/geogami-virtual-environment-dev/issues/59
      //* 1. whether task has initial pos. (no need for it)
      //* 2. whether there is a position stored from previous task, if not use default from virEnvLayer.ts
      if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
        if (this.task.question.initialAvatarPosition) {
          this.avatarLastKnownPosition = new AvatarPosition(
            0,
            new Coords(
              this.task.question.initialAvatarPosition.position.geometry.coordinates[1],
              this.task.question.initialAvatarPosition.position.geometry.coordinates[0]
            )
          );
        } else {
          this.avatarLastKnownPosition = new AvatarPosition(
            0,
            this.previousTaskAavatarLastKnownPosition
              ? new Coords(
                  this.previousTaskAavatarLastKnownPosition.coords.latitude,
                  this.previousTaskAavatarLastKnownPosition.coords.longitude
                )
              : new Coords(
                  virEnvLayers[this.virEnvType].initialPosition.lat,
                  virEnvLayers[this.virEnvType].initialPosition.lng
                )
          );
        }
      }

      //* send inital loc, dir and vir env type
      //* if task doesn't hahve initial positoin send null to keep avatar current position. (?? Wrong if app env changed from 1 or 2 to others
      //* if no virEnvType is found send deafult one
      //* if no initial position is defined, check previous task env., if not same as current use default initial position
      this.socketService.socket.emit("deliverInitialAvatarPositionByGeoApp", {
        initialPosition: this.task.question.initialAvatarPosition
          ? [
              this.task.question.initialAvatarPosition.position.geometry
                .coordinates[0] * 111000,
              this.task.question.initialAvatarPosition.position.geometry
                .coordinates[1] * 112000,
            ]
          : // null),

          this.taskIndex != 0 &&
            this.task.virEnvType ===
              this.game.tasks[this.taskIndex - 1].virEnvType
          ? null
          : [
              virEnvLayers[this.virEnvType].initialPosition.lng * 111000,
              virEnvLayers[this.virEnvType].initialPosition.lat * 112000,
            ],
        initialRotation: this.task.question.initialAvatarPosition
          ? this.task.question.initialAvatarPosition.bearing
          : null,
        virEnvType: this.task.virEnvType,
      });
    }

    if (this.task.settings?.accuracy) {
      PlayingGamePage.triggerTreshold = this.task.settings.accuracy;
    } else {
      PlayingGamePage.triggerTreshold = 10;
    }

    if (this.map.getLayer("marker-point")) {
      this.map.removeLayer("marker-point");
    }

    if (this.map.getSource("marker-point")) {
      this.map.removeSource("marker-point");
    }

    if (this.map.getLayer("viewDirectionTask")) {
      this.map.removeLayer("viewDirectionTask");
      this.map.removeSource("viewDirectionTask");
    }

    if (this.map.getLayer("viewDirectionClick")) {
      this.map.removeLayer("viewDirectionClick");
      this.map.removeSource("viewDirectionClick");
    }

    if (this.map.getLayer("viewDirectionClickGeolocate")) {
      this.map.removeLayer("viewDirectionClickGeolocate");
      this.map.removeSource("viewDirectionClickGeolocate");
    }

    // check if the task before the last task was a drawing task
    // and if the drawing should be kept for the previous task
    // remove it then now
    const prevTask =
      this.taskIndex - 2 >= 0 ? this.game.tasks[this.taskIndex - 2] : undefined;
    if (prevTask) {
      if (
        prevTask.answer.type === AnswerType.DRAW &&
        prevTask.settings.keepDrawing === "next"
      ) {
        this.landmarkControl.removeDrawing();
      }
    }

    if (this.map.hasControl(this.DrawControl)) {
      this.map.removeControl(this.DrawControl);
    }

    this.map.setPitch(0);
    this.map.rotateTo(0);

    this.photo = "";
    this.photoURL = "";
    this.clickDirection = 0;

    this.numberInput = undefined;
    this.textInput = undefined;

    this.isZoomedToTaskMapPoint = false;

    if (this.waypointMarker) {
      if (this.game.tasks[this.taskIndex - 1]?.settings?.keepMarker) {
        const el = document.createElement("div");
        el.className = "waypoint-marker-disabled";

        new mapboxgl.Marker(el, {
          anchor: "bottom",
          offset: [15, 0],
        })
          .setLngLat(
            this.game.tasks[this.taskIndex - 1].answer.position.geometry
              .coordinates
          )
          .addTo(this.map);

        const elDuplicate = document.createElement("div");
        elDuplicate.className = "waypoint-marker-disabled";

        this.waypointMarkerDuplicate = new mapboxgl.Marker(elDuplicate, {
          anchor: "bottom",
          offset: [15, 0],
        }).setLngLat(
          this.game.tasks[this.taskIndex - 1].answer.position.geometry
            .coordinates
        );

        this.layerControl.passMarkers({
          waypointMarkerDuplicate: this.waypointMarkerDuplicate,
        });
      }
      this.waypointMarker.remove();
      this.waypointMarkerDuplicate.remove();
      this.waypointMarker = null;
      this.waypointMarkerDuplicate = null;
    }

    await this._initMapFeatures();
    this.landmarkControl.removeQT();
    this.landmarkControl.removeSearchArea();

    if (!this.isVirtualWorld) {
      try {
        await this.zoomBounds();
      } catch (e) {
      // console.log(e);
      }
    }

    if (
      this.task.answer.type == AnswerType.POSITION &&
      this.task.answer.mode != TaskMode.NAV_ARROW
    ) {
      if (this.task.answer.position != null && this.task.settings.showMarker) {
        const el = document.createElement("div");
        el.className = "waypoint-marker";

        this.waypointMarker = new mapboxgl.Marker(el, {
          anchor: "bottom",
          offset: [15, 0],
        })
          .setLngLat(this.task.answer.position.geometry.coordinates)
          .addTo(this.map);

        // create a duplicate for the swipe map
        const elDuplicate = document.createElement("div");
        elDuplicate.className = "waypoint-marker";

        this.waypointMarkerDuplicate = new mapboxgl.Marker(elDuplicate, {
          anchor: "bottom",
          offset: [15, 0],
        }).setLngLat(this.task.answer.position.geometry.coordinates);

        this.layerControl.passMarkers({
          waypointMarker: this.waypointMarkerDuplicate,
        });
      }
    }

    if (this.task.question.type == QuestionType.MAP_DIRECTION) {
      this.directionBearing = this.task.question.direction.bearing || 0;
    }

    if (this.task.question.type == QuestionType.MAP_DIRECTION_MARKER) {
      this.directionBearing = this.task.question.direction.bearing || 0;

      this.map.addSource("viewDirectionTask", {
        type: "geojson",
        data: this.task.question.direction.position.geometry,
      });
      this.map.addLayer({
        id: "viewDirectionTask",
        source: "viewDirectionTask",
        type: "symbol",
        layout: {
          "icon-image": "view-direction-task",
          "icon-size": 0.65,
          "icon-offset": [0, -8],
          "icon-rotate": this.directionBearing - this.map.getBearing(),
        },
      });
    }

    if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
      if (this.task.question.direction?.position) {
        this.map.addSource("viewDirectionClickGeolocate", {
          type: "geojson",
          data: this.task.question.direction.position.geometry,
        });
        this.map.addLayer({
          id: "viewDirectionClickGeolocate",
          source: "viewDirectionClickGeolocate",
          type: "symbol",
          layout: {
            "icon-image": "view-direction-click-geolocate",
            "icon-size": 0.4,
            "icon-offset": [0, 0],
          },
        });
      } else {
        this.geolocateControl.setType(GeolocateType.Continuous);
      }
    }

    if (
      (this.task.question.type == QuestionType.MAP_FEATURE ||
        this.task.question.type == QuestionType.MAP_FEATURE_FREE) &&
      this.task.answer.mode != TaskMode.NO_FEATURE
    ) {
      this.landmarkControl.setQTLandmark(this.task.question.geometry);
    }

    if (this.task.question.area?.features?.length > 0) {
      this.task.question.text = this.task.question.text +=
        " Suche im umrandeten Gebiet.";
      this.landmarkControl.setSearchArea(this.task.question.area);
    }

    if (this.task.answer.type == AnswerType.DRAW) {
    // console.log(" tasks info: ", this.task);
      if (
        this.task.settings.drawPointOnly !== undefined &&
        this.task.settings.drawPointOnly
      ) {
        this.DrawControl = this.DrawControl_point;
      } else {
        this.DrawControl = this.DrawControl_all;
      }
      this.map.addControl(this.DrawControl, "top-left");
    }

    // VR world (calcualte initial distance to target in nav-arrow tasks)
    if (this.isVirtualWorld && this.task.answer.mode == TaskMode.NAV_ARROW) {
      const waypoint = this.task.answer.position.geometry.coordinates;
      this.targetDistance = this.calculateDistanceToTarget(waypoint);
      this.UpdateInitialArrowDirection(); // To update iniatl arrow direction
    }

    this.changeDetectorRef.detectChanges();
  }

  nextTask() {
    // Keep track on map impl.
    // Check if the previous task has track feature and check
    // if it has keep feature `next`, to delete the track before viweing next game
    const prevNavTask =
      this.taskIndex - 1 >= 0 ? this.game.tasks[this.taskIndex - 1] : undefined;
    if (prevNavTask) {
      if (
        prevNavTask.answer.type == AnswerType.POSITION &&
        prevNavTask.mapFeatures.keepTrack === "next"
      ) {
        this.trackControl.removeTemporaryTrack(this.taskIndex - 1);
      }
    }
    // check if current task has `track feature` and whether its keep feature `next` or `all` to keep the route
    if (this.task.answer.type === AnswerType.POSITION) {
      if (this.task.mapFeatures.keepTrack === "all") {
        this.trackControl.addPermanentTrack(this.taskIndex);
      } else if (this.task.mapFeatures.keepTrack === "next") {
        this.trackControl.addTemporaryTrack(this.taskIndex);
      }
    }

    // this.feedbackControl.dismissFeedback();
    this.taskIndex++;
    //* check if this is last task that player skipped
    if (this.taskIndex > this.game.tasks.length - 1) {
      /* multiplayer */
      /* change player status in socket server to finished tasks */
      if (!this.isSingleMode) {
        this.socketService.socket.emit(
          "changePlayerConnectionStauts",
          "finished tasks"
        );
        /* remove stored player info used to rejoin */
        this.storage.remove("savedTracksData");
      }

      PlayingGamePage.showSuccess = true;

      // To disable map interations
      this.enableDisableMapInteraction(false);

      // VR world (disconnect socket connection when tasks are done)
      if (this.isVirtualWorld) {
        this.disconnectSocketIO();
      }

      this.trackerService.addEvent({
        type: "FINISHED_GAME",
      });

      // store collected data in database only when user agree in the begining of the game
      if (this.shareDataBox) {
        if (this.isSingleMode) {
          this.trackerService.uploadTrack().then((res) => {
            if (res.status == 201) {
              this.uploadDone = true;
            // console.log("res (single)", res);
            }
          });
        } else {
          /* Multiplayer */
          /* Request gmae track status from socket server
           * check wether game track is already stored by one of the players */
          this.socketService.socket.emit(
            "checkGameStatus",
            this.gameCode,
            (response) => {
              this.trackDataStatus = response.trackDataStatus;

              // if game track not stored yet
              if (!this.trackDataStatus.status) {
                /* store multiplayer tracks on server */
                this.trackerService.uploadTrack().then((res) => {
                  if (res.status == 201) {
                    this.uploadDone = true;
                    // // console.log("game id (multi)", res.body["content"]._id);
                    this.storedGameTrack_id = res.body["content"]._id;
                    /* Update game track staus in socket server */
                    this.socketService.socket.emit("updateGameTrackStauts", {
                      roomName: this.gameCode,
                      storedTrack_id: this.storedGameTrack_id,
                    });
                  }
                });
              } else {
                // if game aready stored
                // // console.log("game track already stored: ", this.trackDataStatus)

                /* update stored multiplayer tracks on server*/
                this.trackerService
                  .uploadTrack(true, this.trackDataStatus.track_id)
                  .then((res) => {
                    if (res.status == 201) {
                      this.uploadDone = true;
                    // console.log("game id (multi)", res.body["content"]._id);
                      this.storedGameTrack_id = res.body["content"]._id;
                    }
                  });
              }
            }
          );
        }
      }

      if (Capacitor.isNative) {
        Plugins.Haptics.vibrate();
        Plugins.CapacitorKeepScreenOn.disable();
      }

      return;
    }

    this.task = this.game.tasks[this.taskIndex];
    this.trackerService.updateTaskNo(this.taskIndex + 1, this.task.category); // to update taskNo stored in waypoints
    this.feedbackControl.setTask(this.task);

    //* To avoid using avataLastKnownPosition when changing game task while Vir App not working temporarily
    if (this.isVirtualWorld) {
      this.previousTaskAavatarLastKnownPosition = this.avatarLastKnownPosition;
      this.avatarLastKnownPosition = undefined;
    }

    this.initTask();
  }

  previousTask() {
    if (this.taskIndex > 0) {
      this.taskIndex--;
      /**
    if (this.taskIndex > 1) {
      PlayingGamePage.showSuccess = true;
      this.trackerService.addEvent({
        type: 'FINISHED_GAME',
      });
      this.trackerService.uploadTrack().then((res) => {
        if (res.status == 201) {
          this.uploadDone = true;
        }
      });
      if (Capacitor.isNative) {
        Plugins.Haptics.vibrate();
        Plugins.CapacitorKeepScreenOn.disable();
      }

      return;
    }
    */

      this.task = this.game.tasks[this.taskIndex];
      this.feedbackControl.setTask(this.task);

      //* To avoid using avataLastKnownPosition when changing game task while Vir App not working temporarily
      if (this.isVirtualWorld) {
        this.avatarLastKnownPosition = undefined;
      }

      this.initTask();
    }
  }

  async onMultipleChoicePhotoSelected(item, event) {
    this.selectedPhoto = item;
    this.isCorrectPhotoSelected = item.key === "0";

    Array.from(document.getElementsByClassName("multiple-choize-img")).forEach(
      (elem) => {
        elem.classList.remove("selected");
      }
    );
    event.target.classList.add("selected");

    this.trackerService.addEvent({
      type: "PHOTO_SELECTED",
      answer: {
        photo: item.value,
        correct: this.isCorrectPhotoSelected,
      },
    });
  }

  onMultipleChoiceSelected(item, event) {
    this.selectedChoice = item;
    this.isCorrectChoiceSelected = item.key === "0";

    Array.from(document.getElementsByClassName("choice")).forEach((elem) => {
      elem.classList.remove("selected");
    });
    event.target.classList.add("selected");

    this.trackerService.addEvent({
      type: "MULTIPLE_CHOICE_SELECTED",
      answer: {
        item: item.value,
        correct: this.isCorrectChoiceSelected,
      },
    });
  }

  async onOkClicked() {
    const isCorrect = true;
    const answer: any = {};

    if (
      this.task.type == "nav-flag" &&
      this.task.settings.confirmation &&
      this.task.mapFeatures.zoombar == "task" &&
      !this.isZoomedToTaskMapPoint
    ) {
      this.isZoomedToTaskMapPoint = true;
      this.map.flyTo({
        center: this.task.answer.position.geometry.coordinates,
        zoom: 18,
        // padding: {
        //   top: 80,
        //   bottom: 620,
        //   left: 40,
        //   right: 40
        // },
        // duration: 1000
      });
      this.showCorrectPositionModal = true;
      setTimeout(() => {
        this.showCorrectPositionModal = false;
      }, 2000);
      return;
    }

    if (
      this.task.type == "theme-direction" &&
      this.task.answer.type == AnswerType.DIRECTION &&
      this.task.settings.confirmation &&
      this.task.mapFeatures.zoombar == "task" &&
      !this.isZoomedToTaskMapPoint
    ) {
      this.isZoomedToTaskMapPoint = true;
      this.map.flyTo({
        center: this.task.question.direction.position.geometry.coordinates,
        zoom: 18,
        // padding: {
        //   top: 80,
        //   bottom: 620,
        //   left: 40,
        //   right: 40
        // },
        // duration: 1000
      });
      this.showCorrectPositionModal = true;
      setTimeout(() => {
        this.showCorrectPositionModal = false;
      }, 2000);
      return;
    }

    let draw = undefined;
    if (this.task.answer.type == AnswerType.DRAW) {
      draw = this.DrawControl.getAll();

      if (draw.features?.length === 0) {
        const toast = await this.toastController.create({
          message: this.translate.instant("Feedback.enterAnswer"),
          color: "dark",
          duration: 2000,
        });
        toast.present();
      } else {
        if (this.task.settings.keepDrawing === "all") {
          this.landmarkControl.addPermanentDrawing(
            this.DrawControl.getAll(),
            this.taskIndex
          );
        } else if (this.task.settings.keepDrawing === "next") {
          this.landmarkControl.addTemporaryDrawing(this.DrawControl.getAll());
        }
      }
    }

    await this.feedbackControl.setAnswer({
      selectedPhoto: this.selectedPhoto,
      isCorrectPhotoSelected: this.isCorrectPhotoSelected,
      selectedChoice: this.selectedChoice,
      isCorrectChoiceSelected: this.isCorrectChoiceSelected,
      photo: this.photo,
      photoURL: this.photoURL,
      directionBearing: this.directionBearing,
      compassHeading: this.compassHeading,
      clickDirection: this.clickDirection,
      numberInput: this.numberInput,
      textInput: this.textInput,
      draw,
    });

    if (
      this.task.category == "info" ||
      (this.task.answer.type == AnswerType.DRAW &&
        this.DrawControl.getAll().features?.length > 0)
    ) {
      this.nextTask();
    }

    this.changeDetectorRef.detectChanges();
  }

  calculateDistanceToTarget(waypoint): number {
    return this.helperService.getDistanceFromLatLonInM(
      waypoint[1],
      waypoint[0],
      this.isVirtualWorld
        ? this.avatarLastKnownPosition.coords.latitude
        : this.lastKnownPosition.coords.latitude,
      this.isVirtualWorld
        ? this.avatarLastKnownPosition.coords.longitude
        : this.lastKnownPosition.coords.longitude
    );
  }

  UpdateInitialArrowDirection() {
    const destCoords = this.task.answer.position.geometry.coordinates;
    const bearing = this.helperService.bearing(
      this.avatarLastKnownPosition.coords.latitude,
      this.avatarLastKnownPosition.coords.longitude,
      destCoords[1],
      destCoords[0]
    );

    this.targetHeading = 360 - (this.compassHeading - bearing);
  }

  navigateHome() {
    if (!this.isVirtualWorld) {
      this.positionSubscription.unsubscribe();
      this.deviceOrientationSubscription.unsubscribe();
    } else {
      this.disconnectSocketIO();

      this.avatarPositionSubscription.unsubscribe();
      this.avatarOrientationSubscription.unsubscribe();
    }

    this.geolocationService.clear();

    /* condition to refrain clear track service in multiplayer mode while waiting for other players */
    if (this.isSingleMode || (!this.isSingleMode && !this.waitPlayersPanel)) {
      this.trackerService.clear();
    }

    this.rotationControl.remove();
    this.viewDirectionControl.remove();
    this.landmarkControl.remove();

    // Execute only with real world games
    if (!this.isVirtualWorld) {
      this.streetSectionControl.remove();
    }

    this.layerControl.remove();
    this.trackControl.remove();
    this.geolocateControl.remove();
    this.panControl.remove();
    this.maskControl.remove();

    this.feedbackControl.remove();

    this.orientationService.clear();

    this.map.remove();
    this.navCtrl.navigateRoot("/");
  }

  togglePanel() {
    this.panelMinimized = !this.panelMinimized;
  }

  async capturePhoto() {
    this.photo = "";
    this.photoURL = "";

    const image = await Plugins.Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      width: 500,
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);

    this.uploading = true;

    const blob = await fetch(image.webPath).then((r) => r.blob());
    const formData = new FormData();
    formData.append("file", blob);

    const options = {
      method: "POST",
      body: formData,
    };

    const postResponse = await fetch(
      `${environment.apiURL}/file/upload`,
      options
    );

    if (!postResponse.ok) {
      throw Error("File upload failed");
    }
    this.uploading = false;

    const postResponseText = await postResponse.json();
    const filename = postResponseText.filename;
    this.photoURL = `${environment.apiURL}/file/image/${filename}`;
    this.changeDetectorRef.detectChanges();
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
    if (this.geolocateButton) {
      this.geolocateControl.toggle();
      this.geolocateButton = false;

      setTimeout(() => {
        this.geolocateControl.toggle();
      }, 2000);

      setTimeout(() => {
        this.geolocateButton = true;
      }, 20000);
    }
  }

  toggleSatellite() {
    let currentMapStyle = this.map.getStyle();
    let normalLayerPath = "assets/vir_envs_layers/" + this.virEnvType + ".png";
    let satelliteLayerPath =
      "assets/vir_envs_layers/" + this.virEnvType + "_satellite.png";

    if (currentMapStyle.sources.overlay.url == normalLayerPath) {
      //* update layer image
      this.updateMapStyleOverlayLayer(satelliteLayerPath, false);
    } else {
      //* update layer image
      this.updateMapStyleOverlayLayer(normalLayerPath, false);
    }
  }

  async _initMapFeatures() {
    return new Promise((resolve, reject) => {
      let mapFeatures = this.task.mapFeatures;
      if (mapFeatures == undefined) {
        mapFeatures = cloneDeep(standardMapFeatures);
      }
      for (const key in mapFeatures) {
        if (mapFeatures.hasOwnProperty(key)) {
          switch (key) {
            case "zoombar":
              if (mapFeatures[key] == "true") {
                this.map.scrollZoom.enable();
                this.map.boxZoom.enable();
                this.map.doubleClickZoom.enable();
                this.map.touchZoomRotate.enable();
              } else if (mapFeatures[key] == "false") {
                this.map.scrollZoom.disable();
                this.map.boxZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.touchZoomRotate.disable();
              } else {
                // zoom zur Aufgabe
                this.map.scrollZoom.enable();
                this.map.boxZoom.enable();
                this.map.doubleClickZoom.enable();
                this.map.touchZoomRotate.enable();
              }
              break;
            case "pan":
              if (mapFeatures[key] == "true") {
                this.panControl.setType(PanType.True);
              } else if (mapFeatures[key] == "center") {
                this.panControl.setType(PanType.Center);
              } else if (mapFeatures[key] == "static") {
                this.panControl.setType(PanType.Static);
              }
              break;
            case "rotation":
              if (mapFeatures[key] == "manual") {
                this.rotationControl.setType(RotationType.Manual);
              } else if (mapFeatures[key] == "auto") {
                this.rotationControl.setType(RotationType.Auto);
              } else if (mapFeatures[key] == "button") {
                this.rotationControl.setType(RotationType.Button);
              } else if (mapFeatures[key] == "north") {
                this.rotationControl.setType(RotationType.North);
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
                this.layerControl.setType(LayerType.Standard);
              } else if (mapFeatures[key] == "selection") {
                this.layerControl.setType(LayerType.Selection);
              } else if (mapFeatures[key] == "sat") {
                this.layerControl.setType(LayerType.Satellite);
              } else if (mapFeatures[key] == "sat-button") {
                // TODO: implememt
                this.layerControl.setType(LayerType.SatelliteButton);
              } else if (mapFeatures[key] == "sat-swipe") {
                this.swipe = true;
                this.changeDetectorRef.detectChanges();
                this.layerControl.setType(
                  LayerType.Swipe,
                  this.swipeMapContainer
                );
                this.layerControl.swipeClickSubscription.subscribe((e) =>
                  this.onMapClick(e, "swipe")
                );
              } else if (mapFeatures[key] == "3D") {
                this.layerControl.setType(LayerType.ThreeDimension);
              } else if (mapFeatures[key] == "3D-button") {
                this.layerControl.setType(LayerType.ThreeDimensionButton);
              } else if (mapFeatures[key] == "blank") {
                this.layerControl.setType(LayerType.Blank);
              } else if (mapFeatures[key] == "blank-swipe") {
                this.swipe = true;
                this.changeDetectorRef.detectChanges();
                this.layerControl.setType(
                  LayerType.BlankSwipe,
                  this.swipeMapContainer
                );
                this.layerControl.swipeClickSubscription.subscribe((e) =>
                  this.onMapClick(e, "swipe")
                );
              }
              break;
            case "position":
              if (mapFeatures[key] == "none") {
                this.geolocateControl.setType(GeolocateType.None);
              } else if (mapFeatures[key] == "true") {
                if (this.task.mapFeatures.direction != "true") {
                  // only show position marker when there is no direction marker
                  this.geolocateControl.setType(GeolocateType.Continuous);
                }
              } else if (mapFeatures[key] == "button") {
                // TODO: implement
              } else if (mapFeatures[key] == "start") {
                this.geolocateControl.setType(GeolocateType.TaskStart);
              }
              break;
            case "direction":
              this.directionArrow = false;
              if (mapFeatures[key] == "none") {
                this.viewDirectionControl.setType(ViewDirectionType.None);
              } else if (mapFeatures[key] == "true") {
                this.viewDirectionControl.setType(ViewDirectionType.Continuous);
              } else if (mapFeatures[key] == "button") {
                // TODO: implement
              } else if (mapFeatures[key] == "start") {
                this.viewDirectionControl.setType(ViewDirectionType.TaskStart);
              }
              break;
            case "track":
              if (mapFeatures[key]) {
                this.trackControl.setType(TrackType.Enabled);
              } else {
                this.trackControl.setType(TrackType.Disabled);
              }
              break;
            case "streetSection":
              if (!this.isVirtualWorld) {
                if (mapFeatures[key]) {
                  this.streetSectionControl.setType(StreetSectionType.Enabled);
                } else {
                  this.streetSectionControl.setType(StreetSectionType.Disabled);
                }
              }
              break;
            case "landmarks":
              if (mapFeatures[key]) {
                this.landmarkControl.setLandmark(mapFeatures.landmarkFeatures);
              } else {
                this.landmarkControl.remove();
              }
              break;
            case "reducedInformation":
              if (!mapFeatures[key]) {
                this.maskControl.setType(MaskType.Disabled);
              } else {
                this.maskControl.addLayer(
                  this.task.mapFeatures.reducedMapSectionDiameter
                );
                this.maskControl.setType(MaskType.Enabled);
              }
              break;
          }
        }
      }
      setTimeout(() => {
        resolve("ok");
      }, 250);
    });
  }

  addPlayer() {
    this.playersNames.push("");
  }

  removePlayer(index: number) {
    this.playersNames.splice(index, 1);
  }

  indexTracker(index: number, value: any) {
    return index;
  }

  startGame() {
  // console.log(this.playersNames);
    // this.subscripePosition(); // For Realworld / VE
    this.initGame();
    // this.showPlayersNames = false;
    this.enableDisableMapInteraction(true);
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
    return (
      mappings.filter((m) => {
        if (key == null) {
          return;
        }
        return key.includes(m.tag);
      }).length > 0
    );
  }

  /*-------------------------------------*/
  /*  Socket server listeners - Multiplayer*/
  /*-------------------------------------*/

  /* Request player location by instructor */
  onRequestPlayerLocationByInstructor() {
    /* when instructor request players real time location */
    this.socketService.socket.on("requestPlayerLocation", () => {
    // console.log("(game-paly) requestPlayersLocation1");
    /* console.log(
        "(game-paly) requestPlayersLocation1, this.lastKnownPosition",
        this.lastKnownPosition
      ); */

      this.socketService.socket.emit("updatePlayersLocation", {
        roomName: this.gameCode,
        playerLoc: !this.isVirtualWorld
          ? [
              this.lastKnownPosition.coords.longitude,
              this.lastKnownPosition.coords.latitude,
            ]
          : [
              this.avatarLastKnownPosition.coords.longitude,
              this.avatarLastKnownPosition.coords.latitude,
            ],
        playerNo: this.playerNo,
        //playerName: this.playersNames[0]
      });

    // console.log("(game-paly) requestPlayersLocation2");
    });
  }

  /* on assign number to myself  */
  onAssignPlayerNumber() {
    this.socketService.socket.on("assignPlayerNumber", (data) => {
    // console.log("playerNo from socket: ", data);

      /* player number equal number of players already joined the room */
      this.playerNo = this.joinedPlayersCount = data.playerNo;

      /* if all players joined the game, remove waiting panel */
      if (this.joinedPlayersCount == this.numPlayers) {
        this.waitPlayersPanel = false;
      }
    });
  }

  /* on joining game by other players */
  onPlayerJoinGame() {
    this.socketService.socket.on("playerJoined", (data) => {
    // console.log("PlayerJoined: (number of players so far) ", data);
      this.joinedPlayersCount = data.joinedPlayersCount;

      if (this.joinedPlayersCount == this.numPlayers) {
        this.waitPlayersPanel = false;
        this.startGame();
      }
    });
  }
}
