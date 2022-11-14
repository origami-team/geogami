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
  isSinlgeMode: boolean = true;

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateCreateVirtualGamePage() {
    this.navCtrl.navigateForward('create-game-virtual-menu');
  }

  navigateEditVirtualGame() {
    // VR world
    // this.navCtrl.navigateForward(`edit-game-list/${"VRWorld"}`);

    let bundle = {
      isRealWorld: false,
      isSinlgeMode: true // unitil multi-player impl is added in VE
    }
    this.navCtrl.navigateForward(`edit-game-list/${JSON.stringify(bundle)}`);

  }

}