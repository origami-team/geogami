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
  isSingleMode: boolean = true;
  bundle: any;

  constructor(public navCtrl: NavController, private route: ActivatedRoute) { }

  ngOnInit() {
    // Get selected env. and game type
    this.route.params.subscribe((params) => {
      console.log("params.bundle1: ", params.bundle)
      if (params.bundle != "userRole") {
        this.isRealWorld = JSON.parse(params.bundle).isRealWorld;
        this.isSingleMode = JSON.parse(params.bundle).isSingleMode;
      }

      this.bundle = {
        isRealWorld: this.isRealWorld,
        isSingleMode: this.isSingleMode
      }
    });

  }

  navigateCreateGamePage() {
    // this.navCtrl.navigateForward('create-game/create-game-list');
    
    /* only whit Vir Env. single mode -> to be able to choose between two env.s */
    if(!this.isRealWorld && this.isSingleMode){
      this.navCtrl.navigateForward('create-game-virtual-menu');
    } else{
      this.navCtrl.navigateForward(`create-game-list/${JSON.stringify(this.bundle)}`);
    }
  }

  navigateEditGame() {
    // this.navCtrl.navigateForward(`edit-game-list/${"RealWorld"}`);
    // DoDo update impl of user role
    /* this.bundle = {
      isRealWorld: this.isRealWorld,
      isSingleMode: this.isSingleMode
    } */

    this.navCtrl.navigateForward(`edit-game-list/${JSON.stringify(this.bundle)}`);
  }

}
