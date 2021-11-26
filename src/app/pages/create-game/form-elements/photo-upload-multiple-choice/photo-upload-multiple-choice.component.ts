import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { PopoverComponent } from "src/app/popover/popover.component";
import { environment } from "src/environments/environment";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { Plugins, CameraResultType, CameraSource } from "@capacitor/core";

@Component({
  selector: "app-photo-upload-multiple-choice",
  templateUrl: "./photo-upload-multiple-choice.component.html",
  styleUrls: ["./photo-upload-multiple-choice.component.scss"],
})
export class PhotoUploadMultipleChoiceComponent implements OnInit {
  @Input() photos: SafeResourceUrl[] = ["", "", "", ""];
  @Input() taskType = "";

  @Input() hints?: String[] = [
    "Probiere es noch einmal.",
    "Probiere es noch einmal.",
    "Probiere es noch einmal.",
    "Probiere es noch einmal.",
  ];

  @Output() photosChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() hintsChange: EventEmitter<any> = new EventEmitter<any>();

  uploading: boolean[] = [false, false, false, false];
  uploadingProgress: number[] = [100, 100, 100, 100];

  constructor(
    public popoverController: PopoverController,
    private sanitizer: DomSanitizer,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.photos == undefined) {
      this.photos = ["", "", "", ""];
    }
    if (this.hints == undefined) {
      this.hints = [
        "Probiere es noch einmal.",
        "Probiere es noch einmal.",
        "Probiere es noch einmal.",
        "Probiere es noch einmal.",
      ];
    }
  }

  async capturePhoto(photoNumber, library: boolean = false) {
    const image = await Plugins.Camera.getPhoto({
      quality: 50,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: library ? CameraSource.Photos : CameraSource.Camera,
      width: 500,
    });

    this.photos[photoNumber] = this.sanitizer.bypassSecurityTrustResourceUrl(
      image.webPath
    );

    this.uploading[photoNumber] = true;

    const blob = await fetch(image.webPath).then((r) => r.blob());
    const formData = new FormData();
    formData.append("file", blob);

    const options = {
      method: "POST",
      body: formData,
    };

    const postResponse = await fetch(
      `${environment.apiURL}/file/upload`,
      options
    );

    if (!postResponse.ok) {
      throw Error("File upload failed");
    }
    this.uploading[photoNumber] = false;

    const postResponseText = await postResponse.json();
    const filename = postResponseText.filename;
    this.photos[photoNumber] = `${environment.apiURL}/file/image/${filename}`;
    this.changeRef.detectChanges();
    this.photosChange.emit(this.photos);
  }

  onChange() {
    this.hintsChange.emit(this.hints);
  }

  async showPopover(ev: any, text: string) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text },
    });
    return await popover.present();
  }
}
