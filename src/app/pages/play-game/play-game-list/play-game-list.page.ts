import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

// VR world
import { ActivatedRoute } from '@angular/router';
// For getting user role
import { AuthService } from '../../../services/auth-service.service';


@Component({
  selector: 'app-play-game-list',
  templateUrl: './play-game-list.page.html',
  styleUrls: ['./play-game-list.page.scss']
})
export class PlayGameListPage implements OnInit {
  games: any;
  // VR world
  isVirtualWorld: boolean = false;
  // To be able to update games list and switch between segments 
  searchText: string = "";
  selectedSegment: string = "all";
  // to disable mine segment for unlogged user
  userRole: String = "unloggedUser";
  user = this.authService.getUserValue();

  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // VR world
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
      if (params.worldType === "VRWorld") {
        this.isVirtualWorld = true;
      }
    });

    // Get games data from server
    this.getGamesData();

    // Get user role
    if (this.user) {
      this.userRole = this.user['roles'][0];
    }
  }

  // ToDo: update the functions
  doRefresh(event) {
    let gamesListTemp;

    if (this.selectedSegment == "mine") { // if mine is selected
      this.gamesService.getUserGames().then((games) => {
        // Get either real or VE agmes based on selected environment 
        gamesListTemp = games.filter(game => game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined));

        // to update shown games based on search phrase
        if (this.searchText != "") {
          console.log("this.searchText: ", this.searchText)
          this.filterSelectedSegementList(this.searchText);
        } else {
          this.games = gamesListTemp.reverse();
        }
      }).finally(() => event.target.complete());

  // Get games data from server
  getGamesData() {
    this.gamesService.getGames(true).then(res => res.content).then(games => {
      // Get either real or VE agmes based on selected environment 
        // Get either real or VE agmes based on selected environment 
      // Get either real or VE agmes based on selected environment 
      this.games = games.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined))).reverse();
      //this.gamesTemp = cloneDeep(this.games);
      this.gamesTemp = this.games;

      //console.log("games: ", this.games);
    });
  }

  // ToDo: update the functions
  doRefresh(event) {
    //this.initMap();

    // Get games data from server
    this.gamesService.getGames(true).then(res => res.content).then(games => {
      // Get either real or VE agmes based on selected environment 
        // Get either real or VE agmes based on selected environment 
      // Get either real or VE agmes based on selected environment 
      this.games = games.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined))).reverse();
      //this.gamesTemp = cloneDeep(this.games);
      this.gamesTemp = this.games;

      // Filter data of selected segment
      this.segmentChanged(this.selectedSegment)
    }).finally(() => event.target.complete());;
  }

  // search function
  filterList(event) {
    this.filterSelectedSegementList(event.detail.value);
  }

  gameClick(game: any) {
    console.log(game);
    this.navCtrl.navigateForward(`play-game/game-detail/${game._id}`);
  }

  // segment (my games - all games - curated game)
  segmentChanged(segVal) {  //--- ToDo check duplicate code and create a func for it
    // if mine is selected
    if (segVal == "mine") {
      // console.log("mine"); //temp
      this.games = this.gamesTemp.filter(game => game.user == this.user['_id']);

      // to update shown games based on search phrase
      if (this.searchText != "") {
        this.games = this.games.filter(game =>
        (game.name.toLowerCase().includes(this.searchText.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(this.searchText.toLowerCase())))
        )
      }
    } else if (segVal == "all") { // if all is selected
      //onsole.log("all"); //temp
      this.games = this.gamesTemp;

      // to update shown games based on search phrase
      if (this.searchText != "") {
        this.games = this.games.filter(game =>
        (game.name.toLowerCase().includes(this.searchText.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(this.searchText.toLowerCase())))
        )
      }
    }
    else if (segVal == "curated") { // if all is selected
      //console.log("curated");
      this.games = this.gamesTemp.filter(game => game.isCuratedGame == true);

      // to update shown games based on search phrase
      if (this.searchText != "") {
        this.games = this.games.filter(game =>
        (game.name.toLowerCase().includes(this.searchText.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(this.searchText.toLowerCase())))
        )
      }
    }
  }

  // update list after selecting a segment
  filterSelectedSegementList(searchPhrase) {
    if (this.selectedSegment == "all") {
      this.games = this.gamesTemp.filter(game =>
      (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
        || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
      )
    } else if (this.selectedSegment == "mine") {
      this.games = this.gamesTemp.filter(game =>
        (game.user == this.user['_id']) &&
        (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
      )
    }
    else if (this.selectedSegment == "curated") {
      this.games = this.gamesTemp.filter(game =>
        (game.isCuratedGame == true) &&
        (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
          || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
      )
    }
  }
  }
}
