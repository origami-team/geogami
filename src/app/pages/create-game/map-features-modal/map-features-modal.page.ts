import {
  Component,
  OnInit,
  ViewChild,
  OnChanges,
  ChangeDetectorRef,
  AfterViewInit,
  Input
} from '@angular/core';
import { ModalController } from '@ionic/angular';

import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { environment } from 'src/environments/environment';

import { Plugins } from '@capacitor/core';

import { cloneDeep } from 'lodash';
import { standardMapFeatures } from '../../../models/standardMapFeatures';

@Component({
  selector: 'app-map-features-modal',
  templateUrl: './map-features-modal.page.html',
  styleUrls: ['./map-features-modal.page.scss']
})
export class MapFeaturesModalPage implements OnInit, AfterViewInit {
  @ViewChild('map') mapContainer;

  private draw: MapboxDraw;
  private map: mapboxgl.Map;

  @Input() features: any = cloneDeep(standardMapFeatures);

  // VR world
  @Input() isVirtualWorld: boolean;
  @Input() isVRMirrored: boolean;

  constructor(
    public modalController: ModalController,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.features == undefined) {
      this.features = cloneDeep(standardMapFeatures);

      if (this.isVirtualWorld) {
        this.features.rotation = "north"
      }
    }

    this.onZoomChange();

    this.changeDetectorRef.detectChanges();
    mapboxgl.accessToken = environment.mapboxAccessToken;

    ////////Temp
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
          'url': (this.isVRMirrored ? environment.VR_Version_B: environment.VR_Version_A), // V4
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
    // For world  style end

    let realWorldMapStyle = {
      version: 8,
      metadata: {
        'mapbox:autocomposite': true,
        'mapbox:type': 'template'
      },
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: [
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
        },
        mapbox: {
          url: 'mapbox://mapbox.mapbox-streets-v7',
          type: 'vector'
        }
      },
      layers: [
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22
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
          interactive: true
        },
      ]
    };

    // Set bounds of VR world 
    var bounds = [
      [0.0002307207207 - 0.007, 0.0003628597122 - 0.007], // Southwest coordinates
      [0.003717027207 + 0.007, 0.004459082914 + 0.007] // Northeast coordinates
    ];
    ///

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: (this.isVirtualWorld ? virtualWorldMapStyle : realWorldMapStyle),
      center: (this.isVirtualWorld ? [0.005810510811 / 2, 0.006827038669 / 2] : [8, 51.8]),
      zoom: (this.isVirtualWorld ? 16.5 : 2),
      maxBounds: (this.isVirtualWorld ? bounds : null) // Sets bounds as max
    });

    const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-danger');

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true
      },
      styles: [
        {
          id: 'gl-draw-polygon-fill-inactive',
          type: 'fill',
          filter: ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          paint: {
            'fill-color': dangerColor,
            'fill-outline-color': dangerColor,
            'fill-opacity': 0.1
          }
        },
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': dangerColor,
            'fill-outline-color': dangerColor,
            'fill-opacity': 0.1
          }
        },
        {
          id: 'gl-draw-polygon-midpoint',
          type: 'circle',
          filter: ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'midpoint']],
          paint: {
            'circle-radius': 3,
            'circle-color': dangerColor
          }
        },
        {
          id: 'gl-draw-polygon-stroke-inactive',
          type: 'line',
          filter: ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': dangerColor,
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': dangerColor,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-line-inactive',
          type: 'line',
          filter: ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'LineString'],
            ['!=', 'mode', 'static']
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': dangerColor,
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-line-active',
          type: 'line',
          filter: ['all',
            ['==', '$type', 'LineString'],
            ['==', 'active', 'true']
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': dangerColor,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
          type: 'circle',
          filter: ['all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
          paint: {
            'circle-radius': 5,
            'circle-color': '#fff'
          }
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-inactive',
          type: 'circle',
          filter: ['all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
          paint: {
            'circle-radius': 3,
            'circle-color': dangerColor
          }
        },
        {
          id: 'gl-draw-point-inactive',
          type: 'symbol',
          filter: ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['!=', 'mode', 'static']
          ],
          layout: {
            'icon-image': 'landmark-marker',
            'icon-size': 1,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true
          }
        },
        {
          id: 'gl-draw-point-active',
          type: 'symbol',
          filter: ['all',
            ['==', '$type', 'Point'],
            ['!=', 'meta', 'midpoint'],
            ['==', 'active', 'true']],
          layout: {
            'icon-image': 'landmark-marker',
            'icon-size': 1.1,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true
          }
        },
        {
          id: 'gl-draw-polygon-fill-static',
          type: 'fill',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': dangerColor,
            'fill-outline-color': dangerColor,
            'fill-opacity': 0.1
          }
        },
        {
          id: 'gl-draw-polygon-stroke-static',
          type: 'line',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': dangerColor,
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-line-static',
          type: 'line',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': dangerColor,
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-point-static',
          type: 'symbol',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
          layout: {
            'icon-image': 'landmark-marker',
            'icon-size': 1,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true
          }
        }
      ]
    });
    this.map.addControl(this.draw, 'top-left');

    this.map.on('load', () => {
      this.map.resize();

      this.map.loadImage(
        '/assets/icons/landmark-marker.png',
        (error, image) => {
          if (error) throw error;

          this.map.addImage('landmark-marker', image);
        });

      Plugins.Geolocation.getCurrentPosition().then(position => {
        this.map.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 13,
          speed: 3
        });

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

      if (this.features.landmarkFeatures != undefined) {
        console.log('adding feature', this.features.landmarkFeatures);
        if (this.features.landmarkFeatures.type == 'FeatureCollection') {
          this.features.landmarkFeatures.features.forEach(element => {
            this.draw.add({ properties: {}, ...element });
          });
        }
      }
    });
  }

  ngAfterViewInit() {
    this.map.resize();
  }

  onZoomChange() {
    if (this.features.pan == 'center' && (this.features.zoombar == 'task' || this.features.zoombar == 'game')) {
      this.features.pan = 'true';
    }
  }

  dismissModal(dismissType: string = 'null') {
    if (dismissType == 'close') {
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
