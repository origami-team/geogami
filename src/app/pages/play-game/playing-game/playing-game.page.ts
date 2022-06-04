import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
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
} from "@capacitor/core";
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

// VR world
import { Socket } from 'ngx-socket-io';
import { AvatarPosition } from 'src/app/models/avatarPosition'
import { Coords } from 'src/app/models/coords'
import { TranslateService } from "@ngx-translate/core";
import { map } from "rxjs-compat/operator/map";
import { ShowroomPage } from "../../showroom/showroom/showroom.page";

@Component({
  selector: "app-playing-game",
  templateUrl: "./playing-game.page.html",
  styleUrls: ["./playing-game.page.scss"],
})
export class PlayingGamePage implements OnInit, OnDestroy {
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
    private socket: Socket,
    private translate: TranslateService
  ) {
    this.lottieConfig = {
      path: "assets/lottie/star-success.json",
      renderer: "canvas",
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

  // treshold to trigger location arrive
  public static triggerTreshold: Number = 20;

  public static showSuccess = false;
  geofenceAlert: boolean;
  @ViewChild("mapWrapper") mapWrapper;
  @ViewChild("map") mapContainer;
  @ViewChild("swipeMap") swipeMapContainer;
  @ViewChild("panel") panel;
  @ViewChild("feedback") feedbackControl;

  game: Game;
  playersNames: string[] = [""];
  showPlayersNames = true;

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
  avatarPositionSubscription: Subscription;
  avatarLastKnownPosition: AvatarPosition;
  avatarOrientationSubscription: Subscription;
  initialAvatarLoc: any;
  currentSecond: number = 0;
  gameCode: string = "";

  // static map impl // --- B.Sc. thesis
  static_map = false;
  gameName: string = "";
  gamePlace: string = "";
  layerURL: string = "";
  layer_coordinates = [];

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
  shareData_cbox = false;

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
          "fill-opacity": 0.5,
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

  // Draw control only point enabled
  DrawControl_point = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      point: true,
      trash: true,
    },
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
    ],
  });

  ngOnInit() {
    Plugins.Keyboard.addListener("keyboardDidHide", async () => {
      this.map.resize();
      await this.zoomBounds();
    });

    PlayingGamePage.showSuccess = false;

  }

  connectSocketIO() {
    this.socket.connect();
    /* MultiUsers in Parallel impl. */
    this.socket.emit("newGame", { gameCode: this.gameCode, "isVRWorld_1": !this.isVRMirrored });
  }

  disconnectSocketIO() {
    this.socket.disconnect();
  }

  ionViewWillEnter() {
    // VR world
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
      this.isVirtualWorld = JSON.parse(params.bundle).isVRWorld;
      this.isVRMirrored = JSON.parse(params.bundle).isVRMirrored;
      this.gameCode = JSON.parse(params.bundle).gameCode;
      this.gameName = JSON.parse(params.bundle).gameName;
      this.gamePlace = JSON.parse(params.bundle).gamePlace;

      // add static map impl. // --- B.Sc. thesis
      if (this.gamePlace.includes("Dortmund") && this.gameName.includes("School") && (this.gameName.includes("DM") || this.gameName.includes("PM"))) {
        console.log("this.static_map1: ", this.static_map)
        this.static_map = true;
        console.log("this.static_map2: ", this.static_map)
      }
    });

    // Set the intial avatar location (in either normal or mirrored version)
    this.initialAvatarLoc = (this.isVRMirrored ? environment.initialAvatarLoc_MirroredVersion : environment.initialAvatarLoc)

    this.game = null;
    this.game = new Game(0, 'Loading...', '', false, [], false, false, false, false, false, false);
    this.route.params.subscribe((params) => {
      this.gamesService
        .getGame(JSON.parse(params.bundle).id)
        .then((res) => res.content)
        .then((game) => {
          this.game = game;
          this.loaded = true;

          // VR world
          // Check game type either real or VR world
          if (game.isVRWorld !== undefined && game.isVRWorld != false) {
            this.connectSocketIO();
          }
        });
    });

    mapboxgl.accessToken = environment.mapboxAccessToken;

    // VR world style start
    let virtualWorldMapStyle = {
      'version': 8,
      'name': 'Dark',
      'sources': {
        'mapbox': {
          'type': 'vector',
          'url': 'mapbox://mapbox.mapbox-streets-v8'
        },
        'overlay':
        {
          'type': 'image',
          'url': (this.isVRMirrored ? environment.VR_World_2 : environment.VR_World_1), // V4

          'coordinates': [
            [0.0002307207207, 0.004459082914], // NW
            [0.003717027207, 0.004459082914], // NE 
            [0.003717027207, 0.0003628597122], // SE
            [0.0002307207207, 0.0003628597122] // SW
          ]
        }
      },
      'sprite': 'mapbox://sprites/mapbox/dark-v10',
      'glyphs': 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      'layers': [
        {
          'id': 'background',
          'type': 'background',
          'paint': { 'background-color': '#111' }
        },
        {
          'id': 'water',
          'source': 'mapbox',
          'source-layer': 'water',
          'type': 'fill',
          'paint': { 'fill-color': '#2c2c2c' }
        },
        {
          'id': 'boundaries',
          'source': 'mapbox',
          'source-layer': 'admin',
          'type': 'line',
          'paint': {
            'line-color': '#797979',
            'line-dasharray': [2, 2, 6, 2]
          },
          'filter': ['all', ['==', 'maritime', 0]]
        },
        {
          'id': 'overlay',
          'source': 'overlay',
          'type': 'raster',
          'paint': { 'raster-opacity': 0.85 }
        },
        {
          'id': 'cities',
          'source': 'mapbox',
          'source-layer': 'place_label',
          'type': 'symbol',
          'layout': {
            "visibility": "none",
            'text-field': '{name_en}',
            'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4,
              9,
              6,
              12
            ]
          },
          'paint': {
            'text-color': '#969696',
            'text-halo-width': 2,
            'text-halo-color': 'rgba(0, 0, 0, 0.85)'
          }
        },
        {
          'id': 'states',
          'source': 'mapbox',
          'source-layer': 'place_label',
          'type': 'symbol',
          'layout': {
            'text-transform': 'uppercase',
            'text-field': '{name_en}',
            'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
            'text-letter-spacing': 0.15,
            'text-max-width': 7,
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4,
              10,
              6,
              14
            ]
          },
          'filter': ['==', ['get', 'class'], 'state'],
          'paint': {
            'text-color': '#969696',
            'text-halo-width': 2,
            'text-halo-color': 'rgba(0, 0, 0, 0.85)'
          }
        }
      ]
    };
    // VR world style end

    // if (environment.production) {

    // Real world style start
    let realWorldMapStyle = {
      version: 8,
      metadata: {
        "mapbox:autocomposite": true,
        "mapbox:type": "template",
      },
      sources: {
        "raster-tiles": {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
        },
        mapbox: {
          url: "mapbox://mapbox.mapbox-streets-v7",
          type: "vector",
        },
      },
      layers: [
        {
          id: "simple-tiles",
          type: "raster",
          source: "raster-tiles",
          minzoom: 0,
          maxzoom: 22,
        },
        {
          id: "building",
          type: "fill",
          source: "mapbox",
          "source-layer": "building",
          paint: {
            "fill-color": "#d6d6d6",
            "fill-opacity": 0,
          },
          interactive: true,
        },
      ],
    };
    // } else {
    //   mapStyle = document.body.classList.contains("dark")
    //     ? "mapbox://styles/mapbox/dark-v9"
    //     : "mapbox://styles/mapbox/streets-v9"
    // }

    // Set bounds of VR world 
    var bounds_VR_env = [
      [0.0002307207207 - 0.002, 0.0003628597122 - 0.0035], // Southwest coordinates (lng,lat)
      [0.003717027207 + 0.002, 0.004459082914 + 0.002] // Northeast coordinates (lng,lat)
    ];

    // --- B.Sc. thesis
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: (this.isVirtualWorld || this.static_map ? virtualWorldMapStyle : realWorldMapStyle),
      //style: (this.isVirtualWorld ? virtualWorldMapStyle : realWorldMapStyle),
      center: (this.isVirtualWorld ? [0.00001785714286 / 2, 0.002936936937 / 2] : [8, 51.8]),
      zoom: 2,
      maxZoom: 18,
      maxBounds: (this.isVirtualWorld ? bounds_VR_env : null) // Sets bounds
    });


    // Temp // --- B.Sc. thesis
