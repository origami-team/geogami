import { Component, Input } from '@angular/core';

import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-create-module-modal',
  templateUrl: './create-module-modal.page.html',
  styleUrls: ['./create-module-modal.page.scss'],
})
export class CreateModuleModalPage {

  @Input() gameName: string;

  constructor(public modalController: ModalController) { }

  dismissModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true
    });
  }

}
