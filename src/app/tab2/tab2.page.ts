import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GamesService } from '../services/games.service'



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

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

  itemClick(id: string) {
    this.navCtrl.navigateForward(`game-detail/${id}`);
  }

  goToAddGame() {
    this.navCtrl.navigateForward('add-game');
  }

}
