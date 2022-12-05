import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-game-type-menu',
  templateUrl: './game-type-menu.page.html',
  styleUrls: ['./game-type-menu.page.scss'],
})
export class GameTypeMenuPage implements OnInit {

  constructor(public navCtrl: NavController, private route: ActivatedRoute) { }

  isRealWorld = false;

  ngOnInit() {
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
      if (params.worldType === "RealWorld") {
        this.isRealWorld = true

        // temp
        console.log("isRealWorld: ", this.isRealWorld);
      }
    });
  }

  navCreateSinglePlayerGamePage() {
    // this.navCtrl.navigateForward(`play-game/play-game-list/${"RealWorld"}`);

    let bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: true
    }
    this.navCtrl.navigateForward(`create-game/${JSON.stringify(bundle)}`);
  }

  navCreateMultiPlayerGamePage() {
    // this.navCtrl.navigateForward(`play-game/play-game-list/${"VRWorld"}`);

    let bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: false
    }    
    this.navCtrl.navigateForward(`create-game/${JSON.stringify(bundle)}`);

  }

}
