import { Component, OnInit, ElementRef } from "@angular/core";

import { NavController } from "@ionic/angular";

import { GamesService } from "../../../services/games.service";

@Component({
  selector: "app-analyze-game-list",
  templateUrl: "./analyze-game-list.page.html",
  styleUrls: ["./analyze-game-list.page.scss"]
})
export class AnalyzeGameListPage implements OnInit {
  tracks: any[] = []

  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private elRef: ElementRef
  ) { }

  ngOnInit() {
    this.gamesService.getTracks().then(tracks => {
      this.tracks = tracks
    });
  }
}
