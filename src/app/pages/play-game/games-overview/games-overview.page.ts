// DoDo this is not used anymore
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import mapboxgl from 'mapbox-gl';

import { GamesService } from '../../../services/games.service';



@Component({
  selector: 'app-games-overview',
  templateUrl: './games-overview.page.html',
  styleUrls: ['./games-overview.page.scss'],
})
export class GamesOverviewPage implements OnInit {

  selectGame: String;

  constructor(private _translate: TranslateService, private gamesService: GamesService) { }

  ngOnInit() {
  }

  ionViewDidEnter(): void {
    this._initialiseTranslation();

    mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA';


    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
    });

    this.gamesService.getGames().then(res => res.content).then(games => {
      games.forEach(game => {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3>${game.name}</h3>
            <p>${game.description}</p>
            <ion-button (click)="playGame()">Play</ion-button>`);

        new mapboxgl.Marker()
          .setLngLat([game.waypoints[0].lng, game.waypoints[0].lat])
          .setPopup(popup)
          .addTo(map);
      });

      const coordinates = games.map(game => [game.waypoints[0].lng, game.waypoints[0].lat]);

      const bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
        zoom: 15
      });
    });
  }

  playGame(game) {
    // console.log('Playing ', game);
  }


  _initialiseTranslation(): void {
    this._translate.get('selectGame').subscribe((res: string) => {
      this.selectGame = res;
    });
  }
}
