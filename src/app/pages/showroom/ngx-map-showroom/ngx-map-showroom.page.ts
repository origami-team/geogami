import { Component, OnInit, Directive, Input, ViewChild } from '@angular/core';
import { MapImageData } from 'ngx-mapbox-gl';
import { AnyLayout } from 'mapbox-gl';

import mapboxgl from 'mapbox-gl';
import ngxmapboxgl from 'ngx-mapbox-gl';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import MapboxCompare from 'mapbox-gl-compare';

import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';

import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { OsmService } from './../../../services/osm.service';

import osmtogeojson from 'osmtogeojson';

import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';

@Component({
  selector: 'ngx-app-map-showroom',
  templateUrl: './ngx-map-showroom.page.html',
  styleUrls: ['./ngx-map-showroom.page.scss'],
})
export class NGXMapShowroomPage {

  enabledFeatures: string[] = ['pan', 'manualRotate'];

  map: mapboxgl.Map;
  swipeMap1: mapboxgl.Map;
  swipeMap2: mapboxgl.Map;

  swipe = false; //satellite map initially off
  @ViewChild('mapWrapper') mapWrapper;
  compare: any;
  mapCenter: number[] = [8, 51.8];
  mapZoom = 2;
  mapZoomEnabled = false;
  mapPanEnabled = true;
  mapBearing: number[] = [0];
  // map layer plugins
  viewDirectionVisible = false;
  geolocateVisible = false;
  trackVisible = false;
  streetSectionVisible = false;
  // @ViewChild('map') mapContainer;
  @ViewChild('swipeMap') swipeMapContainer;
  @ViewChild('panel') panel;
  @ViewChild('feedback') feedbackControl;
  
  zoomControl: mapboxgl.NavigationControl = new mapboxgl.NavigationControl();
  geolocateControl: mapboxgl.GeolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  });
  layerId = 'basic';
  style: string;
  styleSwitcherControl: MapboxStyleSwitcherControl = new MapboxStyleSwitcherControl();
  drawControl: MapboxDraw = new MapboxDraw();

  _rotateTo: EventListener;
  _orientTo: EventListener;
  _viewDirection: EventListener;

  directionSubscribe: any;

  currentLocation: [number, number];
  currentCompassData: DeviceOrientationCompassHeading;

  path: any;
  /**
    constructor(private OSMService: OsmService, private deviceOrientation: DeviceOrientation) {
    }
  
    ionViewWillEnter() {  
      this.swipeMap = new mapboxgl.Map({
        container: 'swipingContainer',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [0, 0],
        zoom: 0
        });
    }
    */
