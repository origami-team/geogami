import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef
} from "@angular/core";
import { FormGroup } from "@angular/forms";

import mapboxgl from "mapbox-gl";

import { Field } from "../../dynamic-form/models/field";
import { FieldConfig } from "../../dynamic-form/models/field-config";
import { PopoverComponent } from "src/app/popover/popover.component";
import { PopoverController } from "@ionic/angular";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

// import MapboxDraw from '@mapbox/mapbox-gl-draw'

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent implements OnInit, Field, AfterViewInit {
  @ViewChild("map", { static: false }) mapContainer;
  @ViewChild("hiddenInput", { static: false }) hiddenInput;
  @ViewChild("marker", { static: false }) directionMarker;

  showDirectionMarker: boolean = false;

  marker: mapboxgl.Marker;
  map: mapboxgl.Map;
  draw: MapboxDraw;
  feature: any = "";

  config: FieldConfig;
  group: FormGroup;

  constructor(
    public popoverController: PopoverController,
    private changeDetectorRef: ChangeDetectorRef
  ) { }
  ngOnInit(): void { }

  ionViewDidEnter() { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  _onChange = (feature: GeoJSON.Feature<GeoJSON.Point>) => {
    if (feature != null) {
      if (!this.marker) {
        this.marker = new mapboxgl.Marker({
          draggable: true
        })
          .setLngLat(feature.geometry.coordinates)
          .addTo(this.map);

        this.marker.on("dragend", () => {
          const lngLat = this.marker._lngLat;
          const pointFeature = this._toGeoJSONPoint(lngLat.lng, lngLat.lat);
          this._onChange(pointFeature);
        });
      } else {
        this.marker.setLngLat(feature.geometry.coordinates);
      }
    }

    this.feature = feature;
    this.group.patchValue({ [this.config.name]: this.feature });
  };

  initMap() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA";

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: "mapbox://styles/mapbox/streets-v9",
      center: [8, 51.8],
      zoom: 2,
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

    this.map.on("click", e => {
      if (
        this.config.featureType != "direction" &&
        this.config.featureType != "polygon"
      ) {
        const pointFeature = this._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);
        this._onChange(pointFeature);
      }
    });

    this.map.on("move", e => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (this.config.featureType == "direction" && this.marker) {
        this.marker.setLngLat(this.map.getCenter());
      }
    });

    this.map.on("rotate", e => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (this.config.featureType == "direction") {
        let bearing = this.map.getBearing();

        while (bearing > 360) {
          bearing = bearing - 360;
        }
        while (bearing < 0) {
          bearing = bearing + 360;
        }

        console.log(bearing);

        this.group.patchValue({ [this.config.name]: bearing });
      }
    });

    this.map.on("load", () => {
      this.map.resize();
      geolocate.trigger();

      if (this.config.featureType == "direction") {
        this.showDirectionMarker = true;
        this.changeDetectorRef.detectChanges();

        this.marker = new mapboxgl.Marker(this.directionMarker.nativeElement, {
          offset: [0, -30]
        })
          .setLngLat(this.map.getCenter())
          .addTo(this.map);
      } else if (this.config.featureType == "polygon") {
        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        this.map.addControl(this.draw, "top-left");

        this.map.on("draw.create", e => {
          this.group.patchValue({ [this.config.name]: e.features });

          console.log(e.features);
        });
      }
    });
  }

  async showPopover(ev: any, text: string) {
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

  _toGeoJSONPoint = (lng, lat): GeoJSON.Feature<GeoJSON.Point> =>
    JSON.parse(`
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [${lng}, ${lat}]
    }
  }`);

  _centerPoint = () => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [this.map.getCenter().lng, this.map.getCenter().lat]
      }
    };
  };
}
