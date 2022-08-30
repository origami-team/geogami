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
  selectedSegment: string = "curated";
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

    // get games list
    this.gamesService.getGames(true).then(res => res.content).then(games => {
      // Get either real or VE agmes based on selected environment 
      this.games = games.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined)) && game.isCuratedGame).reverse();
    });

    // Get user role
    if(this.user){
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

    } else if (this.selectedSegment == "all") { // if all is selected
      //--- ToDo
      this.gamesService.getGames(true).then(res => res.content).then(games => {
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
    }
    else if (this.selectedSegment == "curated") { // if all is selected
      this.gamesService.getGames(true).then(res => res.content).then(games => {
        // Get either real or VE agmes based on selected environment 
        gamesListTemp = games.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined)) && game.isCuratedGame);

        // to update shown games based on search phrase
        if (this.searchText != "") {
          console.log("this.searchText: ", this.searchText)
          this.filterSelectedSegementList(this.searchText);
        } else {
          this.games = gamesListTemp.reverse();
        }

      }).finally(() => event.target.complete());
    }
  }

  // search function
  filterList(event) {
    this.filterSelectedSegementList(event.detail.value);
  }

  gameClick(game: any) {
    console.log(game);
    this.navCtrl.navigateForward(`play-game/game-detail/${game._id}`);
  }

  // segment (my games - all games)
  segmentChanged(event) {  //--- ToDo check duplicate code and create a func for it
    // clear search tbox
    let gamesListTemp;

    // if mine is selected
    if (event.detail.value == "mine") {
      this.gamesService.getUserGames().then((games) => {
        // Get either real or VE agmes based on selected environment 
        gamesListTemp = games.filter(game => game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined));

        // to update shown games based on search phrase
        if (this.searchText != "") {
          this.filterSelectedSegementList(this.searchText);
        } else {
          this.games = gamesListTemp.reverse();
        }

      });
    } else if (event.detail.value == "all") { // if all is selected
      this.gamesService.getGames(true).then(res => res.content).then(games => {
        // Get either real or VE agmes based on selected environment 
        gamesListTemp = games.filter(game => game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined));

        // to update shown games based on search phrase
        if (this.searchText != "") {
          console.log("this.searchText: ", this.searchText)
          this.filterSelectedSegementList(this.searchText);
        } else {
          this.games = gamesListTemp.reverse();
        }
      });
    }
    else if (event.detail.value == "curated") { // if all is selected
      this.gamesService.getGames(true).then(res => res.content).then(games => {
        // Get either real or VE agmes based on selected environment 
        gamesListTemp = games.filter(game => (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined)) && game.isCuratedGame);

        // to update shown games based on search phrase
        if (this.searchText != "") {
          console.log("this.searchText: ", this.searchText)
          this.filterSelectedSegementList(this.searchText);
        } else {
          this.games = gamesListTemp.reverse();
        }
      });
    }
  }

  // update list after selecting a segment
  filterSelectedSegementList(searchPhrase) {
    if (this.selectedSegment == "all") {
      this.gamesService
        .getGames(true).then(res => res.content).then(
          games => {
            this.games = games.reverse();
            this.games = this.games.filter(game =>
              (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
                || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
              && (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined))
            )
          }
        );
    } else if (this.selectedSegment == "mine") {
      this.gamesService.getUserGames().then((res) => {
        this.games = res.reverse();

        this.games = this.games.filter(game =>
          (game.name.toLowerCase().includes(searchPhrase.toLowerCase())
            || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
          && (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined)))
      });
    }
    else if (this.selectedSegment == "curated") {
      this.gamesService
        .getGames(true).then(res => res.content).then(
          games => {
            this.games = games.reverse();
            this.games = this.games.filter(game =>
            ((game.name.toLowerCase().includes(searchPhrase.toLowerCase())
              || (game.place != undefined && game.place.toLowerCase().includes(searchPhrase.toLowerCase())))
              && (game.isVRWorld == this.isVirtualWorld || (!this.isVirtualWorld && game.isVRWorld == undefined)) && game.isCuratedGame)
            )
          }
        );
    }
  }
}
