import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

@Component({
  selector: 'app-edit-game-list',
  templateUrl: './edit-game-list.page.html',
  styleUrls: ['./edit-game-list.page.scss']
})
export class EditGameListPage implements OnInit {
  games: any;

  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService
  ) { }

  ngOnInit() {
    this.gamesService.getGames(true).then(games => (this.games = games.reverse()));
  }

  doRefresh(event) {
    this.gamesService
      .getGames(true)
      .then(games => (this.games = games.reverse()))
      .finally(() => event.target.complete());
  }

  filterList(event) {
    this.gamesService
      .getGames(true)
      .then(
        games =>
          (this.games = games.filter(game =>
            game.name.toLowerCase().includes(event.detail.value.toLowerCase())
          ).reverse())
      );
  }

  gameClick(game: any) {
    console.log(game);
    this.navCtrl.navigateForward(`edit-game/${game._id}`);
  }
}
