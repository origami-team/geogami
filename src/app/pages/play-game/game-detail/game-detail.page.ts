import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';


import mapboxgl from 'mapbox-gl';

import { GamesService } from '../../../services/games.service'


@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
})
export class GameDetailPage implements OnInit {

  game: any;
  activities: any[]
  points: any[]

  constructor(public navCtrl: NavController, private route: ActivatedRoute, private gamesService: GamesService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gamesService.getGame(params.id)
        .then(games => {
          this.game = games[0]
        })
        .finally(() => {
          console.log(this.game)
          // this.activities = this.game.activities
          // this.points = this.activities[0].points
          this.initMap()
        })
    });

  }

  initMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';

    const map = new mapboxgl.Map({
      container: 'detailmap',
      style: 'mapbox://styles/mapbox/streets-v9',
    });

    // const activity = this.game.activities[0];
    // const markers = activity.points.map(point => new mapboxgl.Marker().setLngLat([point.lng, point.lat]).addTo(map))

    // var bounds = new mapboxgl.LngLatBounds();

    // markers.forEach((marker) => {
    //   bounds.extend(marker._lngLat);
    // });

    // map.fitBounds(bounds, { padding: 40, duration: 500 });
  }

  pointClick(point) {
    console.log(point)
  }

  startGame() {
    this.navCtrl.navigateForward(`play-game/playing-game/${this.game._id}`)
  }

}
