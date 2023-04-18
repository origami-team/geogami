/* ToDo: I may delete this page */
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';

@Component({
  selector: 'app-create-game-virtual',
  templateUrl: './create-game-virtual.page.html',
  styleUrls: ['./create-game-virtual.page.scss'],
})
export class CreateGameVirtualPage implements OnInit {

  // Multiplyar impl.
  isRealWorld: boolean = true;
  isSingleMode: boolean = true;

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  // temp : check it out
  navigateCreateVirtualGamePage() {
    this.navCtrl.navigateForward('create-game-virtual-menu');
  }

  navigateEditVirtualGame() {
    // VR world
    // this.navCtrl.navigateForward(`edit-game-list/${"VRWorld"}`);

    let bundle = {
      isRealWorld: false,
      isSingleMode: true // until multi-player impl. is added in VE
    }
    this.navCtrl.navigateForward(`edit-game-list`);

  }

}