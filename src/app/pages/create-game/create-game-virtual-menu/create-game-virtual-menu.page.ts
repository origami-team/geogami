import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

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


  constructor(
    public navCtrl: NavController,
    private route: ActivatedRoute) { }

  ngOnInit() {
    // Get selected env. and game type
    this.route.params.subscribe((params) => {
      this.isRealWorld = JSON.parse(params.bundle).isRealWorld;
      this.isSingleMode = JSON.parse(params.bundle).isSingleMode;

      this.bundle = {
        isRealWorld: this.isRealWorld,
        isSingleMode: this.isSingleMode,
        virEnvType: "VR_type_A"
      }
    });
  }

  navigateCreateVRGameTypeA() {
    this.bundle.virEnvType = "VR_type_A";
    this.navCtrl.navigateForward(`create-game-list/${JSON.stringify(this.bundle)}`);
  }

  navigateCreateVRGameTypeB() {
    this.bundle.virEnvType = "VR_type_B";
    this.navCtrl.navigateForward(`create-game-list/${JSON.stringify(this.bundle)}`);
  }

}
