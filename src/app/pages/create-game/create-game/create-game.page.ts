import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavController } from '@ionic/angular';




@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {

  // To hold received parametres vlaues via route
  isRealWorld: boolean = true;
  isSinlgeMode: boolean = true;
  bundle: any;

  constructor(public navCtrl: NavController, private route: ActivatedRoute) { }

  ngOnInit() {
    // Get selected env. and game type
    this.route.params.subscribe((params) => {
      this.isRealWorld = JSON.parse(params.bundle).isRealWorld;
      this.isSinlgeMode = JSON.parse(params.bundle).isSinlgeMode;

      this.bundle = {
        isRealWorld: this.isRealWorld,
        isSinlgeMode: this.isSinlgeMode
      }
    });

  }

  navigateCreateGamePage() {
    // this.navCtrl.navigateForward('create-game/create-game-list');

    this.navCtrl.navigateForward(`create-game-list/${JSON.stringify(this.bundle)}`);
  }

  navigateEditGame() {
    // this.navCtrl.navigateForward(`edit-game-list/${"RealWorld"}`);

    this.navCtrl.navigateForward(`edit-game-list/${JSON.stringify(this.bundle)}`);
  }

}
