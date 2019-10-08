import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';

import mapboxgl from 'mapbox-gl';

// import MapboxDraw from '@mapbox/mapbox-gl-draw'
// import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  @Input() featureType: string = ''

  @Input() index: number = 0

  @ViewChild('map') mapElement;

  marker: any;

  constructor() { }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';

    const map = new mapboxgl.Map({
      container: this.mapElement.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [8, 51.8],
      zoom: 2
    });

    switch (this.featureType) {

      case 'point':
        map.on('click', e => {
          console.log(e)
          if (!this.marker) {
            this.marker = new mapboxgl.Marker({
              draggable: true,
            }).setLngLat(e.lngLat).addTo(map)
          } else {
            this.marker.setLngLat(e.lngLat)
          }
        });
        return;

      case 'route':
        // const Draw = new MapboxDraw();

        // Map#addControl takes an optional second argument to set the position of the control.
        // If no position is specified the control defaults to `top-right`. See the docs 
        // for more details: https://www.mapbox.com/mapbox-gl-js/api/map#addcontrol

        // map.addControl(Draw, 'top-left');

        return;
    }
  }

}
