import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { PopoverController } from '@ionic/angular';

import { NavController } from '@ionic/angular';

import { Game } from '../../../models/game';
import { Storage } from '@ionic/storage';


import { GameFactoryService } from '../../../services/game-factory.service';

import { PopoverComponent } from '../../../popover/popover.component';
import { GamesService } from 'src/app/services/games.service';

import { AnimationOptions } from 'ngx-lottie';

import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { environment } from 'src/environments/environment';
import { calcBounds } from './../../../helpers/bounds';
import { AnswerType, QuestionType } from 'src/app/models/types';
import { LandmarkControl } from 'src/app/mapControllers/landmark-control';
import { featureCollection } from '@turf/helpers';
// VR world
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// For getting user role
import { AuthService } from '../../../services/auth-service.service';
import { UtilService } from 'src/app/services/util.service';


@Component({
  selector: 'app-create-game-overview',
  templateUrl: './create-game-overview.page.html',
  styleUrls: ['./create-game-overview.page.scss']
})
export class CreateGameOverviewPage implements AfterViewInit {
  @ViewChild('boundingMap') mapContainer;

  public game: Game;
  public lottieConfig: AnimationOptions;
  showSuccess = false;
  showUpload = false;
  showNameError = false;
  map: mapboxgl.Map;
  draw: MapboxDraw;

  mapSection = false;
  mapSectionVisible = true;
  geofence = false;
  landmarkControl: LandmarkControl;

  // VR world
  isVirtualWorld: boolean = false;
  isVRMirrored: boolean = false;
  virEnvType: string; // new to store vir env type

  // curated filter
  isCuratedGame = false;
  // to set curated gmaes only by admins (geogami team)
  userRole: String = "";

  // Multiplayer mode 
  isSingleMode: boolean = false; // used to show number of players card in multiplayer mode
  numPlayers: Number = 1;

  errorMsg: String;

  constructor(
    public popoverController: PopoverController,
    public navCtrl: NavController,
    public gameFactory: GameFactoryService,
    public gamesService: GamesService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private authService: AuthService,
    private utilService: UtilService
  ) {
    this.lottieConfig = {
      path: 'assets/lottie/astronaut.json',
      renderer: 'svg',
      autoplay: true,
      loop: true
    };
  }

  ngOnInit() {
    // VR world
    // to add game attribute that distinguish VR games from real ones
    this.route.params.subscribe((params) => {
      this.isVirtualWorld = JSON.parse(params.bundle).isVRWorld;
      this.isVRMirrored = JSON.parse(params.bundle).isVRMirrored;
      this.virEnvType = JSON.parse(params.bundle).virEnvType;
      //this.isRealWorld = JSON.parse(params.bundle).isRealWorld;
      this.isSingleMode = JSON.parse(params.bundle).isSingleMode;
      this.numPlayers = JSON.parse(params.bundle).numPlayers;
    });

    // Get user role
    if (this.authService.getUserValue()) {
      this.userRole = this.authService.getUserRole();
    }
  }

  ngAfterViewInit(): void {
    this.gameFactory.getGame().then(game => { this.game = game; }).finally(() => {
      if (this.mapSection) {
        this.initMap();
      }
    });
  }

