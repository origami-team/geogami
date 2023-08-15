import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

// VR world
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service.service';
import { UtilService } from 'src/app/services/util.service';

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
  isSingleMode: boolean = true;
  // bundle: any;

  // to show star icon for content admin
  userRole: String = "user";

  //* for choosing game env and mode
  gameEnvSelected = 'real';  // (default) game mode select
  gameModeSelected = 'single';  // (default) game mode select
  isMutiplayerGame = undefined;
  games_res: any;
  games_view: any;  // for viewing based on filter games_res
  // all_games_segment: any;

  // To search for games in city names as well as game names
  searchText: string = "";


  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {

    /* if device is not connected to internet, show notification */
    if (!this.utilService.getIsOnlineValue()) {
      // show no connection notification
      this.utilService.showAlertNoConnection();
      // return;
    }

    // Check user role
    if (this.authService.getUserValue()) {
      this.userRole = this.authService.getUserRole();
    }

    // Get games data from server
    this.getUserGamesData();
  }

  // Get user's games data from server
  getUserGamesData() {

    //* request user games data
    this.gamesService.getUserGames().then(games => {
      this.games_res = games;

    // console.log("games_res: ", this.games_res)

      /* filter real world games (default) - as it represents the initial view */
      this.filterRealWorldGames();

      //* in case games list is empty show notification
      if (this.games_res.length == 0) {
        this.showEmptyInfo = true;
      }
    });
  }

  doRefresh(event) {
    //* Get user games data from server
    this.gamesService.getUserGames().then(games => {
        this.games_res = games;

        this.filterGamesEnv(this.gameEnvSelected);
      }).finally(() => event.target.complete());
  }

  //* update shown games based on search phrase
  filterList(event) {
    let searchPhrase = event.detail.value.toLowerCase();
    this.games_view = this.games_res.filter(game =>
    (game.name.toLowerCase().includes(searchPhrase)
      || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase)))
    )
  }

  gameClick(game: any) {
    let bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: this.isSingleMode,
      game_id: game._id
    }

    this.navCtrl.navigateForward(`edit-game-tasks/${JSON.stringify(bundle)}`);
  }

  //* filter real wold games
  filterRealWorldGames() {
    this.games_view = this.games_res.filter(game =>
      (game.isVRWorld == false || game.isVRWorld == undefined) && game.isMultiplayerGame == this.isMutiplayerGame
    ).reverse();
  }

  //* filter virtual environments games
  filterVirtualEnvGames() {
    this.games_view = this.games_res.filter(game =>
      (game.isVRWorld == true && game.isMultiplayerGame == this.isMutiplayerGame)
    ).reverse();
  }

  /* on game environment change OR refresh*/
  filterGamesEnv(envVal: string) {
    /* first, update game mode to single player */
    this.gameModeSelected = 'single';
    this.isMutiplayerGame = undefined;
    /* then, check game env. */
    if (envVal == "real") {
      this.isRealWorld = true;
      this.filterRealWorldGames();
    } else {
      this.isRealWorld = false;
      this.filterVirtualEnvGames();
    }
  }

  //*  on game mode change ***/
  filterGamesMode(modeVal: string) {
    if (modeVal == "single") {
      this.isMutiplayerGame = undefined;
      this.isSingleMode = true;     //* for next page
      this.games_view = this.games_res.filter(game =>
        (game.isMultiplayerGame == undefined)
      ).reverse();
    } else {
      this.isMutiplayerGame = true;
      this.isSingleMode = false;      //* for next page
      this.games_view = this.games_res.filter(game =>
        (game.isMultiplayerGame == true)
      ).reverse();
    }
  }

}
