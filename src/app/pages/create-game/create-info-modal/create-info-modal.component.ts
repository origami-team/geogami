import { Component, OnInit } from '@angular/core';
import { ModalController } from "@ionic/angular";

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';


import { MapFeaturesModalPage } from './../map-features-modal/map-features-modal.page';
import { environment } from 'src/environments/environment';

import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


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
  photo: SafeResourceUrl
  photoURL: string;

  baseOptions: CameraOptions = {
    quality: environment.photoQuality,
    destinationType: this.camera.DestinationType.FILE_URI,
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

  constructor(
    public modalController: ModalController, private camera: Camera,
    private transfer: FileTransfer, private file: File, private webview: WebView, private sanitizer: DomSanitizer
  ) { }

  ngOnInit() { }

  capturePhoto() {
    this.camera.getPicture(this.cameraOptions).then((imageData) => {
      const filePath = this.webview.convertFileSrc(imageData)
      this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);

      const fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.upload(imageData, `${environment.apiURL}/upload`).then(res => {
        console.log(JSON.parse(res.response))
        const filename = JSON.parse(res.response).filename
        this.photoURL = `${environment.apiURL}/file/${filename}`
      })
        .catch(err => console.log(err))
    }, (err) => {
      // Handle error
    });
  }

  photoFromLibrary() {
    this.camera.getPicture(this.libraryOptions).then((imageData) => {
      const filePath = this.webview.convertFileSrc(imageData)
      this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);

      const fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.upload(imageData, `${environment.apiURL}/upload`).then(res => {
        console.log(JSON.parse(res.response))
        const filename = JSON.parse(res.response).filename
        this.photoURL = `${environment.apiURL}/file/${filename}`
      })
      .catch(err => console.log(err))
    }, (err) => {
      // Handle error
    });
  }

  async presentMapFeaturesModal() {
    const modal = await this.modalController.create({
      component: MapFeaturesModalPage,
      backdropDismiss: false,
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
          photo: this.photoURL,
          mapFeatures: this.mapFeatures,
          confirmation: true
        }
      }
    });
  }

}
