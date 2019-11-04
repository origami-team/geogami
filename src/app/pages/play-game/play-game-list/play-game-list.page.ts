import { Component, OnInit } from "@angular/core";

import { NavController } from "@ionic/angular";

import { GamesService } from "../../../services/games.service";

@Component({
  selector: "app-play-game-list",
  templateUrl: "./play-game-list.page.html",
  styleUrls: ["./play-game-list.page.scss"]
})
export class PlayGameListPage implements OnInit {
  games: any;

  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService
  ) {}

  ngOnInit() {
    this.gamesService.getGames(true).then(games => (this.games = games));
  }

  doRefresh(event) {
    this.gamesService
      .getGames(true)
      .then(games => (this.games = games))
      .finally(() => event.target.complete());
  }

  filterList(event) {
    this.gamesService
      .getGames(true)
      .then(
        games =>
          (this.games = games.filter(game =>
            game.name.toLowerCase().includes(event.detail.value.toLowerCase())
          ))
      );
  }

  gameClick(game: any) {
    console.log(game);
    this.navCtrl.navigateForward(`play-game/game-detail/${game._id}`);
  }
}
