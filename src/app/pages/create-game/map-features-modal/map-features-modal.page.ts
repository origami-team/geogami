import {
  Component,
  OnInit,
  ViewChild,
  OnChanges,
  ChangeDetectorRef
} from "@angular/core";
import { ModalController } from "@ionic/angular";

import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import { environment } from "src/environments/environment";

@Component({
  selector: "app-map-features-modal",
  templateUrl: "./map-features-modal.page.html",
  styleUrls: ["./map-features-modal.page.scss"]
})
export class MapFeaturesModalPage implements OnInit {
  @ViewChild("map", { static: false }) mapContainer;

  private draw: MapboxDraw;
  private map: mapboxgl.Map;

  features: any = {
    zoombar: "true",
    pan: "true",
    rotation: "manual",
    material: "standard",
    position: "none",
    direction: "none",
    track: false,
    streetSection: false,
    reducedInformation: false,
    landmarks: false,
    landmarkFeatures: undefined
  };

  constructor(
    public modalController: ModalController,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
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

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      fitBoundsOptions: {
        minZoom: 20
      },
      trackUserLocation: true
    });
    this.map.addControl(geolocate);

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
      geolocate.trigger();
    })
  }

  ionViewDidEnter() {
    this.map.resize();
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
