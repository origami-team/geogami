import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PopoverComponent } from "src/app/popover/popover.component";
import { PopoverController } from "@ionic/angular";
import { environment } from 'src/environments/environment';
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
    private sanitizer: DomSanitizer,
    private changeRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

  }

  deletePhoto() {
    this.photo = ""
    this.changeRef.detectChanges();
    this.photoChange.emit(this.photo)
  }

  async capturePhoto(library: boolean = false) {
    const cameraOptions = {
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: library ? CameraSource.Photos : CameraSource.Camera,
      width: 500
    }

    const image = await Plugins.Camera.getPhoto(cameraOptions);

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);
    this.changeRef.detectChanges();

    this.uploading = true;

    let blob = await fetch(image.webPath).then(r => r.blob());
    let formData = new FormData();
    formData.append("file", blob);

    const options = {
      method: 'POST',
      body: formData
    };

    const postResponse = await fetch(`${environment.apiURL}/upload`, options)

    if (!postResponse.ok) {
      throw Error("File upload failed")
    }
    this.uploading = false;

    const postResponseText = await postResponse.json()
    const filename = postResponseText.filename
    this.photo = `${environment.apiURL}/file/${filename}`
    this.changeRef.detectChanges();
    this.photoChange.emit(this.photo)
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
