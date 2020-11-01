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
  track: any[] = []
  events: any[] = []
  taskName: String = ""
  game: any[] = []
  AllGames: any[] = []
  players: any[] = []


  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private elRef: ElementRef
  ) { }

  ngOnInit() {
    this.gamesService.getTracks().then(tracks => {
      if (tracks != null) {
        tracks.forEach(element => {
          this.taskName = element["name"]
          this.track = element["events"]
          this.players = element["players"]

          this.track.forEach(event => {
            if ((event["type"] == "ON_OK_CLICKED" && event["correct"] == true) || event["type"] == "WAYPOINT_REACHED") {
              this.events.push(event)
            }
          });

          this.tracks.push([this.players, this.taskName, this.events])
          this.events = []
        });

        this.tracks  = JSON.parse(JSON.stringify(this.tracks))
      }
    });
  }
}