//set initial style
    ngOnInit() {
      this.changeStyle(this.layerId);
    }

  //ensures that the map has full size
  onMapLoad(map: mapboxgl.Map) {
    this.map = map;
    this.map.resize();
  }

  onSwipeMap1Load(map: mapboxgl.Map) {
    this.swipeMap1 = map;
    this.swipeMap1.resize();
  }

  onSwipeMap2Load(map: mapboxgl.Map) {
    this.swipeMap2 = map;
    this.swipeMap2.resize();
  }

  toggleZoomBar() {
    if (this.enabledFeatures.includes('zoomBar')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'zoomBar');
      //this.map.removeControl(this.zoomControl);
      this.mapZoomEnabled = false;
    } else {
      this.enabledFeatures.push('zoomBar');
      this.mapZoomEnabled = true;
      //this.map.addControl(this.zoomControl);
    }
  }

  toggleSwipe() {
    if (this.enabledFeatures.includes('swipe')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'swipe');
      this.swipe = false;
      this.compare.remove();
      this.map.setStyle('mapbox://styles/mapbox/streets-v9');
      //TODO: was tut das?
      const elem = document.getElementsByClassName('swiping');
      while (elem.length > 0)
        elem[0].remove();

    } else {
      this.mapZoom = this.map.getZoom();
      this.enabledFeatures.push('swipe');
      //this.swipe=true;     
      /**
      this.swipeMap1 = new mapboxgl.Map({
        container: 'swipingContainer1',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [8, 51.8],
        zoom:this.mapZoom 
      });
      this.swipeMap2 = new mapboxgl.Map({
        container: 'swipingContainer2',
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [8, 51.8],
        zoom:this.mapZoom
      });
*/
      this.compare = new MapboxCompare(
        this.swipeMap1,
        this.swipeMap2,
        this.mapWrapper.nativeElement
      );
      this.map.setStyle('mapbox://styles/mapbox/satellite-v9');
      console.log(this.compare);
    }
  }

  togglePan() {
    if (this.enabledFeatures.includes('pan')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'pan');
      //this.map.dragPan.disable();
      this.mapPanEnabled=false;
    } else {
      this.enabledFeatures.push('pan');
      //this.map.dragPan.enable();
      this.mapPanEnabled=true;
    }
  }

  toggleManualRotate() {
    if (this.enabledFeatures.includes('manualRotate')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'manualRotate');
      this.map.touchZoomRotate.disableRotation();

    } else {
      this.enabledFeatures.push('manualRotate');
      this.map.touchZoomRotate.enableRotation();
    }
  }

  toggleAutoRotate() {


    if (this.enabledFeatures.includes('autoRotate')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'autoRotate');
      window.removeEventListener('deviceorientation', this._rotateTo);
      this.map.rotateTo(0);
    } else {
      this.enabledFeatures.push('autoRotate');
      window.addEventListener('compassneedscalibration', function (event) {
        alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
        event.preventDefault();
      }, true);

      window.addEventListener('deviceorientation', this._rotateTo, false);
    }
  }

  togglePosition() {
    if (this.enabledFeatures.includes('position')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'position');
      //this.map.removeControl(this.geolocateControl);
      this.geolocateVisible = false;

    } else {
      this.enabledFeatures.push('position');
      //this.map.addControl(this.geolocateControl);
      //setTimeout(() => this.geolocateControl.trigger(), 100);
      this.geolocateVisible = true;
    }
  }

  toggleStyleSwitcher() {
    if (this.enabledFeatures.includes('styleSwitcher')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'styleSwitcher');
      //this.map.removeControl(this.styleSwitcherControl);

      document.querySelectorAll('.mapboxgl-ctrl .mapboxgl-style-switcher').forEach(element => {
        element.parentElement.remove();
      });

    } else {
      this.enabledFeatures.push('styleSwitcher');
     // this.map.addControl(this.styleSwitcherControl);
    }
  }


  changeStyle(layerId: string) {
    this.style = `mapbox://styles/mapbox/${layerId}-v9`;
  }

  toggleStreetSection() {
    if (this.enabledFeatures.includes('streetSection')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'streetSection');
    } else {
      /** 
      this.enabledFeatures.push('streetSection');
      this.togglePosition();

      this.geolocateControl.on('geolocate', data => {
        const lat = Math.round(data.coords.latitude * 1000000) / 1000000;
        const lng = Math.round(data.coords.longitude * 1000000) / 1000000;

        this.OSMService.getStreetCoordinates(lat, lng).then(data => {
          const geometries = osmtogeojson(data);

          if (this.map.getSource('section') == undefined) {
            this.map.addSource('section', { type: 'geojson', data: geometries });
            this.map.addLayer({
              id: 'section',
              type: 'line',
              source: 'section',
              paint: {
                'line-color': 'red',
                'line-opacity': 0.5,
                'line-width': 10
              },
              layout: {
                'line-cap': 'round'
              }
            });
          } else {
            this.map.getSource('section').setData(geometries);
          }
        });
      });
      */
    }
  }

  toggleViewDirection() {
    if (this.enabledFeatures.includes('viewDirection')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'viewDirection');

      this.viewDirectionVisible = false;


    } else {
      this.enabledFeatures.push('viewDirection');
      if (!this.enabledFeatures.includes('position')) this.togglePosition();

      window.addEventListener('compassneedscalibration', function (event) {
        alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
        event.preventDefault();
      }, true);

      window.addEventListener('deviceorientationabsolute', this._viewDirection, false);

      this.geolocateControl.on('geolocate', data => {
        const lat = Math.round(data.coords.latitude * 1000000) / 1000000;
        const lng = Math.round(data.coords.longitude * 1000000) / 1000000;

        this.currentLocation = [lng, lat];
      });


    }
  }

  toggleTrack() {
    if (this.enabledFeatures.includes('track')) {
      this.togglePosition();
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'track').filter(e => e != 'position');

      this.map.removeLayer('track');
      this.map.removeSource('track');
    } else {
      if (!this.enabledFeatures.includes('position')) this.togglePosition();
      this.enabledFeatures.push('track');

      this.geolocateControl.on('geolocate', data => {
        const lat = Math.round(data.coords.latitude * 1000000) / 1000000;
        const lng = Math.round(data.coords.longitude * 1000000) / 1000000;

        this.path.geometry.coordinates.push([lng, lat]);


        if (this.map.getSource('track') == undefined) {
          this.map.addSource('track', { type: 'geojson', data: this.path });
          this.map.addLayer({
            id: 'track',
            type: 'line',
            source: 'track',
            paint: {
              'line-color': 'cyan',
              'line-opacity': 0.5,
              'line-width': 5
            },
            layout: {
              'line-cap': 'round'
            }
          });
        } else {
          this.map.getSource('track').setData(this.path);
        }
      });


    }
  }

  toggle3D() {
    if (this.enabledFeatures.includes('3D')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != '3D');

      window.removeEventListener('deviceorientation', this._orientTo);
      this.map.setPitch(0);
      this.map.rotateTo(0);

      this.map.removeLayer('3d-buildings');

    } else {
      this.enabledFeatures.push('3D');

      window.addEventListener('compassneedscalibration', function (event) {
        alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
        event.preventDefault();
      }, true);

      window.addEventListener('deviceorientation', this._orientTo, false);

      // Add 3D buildungs
      // Insert the layer beneath any symbol layer.
      let layers = this.map.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      this.map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': .6
        }
      }, labelLayerId);

    }
  }

  toggleOffline() {
    if (this.enabledFeatures.includes('offline')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'offline');
    } else {
      this.enabledFeatures.push('offline');

      this.map.addLayer({
        id: 'mapillary',
        type: 'line',
        source: {
          type: 'vector',
          tiles: ['https://d25uarhxywzl1j.cloudfront.net/v0.1/14/8539/5412.mvt'],
          minzoom: 6,
          maxzoom: 14
        },
        'source-layer': 'mapillary-sequences',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-opacity': 0.6,
          'line-color': 'rgb(53, 175, 109)this.mapZoom',
          'line-width': 2
        }
      }, 'waterway-label');
    }
  }

  toggleDraw() {
    if (this.enabledFeatures.includes('draw')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'draw');
      this.map.removeControl(this.drawControl);
    } else {
      this.enabledFeatures.push('draw');
      this.map.addControl(this.drawControl, 'top-left');
    }
  }

}
