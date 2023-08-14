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
} from '@angular/core';
import { Plugins } from '@capacitor/core';

import mapboxgl from 'mapbox-gl';

import MapboxDraw from '@mapbox/mapbox-gl-draw';

import bbox from '@turf/bbox';

import { searchArea } from './drawThemes';
import { HelperService } from 'src/app/services/helper.service';
import { SatControl } from './SatControl/SatControl';
import { environment } from 'src/environments/environment';
import { virEnvLayers } from 'src/app/models/virEnvsLayers';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('map') mapContainer;
  @ViewChild('hiddenInput') hiddenInput;
  // @ViewChild("marker") directionMarker;

  @Input() feature: any;

  @Output() featureChange: EventEmitter<any> = new EventEmitter<any>(true);

  @Input() featureType: string;

  @Input() markerType: string;

  @Input() drawTheme: string;

  // VR world
  @Input() isVirtualWorld: boolean;
  @Input() isVRMirrored: boolean;
  @Input() virEnvType: string;

  showDirectionMarker = false;
  directionMarkerPosition: any;

  marker: mapboxgl.Marker;
  map: mapboxgl.Map;
  draw: MapboxDraw;

  // Multi-player Mode
  // DoDo check the error you are getting @Input() allPlayersFeatures
  // @Input() allPlayersFeatures: []; // to be able to view flages of all players in each map view
  @Input() isSingleMode: boolean; // to use it in `ngOnChanges`


  constructor(private changeDetectorRef: ChangeDetectorRef, public helperService: HelperService) { }

  ngOnDestroy(): void {
    this.map.remove();
  }
  ngOnInit(): void {
    // console.log('// isSingleMode (map comp): ', this.isSingleMode)
  }

  // Compare the input feature value before and after change task type
  // to keep flags on map 
  ngOnChanges(changes: SimpleChanges): void {
  console.log("ngOnChanges (mapComponent): ", changes);
    // if (this.isSingleMode) {
    if (changes.answer) {     //* we need to add it "if condtionns" to specify what to change
      if (changes.feature.currentValue == undefined && changes.feature.previousValue != undefined) {
        // console.log("ngOnChanges (mapComponent) - if changes.answer");
        this.featureChange.emit(changes.feature.previousValue);
      }
    } else if (changes.virEnvType && changes.virEnvType.currentValue != undefined && changes.virEnvType.previousValue != undefined) {            //* when virEnvType is changed
    console.log("changes (changes.virEnvType): ", changes.virEnvType.currentValue);
      this.virEnvType = changes.virEnvType.currentValue

      let newStyle = this.map.getStyle();
      //* update layer image
      newStyle.sources.overlay.url = "assets/vir_envs_layers/" + this.virEnvType + ".png";
      //* update layer dimensions
      newStyle.sources.overlay.coordinates = virEnvLayers[this.virEnvType].overlayCoords;
      //* apply new style on map 
      this.map.setStyle(newStyle);
      //* update map max bounds
      this.map.setMaxBounds(virEnvLayers[this.virEnvType].bounds);
    }

    /*}
     else {
      // Multi-player Mode
      if (changes.feature.currentValue == undefined && changes.feature.previousValue != undefined) {
        this.featureChange.emit(changes.feature.previousValue);
      }
    } */

  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  resetViewDirectionMarker() {
    this.directionMarkerPosition = undefined;
    this.map.removeLayer('viewDirectionClick');
    this.map.removeSource('viewDirectionClick');
    this.showDirectionMarker = false;
    this.featureChange.emit({ bearing: 0, position: undefined });
  }

  // _onChange = (feature: GeoJSON.Feature<GeoJSON.Point>) => {
  _onChange = (feature: any) => {
    if (feature != null) {
      if (!this.marker) {
        const el = document.createElement('div');
        if (this.markerType != 'circle') {
          el.className = 'waypoint-marker';
        } else {
          el.className = 'circle-marker';
        }

        this.marker = new mapboxgl.Marker(el, {
          anchor: 'bottom',
          offset: this.markerType == 'circle' ? [0, 15] : [15, 0],
          draggable: true
        })
          .setLngLat(feature.geometry.coordinates)
          .addTo(this.map);

        this.marker.on('dragend', () => {
          const lngLat = this.marker._lngLat;
          const pointFeature = this._toGeoJSONPoint(lngLat.lng, lngLat.lat);
          this.featureChange.emit(pointFeature);
          this._onChange(pointFeature);
        });
      } else {
        this.marker.setLngLat(feature.geometry.coordinates);
      }
    }
  }

  initMap() {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';

    // Set bounds of VR world 
    var bounds = [
      [0.0002307207207 - 0.002, 0.0003628597122 - 0.002], // Southwest coordinates
      [0.003717027207 + 0.002, 0.004459082914 + 0.002] // Northeast coordinates
    ];

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      /* style: (this.isVirtualWorld ?
        (this.isVRMirrored ? environment.mapStyle + 'virtualEnv_2.json' : environment.mapStyle + 'virtualEnv_1.json') :
        environment.mapStyle + 'realWorld.json'), */
      style: (this.isVirtualWorld ? environment.mapStyle + this.virEnvType + ".json" : environment.mapStyle + 'realWorld.json'),
      center: (this.isVirtualWorld ? [0.005810510811 / 2, 0.006827038669 / 2] : [8, 51.8]),
      zoom: (this.isVirtualWorld ? 15.5 : 2),
      // maxBounds: (this.isVirtualWorld ? bounds : null) // Sets bounds as max
      maxBounds: (this.isVirtualWorld ? virEnvLayers[this.virEnvType].bounds : null) // Sets bounds
    });

    /* Show satelitte control only with real world */
    if (!this.isVirtualWorld) {
      this.map.addControl(new SatControl());
    }

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('click', e => {

      // temp
      // console.log("allPlayersFeatures", this.allPlayersFeatures)

      if (this.featureType == 'point') {
        this.feature = this._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);
        this.featureChange.emit(this.feature);
        this._onChange(this.feature);

        // Temporary show loc of selected flag
      console.log("Flag ( lng: ", e.lngLat.lng, "lat: ", e.lngLat.lat, " )");
      }

      if (this.featureType == 'direction') {
        /* To add view direction marker only once */
        if (!this.showDirectionMarker) {
          this.directionMarkerPosition = this._toGeoJSONPoint(e.lngLat.lng, e.lngLat.lat);
          this.map.addSource('viewDirectionClick', {
            type: 'geojson',
            data: this.directionMarkerPosition
          });
          this.map.addLayer({
            id: 'viewDirectionClick',
            source: 'viewDirectionClick',
            type: 'symbol',
            layout: {
              'icon-image': 'view-direction-task',
              'icon-size': 0.65,
              'icon-offset': [0, -8],
              'icon-allow-overlap': true
            }
          });
          this.showDirectionMarker = true;

          this.featureChange.emit({ bearing: 0, position: this.directionMarkerPosition });
        } else {
          let clickDirection = this.helperService.bearing(
            this.directionMarkerPosition.geometry.coordinates[1],
            this.directionMarkerPosition.geometry.coordinates[0],
            e.lngLat.lat,
            e.lngLat.lng
          );
          this.map.setLayoutProperty(
            'viewDirectionClick',
            'icon-rotate',
            clickDirection - this.map.getBearing()
          );
          while (clickDirection > 360) {
            clickDirection = clickDirection - 360;
          }
          while (clickDirection < 0) {
            clickDirection = clickDirection + 360;
          }
          this.featureChange.emit({ bearing: clickDirection, position: this.directionMarkerPosition });

        }
      }
    });

    this.map.on('load', () => {
      this.map.resize();

      // disable map rotation using right click + drag
      this.map.dragRotate.disable();

      // disable map rotation using touch rotation gesture
      this.map.touchZoomRotate.disableRotation();

      this.map.loadImage(
        '/assets/icons/directionv2-richtung-settings.png',
        (error, image) => {
          if (error) throw error;

          this.map.addImage('view-direction-task', image);



          if (this.feature) {
            if (this.featureType == 'direction' && this.feature.position) {
              this.map.flyTo({
                center: this.feature.position.geometry.coordinates,
                zoom: 13,
                speed: 3
              });

              this.map.addSource('viewDirectionClick', {
                type: 'geojson',
                data: this.feature.position
              });
              this.map.addLayer({
                id: 'viewDirectionClick',
                source: 'viewDirectionClick',
                type: 'symbol',
                layout: {
                  'icon-image': 'view-direction-task',
                  'icon-size': 0.65,
                  'icon-offset': [0, -8],
                  'icon-rotate': this.feature.bearing,
                  'icon-allow-overlap': true
                }
              });

              this.directionMarkerPosition = this.feature.position;
              this.showDirectionMarker = true;
            }
            if (this.featureType == 'point' && this.feature.geometry) {
              this.map.flyTo({
                center: this.feature.geometry.coordinates,
                zoom: 13,
                bearing: 0,
                speed: 3
              });
            }
            if ((this.featureType == 'geometry' || this.featureType == 'geometry-free') && this.feature.features) {
              if (this.feature.features.length > 0) {
                this.map.fitBounds(bbox(this.feature), {
                  padding: 20,
                  speed: 3
                });
              }
              // this.map.flyTo({
              //   center: this.feature.geometry.coordinates,
              //   zoom: 13,
              //   bearing: 0,
              //   speed: 3
              // })
            }
          }

        });

      // disable zoom to current position in VR world
      if (!this.isVirtualWorld) {
        Plugins.Geolocation.getCurrentPosition().then(position => {
          if (!this.feature) {
            this.map.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 13,
              bearing: this.featureType == 'direction' ? (this.feature && this.feature.bearing) ? this.feature.bearing : 0 : 0,
              speed: 3
            });
          }

          this.map.loadImage(
            '/assets/icons/position.png',
            (error, image) => {
              if (error) throw error;

              this.map.addImage('geolocate', image);

              this.map.addSource('geolocate', {
                type: 'geojson',
                data: {
                  type: 'Point',
                  coordinates: [position.coords.longitude, position.coords.latitude]
                }
              });
              this.map.addLayer({
                id: 'geolocate',
                source: 'geolocate',
                type: 'symbol',
                layout: {
                  'icon-image': 'geolocate',
                  'icon-size': 0.4,
                  'icon-offset': [0, 0]
                }
              });
            });
        });
      }



      if (this.feature != undefined && this.featureType == 'point') {
        this._onChange(this.feature);
      }

      if (this.featureType == 'geometry') {


        if (!this.drawTheme) {
          this.draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              polygon: true,
              trash: true
            }
          });
        }
        if (this.drawTheme == 'searchArea') {
          this.draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              polygon: true,
              trash: true
            },
            styles: searchArea
          });
        }

        this.map.addControl(this.draw, 'top-left');

        this.map.on('draw.create', e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on('draw.delete', e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on('draw.update', e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        if (this.feature != undefined) {
          if (this.feature.type == 'FeatureCollection') {
            this.feature.features.forEach(element => {
              element.properties = {
                ...element.properties
              };
              this.draw.add(element);
            });
          }
        }
      }

      if (this.featureType == 'geometry-free') {
        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            line_string: true,
            point: true,
            trash: true
          }
        });

        this.map.addControl(this.draw, 'top-left');

        this.map.on('draw.create', e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on('draw.delete', e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        this.map.on('draw.update', e => {
          this.feature = this.draw.getAll();
          this.featureChange.emit(this.draw.getAll());
        });

        if (this.feature != undefined) {
          if (this.feature.type == 'FeatureCollection') {
            this.feature.features.forEach(element => {
              element.properties = {
                ...element.properties
              };
              this.draw.add(element);
            });
          }
        }
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
  }`)

  _centerPoint = () => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.map.getCenter().lng, this.map.getCenter().lat]
      }
    };
  }
}
