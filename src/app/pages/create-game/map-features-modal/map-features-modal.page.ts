import {
  Component,
  OnInit,
  ViewChild,
  OnChanges,
  ChangeDetectorRef,
  AfterViewInit,
  Input
} from "@angular/core";
import { ModalController } from "@ionic/angular";

import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import { environment } from "src/environments/environment";

import { Plugins } from '@capacitor/core'

import { cloneDeep } from 'lodash';
import { standardMapFeatures } from "./../../../models/mapFeatures"

@Component({
  selector: "app-map-features-modal",
  templateUrl: "./map-features-modal.page.html",
  styleUrls: ["./map-features-modal.page.scss"]
})
export class MapFeaturesModalPage implements OnInit, AfterViewInit {
  @ViewChild("map") mapContainer;

  private draw: MapboxDraw;
  private map: mapboxgl.Map;

  @Input() features: any = cloneDeep(standardMapFeatures);

  constructor(
    public modalController: ModalController,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.features == undefined) {
      this.features = cloneDeep(standardMapFeatures);
    }
    this.changeDetectorRef.detectChanges();
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

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        polygon: true,
        trash: true
      }
    });
    this.map.addControl(this.draw, "top-left");

    this.map.on('load', () => {
      this.map.resize();

      Plugins.Geolocation.getCurrentPosition().then(position => {
        this.map.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 13,
          speed: 3
        })

        this.map.loadImage(
          "/assets/icons/position.png",
          (error, image) => {
            if (error) throw error;

            this.map.addImage("geolocate", image);

            this.map.addSource("geolocate", {
              type: "geojson",
              data: {
                type: "Point",
                coordinates: [position.coords.longitude, position.coords.latitude]
              }
            });
            this.map.addLayer({
              id: "geolocate",
              source: "geolocate",
              type: "symbol",
              layout: {
                "icon-image": "geolocate",
                "icon-size": 0.4,
                "icon-offset": [0, 0]
              }
            });
          });
      })

      if (this.features.landmarkFeatures != undefined) {
        console.log('adding feature', this.features.landmarkFeatures)
        if (this.features.landmarkFeatures.type == "FeatureCollection") {
          this.features.landmarkFeatures.features.forEach(element => {
            this.draw.add({ properties: {}, ...element })
          });
        }
      }
    })
  }

  ngAfterViewInit() {
    this.map.resize()
  }

  dismissModal(dismissType: string = "null") {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }

    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true,
      data: {
        ...this.features,
        landmarkFeatures: this.draw.getAll()
      }
    });
  }
}
