import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service'

@Component({
  selector: 'app-play-game-list',
  templateUrl: './play-game-list.page.html',
  styleUrls: ['./play-game-list.page.scss'],
})
export class PlayGameListPage implements OnInit {

  results: any;

  constructor(public navCtrl: NavController, private gamesService: GamesService) { }

  ngOnInit() {
    this.gamesService.getGames().then(games => this.results = games)
  }

  doRefresh(event) {
    this.gamesService.getGames()
      .then(games => this.results = games)
      .finally(() => event.target.complete())
  }

  filterList(event) {
    this.results = this.results.filter(game => game.name)
      .filter(game => game.name.toLowerCase().includes(event.detail.value.toLowerCase()))
  }

  gameClick(game: any) {
    console.log(game)
    this.navCtrl.navigateForward(`play-game/game-detail/${game._id}`)
  }

}
