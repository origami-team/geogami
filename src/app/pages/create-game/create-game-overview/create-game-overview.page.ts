import { Component, OnInit } from "@angular/core";

import { PopoverController } from "@ionic/angular";

import { NavController } from "@ionic/angular";

import { Game } from "../../../models/game";
import { Storage } from '@ionic/storage';


import { GameFactoryService } from "../../../services/game-factory.service";

import { PopoverComponent } from "../../../popover/popover.component";
import { GamesService } from "src/app/services/games.service";

@Component({
  selector: "app-create-game-overview",
  templateUrl: "./create-game-overview.page.html",
  styleUrls: ["./create-game-overview.page.scss"]
})
export class CreateGameOverviewPage implements OnInit {
  public model = this.gameFactory.getGame();
  public lottieConfig: Object;
  showSuccess: boolean = false;
  showUpload: boolean = false;

  constructor(
    public popoverController: PopoverController,
    public navCtrl: NavController,
    public gameFactory: GameFactoryService,
    public gamesService: GamesService,
    private storage: Storage
  ) {
    this.lottieConfig = {
      path: "assets/lottie/astronaut.json",
      renderer: "canvas",
      autoplay: true,
      loop: true
    };
  }

  // #0a1b28

  ngOnInit() { }

  async showTrackingInfo(ev: any, text: string) {
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

  uploadGame() {
    this.gameFactory.addGameInformation(this.model);
    console.log(this.gameFactory.game);

    this.showUpload = true;
    this.gamesService
      .postGame(this.gameFactory.game)
      .then(res => {
        if (res.status == 200) {
          this.showSuccess = true;
          this.gameFactory.flushGame();
        }
      })
      .catch(e => console.error(e));
  }

  navigateHome() {
    this.navCtrl.navigateRoot("/");
  }
}