  initMap() {
    mapboxgl.accessToken = environment.mapboxAccessToken;

    // Set bounds of VR world 
    var bounds = [
      [0.0002307207207 - 0.003, 0.0003628597122 - 0.003], // Southwest coordinates
      [0.003717027207 + 0.003, 0.004459082914 + 0.003] // Northeast coordinates
    ];

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: (this.isVirtualWorld ?
        (this.isVRMirrored ? environment.mapStyle + 'virtualEnv_2.json' : environment.mapStyle + 'virtualEnv_1.json') :
        environment.mapStyle + 'realWorld.json'),
      center: (this.isVirtualWorld ? [0.00001785714286 / 2, 0.002936936937 / 2] : [8, 51.8]),
      zoom: 2,
      maxBounds: (this.isVirtualWorld ? bounds : null) // Sets bounds
    });

    this.map.on('load', () => {
      // disable map rotation in VR world
      if (this.isVirtualWorld) {
        // disable map rotation using right click + drag
        this.map.dragRotate.disable();
        // disable map rotation using touch rotation gesture
        this.map.touchZoomRotate.disableRotation();
      }

      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        styles: [// ACTIVE (being drawn)
          // line stroke
          {
            id: 'gl-draw-line',
            type: 'line',
            filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
              'line-dasharray': [3, 2],
              'line-width': 5
            }
          },
          // polygon fill
          {
            id: 'gl-draw-polygon-fill',
            type: 'fill',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: {
              'fill-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
              'fill-outline-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
              'fill-opacity': 0.5
            }
          },
          // polygon outline stroke
          // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
          {
            id: 'gl-draw-polygon-stroke-active',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
              'line-dasharray': [3, 2],
              'line-width': 5
            }
          },
          // vertex point halos
          {
            id: 'gl-draw-polygon-and-line-vertex-halo-active',
            type: 'circle',
            filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            paint: {
              'circle-radius': 5,
              'circle-color': '#FFF'
            }
          },
          // vertex points
          {
            id: 'gl-draw-polygon-and-line-vertex-active',
            type: 'circle',
            filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            paint: {
              'circle-radius': 3,
              'circle-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
            }
          },

          // INACTIVE (static, already drawn)
          // line stroke
          {
            id: 'gl-draw-line-static',
            type: 'line',
            filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': '#000',
              'line-width': 3
            }
          },
          // polygon fill
          {
            id: 'gl-draw-polygon-fill-static',
            type: 'fill',
            filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
            paint: {
              'fill-color': '#000',
              'fill-outline-color': '#000',
              'fill-opacity': 0.5
            }
          },
          // polygon outline
          {
            id: 'gl-draw-polygon-stroke-static',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': '#000',
              'line-width': 3
            }
          }
        ]
      });

      this.map.addControl(this.draw, 'top-left');

      if (this.game.bbox != undefined) {
        if (this.game.bbox.type == 'FeatureCollection') {
          this.game.bbox.features.forEach(element => {
            element.properties = {
              ...element.properties
            };
            this.draw.add(element);
          });
        }
      }

      let bounds = new mapboxgl.LngLatBounds();

      this.game.tasks.forEach(task => {
        bounds = bounds.extend(calcBounds(task));
      });

      this.map.resize();

      if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds, {
          padding: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
          }, duration: 1000,
          maxZoom: 16
        });
      }

      this.map.loadImage(
        '/assets/icons/directionv2-richtung.png',
        (error, image) => {
          if (error) throw error;

          this.map.addImage('view-direction-task', image);
        });

      this.landmarkControl = new LandmarkControl(this.map);

      let qtlandmarks = featureCollection([]);
      let searchareas = featureCollection([]);
      let landmarks = featureCollection([]);

      for (const [i, task] of this.game.tasks.entries()) {
        if (task.answer.type == AnswerType.POSITION && task.answer.position?.geometry?.coordinates) {
          const el = document.createElement('div');
          el.className = 'waypoint-marker';

          new mapboxgl.Marker(el, {
            anchor: 'bottom',
            offset: [15, 0]
          }).setLngLat(task.answer.position.geometry.coordinates)
            .addTo(this.map);
        }

        if (task.question.type == QuestionType.MAP_FEATURE || task.question.type == QuestionType.MAP_FEATURE_FREE || task.question.type == QuestionType.MAP_FEATURE_PHOTO) {
          qtlandmarks = featureCollection([...qtlandmarks.features, ...task.question.geometry.features]);
        }

        if (task.question.area?.features?.length > 0) {
          searchareas = featureCollection([...searchareas.features, ...task.question.area.features]);
        }

        if (task.mapFeatures.landmarks) {
          landmarks = featureCollection([...landmarks.features, ...task.mapFeatures.landmarkFeatures.features]);
        }

        if (task.question.type == QuestionType.MAP_DIRECTION_MARKER || task.question.type == QuestionType.MAP_DIRECTION) {
          const directionBearing = task.question.direction.bearing || 0;

          this.map.addSource(`viewDirectionTask${i}`, {
            type: 'geojson',
            data: task.question.direction.position.geometry
          });
          this.map.addLayer({
            id: `viewDirectionTask${i}`,
            source: `viewDirectionTask${i}`,
            type: 'symbol',
            layout: {
              'icon-image': 'view-direction-task',
              'icon-size': 0.65,
              'icon-offset': [0, -8],
              'icon-rotate': directionBearing - this.map.getBearing()
            }
          });
        }
      }
      this.landmarkControl.setQTLandmark(qtlandmarks);
      this.landmarkControl.setSearchArea(searchareas);
      this.landmarkControl.setLandmark(landmarks);

    });
  }

  mapSectionToggleChange(event) {
    if (this.mapSection) {
      this.changeDetectorRef.detectChanges();

      this.initMap();
    } else {
      this.geofence = false;
    }
  }

  mapSectionVisibleChange(visible: boolean) {
    if (this.mapSectionVisible != visible) {
      this.draw.deleteAll();
      this.mapSectionVisible = visible;
    }
  }

  async showTrackingInfo(ev: any, text: string) {
    // console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

  uploadGame() {
    // if device is not connected to internet, show notification
    if (!this.utilService.getIsOnlineValue()) {
      // show no connection notification
      this.utilService.showAlertNoConnection();
      return;
    }
  
    // Remove extra spaces from game name
    this.game.name = this.game.name.trim();

    // Remove extra spaces from game name
    this.game.name = this.game.name.trim();

    if (this.game.name == "") {
      this.errorMsg = this.translate.instant("SaveGame.enterValidGameName")
      this.showNameError = true;
      return;
    }

    // console.log("///Game to be uploaded: ", this.game);
    this.gameFactory.addGameInformation({
      ...this.game,
      bbox: this.mapSection ? this.draw.getAll() : null,
      mapSectionVisible: this.mapSectionVisible,
      geofence: this.geofence,
      place: this.game.place,
      isVRWorld: this.isVirtualWorld,
      isVRMirrored: (this.isVirtualWorld ? this.isVRMirrored : undefined),      /* to hide it with real world games */
      virEnvType: this.virEnvType,      /* to store vir env name */
      isVisible: true,                    // new game is visible by default
      isCuratedGame: this.isCuratedGame,  // to set whether game can be viewed in curated filter list
      isMultiplayerGame: (!this.isSingleMode ? true : undefined),
      numPlayers: (!this.isSingleMode ? this.numPlayers : undefined)
      // playersCount: (!this.isSingleMode ? this.numPlayers : 1)     // ToDo: update it in server

    });
    // console.log(this.gameFactory.game);

    this.showUpload = true;
    this.gamesService
      .postGame(this.gameFactory.game)
      .then(res => {
        if (res.status == 201) {
          this.showSuccess = true;
          this.gameFactory.flushGame();
        }
      })
      .catch(e => {
        console.error(e);
        this.showUpload = false;
        this.errorMsg = this.translate.instant("SaveGame.gameNameExist");
        this.showNameError = true;
      });
  }

  navigateHome() {
    this.navCtrl.navigateRoot('/');
  }

  async showPopover(ev: any, key: string) {
    let text = this.translate.instant(key);

    // console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }
}
