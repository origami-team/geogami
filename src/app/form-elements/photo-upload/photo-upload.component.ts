import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/dynamic-form/models/field';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';


@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent implements Field {
  config: import("../../dynamic-form/models/field-config").FieldConfig;
  group: import("@angular/forms").FormGroup;

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

  photo: string

  constructor(private camera: Camera) { }


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


}
