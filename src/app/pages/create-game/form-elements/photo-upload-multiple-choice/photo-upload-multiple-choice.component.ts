import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { PopoverComponent } from "src/app/popover/popover.component";
import { environment } from 'src/environments/environment';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Plugins, CameraResultType } from '@capacitor/core';

@Component({
  selector: "app-photo-upload-multiple-choice",
  templateUrl: "./photo-upload-multiple-choice.component.html",
  styleUrls: ["./photo-upload-multiple-choice.component.scss"]
})
export class PhotoUploadMultipleChoiceComponent implements OnInit {

  @Input() photos: SafeResourceUrl[] = ["", "", "", ""];

  @Output() photosChange: EventEmitter<any> = new EventEmitter<any>();

  uploading: boolean = false;

  constructor(
    public popoverController: PopoverController,
    private transfer: FileTransfer,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if (this.photos == undefined) {
      this.photos = ["", "", "", ""];
    }
  }

  async capturePhoto(photoNumber) {
    const image = await Plugins.Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

    this.photos[photoNumber] = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);

    this.uploading = true;

    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.upload(image.path, `${environment.apiURL}/upload`).then(res => {
      console.log(JSON.parse(res.response))
      const filename = JSON.parse(res.response).filename
      this.photos[photoNumber] = `${environment.apiURL}/file/${filename}`
      this.photosChange.emit(this.photos)
      // this.group.patchValue({
      //   [`${this.config.name}`]: {
      //     ...this.group.value[`${this.config.name}`],
      //     [`photo-${photoNumber}`]: `${environment.apiURL}/file/${filename}`
      //   }
      // }); 
      this.uploading = false;
    })
      .catch(err => {
        console.log(err)
        this.uploading = false;
      })
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
