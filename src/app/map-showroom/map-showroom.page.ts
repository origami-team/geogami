import { Component, OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl';
import MapboxCompare from 'mapbox-gl-compare';

import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";

import 'mapbox-gl-compare/dist/mapbox-gl-compare.css'
import 'mapbox-gl-style-switcher/styles.css'

import { OsmService } from './../services/osm.service'

import osmtogeojson from 'osmtogeojson';

import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';

@Component({
  selector: 'app-map-showroom',
  templateUrl: './map-showroom.page.html',
  styleUrls: ['./map-showroom.page.scss'],
})
export class MapShowroomPage implements OnInit {

  map: any;

  enabledFeatures: string[] = ['pan', 'manualRotate']

  zoomControl: mapboxgl.NavigationControl = new mapboxgl.NavigationControl()
  geolocateControl: mapboxgl.GeolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  })
  styleSwitcherControl: MapboxStyleSwitcherControl = new MapboxStyleSwitcherControl();

  _rotateTo: EventListener;
  _orientTo: EventListener;
  _viewDirection: EventListener;

  directionSubscribe: any;

  currentLocation: [number, number];
  currentCompassData: DeviceOrientationCompassHeading;

  path: any;

  constructor(private OSMService: OsmService, private deviceOrientation: DeviceOrientation) {

    console.log("creating orientation subscribe...")
    this.directionSubscribe = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => this.currentCompassData = data
    );
    console.log("...done")


    this._rotateTo = (e: DeviceOrientationEvent) => {
      this.map.rotateTo(this.currentCompassData.magneticHeading, { duration: 50 })
    }

    this._orientTo = (e: DeviceOrientationEvent) => {
      if (e.beta <= 60 && e.beta >= 0) {
        this.map.setPitch(e.beta)
      }
      this.map.rotateTo(this.currentCompassData.magneticHeading, { duration: 50 })
    }

    this._viewDirection = (e: DeviceOrientationEvent) => {
      // this.map.rotateTo(e.alpha, { duration: 10 })
      console.log(this.currentCompassData)

      if (this.map.getSource('viewDirection') == undefined) {
        // this.map.addImage('view-direction', 'assets/icons/direction.png')

        this.map.loadImage('/assets/icons/direction.png', (error, image) => {
          if (error) throw error;
          this.map.addImage('view-direction', image);


          this.map.addSource('viewDirection', {
            "type": "geojson",
            "data": {
              "type": "Point",
              "coordinates": this.currentLocation
            }
          });

          this.map.addLayer({
            "id": "viewDirection",
            "source": "viewDirection",
            "type": "symbol",
            "layout": {
              "icon-image": "view-direction",
              "icon-size": 1,
              "icon-offset": [0, -25]
            }
          });
          this.map.setLayoutProperty('viewDirection', "icon-rotate", this.currentCompassData.magneticHeading)
          // this.map.setLayoutProperty('viewDirection', "icon-rotate", e.alpha)
        });
      } else {
        this.map.getSource('viewDirection').setData({
          "type": "Point",
          "coordinates": this.currentLocation
        })
        this.map.setLayoutProperty('viewDirection', "icon-rotate", this.currentCompassData.magneticHeading)
      }


    }

    this.path = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": [

        ]
      }
    }
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';


    this.map = new mapboxgl.Map({
      container: 'primary-map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [8, 51.8],
      zoom: 2
    });

  }

  toggleZoomBar() {
    if (this.enabledFeatures.includes('zoomBar')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'zoomBar')
      this.map.removeControl(this.zoomControl)
    } else {
      this.enabledFeatures.push('zoomBar')
      this.map.addControl(this.zoomControl);
    }
  }

  toggleSwipe() {
    if (this.enabledFeatures.includes('swipe')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'swipe')
      const elem = document.getElementsByClassName('mapboxgl-compare')
      while (elem.length > 0)
        elem[0].remove();

    } else {
      this.enabledFeatures.push('swipe')

      setTimeout(() => {
        const satMap = new mapboxgl.Map({
          container: 'secondary-map',
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [8, 51.8],
          zoom: 2
        });

        new MapboxCompare(this.map, satMap);

      }, 100)

    }
  }

  togglePan() {
    if (this.enabledFeatures.includes('pan')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'pan')
      this.map.dragPan.disable()

    } else {
      this.enabledFeatures.push('pan')
      this.map.dragPan.enable()
    }
  }

  toggleManualRotate() {
    if (this.enabledFeatures.includes('manualRotate')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'manualRotate')
      this.map.touchZoomRotate.disableRotation()

    } else {
      this.enabledFeatures.push('manualRotate')
      this.map.touchZoomRotate.enableRotation()
    }
  }

  toggleAutoRotate() {


    if (this.enabledFeatures.includes('autoRotate')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'autoRotate')
      window.removeEventListener('deviceorientation', this._rotateTo)
      this.map.rotateTo(0)
    } else {
      this.enabledFeatures.push('autoRotate')
      window.addEventListener("compassneedscalibration", function (event) {
        alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
        event.preventDefault();
      }, true);

      window.addEventListener("deviceorientation", this._rotateTo, false);
    }
  }

  togglePosition() {
    if (this.enabledFeatures.includes('position')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'position')
      this.map.removeControl(this.geolocateControl)

    } else {
      this.enabledFeatures.push('position')
      this.map.addControl(this.geolocateControl)
      setTimeout(() => this.geolocateControl.trigger(), 100)

    }
  }

  toggleStyleSwitcher() {
    if (this.enabledFeatures.includes('styleSwitcher')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'styleSwitcher')
      this.map.removeControl(this.styleSwitcherControl)

      document.querySelectorAll('.mapboxgl-ctrl .mapboxgl-style-switcher').forEach(element => {
        element.parentElement.remove()
      });

    } else {
      this.enabledFeatures.push('styleSwitcher')
      this.map.addControl(this.styleSwitcherControl)
    }
  }

  toggleStreetSection() {
    if (this.enabledFeatures.includes('streetSection')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'streetSection')
    } else {
      this.enabledFeatures.push('streetSection')
      this.togglePosition()

      this.geolocateControl.on('geolocate', data => {
        const lat = Math.round(data.coords.latitude * 1000000) / 1000000
        const lng = Math.round(data.coords.longitude * 1000000) / 1000000

        this.OSMService.getStreetCoordinates(lat, lng).then(data => {
          const geometries = osmtogeojson(data)

          if (this.map.getSource('section') == undefined) {
            this.map.addSource('section', { type: 'geojson', data: geometries });
            this.map.addLayer({
              "id": "section",
              "type": "line",
              "source": "section",
              "paint": {
                "line-color": "red",
                "line-opacity": 0.5,
                "line-width": 10
              },
              "layout": {
                "line-cap": "round"
              }
            });
          } else {
            this.map.getSource('section').setData(geometries);
          }
        })
      })
    }
  }

  toggleViewDirection() {
    if (this.enabledFeatures.includes('viewDirection')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'viewDirection')



    } else {
      this.enabledFeatures.push('viewDirection')
      if (!this.enabledFeatures.includes('position')) this.togglePosition()

      window.addEventListener("compassneedscalibration", function (event) {
        alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
        event.preventDefault();
      }, true);

      window.addEventListener("deviceorientationabsolute", this._viewDirection, false);

      this.geolocateControl.on('geolocate', data => {
        const lat = Math.round(data.coords.latitude * 1000000) / 1000000
        const lng = Math.round(data.coords.longitude * 1000000) / 1000000

        this.currentLocation = [lng, lat]
      })


    }
  }

  toggleTrack() {
    if (this.enabledFeatures.includes('track')) {
      this.togglePosition()
      this.enabledFeatures = this.enabledFeatures.filter(e => e != 'track').filter(e => e != 'position')

      this.map.removeLayer('track')
      this.map.removeSource('track')
    } else {
      if (!this.enabledFeatures.includes('position')) this.togglePosition()
      this.enabledFeatures.push('track')

      this.geolocateControl.on('geolocate', data => {
        const lat = Math.round(data.coords.latitude * 1000000) / 1000000
        const lng = Math.round(data.coords.longitude * 1000000) / 1000000

        this.path.geometry.coordinates.push([lng, lat])


        if (this.map.getSource('track') == undefined) {
          this.map.addSource('track', { type: 'geojson', data: this.path });
          this.map.addLayer({
            "id": "track",
            "type": "line",
            "source": "track",
            "paint": {
              "line-color": "cyan",
              "line-opacity": 0.5,
              "line-width": 5
            },
            "layout": {
              "line-cap": "round"
            }
          });
        } else {
          this.map.getSource('track').setData(this.path);
        }
      })


    }
  }

  toggle3D() {
    if (this.enabledFeatures.includes('3D')) {
      this.enabledFeatures = this.enabledFeatures.filter(e => e != '3D')

      window.removeEventListener('deviceorientation', this._orientTo)
      this.map.setPitch(0)
      this.map.rotateTo(0)

      this.map.removeLayer('3d-buildings')

    } else {
      this.enabledFeatures.push('3D')

      window.addEventListener("compassneedscalibration", function (event) {
        alert('Your compass needs calibrating! Wave your device in a figure-eight motion');
        event.preventDefault();
      }, true);

      window.addEventListener("deviceorientation", this._orientTo, false);

      // Add 3D buildungs 
      // Insert the layer beneath any symbol layer.
      var layers = this.map.getStyle().layers;

      var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      this.map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          'fill-extrusion-height': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "height"]
          ],
          'fill-extrusion-base': [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            15.05, ["get", "min_height"]
          ],
          'fill-extrusion-opacity': .6
        }
      }, labelLayerId);

    }
  }
}
