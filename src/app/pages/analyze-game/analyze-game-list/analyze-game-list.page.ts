import { Component, OnInit, ElementRef } from "@angular/core";

import { NavController } from "@ionic/angular";

import { GamesService } from "../../../services/games.service";

import {
  Plugins,
  FilesystemDirectory,
  FilesystemEncoding,
} from "@capacitor/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "src/app/services/auth-service.service";

@Component({
  selector: "app-analyze-game-list",
  templateUrl: "./analyze-game-list.page.html",
  styleUrls: ["./analyze-game-list.page.scss"],
})
export class AnalyzeGameListPage implements OnInit {
  tracks: any[] = [];
  gamesWithTracks: any[] = [];

  // to only allow admins and scholars to see this page
  user = this.authService.getUser();
  userRole: string;

  blobUrl: any;
  sanitizedBlobUrl: any;
  filename: string;

  // filter shown games
  all_tracks: any;
  gamesWithTracks_view: any; // for viewing based on filter gamesWithTracks
  gameEnvSelected = "real"; // (default) game mode select
  gameModeSelected = "single"; // (default) game mode select
  isMutiplayerGame = undefined;

  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // this.gamesService.getTracks().then(tracks => {
    //   this.tracks = tracks
    // });

    //* old impl. (showing tracks stored locally)
    // await this.getTracks();
    //* new impl. (showing user games that has tracks)
    this.getUserGamesBasicData();
  }

  ionViewWillEnter() {
    // Check user role. Allow only ["admin", "contentAdmin", "scholar"] to access evlaute page
    this.user.subscribe((event) => {
      if (
        event == null ||
        !["admin", "contentAdmin", "scholar"].includes(event["roles"][0])
      ) {
        this.navCtrl.navigateForward("/");
      }
    });
  }

  //* Get user games that has at least on track
  getUserGamesBasicData() {
    this.gamesService
      .getUserGamesWithTrackInfo()
      .then((res: any) => res.content)
      .then((games) => {
        // Get either real or VE agmes based on selected environment
        this.gamesWithTracks = games;

        /* filter real world games (default) - as it represents the initial view */
        this.filterRealWorldGames();
      });
  }

  //***** Game filters impl. ******/
  //* on game environment change
  filterGamesEnv(envVal: string) {
    /* first, update game mode to single player */
    this.gameModeSelected = "single";
    this.isMutiplayerGame = undefined;
    /* then, check game env. */
    if (envVal == "real") {
      this.filterRealWorldGames();
    } else {
      this.filterVirtualEnvGames();
    }
  }

  //*  on game mode change
  filterGamesMode(modeVal: string) {
    if (modeVal == "single") {
      this.isMutiplayerGame = undefined;

      this.gamesWithTracks_view = this.all_tracks
        .filter((game) => game.isMultiplayerGame == undefined)
        .reverse();
    } else {
      this.isMutiplayerGame = true;
      this.gamesWithTracks_view = this.all_tracks
        .filter((game) => game.isMultiplayerGame == true)
        .reverse();
    }
  }

  filterRealWorldGames() {
    this.all_tracks = this.gamesWithTracks
      .filter((game) => game.isVRWorld == false || game.isVRWorld == undefined)
      .reverse();
  }

  filterVirtualEnvGames() {
    this.all_tracks = this.gamesWithTracks
      .filter((game) => game.isVRWorld == true)
      .reverse();
  }
  //***** End game filters impl. ******/

  async getTracks() {
    try {
      const ret = await Plugins.Filesystem.readdir({
        path: "origami/tracks",
        directory: FilesystemDirectory.Documents,
      });
      this.tracks = ret.files;
    } catch (e) {
      console.error("Unable to read dir", e);
    }
  }
  //--- ToDo
  async upload(track) {
    const contents = await Plugins.Filesystem.readFile({
      path: `origami/tracks/${track}`,
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8,
    });
    console.log(contents);

    this.http
      .post(`${environment.apiURL}/track`, JSON.parse(contents.data), {
        observe: "response",
      })
      .subscribe((response) =>
        alert(response.status + " " + response.statusText)
      );
  }

  async remove(track) {
    this.confirmDialog(`Willst du die Datei ${track} wirklich löschen?`) // --- ToDo (translate)
      .then(async () => {
        await Plugins.Filesystem.deleteFile({
          path: `origami/tracks/${track}`,
          directory: FilesystemDirectory.Documents,
        });
      })
      .catch((err) => console.log("User aborted delete"))
      .finally(async () => await this.getTracks());
  }

  private confirmDialog(msg: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const confirmed = window.confirm(msg);

      return confirmed ? resolve(true) : reject(false);
    });
  }

  //* open game's tracks
  gameClick(game: any) {
    let bundle = {
      id: game._id,
      /* replace is used to get rid of special charachters, so values can be sent via routing */
      name: game.name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ""),
      isVRWorld: game.isVRWorld,
      virEnvType: game.virEnvType,
    };
    this.navCtrl.navigateForward(
      `analyze/game-tracks/${JSON.stringify(bundle)}`
    );
  }
}
