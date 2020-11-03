import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PopoverComponent } from "src/app/popover/popover.component";
import { PopoverController } from "@ionic/angular";
import { environment } from 'src/environments/environment';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core'



import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';

@Component({
  selector: "app-photo-upload",
  templateUrl: "./photo-upload.component.html",
  styleUrls: ["./photo-upload.component.scss"]
})
export class PhotoUploadComponent implements OnInit {
  @Input() photo: SafeResourceUrl = '';
  @Input() taskType: string = "";
  @Input() theme: string = "secondary";

  @Output() photoChange: EventEmitter<any> = new EventEmitter<any>();

  uploading: boolean = false
  uploadingProgress: number = 100;

  constructor(
    public popoverController: PopoverController,
    private transfer: FileTransfer,
    private sanitizer: DomSanitizer,
    private changeRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // throw new Error("Method not implemented.");
  }

  async capturePhoto(library: boolean = false) {
    const image = await Plugins.Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: library ? CameraSource.Photos : CameraSource.Camera,
      width: 500
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);
    this.changeRef.detectChanges();

    this.uploading = true;

    const fileTransfer: FileTransferObject = this.transfer.create();

    fileTransfer.onProgress(e => {
      this.uploadingProgress = e.loaded / e.total * 100
    })

    fileTransfer.upload(image.path, `${environment.apiURL}/upload`).then(res => {
      console.log(JSON.parse(res.response))
      const filename = JSON.parse(res.response).filename
      this.photo = `${environment.apiURL}/file/${filename}`
      this.changeRef.detectChanges();
      this.photoChange.emit(this.photo)
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