/*     this.map.on('click', e => {
      var coordinates = e.lngLat;
      console.log("lng lat:", coordinates)
      console.log("zoom level:", this.map.getZoom())
    }); */


    this.geolocationService.init(this.isVirtualWorld);
    this.orientationService.init(this.isVirtualWorld);

    if (!this.isVirtualWorld) {
      this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
        (position) => {
          this.trackerService.addWaypoint({});

          this.lastKnownPosition = position;

          if (this.task && !PlayingGamePage.showSuccess) {
            if (this.task.answer.type == AnswerType.POSITION) {
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
        }
      );
    } else {
      // VR world
      this.avatarPositionSubscription = this.geolocationService.avatarGeolocationSubscription.subscribe(
        (avatarPosition) => {

          // Store waypoint every second
          if (this.currentSecond != new Date().getSeconds()) {
            this.currentSecond = new Date().getSeconds();
            this.trackerService.addWaypoint({});
          }

          if (this.avatarLastKnownPosition === undefined) {
            // Initial avatar's positoin to measure distance to target in nav-arrow tasks
            this.avatarLastKnownPosition = new AvatarPosition(0, new Coords(this.initialAvatarLoc.lat, this.initialAvatarLoc.lng));
          } else {
            this.avatarLastKnownPosition = new AvatarPosition(0, new Coords(parseFloat(avatarPosition["z"]) / 111200, parseFloat(avatarPosition["x"]) / 111000));
          }

          if (this.task && !PlayingGamePage.showSuccess) {
            if (this.task.answer.type == AnswerType.POSITION) {
              if (this.task.answer.mode == TaskMode.NAV_ARROW) {
                const destCoords = this.task.answer.position.geometry.coordinates;
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
        this.isVirtualWorld);
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
        this.initialAvatarLoc
      );
      this.panControl = new PanControl(
        this.map,
        this.geolocationService,
        this.isVirtualWorld
      );
      this.maskControl = new MaskControl(
        this.map,
        this.geolocationService,
        this.isVirtualWorld);

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
    });

    this.map.on("click", (e) => this.onMapClick(e, "standard"));

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
      this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe(
        (heading: number) => {
          this.compassHeading = heading;
          this.targetHeading = 360 - (this.compassHeading - this.heading);
          this.indicatedDirection = this.compassHeading - this.directionBearing;
        }
      );
    } else {
      this.avatarOrientationSubscription = this.orientationService.avatarOrientationSubscription.subscribe(
        (avatarHeading: number) => {
          this.compassHeading = avatarHeading;
          this.targetHeading = 360 - (this.compassHeading - this.heading);
          this.indicatedDirection = this.compassHeading - this.directionBearing;
        }
      );
    }

    if (Capacitor.isNative) {
      Plugins.CapacitorKeepScreenOn.enable();
    }
  }

  onMapClick(e, mapType) {
    console.log(e);
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
            (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.latitude : this.lastKnownPosition.coords.latitude),
            (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.longitude : this.lastKnownPosition.coords.longitude),
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
            this.map.addSource("viewDirectionClick", {
              type: "geojson",
              data: {
                type: "Point",
                coordinates: [
                  (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.longitude : this.lastKnownPosition.coords.longitude),
                  (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.latitude : this.lastKnownPosition.coords.latitude),
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
            (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.longitude : this.lastKnownPosition.coords.longitude),
            (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.latitude : this.lastKnownPosition.coords.latitude),
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

  calcBounds(task: any): mapboxgl.LngLatBounds {
    const bounds = new mapboxgl.LngLatBounds();

    if (task.answer.position) {
      try {
        bounds.extend(task.answer.position.geometry.coordinates);
      } catch (e) { }
    }

    if (task.question.geometry) {
      try {
        bounds.extend(bbox(task.question.geometry));
      } catch (e) { }
    }

    if (task.question.area) {
      try {
        bounds.extend(bbox(task.question.area));
      } catch (e) { }
    }

    if (task.question.direction) {
      try {
        bounds.extend(task.question.direction.position.geometry.coordinates);
      } catch (e) { }
    }

    if (
      task.mapFeatures?.landmarkFeatures &&
      task.mapFeatures?.landmarkFeatures.features.length > 0
    ) {
      try {
        bounds.extend(bbox(task.mapFeatures.landmarkFeatures));
      } catch (e) { }
    }

    if (
      this.task.answer.type == AnswerType.MAP_DIRECTION ||
      this.task.type == "theme-loc"
    ) {
      const position = point([
        (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.longitude : this.lastKnownPosition.coords.longitude),
        (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.latitude : this.lastKnownPosition.coords.latitude),
      ]);
      if (this.game.bbox?.features?.length > 0) {
        const bbox = this.game.bbox?.features[0];
        if (booleanWithin(position, bbox)) {
          try {
            bounds.extend(position);
          } catch (e) { }
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
          (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.longitude : this.lastKnownPosition.coords.longitude),
          (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.latitude : this.lastKnownPosition.coords.latitude),
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
          maxZoom: (this.static_map ? 18 : 16),  // to change zoom level
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
    this.task = this.game.tasks[this.taskIndex];
    this.feedbackControl.setTask(this.task);
    await this.trackerService.init(
      this.game._id,
      this.game.name,
      this.map,
      this.playersNames,
      this.isVirtualWorld,
      this.initialAvatarLoc
    );
    console.log(this.game);

    this.trackerService.addEvent({
      type: "INIT_GAME",
    });
    await this.initTask();

    if (this.game.bbox != undefined && this.game.bbox?.features?.length > 0) {
      const bboxBuffer = bbox(buffer(this.game.bbox, 0.5));
      // this.map.setMaxBounds(bboxBuffer)

      // you are leaving the game area warning
      if (this.game.geofence) {
        console.log("creating the subscription");
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

    // --- B.Sc. thesis
    this.showImageMapLayer();

    this.panelMinimized = false;

    console.log("Current task: ", this.task);

    this.trackerService.setTask(this.task);

    this.trackerService.addEvent({
      type: "INIT_TASK",
    });

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
        console.log(e);
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
      console.log(" tasks info: ", this.task)
      if (this.task.settings.drawPointOnly !== undefined && this.task.settings.drawPointOnly) {
        this.DrawControl = this.DrawControl_point;
      } else {
        this.DrawControl = this.DrawControl_all;
      }
      this.map.addControl(this.DrawControl, "top-left");
    }

    // VR world (calcualte initial distance to target in nav-arrow tasks)
    if (this.isVirtualWorld && this.task.answer.mode == TaskMode.NAV_ARROW) {
      const waypoint = this.task.answer.position.geometry.coordinates;
      this.targetDistance = this.calculateDistanceToTarget(waypoint)
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
        prevNavTask.mapFeatures.keepTrack === "next") {
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
    if (this.taskIndex > this.game.tasks.length - 1) {
      PlayingGamePage.showSuccess = true;

      // VR world (disconnect socket connection when tasks are done)
      if (this.isVirtualWorld) {
        this.disconnectSocketIO();
      }

      this.trackerService.addEvent({
        type: "FINISHED_GAME",
      });

      // store collected data in database only when user agree in the begining of the game
      if (this.shareData_cbox) {
        this.trackerService.uploadTrack().then((res) => {
          if (res.status == 201) {
            this.uploadDone = true;
          }
        });
      }

      if (Capacitor.isNative) {
        Plugins.Haptics.vibrate();
        Plugins.CapacitorKeepScreenOn.disable();
      }

      return;
    }

    this.task = this.game.tasks[this.taskIndex];
    this.feedbackControl.setTask(this.task);
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

    console.log("onOkClicked//////")
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
      }, 3000);
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
      }, 3000);
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
      (this.task.answer.type == AnswerType.DRAW && this.DrawControl.getAll().features?.length > 0)
    ) {
      this.nextTask();
    }

    this.changeDetectorRef.detectChanges();
  }

  calculateDistanceToTarget(waypoint): number {
    return this.helperService.getDistanceFromLatLonInM(
      waypoint[1],
      waypoint[0],
      (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.latitude : this.lastKnownPosition.coords.latitude),
      (this.isVirtualWorld ? this.avatarLastKnownPosition.coords.longitude : this.lastKnownPosition.coords.longitude)
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

  ngOnDestroy() { }

  navigateHome() {
    if (!this.isVirtualWorld) {
      this.positionSubscription.unsubscribe(); //
      this.deviceOrientationSubscription.unsubscribe();
    } else {
      this.disconnectSocketIO();

      this.avatarPositionSubscription.unsubscribe();
      this.avatarOrientationSubscription.unsubscribe();
    }

    this.geolocationService.clear();

    this.trackerService.clear();

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

    // this.map.remove();
    this.navCtrl.navigateRoot('/');
    //this.streetSectionControl.remove();  // duplicate
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
      }, 2000)

      setTimeout(() => {
        this.geolocateButton = true;
      }, 20000)
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
    console.log(this.playersNames);
    this.initGame();
    this.showPlayersNames = false;
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

  // adding static map impl. // --- B.Sc. thesis
  showImageMapLayer(){
    
    if (this.static_map) {
      console.log("___taskIndex + 1:", this.taskIndex + 1)
      this.layerURL = "";

      switch (this.gameName) {
        /* school 1 */
        // School 1 Post-Test
        case "School 1 Post-Test PM & DM ":
          switch (this.taskIndex + 1) {
            case 2:
            case 3:
              this.layerURL = "assets/School_1/Post-Test/1_Post_Map_1.jpeg";
              break;
            case 5:
            case 6:
              this.layerURL = "assets/School_1/Post-Test/1_Post_Map_2.jpeg";
              break;
            case 8:
            case 9:
              this.layerURL = "assets/School_1/Post-Test/1_Post_Map_3.jpeg";
              break;
            case 11:
            case 12:
            case 13:
              this.layerURL = "assets/School_1/Post-Test/1_Post_Map_4.jpeg";
              break;
          }
          break;

        // School 1 Pre-Test
        case "School 1 Pre-Test PM & DM":
          switch (this.taskIndex + 1) {
            case 2:
            case 3:
              this.layerURL = "assets/School_1/Pre-Test/1_Pre_Map_1.jpeg";
              break;
            case 5:
            case 6:
              this.layerURL = "assets/School_1/Pre-Test/1_Pre_Map_2.jpeg";
              break;
            case 8:
            case 9:
              this.layerURL = "assets/School_1/Pre-Test/1_Pre_Map_3.jpeg";
              break;
            case 11:
            case 12:
            case 13:
              this.layerURL = "assets/School_1/Pre-Test/1_Pre_Map_4.jpeg";
              break;
          }
          console.log("___after switch:", "this.layerURL:", this.layerURL)
          break;

        // School 1 Training
        case "School 1 Training DM":
        case "School 1 Training PM":
          this.layerURL = "assets/School_1/Trainings/1_Training_Map.jpeg";
          break;

        // school 2
        // School 2 Post-Test
        case "School 2 Post-Test DM & PM":
          switch (this.taskIndex + 1) {
            case 2:
            case 3:
              this.layerURL = "assets/School_2/Post-Test/2_Post_Map_1.jpeg";
              break;
            case 5:
            case 6:
              this.layerURL = "assets/School_2/Post-Test/2_Post_Map_2.jpeg";
              break;
            case 8:
            case 9:
              this.layerURL = "assets/School_2/Post-Test/2_Post_Map_3.jpeg";
              break;
          }
          break;

        // School 2 Pre-Test
        case "School 2 Pre-Test DM & PM":
          switch (this.taskIndex + 1) {
            case 2:
            case 3:
              this.layerURL = "assets/School_2/Pre-Test/2_Pre_Map_1.jpeg";
              break;
            case 5:
            case 6:
              this.layerURL = "assets/School_2/Pre-Test/2_Pre_Map_2.jpeg";
              break;
            case 8:
            case 9:
              this.layerURL = "assets/School_2/Pre-Test/2_Pre_Map_3.jpeg";
              break;
          }
          break;

        // School 2 Training
        case "School 2 Training DM":
        case "School 2 Training PM":
          this.layerURL = "assets/School_2/Training/2_Training_Map.jpeg";
          break;

      }

      console.log("___1this.layerURL:", this.layerURL)

      if (this.layerURL != "") {
        // check school 1 OR 2
        if (this.gameName.includes("School 1")) {
          this.layer_coordinates = [
            [7.525428844788735, 51.47987798697528], // NW  7.525470150110408, lat: 51.47985653524688
            [7.526238284951148, 51.480269771617344], // NE 7.526306999322998, lat: 51.48022069238428 
            [7.527741757834178, 51.47908687626966], // SE 7.527733934519745, 51.47909480265798
            [7.526922897883736, 51.47869482931878]  // SW 7.526902449724844, 51.478700567638185
          ]

          // rotate map
          setTimeout(() => {
            this.map.rotateTo(-38)
          }, 1500);
        }
        else {
          this.layer_coordinates = [
            [7.507035848527437, 51.47406944074166], // NW  1,  7.507035848527437, 51.47406944074166
            // 7.50709523585266, lat: 51.47406679750375 
            [7.507935021335101, 51.47415524643509], // NE 2,  7.507935021335101, 51.47415524643509 
            [7.5082143041779545, 51.47329155822925], // SE 3,  7.5082143041779545, 51.47329155822925 
            [7.507303443022494, 51.473180634273746]  // SW 4,  7.507303443022494, 51.473180634273746 
            // 7.5073521235915734, 51.47318572269714
          ]

          // rotate map
          setTimeout(() => {
            this.map.rotateTo(-10.4)
          }, 1500);
        }
        // (note: i manged to add the static map layer using add layer as below code)
        //this.map.on('load', () => {
        if (this.map.getLayer("radar-layer")) {
          this.map.removeLayer("radar-layer");
          this.map.removeSource("radar");
        }
        console.log("___2this.layerURL:", this.layerURL)
        this.map.addSource('radar', {
          'type': 'image',
          'url': this.layerURL, // V4
          'coordinates': this.layer_coordinates
        });
        this.map.addLayer({
          id: 'radar-layer',
          'type': 'raster',
          'source': 'radar',
          'paint': {
            'raster-fade-duration': 0,
            //"raster-opacity": 0.5
          }
        });
      } else { // to remove layer in next task
        if (this.map.getLayer("radar-layer")) {
          this.map.removeLayer("radar-layer");
          this.map.removeSource("radar");
        }
      }
    }
  }
}
