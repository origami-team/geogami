import { Component, OnInit } from "@angular/core";

import { PopoverController } from "@ionic/angular";

import { NavController } from "@ionic/angular";

import { Game } from "../../../models/game";

import { GameFactoryService } from "../../../services/game-factory.service";

import { PopoverComponent } from "../../../popover/popover.component";
import { GamesService } from 'src/app/services/games.service';


@Component({
  selector: "app-create-game-overview",
  templateUrl: "./create-game-overview.page.html",
  styleUrls: ["./create-game-overview.page.scss"]
})
export class CreateGameOverviewPage implements OnInit {
  public model = this.gameFactory.getGame()
  public lottieConfig: Object;
  showSuccess: boolean = false

  constructor(
    public popoverController: PopoverController,
    public navCtrl: NavController,
    public gameFactory: GameFactoryService,
    public gamesService: GamesService
  ) {
    this.lottieConfig = {
      path: 'assets/lottie/astronaut.json',
      renderer: 'canvas',
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
    console.log(this.gameFactory.game)

    this.gamesService.postGame(this.gameFactory.game).then(res => console.log(res)).catch(e => console.error(e))
    this.showSuccess = true
  }

  navigateHome() {
    this.navCtrl.navigateRoot('/')
  }
}
