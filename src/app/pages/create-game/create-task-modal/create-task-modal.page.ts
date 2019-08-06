import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.page.html',
  styleUrls: ['./create-task-modal.page.scss'],
})
export class CreateTaskModalPage {

  @Input() gameName: string;

  constructor(public modalController: ModalController) { }

  dismissModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }
}
