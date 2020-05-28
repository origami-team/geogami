import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";

import { PopoverController } from "@ionic/angular";

import { NavController } from "@ionic/angular";

import { Game } from "../../../models/game";
import { Storage } from '@ionic/storage';


import { GameFactoryService } from "../../../services/game-factory.service";

import { PopoverComponent } from "../../../popover/popover.component";
import { GamesService } from "src/app/services/games.service";

import { AnimationOptions } from 'ngx-lottie';

import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import { environment } from 'src/environments/environment';
import { calcBounds } from './../../../helpers/bounds'


@Component({
  selector: "app-create-game-overview",
  templateUrl: "./create-game-overview.page.html",
  styleUrls: ["./create-game-overview.page.scss"]
})
export class CreateGameOverviewPage implements AfterViewInit {
  @ViewChild("boundingMap") mapContainer;

  public model;
  public lottieConfig: AnimationOptions;
  showSuccess: boolean = false;
  showUpload: boolean = false;
  map: mapboxgl.Map;
  draw: MapboxDraw


  constructor(
    public popoverController: PopoverController,
    public navCtrl: NavController,
    public gameFactory: GameFactoryService,
    public gamesService: GamesService,
  ) {
    this.lottieConfig = {
      path: "assets/lottie/astronaut.json",
      renderer: "canvas",
      autoplay: true,
      loop: true
    };
  }
  ngAfterViewInit(): void {
    this.gameFactory.getGame().then(game => { this.model = game }).finally(() => {
      mapboxgl.accessToken = environment.mapboxAccessToken;

      this.map = new mapboxgl.Map({
        container: this.mapContainer.nativeElement,
        style: {
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
        },
        center: [8, 51.8],
        zoom: 2
      });

      this.map.on('load', () => {
        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        this.map.addControl(this.draw, "top-left");

        if (this.model.bbox != undefined) {
          if (this.model.bbox.type == "FeatureCollection") {
            this.model.bbox.features.forEach(element => {
              element.properties = {
                ...element.properties
              }
              this.draw.add(element)
            });
          }
        }

        let bounds = new mapboxgl.LngLatBounds();

        this.model.tasks.forEach(task => {
          bounds = bounds.extend(calcBounds(task))
        });

        this.map.resize()

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
      });
    })
  }

  async showTrackingInfo(ev: any, text: string) {
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

  uploadGame() {
    this.gameFactory.addGameInformation({
      ...this.model,
      bbox: this.draw.getAll()
    });
    console.log(this.gameFactory.game);

    this.showUpload = true;
    this.gamesService
      .postGame(this.gameFactory.game)
      .then(res => {
        if (res.status == 200) {
          this.showSuccess = true;
          this.gameFactory.flushGame();
        }
      })
      .catch(e => console.error(e));
  }

  navigateHome() {
    this.navCtrl.navigateRoot("/");
  }
}
