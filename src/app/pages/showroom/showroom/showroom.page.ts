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

  navigateMapShowroom() {
    this.navCtrl.navigateForward('map-showroom');
  }
  navigateTaskShowroom() {
    this.navCtrl.navigateForward('task-showroom');
  }

}
