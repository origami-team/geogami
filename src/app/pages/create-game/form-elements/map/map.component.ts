import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { Plugins } from "@capacitor/core";

import mapboxgl from "mapbox-gl";

import MapboxDraw from "@mapbox/mapbox-gl-draw";

import bbox from '@turf/bbox'

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("map") mapContainer;
  @ViewChild("hiddenInput") hiddenInput;
  @ViewChild("marker") directionMarker;

  @Input() feature: any;

  @Output() featureChange: EventEmitter<any> = new EventEmitter<any>(true);

  @Input() featureType: string;

  showDirectionMarker: boolean = false;

  marker: mapboxgl.Marker;
  map: mapboxgl.Map;
  draw: MapboxDraw;


  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnDestroy(): void {
    this.map.remove();
  }
  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.feature.currentValue == undefined && changes.feature.previousValue != undefined) {
      this.featureChange.emit(changes.feature.previousValue)
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  // _onChange = (feature: GeoJSON.Feature<GeoJSON.Point>) => {
  _onChange = (feature: any) => {
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
          this.featureChange.emit(pointFeature)
          this._onChange(pointFeature);
        });
      } else {
        this.marker.setLngLat(feature.geometry.coordinates);
      }
    }
  };

  initMap() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA";

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
      zoom: 2,
    });

    this.map.on("click", e => {
      if (this.featureType == 'point') {
        this.feature = this._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);
        this.featureChange.emit(this.feature);
        this._onChange(this.feature);
      }
    });

    this.map.on("load", () => {
      this.map.resize();

      if (this.feature) {
        if (this.featureType == 'direction' && this.feature.position) {
          this.map.flyTo({
            center: this.feature.position.geometry.coordinates,
            zoom: 13,
            bearing: this.featureType == "direction" ? (this.feature && this.feature.bearing) ? this.feature.bearing : 0 : 0,
            speed: 3
          })
        }
        if (this.featureType == 'point' && this.feature.geometry) {
          this.map.flyTo({
            center: this.feature.geometry.coordinates,
            zoom: 13,
            bearing: 0,
            speed: 3
          })
        }
        if ((this.featureType == 'geometry' || this.featureType == 'geometry-free') && this.feature.features) {
          this.map.fitBounds(bbox(this.feature), {
            padding: 20,
            speed: 3
          })
          // this.map.flyTo({
          //   center: this.feature.geometry.coordinates,
          //   zoom: 13,
          //   bearing: 0,
          //   speed: 3
          // })
        }
      }

      Plugins.Geolocation.getCurrentPosition().then(position => {
        if (!this.feature) {
          this.map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 13,
            bearing: this.featureType == "direction" ? (this.feature && this.feature.bearing) ? this.feature.bearing : 0 : 0,
            speed: 3
          })
        }

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



      if (this.feature != undefined && this.featureType == 'point') {
        this._onChange(this.feature)
      }

      if (this.featureType == "geometry") {
        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          }
        });

        this.map.addControl(this.draw, "top-left");

        this.map.on("draw.create", e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on("draw.delete", e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on("draw.update", e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        if (this.feature != undefined) {
          if (this.feature.type == "FeatureCollection") {
            this.feature.features.forEach(element => {
              element.properties = {
                ...element.properties
              }
              this.draw.add(element)
            });
          }
        }
      }

      if (this.featureType == "geometry-free") {
        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            line_string: true,
            point: true,
            trash: true
          }
        });

        this.map.addControl(this.draw, "top-left");

        this.map.on("draw.create", e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on("draw.delete", e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on("draw.update", e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        if (this.feature != undefined) {
          if (this.feature.type == "FeatureCollection") {
            this.feature.features.forEach(element => {
              element.properties = {
                ...element.properties
              }
              this.draw.add(element)
            });
          }
        }
      }

      this.map.on("move", e => {
        if (e.cancelable) {
          e.preventDefault();
        }
        if (this.featureType == "direction" && this.marker) {
          this.marker.setLngLat(this.map.getCenter());

          let bearing = this.map.getBearing();

          while (bearing > 360) {
            bearing = bearing - 360;
          }
          while (bearing < 0) {
            bearing = bearing + 360;
          }

          this.featureChange.emit({ bearing: bearing, position: this._toGeoJSONPoint(this.map.getCenter().lng, this.map.getCenter().lat) });
        }
      });

      if (this.featureType == "direction") {
        this.showDirectionMarker = true;
        this.changeDetectorRef.detectChanges();

        this.marker = new mapboxgl.Marker(this.directionMarker.nativeElement, {
          offset: [0, -30]
        })
          .setLngLat(this.map.getCenter())
          .addTo(this.map);
      }
    });

    this.map.on("rotate", e => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (this.featureType == "direction") {
        let bearing = this.map.getBearing();

        while (bearing > 360) {
          bearing = bearing - 360;
        }
        while (bearing < 0) {
          bearing = bearing + 360;
        }

        this.featureChange.emit({ bearing: bearing, position: this._toGeoJSONPoint(this.map.getCenter().lng, this.map.getCenter().lat) });
      }
    });
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
