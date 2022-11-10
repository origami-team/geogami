import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

// VR world
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-game-list', // edit-game-list
  templateUrl: './edit-game-list.page.html',
  styleUrls: ['./edit-game-list.page.scss'],
})
export class EditGameListPage implements OnInit {
  games: any;

  showEmptyInfo = false;

  // VR world
  isVirtualWorld: boolean = false;

  // Multiplyar impl.
  isRealWorld: boolean = true;
  isSinlgeMode: boolean = true;
  // bundle: any;

  
  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    // Get selected env. and game type
    this.route.params.subscribe((params) => {
      this.isRealWorld = JSON.parse(params.bundle).isRealWorld;
      this.isSinlgeMode = JSON.parse(params.bundle).isSinlgeMode;

      this.isVirtualWorld = !this.isRealWorld;

      
    });

    /* // VR world
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
      if (params.worldType === "VRWorld") {
        this.isVirtualWorld = true;
      }
    }); */

    this.gamesService.getUserGames().then((res) => {
      // Get either real or VE agmes based on selected environment 
      this.games = res.filter(game => game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined)).reverse();
      
      if(this.games.length == 0){
        this.showEmptyInfo = true;
      }
    });
  }

  doRefresh(event) {
    this.gamesService.getUserGames().then((games) => {
      // Get either real or VE agmes based on selected environment 
      this.games = games.filter(game => game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined)).reverse();
    }).finally(() => event.target.complete());
  }

  filterList(event) {
    this.gamesService.getUserGames().then((games) => {
      this.games = games.filter(game =>
        (game.name.toLowerCase().includes(event.detail.value.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(event.detail.value.toLowerCase())))
        && (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined))).reverse();
    });
  }

  gameClick(game: any) {
    // console.log("game: ", game);
    // this.navCtrl.navigateForward(`edit-game-tasks/${game._id}`);

    let bundle = {
      isRealWorld: this.isRealWorld,
      isSinlgeMode: this.isSinlgeMode,
      game_id: game._id
    }
    
    this.navCtrl.navigateForward(`edit-game-tasks/${JSON.stringify(bundle)}`);
  }
}
