import { Component, OnInit } from '@angular/core';

import { PopoverController } from '@ionic/angular';

import { NavController } from '@ionic/angular';

import { Game } from './../../../models/game'

import { GameFactoryService } from '../../../services/game-factory.service'


import { TrackingPopoverComponent } from '../../../tracking-popover/tracking-popover.component';

@Component({
  selector: 'app-create-game-meta',
  templateUrl: './create-game-meta.page.html',
  styleUrls: ['./create-game-meta.page.scss'],
})
export class CreateGameMetaPage implements OnInit {

  public model = new Game(0, '', '', '', true, undefined);

  constructor(public popoverController: PopoverController, public navCtrl: NavController, public gameFactory: GameFactoryService) { }

  ngOnInit() {
  }

  async showTrackingInfo(ev: any) {
    console.log(ev)
    const popover = await this.popoverController.create({
      component: TrackingPopoverComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  goToCreateGameMap() {
    this.gameFactory.addGameInformation(this.model)
    this.navCtrl.navigateForward('create-game/create-game-list')
  }

}
