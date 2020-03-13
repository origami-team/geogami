import { Component, OnInit } from "@angular/core";
import { Field } from "src/app/dynamic-form/models/field";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { PopoverController } from "@ionic/angular";
import { PopoverComponent } from "src/app/popover/popover.component";
import { environment } from 'src/environments/environment';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: "app-photo-upload-multiple-choice",
  templateUrl: "./photo-upload-multiple-choice.component.html",
  styleUrls: ["./photo-upload-multiple-choice.component.scss"]
})
export class PhotoUploadMultipleChoiceComponent implements Field {
  config: import("../../dynamic-form/models/field-config").FieldConfig;
  group: import("@angular/forms").FormGroup;

  baseOptions: CameraOptions = {
    quality: environment.photoQuality,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  cameraOptions: CameraOptions = {
    ...this.baseOptions,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  libraryOptions: CameraOptions = {
    ...this.baseOptions,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };

  photos: SafeResourceUrl[] = ["", "", "", ""];

  constructor(
    private camera: Camera,
    public popoverController: PopoverController,
    private transfer: FileTransfer, private file: File, private webview: WebView, private sanitizer: DomSanitizer
  ) { }

  capturePhoto(photoNumber) {
    this.camera.getPicture(this.cameraOptions).then(
      imageData => {
        
        const filePath = this.webview.convertFileSrc(imageData)
        this.photos[photoNumber] = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);

        const fileTransfer: FileTransferObject = this.transfer.create();
        fileTransfer.upload(imageData, `${environment.apiURL}/upload`).then(res => {
          console.log(JSON.parse(res.response))
          const filename = JSON.parse(res.response).filename
          this.group.patchValue({
            [`${this.config.name}`]: {
              ...this.group.value[`${this.config.name}`],
              [`photo-${photoNumber}`]: `${environment.apiURL}/file/${filename}`
            }
          });
        })
        .catch(err => console.log(err))
      },
      err => {
        // Handle error
      }
    );
  }

  photoFromLibrary(photoNumber) {
    this.camera.getPicture(this.libraryOptions).then(
      imageData => {
        const filePath = this.webview.convertFileSrc(imageData)
        this.photos[photoNumber] = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);

        const fileTransfer: FileTransferObject = this.transfer.create();
        fileTransfer.upload(imageData, `${environment.apiURL}/upload`).then(res => {
          console.log(JSON.parse(res.response))
          const filename = JSON.parse(res.response).filename
          this.group.patchValue({
            [`${this.config.name}`]: {
              ...this.group.value[`${this.config.name}`],
              [`photo-${photoNumber}`]: `${environment.apiURL}/file/${filename}`
            }
          });
        })
        .catch(err => console.log(err))
      },
      err => {
        // Handle error
      }
    );
  }

  async showPopover(ev: any, text: string) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }
}
