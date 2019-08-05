import { Component, OnInit } from '@angular/core';

import mapboxgl from 'mapbox-gl';

import { Geolocation } from '@ionic-native/geolocation/ngx';



@Component({
  selector: 'app-create-game-map',
  templateUrl: './create-game-map.page.html',
  styleUrls: ['./create-game-map.page.scss'],
})
export class CreateGameMapPage implements OnInit {

  constructor(private geolocation: Geolocation) { }

  ngOnInit() {

  }



  ionViewWillEnter() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';

    const map = new mapboxgl.Map({
      container: 'create-game-map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [8, 51.8],
      zoom: 2
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    })

    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude

      console.log(resp)
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
      console.log(data)
    });

    // Add geolocate control to the map.
    map.addControl(geolocate);

    geolocate.trigger();

    let newMarker = null;

    map.on('click', function (e) {
      console.log(e)
      console.log(map)
      if (newMarker == null) {
        newMarker = new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map)
      } else {
        newMarker.setLngLat(e.lngLat)
      }
    });

  }

}
