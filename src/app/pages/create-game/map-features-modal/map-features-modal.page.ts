import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-map-features-modal',
  templateUrl: './map-features-modal.page.html',
  styleUrls: ['./map-features-modal.page.scss'],
})
export class MapFeaturesModalPage implements OnInit {

  features: any = {
    zoombar: false,
    swipe: false,
    pan: true,
    manualRotation: true,
    automaticRotation: false,
    position: false,
    heading: false,
    track: false,
    layerControl: false,
    threeD: false,
    streetSection: false
  }

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }


  dismissModal(dismissType: string = 'null') {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }

    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true,
      data: this.features
    });
  }

}
