import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-map-features-modal",
  templateUrl: "./map-features-modal.page.html",
  styleUrls: ["./map-features-modal.page.scss"]
})
export class MapFeaturesModalPage implements OnInit {
  features: any = {
    zoombar: false,
    pan: "true",
    rotation: "manual",
    material: "standard",
    position: "none",
    direction: "none",
    track: false,
    streetSection: false,
    reducedInformation: false,
    landmarks: false
  };

  constructor(public modalController: ModalController) {}

  ngOnInit() {}

  dismissModal(dismissType: string = "null") {
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
