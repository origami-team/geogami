import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GamesService } from '../../../services/games.service';
import { OsmService } from '../../../services/osm.service';
import { TrackerService } from '../../../services/tracker.service';
import mapboxgl, { LngLatBounds, LngLatBoundsLike, MapMouseEvent } from 'mapbox-gl';
import {
  Plugins,
  GeolocationPosition,
  Capacitor,
  CameraResultType,
  CameraSource,
} from '@capacitor/core';
import {
  ModalController,
  NavController,
  ToastController,
} from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Game } from 'src/app/models/game';
import { Subscription } from 'rxjs';
import {
  RotationControl,
  RotationType,
} from './../../../mapControllers/rotation-control';
import { LayerControl, LayerType } from 'src/app/mapControllers/layer-control';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';
import { MaskControl, MaskType } from 'src/app/mapControllers/mask-control';
import { PanControl, PanType } from 'src/app/mapControllers/pan-control';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { mappings } from './../../../pipes/keywords.js';
import { OrigamiGeolocationService } from './../../../services/origami-geolocation.service';
import { AnswerType, TaskMode, QuestionType } from 'src/app/models/types';
import { cloneDeep } from 'lodash';
import { standardMapFeatures } from '../../../models/standardMapFeatures';
import { AnimationOptions } from 'ngx-lottie';
import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import { Task } from 'src/app/models/task';
import { point } from '@turf/helpers';
import booleanWithin from '@turf/boolean-within';
import { OrigamiOrientationService } from 'src/app/services/origami-orientation.service';
import MapboxCompare from 'mapbox-gl-compare';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-playing-game',
  templateUrl: './playing-game.page.html',
  styleUrls: ['./playing-game.page.scss'],
})
export class PlayingGamePage implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    public modalController: ModalController,
    public toastController: ToastController,
    private gamesService: GamesService,
    private taskService: TaskService,
    public navCtrl: NavController,
    private changeDetectorRef: ChangeDetectorRef,
    private OSMService: OsmService,
    private trackerService: TrackerService,
    public alertController: AlertController,
    public platform: Platform,
    public helperService: HelperService,
    private sanitizer: DomSanitizer,
    private geolocationService: OrigamiGeolocationService,
    private orientationService: OrigamiOrientationService
  ) {
    this.lottieConfig = {
      path: 'assets/lottie/star-success.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true,
    };
    // this.audioPlayer.src = 'assets/sounds/zapsplat_multimedia_alert_musical_warm_arp_005_46194.mp3'
    this.primaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue('--ion-color-primary');
    this.secondaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue('--ion-color-secondary');
  }

  get staticShowSuccess() {
    return PlayingGamePage.showSuccess;
  }

  // treshold to trigger location arrive
  public static triggerTreshold = 20;

  public static showSuccess = false;
  @ViewChild('mapWrapper') mapWrapper;
  // @ViewChild('map') mapContainer;
  @ViewChild('swipeMap') swipeMapContainer;
  @ViewChild('panel') panel;
  @ViewChild('feedback') feedbackControl;

  // mapbox gl settings
  map: mapboxgl.Map;
  swipeMap: mapboxgl.Map;
  mapCenter: number[] = [8, 51.8];
  mapZoom = 2;
  mapZoomEnabled = true;
  mapPanEnabled = true;
  mapBearing: number[] = [0];
  mapStyle: mapboxgl.Style = {
    version: 8,
    metadata: {
      'mapbox:autocomposite': true,
      'mapbox:type': 'template',
    },
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
      },
      mapbox: {
        url: 'mapbox://mapbox.mapbox-streets-v7',
        type: 'vector',
      },
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22,
      },
      {
        id: 'building',
        type: 'fill',
        source: 'mapbox',
        'source-layer': 'building',
        paint: {
          'fill-color': '#d6d6d6',
          'fill-opacity': 0,
        },
        interactive: true,
      },
    ],
  };
  mapBounds: LngLatBounds;
  // mapbox gl settings end

  // map layer plugins
  viewDirectionVisible = false;
  geolocateVisible = false;
  trackVisible = false;
  streetSectionVisible = false;

  landmarks: any = {
    landmark: undefined,
    qtLandmark: undefined,
    searchArea: undefined,
  };
  bbox: GeoJSON.FeatureCollection;
  // map plugins ens

  game: Game;
  playersNames: string[] = [''];
  showPlayersNames = true;

  waypointMarker: mapboxgl.Marker;
  waypointMarkerDuplicate: mapboxgl.Marker;

  // map features
  directionArrow = false;
  swipe = false;

  clickDirection = 0;

  rotationControl: RotationControl;
  layerControl: LayerControl;
  panControl: PanControl;
  maskControl: MaskControl;

  // tasks
  task: Task;
  taskIndex = 0;

  positionSubscription: Subscription;
  lastKnownPosition: GeolocationPosition;

  // degree for nav-arrow
  heading = 0;
  compassHeading = 0;
  targetHeading = 0;
  targetDistance = 0;
  directionBearing = 0;
  indicatedDirection = 0;
  public lottieConfig: AnimationOptions;

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

  ngOnInit() {
    Plugins.Keyboard.addListener('keyboardDidHide', async () => {
      this.map.resize();
      await this.zoomBounds();
    });

    PlayingGamePage.showSuccess = false;
  }

  onMapLoad(map: mapboxgl.Map) {
    this.map = map;
    this.map.resize();

    this.rotationControl = new RotationControl(
      this.map,
      this.orientationService
    );
    this.layerControl = new LayerControl(
      this.map,
      this.mapWrapper,
      this.alertController,
      this.platform
    );
    this.panControl = new PanControl(this.map, this.geolocationService);
    this.maskControl = new MaskControl(this.map, this.geolocationService);

    this.feedbackControl.init(
      this.map,
      this.geolocationService,
      this.helperService,
      this.toastController,
      this.trackerService,
      this
    );

    this.game = null;
    this.game = new Game(0, 'Loading...', '', false, [], false, false);
    this.route.params.subscribe((params) => {
      this.gamesService.getGame(params.id).then((games) => {
        this.game = games.content;
        this.loaded = true;
      });
    });

    this.taskService.taskSubscription.subscribe(task => {
      if (task != null) {
        this.task = task;
        this.feedbackControl.setTask(this.task);
        this.initTask();
      }
    });
  }

  onSwipeMapLoad(map: mapboxgl.Map) {
    this.swipeMap = map;

    const compare = new MapboxCompare(
      this.map,
      this.swipeMap,
      this.mapWrapper.nativeElement
    );
    console.log(compare);

    if (this.swipeMap.loaded()) {
      const defaultMapSources = this.map.getStyle().sources;
      const { mapbox, satellite, ...sources } = defaultMapSources;
      delete sources['raster-tiles'];

      const layers = this.map.getStyle().layers.filter(l => l.id !== 'simple-tiles' && l.id !== 'building');

      Object.entries(sources).forEach(s => {
        if (this.swipeMap.getSource(s[0])) {
          // this.satMap.getSource(s[0]).setData(s[1]['data'])
        } else {
          this.swipeMap.addSource(s[0], s[1]);
        }
      });

      layers.forEach(l => {
        if (this.swipeMap.getLayer(l.id)) {
          if (l.id === 'viewDirection' || l.id === 'viewDirectionTask' || l.id === 'viewDirectionClick') {
            const bearing = this.map.getLayoutProperty(l.id, 'icon-rotate');
            this.swipeMap.setLayoutProperty(l.id, 'icon-rotate', bearing);
          }
        } else {
          this.swipeMap.addLayer(l);
        }
      });
    }
  }

  ionViewWillEnter() {
    this.geolocationService.init();
    this.orientationService.init();

    this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe(
      (position) => {
        this.trackerService.addWaypoint({});

        this.lastKnownPosition = position;

        if (this.task && !PlayingGamePage.showSuccess) {
          if (this.task.answer.type === AnswerType.POSITION) {
            if (this.task.answer.mode === TaskMode.NAV_ARROW) {
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

    // this.map.on('rotate', () => {
    //   if (this.map.getLayer('viewDirectionTask')) {
    //     this.map.setLayoutProperty(
    //       "viewDirectionTask",
    //       "icon-rotate",
    //       this.directionBearing - this.map.getBearing()
    //     );
    //   }

    //   if (this.map.getLayer('viewDirectionClick')) {
    //     this.map.setLayoutProperty(
    //       "viewDirectionClick",
    //       "icon-rotate",
    //       this.clickDirection - this.map.getBearing()
    //     );
    //   }
    // })

    // reset zoomtotaskmapmpoint if zoomend is a user event (and no animation event)
    // this.map.on('zoomend', ({ originalEvent }) => {
    //   if (originalEvent) {
    //     this.isZoomedToTaskMapPoint = false;
    //   }
    // });

    // rotation
    this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe(
      (heading: number) => {
        this.compassHeading = heading;
        this.targetHeading = 360 - (this.compassHeading - this.heading);
        this.indicatedDirection = this.compassHeading - this.directionBearing;
      }
    );

    if (Capacitor.isNative) {
      Plugins.CapacitorKeepScreenOn.enable();
    }
  }

  onMapClick(e: MapMouseEvent, mapType = 'standard') {
    console.log(e);
    const clickDirection = 0;

    // if (this.task.answer.type === AnswerType.MAP_POINT) {
    //   if (this.isZoomedToTaskMapPoint || this.task.mapFeatures.zoombar !== "task") {
    //     const pointFeature = this.helperService._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);

    //     if (this.map.getSource('marker-point')) {
    //       this.map.getSource('marker-point').setData(pointFeature)
    //     } else {
    //       this.map.addSource('marker-point', {
    //         'type': 'geojson',
    //         'data': pointFeature
    //       });
    //     }

    //     if (!this.map.getLayer('marker-point')) {
    //       this.map.addLayer({
    //         'id': 'marker-point',
    //         'type': 'symbol',
    //         'source': 'marker-point',
    //         'layout': {
    //           "icon-image": "marker-editor",
    //           "icon-size": 0.65,
    //           "icon-anchor": 'bottom'
    //         }
    //       });
    //     }
    //   } else {
    //     this.isZoomedToTaskMapPoint = true;
    //     this.map.flyTo({
    //       center: [e.lngLat.lng, e.lngLat.lat],
    //       zoom: 18,
    //       // padding: {
    //       //   top: 80,
    //       //   bottom: 620,
    //       //   left: 40,
    //       //   right: 40
    //       // },
    //       // duration: 1000
    //     })
    //   }

    // }

    // if (this.task.answer.type === AnswerType.MAP_DIRECTION) {
    //   if (this.isZoomedToTaskMapPoint || this.task.mapFeatures.zoombar !== "task") {
    //     if (this.task.question.direction?.position) {
    //       this.clickDirection = this.helperService.bearing(
    //         this.task.question.direction.position.geometry.coordinates[1],
    //         this.task.question.direction.position.geometry.coordinates[0],
    //         e.lngLat.lat,
    //         e.lngLat.lng
    //       )
    //     } else {
    //       this.clickDirection = this.helperService.bearing(
    //         this.lastKnownPosition.coords.latitude,
    //         this.lastKnownPosition.coords.longitude,
    //         e.lngLat.lat,
    //         e.lngLat.lng
    //       )
    //     }
    //     clickDirection = this.clickDirection;
    //     if (!this.map.getLayer('viewDirectionClick')) {
    //       if (this.task.question.direction?.position) {
    //         this.map.addSource("viewDirectionClick", {
    //           type: "geojson",
    //           data: {
    //             type: "Point",
    //             coordinates: this.task.question.direction.position.geometry.coordinates
    //           }
    //         });
    //       } else {
    //         this.map.addSource("viewDirectionClick", {
    //           type: "geojson",
    //           data: {
    //             type: "Point",
    //             coordinates: [this.lastKnownPosition.coords.longitude, this.lastKnownPosition.coords.latitude]
    //           }
    //         });
    //       }
    //       this.map.addLayer({
    //         id: "viewDirectionClick",
    //         source: "viewDirectionClick",
    //         type: "symbol",
    //         layout: {
    //           "icon-image": "view-direction-task",
    //           "icon-size": 0.65,
    //           "icon-offset": [0, -8]
    //         }
    //       });
    //       if (this.map.getLayer('viewDirectionClickGeolocate')) {
    //         this.map.removeLayer('viewDirectionClickGeolocate')
    //         this.map.removeSource('viewDirectionClickGeolocate')
    //       } else {
    //         this.geolocateControl.setType(GeolocateType.None)
    //       }
    //     }
    //     this.map.setLayoutProperty(
    //       "viewDirectionClick",
    //       "icon-rotate",
    //       this.clickDirection - this.map.getBearing()
    //     );
    //   } else {
    //     this.isZoomedToTaskMapPoint = true;
    //     const center =
    //       this.task.question.direction?.position ?
    //         this.task.question.direction.position.geometry.coordinates :
    //         [this.lastKnownPosition.coords.longitude, this.lastKnownPosition.coords.latitude]
    //     this.map.flyTo({
    //       center: center,
    //       zoom: 18,
    //       // padding: {
    //       //   top: 80,
    //       //   bottom: 620,
    //       //   left: 40,
    //       //   right: 40
    //       // },
    //       // duration: 1000
    //     })
    //   }
    // }

    this.trackerService.addEvent({
      type: 'ON_MAP_CLICKED',
      clickPosition: {
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng
      },
      clickDirection,
      map: mapType,
      answer: this.feedbackControl.getMapClickAnswer({
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
        textInput: this.textInput
      }, [e.lngLat.lng, e.lngLat.lat])
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
        bounds.extend(bbox(task.question.geometry) as LngLatBoundsLike);
      } catch (e) { }
    }

    if (task.question.area) {
      try {
        bounds.extend(bbox(task.question.area) as LngLatBoundsLike);
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
        bounds.extend(
          bbox(task.mapFeatures.landmarkFeatures) as LngLatBoundsLike
        );
      } catch (e) { }
    }

    if (
      this.task.answer.type === AnswerType.MAP_DIRECTION ||
      this.task.type === 'theme-loc'
    ) {
      const position = point([
        this.lastKnownPosition.coords.longitude,
        this.lastKnownPosition.coords.latitude,
      ]);
      if (this.game.bbox?.features?.length > 0) {
        const bbox = this.game.bbox?.features[0];
        if (booleanWithin(position, bbox)) {
          try {
            bounds.extend(position.bbox as LngLatBoundsLike);
          } catch (e) { }
        }
      }
    }

    return bounds;
  }

  zoomBounds() {
    let bounds = new mapboxgl.LngLatBounds();

    if (this.taskIndex !== 0 && this.task.mapFeatures.zoombar === 'true') {
      return;
    }

    if (
      this.task.mapFeatures.zoombar === 'task' &&
      this.task.answer.mode !== TaskMode.NAV_ARROW &&
      this.task.answer.mode !== TaskMode.DIRECTION_ARROW
    ) {
      // zoom to task
      bounds = this.calcBounds(this.task);

      // include position into bounds (only if position is in bbox bounds)
      if (
        this.task.mapFeatures.position === 'true' ||
        this.task.mapFeatures.direction === 'true'
      ) {
        const position = point([
          this.lastKnownPosition.coords.longitude,
          this.lastKnownPosition.coords.latitude,
        ]);
        const bbox = this.game.bbox.features[0];

        if (this.game.bbox?.features?.length > 0) {
          if (booleanWithin(position, bbox)) {
            bounds.extend(position.geometry.coordinates as LngLatBoundsLike);
          }
        } else {
          bounds.extend(position.geometry.coordinates as LngLatBoundsLike);
        }
      }

      // use default bounds when there are no bounds to identify in task
      if (bounds.isEmpty()) {
        this.game.tasks.forEach((task) => {
          bounds = bounds.extend(this.calcBounds(task));
        });
      }
    } else if (this.game.bbox?.features?.length > 0) {
      const bboxBuffer = bbox(buffer(this.game.bbox, 0.4));
      bounds = bounds.extend(bboxBuffer as LngLatBoundsLike);
    } else if (this.task.question.area?.features?.length > 0) {
      const searchAreaBuffer = bbox(buffer(this.task.question.area, 0.5));
      bounds = bounds.extend(searchAreaBuffer as LngLatBoundsLike);
    } else {
      this.game.tasks.forEach((task) => {
        bounds = bounds.extend(this.calcBounds(task));
      });
    }

    this.mapBounds = bounds;
  }

  zoomBbox() {
    if (this.game.bbox !== undefined && this.game.bbox?.features?.length > 0) {
      this.mapBounds = new LngLatBounds().extend(
        bbox(this.game.bbox) as LngLatBoundsLike
      );
      this.isZoomedToTaskMapPoint = false;
    }
  }

  async initGame() {
    // this.task = this.game.tasks[this.taskIndex];
    this.taskService.loadGame(this.game);
    // this.feedbackControl.setTask(this.task);
    await this.trackerService.init(
      this.game._id,
      this.game.name,
      this.map,
      this.playersNames
    );
    console.log(this.game);

    this.trackerService.addEvent({
      type: 'INIT_GAME',
    });
    await this.initTask();
    this.changeDetectorRef.detectChanges();

    if (this.game.bbox !== undefined && this.game.bbox?.features?.length > 0) {
      const bboxBuffer = bbox(buffer(this.game.bbox, 0.5));

      if (
        this.game.mapSectionVisible === true ||
        this.game.mapSectionVisible === undefined
      ) {
        console.log(this.game.bbox);
        this.bbox = this.game.bbox;
      }
    }
  }

  async initTask() {
    this.panelMinimized = false;

    console.log('Current task: ', this.task);

    this.trackerService.setTask(this.task);

    this.trackerService.addEvent({
      type: 'INIT_TASK',
    });

    if (this.task.settings?.accuracy) {
      PlayingGamePage.triggerTreshold = this.task.settings.accuracy;
    } else {
      PlayingGamePage.triggerTreshold = 10;
    }

    // if (this.map.getLayer('marker-point')) {
    //   this.map.removeLayer('marker-point')
    // }

    // if (this.map.getSource('marker-point')) {
    //   this.map.removeSource('marker-point')
    // }

    // if (this.map.getLayer('viewDirectionTask')) {
    //   this.map.removeLayer('viewDirectionTask');
    //   this.map.removeSource('viewDirectionTask');
    // }

    // if (this.map.getLayer('viewDirectionClick')) {
    //   this.map.removeLayer('viewDirectionClick');
    //   this.map.removeSource('viewDirectionClick');
    // }

    // if (this.map.getLayer('viewDirectionClickGeolocate')) {
    //   this.map.removeLayer('viewDirectionClickGeolocate')
    //   this.map.removeSource('viewDirectionClickGeolocate')
    // }

    this.photo = '';
    this.photoURL = '';
    this.clickDirection = 0;

    this.numberInput = undefined;
    this.textInput = undefined;

    this.isZoomedToTaskMapPoint = false;

    this.landmarks = {
      landmark: undefined,
      qtLandmark: undefined,
      searchArea: undefined,
    };

    try {
      await this.zoomBounds();
    } catch (e) {
      console.log(e);
    }

    this._initMapFeatures();

    if (this.task.question.area?.features?.length > 0) {
      this.task.question.text = this.task.question.text +=
        ' Suche im umrandeten Gebiet.';
      this.landmarks = {
        ...this.landmarks,
        searchArea: this.task.question.area,
      };
    }

    if (this.waypointMarker) {
      if (this.game.tasks[this.taskIndex - 1]?.settings?.keepMarker) {
        const el = document.createElement('div');
        el.className = 'waypoint-marker-disabled';

        new mapboxgl.Marker(el, {
          anchor: 'bottom',
          offset: [15, 0],
        })
          .setLngLat(
            this.game.tasks[this.taskIndex - 1].answer.position.geometry
              .coordinates
          )
          .addTo(this.map);

        const elDuplicate = document.createElement('div');
        elDuplicate.className = 'waypoint-marker-disabled';

        this.waypointMarkerDuplicate = new mapboxgl.Marker(elDuplicate, {
          anchor: 'bottom',
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

    if (this.task.answer.type === AnswerType.POSITION) {
      if (this.task.answer.position !== null && this.task.settings.showMarker) {
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
          offset: [15, 0],
        })
          .setLngLat(this.task.answer.position.geometry.coordinates)
          .addTo(this.map);

        // create a duplicate for the swipe map
        const elDuplicate = document.createElement('div');
        elDuplicate.className = 'waypoint-marker';

        this.waypointMarkerDuplicate = new mapboxgl.Marker(elDuplicate, {
          anchor: 'bottom',
          offset: [15, 0],
        }).setLngLat(this.task.answer.position.geometry.coordinates);

        this.layerControl.passMarkers({
          waypointMarker: this.waypointMarkerDuplicate,
        });
      }
    }

    if (this.task.question.type === QuestionType.MAP_DIRECTION) {
      this.directionBearing = this.task.question.direction.bearing || 0;
    }

    if (this.task.question.type === QuestionType.MAP_DIRECTION_MARKER) {
      this.directionBearing = this.task.question.direction.bearing || 0;

      this.map.addSource('viewDirectionTask', {
        type: 'geojson',
        data: this.task.question.direction.position.geometry,
      });
      this.map.addLayer({
        id: 'viewDirectionTask',
        source: 'viewDirectionTask',
        type: 'symbol',
        layout: {
          'icon-image': 'view-direction-task',
          'icon-size': 0.65,
          'icon-offset': [0, -8],
          'icon-rotate': this.directionBearing - this.map.getBearing(),
        },
      });
    }

    if (this.task.answer.type === AnswerType.MAP_DIRECTION) {
      if (this.task.question.direction?.position) {
        this.map.addSource('viewDirectionClickGeolocate', {
          type: 'geojson',
          data: this.task.question.direction.position.geometry,
        });
        this.map.addLayer({
          id: 'viewDirectionClickGeolocate',
          source: 'viewDirectionClickGeolocate',
          type: 'symbol',
          layout: {
            'icon-image': 'view-direction-click-geolocate',
            'icon-size': 0.4,
            'icon-offset': [0, 0],
          },
        });
      } else {
        this.geolocateVisible = true;
      }
    }

    if (
      (this.task.question.type === QuestionType.MAP_FEATURE ||
        this.task.question.type === QuestionType.MAP_FEATURE_FREE) &&
      this.task.answer.mode !== TaskMode.NO_FEATURE
    ) {
      this.landmarks = {
        ...this.landmarks,
        qtLandmark: this.task.question.geometry,
      };
    }


    this.changeDetectorRef.detectChanges();
  }

  nextTask() {
    // this.feedbackControl.dismissFeedback();
    this.taskIndex++;
    if (this.taskIndex > this.game.tasks.length - 1) {
      PlayingGamePage.showSuccess = true;
      this.trackerService.addEvent({
        type: 'FINISHED_GAME',
      });
      this.trackerService.uploadTrack().then((res) => {
        if (res.status === 201) {
          this.uploadDone = true;
        }
      });
      if (Capacitor.isNative) {
        Plugins.Haptics.vibrate();
        Plugins.CapacitorKeepScreenOn.disable();
      }

      return;
    }

    this.taskService.nextTask();
    // this.task = this.game.tasks[this.taskIndex];

  }

  async onMultipleChoicePhotoSelected(item, event) {
    this.selectedPhoto = item;
    this.isCorrectPhotoSelected = item.key === '0';

    Array.from(document.getElementsByClassName('multiple-choize-img')).forEach(
      (elem) => {
        elem.classList.remove('selected');
      }
    );
    event.target.classList.add('selected');

    this.trackerService.addEvent({
      type: 'PHOTO_SELECTED',
      answer: {
        photo: item.value,
        correct: this.isCorrectPhotoSelected,
      },
    });
  }

  onMultipleChoiceSelected(item, event) {
    this.selectedChoice = item;
    this.isCorrectChoiceSelected = item.key === '0';

    Array.from(document.getElementsByClassName('choice')).forEach((elem) => {
      elem.classList.remove('selected');
    });
    event.target.classList.add('selected');

    this.trackerService.addEvent({
      type: 'MULTIPLE_CHOICE_SELECTED',
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
      this.task.type === 'nav-flag' &&
      this.task.settings.confirmation &&
      this.task.mapFeatures.zoombar === 'task' &&
      !this.isZoomedToTaskMapPoint
    ) {
      this.isZoomedToTaskMapPoint = true;

      this.mapCenter = this.task.answer.position.geometry.coordinates;
      this.mapZoom = 18;

      this.showCorrectPositionModal = true;
      setTimeout(() => {
        this.showCorrectPositionModal = false;
      }, 3000);
      return;
    }

    if (
      this.task.type === 'theme-direction' &&
      this.task.answer.type === AnswerType.DIRECTION &&
      this.task.settings.confirmation &&
      this.task.mapFeatures.zoombar === 'task' &&
      !this.isZoomedToTaskMapPoint
    ) {
      this.isZoomedToTaskMapPoint = true;

      this.mapCenter = this.task.answer.position.geometry.coordinates;
      this.mapZoom = 18;

      this.showCorrectPositionModal = true;
      setTimeout(() => {
        this.showCorrectPositionModal = false;
      }, 3000);
      return;
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
    });

    if (this.task.category === 'info') {
      this.nextTask();
    }
  }

  userDidArrive(waypoint) {
    this.targetDistance = this.helperService.getDistanceFromLatLonInM(
      waypoint[1],
      waypoint[0],
      this.lastKnownPosition.coords.latitude,
      this.lastKnownPosition.coords.longitude
    );
    return this.targetDistance < PlayingGamePage.triggerTreshold;
  }

  ngOnDestroy() { }

  navigateHome() {
    this.positionSubscription.unsubscribe();
    this.geolocationService.clear();

    this.deviceOrientationSubscription.unsubscribe();

    this.trackerService.clear();

    this.rotationControl.remove();
    this.layerControl.remove();
    this.panControl.remove();
    this.maskControl.remove();

    this.feedbackControl.remove();

    this.orientationService.clear();

    // this.map.remove();
    this.navCtrl.navigateRoot('/');
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
      width: 500,
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);

    this.uploading = true;

    const blob = await fetch(image.webPath).then((r) => r.blob());
    const formData = new FormData();
    formData.append('file', blob);

    const options = {
      method: 'POST',
      body: formData,
    };

    const postResponse = await fetch(
      `${environment.apiURL}/file/upload`,
      options
    );

    if (!postResponse.ok) {
      throw Error('File upload failed');
    }
    this.uploading = false;

    const postResponseText = await postResponse.json();
    const filename = postResponseText.filename;
    this.photoURL = `${environment.apiURL}/file/image/${filename}`;
    this.changeDetectorRef.detectChanges();
  }

  // toggleRotate() {
  //   this.rotationControl.toggle();
  // }

  // toggleSat() {
  //   this.layerControl.toggleSat();
  // }

  // toggle3D() {
  //   this.layerControl.toggle3D();
  // }

  toggleDirection() {
    this.viewDirectionVisible = !this.viewDirectionVisible;
  }

  toggleGeolocate() {
    this.geolocateVisible = !this.geolocateVisible;
  }

  _initMapFeatures() {
    let mapFeatures = this.task.mapFeatures;
    if (mapFeatures === undefined) {
      mapFeatures = cloneDeep(standardMapFeatures);
    }
    for (const key in mapFeatures) {
      if (mapFeatures.hasOwnProperty(key)) {
        switch (key) {
          case 'zoombar':
            if (mapFeatures[key] === 'false') {
              this.mapZoomEnabled = false;
            } else {
              this.mapZoomEnabled = true;
            }
            break;
          case 'pan':
            if (mapFeatures[key] === 'true') {
              this.mapPanEnabled = true;
            } else {
              this.mapPanEnabled = false;
              // TODO: keep map centered position
            }
            break;
          // case 'rotation':
          //   if (mapFeatures[key] === 'manual') {
          //     this.rotationControl.setType(RotationType.Manual);
          //   } else if (mapFeatures[key] === 'auto') {
          //     this.rotationControl.setType(RotationType.Auto);
          //   } else if (mapFeatures[key] === 'button') {
          //     this.rotationControl.setType(RotationType.Button);
          //   } else if (mapFeatures[key] === 'north') {
          //     this.rotationControl.setType(RotationType.North);
          //   }
          //   break;
          case 'material':
            // this.swipe = false;
            // this.map.getContainer().parentElement.style.clip = 'unset';
            // if (this.map.getLayer('satellite')) {
            //   this.map.removeLayer('satellite');
            // }

            // const elem = document.getElementsByClassName('mapboxgl-compare');
            // while (elem.length > 0) elem[0].remove();

            if (mapFeatures[key] === 'standard') {
              // this.layerControl.setType(LayerType.Standard);
            } else if (mapFeatures[key] === 'selection') {
              this.layerControl.setType(LayerType.Selection);
            } else if (mapFeatures[key] === 'sat') {
              this.layerControl.setType(LayerType.Satellite);
            } else if (mapFeatures[key] === 'sat-button') {
              // TODO: implememt
              this.layerControl.setType(LayerType.SatelliteButton);
            } else if (mapFeatures[key] === 'sat-swipe') {
              this.swipe = true;
              this.changeDetectorRef.detectChanges();
              // this.layerControl.setType(LayerType.Swipe, this.swipeMap);
              // this.layerControl.swipeClickSubscription.subscribe(e => this.onMapClick(e, "swipe"))
            } else if (mapFeatures[key] === '3D') {
              this.layerControl.setType(LayerType.ThreeDimension);
            } else if (mapFeatures[key] === '3D-button') {
              this.layerControl.setType(LayerType.ThreeDimensionButton);
            }
            break;
          case 'position':
            if (mapFeatures[key] === 'none') {
              this.geolocateVisible = false;
            } else if (mapFeatures[key] === 'true') {
              if (this.task.mapFeatures.direction !== 'true') {
                // only show position marker when there is no direction marker
                this.geolocateVisible = true;
              }
            } else if (mapFeatures[key] === 'button') {
              // TODO: implement
            } else if (mapFeatures[key] === 'start') {
              this.geolocateVisible = true;
              setTimeout(() => {
                this.geolocateVisible = false;
              }, 10000);
            }
            break;
          case 'direction':
            this.directionArrow = false;
            if (mapFeatures[key] === 'none') {
              this.viewDirectionVisible = false;
            } else if (mapFeatures[key] === 'true') {
              this.viewDirectionVisible = true;
            } else if (mapFeatures[key] === 'button') {
              // TODO: implement
            } else if (mapFeatures[key] === 'start') {
              this.viewDirectionVisible = true;
              setTimeout(() => {
                this.viewDirectionVisible = false;
              }, 10000);
            }
            break;
          case 'track':
            if (mapFeatures[key]) {
              this.trackVisible = true;
            } else {
              this.trackVisible = false;
            }
            break;
          case 'streetSection':
            if (mapFeatures[key]) {
              this.streetSectionVisible = true;
            } else {
              this.streetSectionVisible = false;
            }
            break;
          case 'landmarks':
            if (mapFeatures[key]) {
              this.landmarks = {
                ...this.landmarks,
                landmark: mapFeatures.landmarkFeatures,
              };
            }
            break;
          case 'reducedInformation':
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

    this.changeDetectorRef.detectChanges();
  }

  addPlayer() {
    this.playersNames.push('');
  }

  removePlayer(index: number) {
    this.playersNames.splice(index, 1);
  }

  indexTracker(index: number, value: any) {
    return index;
  }

  async startGame() {
    console.log(this.playersNames);
    this.showPlayersNames = false;
    await this.initGame();
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
        if (key === null) {
          return;
        }
        return key.includes(m.tag);
      }).length > 0
    );
  }
}
