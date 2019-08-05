import { Component, OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl';
import MapboxCompare from 'mapbox-gl-compare';

import 'mapbox-gl-compare/dist/mapbox-gl-compare.css'


@Component({
  selector: 'app-map-swipe',
  templateUrl: './map-swipe.page.html',
  styleUrls: ['./map-swipe.page.scss'],
})
export class MapSwipePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';


    const map = new mapboxgl.Map({
      container: 'swipe-map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [8, 51.8],
      zoom: 2
    });

    const satMap = new mapboxgl.Map({
      container: 'sat-map',
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [8, 51.8],
      zoom: 2
    });


    new MapboxCompare(map, satMap);

    console.log('page did load')
  }

}
