import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  // @Input() gameDetails: any;
  @Input() gameID: any;
  @Input() gameName: any;
  @Input() gamePlace: any;
  @Input() NumTasks: any;

  constructor(public navCtrl: NavController) { }

  ngOnInit(): void {
    //console.log("gameName: ", this.gameName)
  }

  playGame(){
    // console.log("play pressed: ", this.gameName)
    this.navCtrl.navigateForward(`play-game/game-detail/${this.gameID}`);

  }

}
