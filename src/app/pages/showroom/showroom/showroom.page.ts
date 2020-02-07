import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-showroom',
  templateUrl: './showroom.page.html',
  styleUrls: ['./showroom.page.scss'],
})
export class ShowroomPage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  // Das hier ist etwas unsauber. Es wäre schöner, wenn map-showroom im Unterordner stecken würde,
  // aber beim Verschieben treten immer Fehler auf...

  navigateMapShowroom() {
    this.navCtrl.navigateBack('map-showroom');
  }
  navigateTaskShowroom() {
    this.navCtrl.navigateForward('task-showroom');
  }

}
