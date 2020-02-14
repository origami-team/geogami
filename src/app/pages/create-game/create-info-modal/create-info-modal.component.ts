import { Component, OnInit } from '@angular/core';
import { ModalController } from "@ionic/angular";

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';


import { MapFeaturesModalPage } from './../map-features-modal/map-features-modal.page';


@Component({
  selector: 'app-create-info-modal',
  templateUrl: './create-info-modal.component.html',
  styleUrls: ['./create-info-modal.component.scss'],
})
export class CreateInfoModalComponent implements OnInit {

  info: string
  mapFeatures: any = {
    zoombar: "true",
    pan: "true",
    rotation: "manual",
    material: "standard",
    position: "none",
    direction: "none",
    track: false,
    streetSection: false,
    reducedInformation: false,
    landmarks: false,
    landmarkFeatures: undefined
  }
  photo: string

  baseOptions: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  }

  cameraOptions: CameraOptions = {
    ...this.baseOptions,
    sourceType: this.camera.PictureSourceType.CAMERA
  }

  libraryOptions: CameraOptions = {
    ...this.baseOptions,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  }

  constructor(public modalController: ModalController, private camera: Camera) { }

  ngOnInit() { }

  capturePhoto() {
    this.camera.getPicture(this.cameraOptions).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photo = base64Image
      console.log(base64Image)
    }, (err) => {
      // Handle error
    });
  }

  photoFromLibrary() {
    this.camera.getPicture(this.libraryOptions).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photo = base64Image
      console.log(base64Image)

    }, (err) => {
      // Handle error
    });
  }

  async presentMapFeaturesModal() {
    const modal = await this.modalController.create({
      component: MapFeaturesModalPage,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    this.mapFeatures = data.data
    return;
  }

  dismissModal(dismissType: string = 'null') {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }


    this.modalController.dismiss({
      dismissed: true,
      data: {
        type: 'info',
        settings: {
          text: this.info,
          photo: this.photo,
          mapFeatures: this.mapFeatures,
          confirmation: true
        }
      }
    });
  }

}
