import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { VirEnvHeaders } from 'src/app/models/virEnvsHeader';
import { GameFactoryService } from 'src/app/services/game-factory.service';


@Component({
  selector: 'app-create-game-virtual-menu',
  templateUrl: './create-game-virtual-menu.page.html',
  styleUrls: ['./create-game-virtual-menu.page.scss'],
})

export class CreateGameVirtualMenuPage implements OnInit {
  // Multiplayer mode 
  isRealWorld: boolean = false;
  isSingleMode: boolean = false;
  bundle: any;
  virEnvType: string; // new var. to store vir env type

  //* get virual environment headers
  virEnvTypesList = VirEnvHeaders;


  constructor(
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private gameFactory: GameFactoryService) { }

  ngOnInit() {
    // Get selected env. and game type
    this.route.params.subscribe((params) => {
      this.isRealWorld = JSON.parse(params.bundle).isRealWorld;
      this.isSingleMode = JSON.parse(params.bundle).isSingleMode;

      this.bundle = {
        isRealWorld: this.isRealWorld,
        isSingleMode: this.isSingleMode,
        // virEnvType: "VR_type_A"
        virEnvType: "VirEnv_1"      // Defualt env.
      }
    });

    //* To make sure that game is clear when choosing another vir. env. (no need for it now)
    // this.gameFactory.flushGame(); // clear game data
  }

  navigateCreateVRGame(virEnvType) {
  console.log("🚀 ~ CreateGameVirtualMenuPage ~ navigateCreateVRGame ~ virEnvType:", virEnvType)
    this.bundle.virEnvType = virEnvType;
    this.navCtrl.navigateForward(`create-game-list/${JSON.stringify(this.bundle)}`);
  } 

}
