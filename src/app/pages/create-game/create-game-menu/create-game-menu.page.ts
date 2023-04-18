import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-create-game-menu',
  templateUrl: './create-game-menu.page.html',
  styleUrls: ['./create-game-menu.page.scss'],
})
export class CreateGameMenuPage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateCreateRealGamePage() {
    // this.navCtrl.navigateForward('create-game');

    this.navCtrl.navigateForward(`game-type-menu/${"RealWorld"}`);
  }

  navigateCreateVirtualGamePage() {
    this.navCtrl.navigateForward(`game-type-menu/${"Vir.Env."}`);
    // this.navCtrl.navigateForward('create-game-virtual');
  }
  
}
