import { Component, OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map-scale',
  templateUrl: './map-scale.page.html',
  styleUrls: ['./map-scale.page.scss'],
})
export class MapScalePage implements OnInit {

  map: mapboxgl.Map;

  constructor() { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';


    this.map = new mapboxgl.Map({
      container: 'scale-map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [8, 51.8],
      zoom: 2
    });

    console.log('page did load')
  }

  onRangeChange(e) {
    console.log(e.detail.value)
    console.log(this.map)
    this.map.zoomTo(e.detail.value.lower);
  }

}
