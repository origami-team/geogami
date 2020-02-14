import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { environment } from 'src/environments/environment';

// import { Plugins, CameraResultType } from '@capacitor/core';
// const { Camera } = Plugins;


@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {

  photoData: string = ''

  constructor(private camera: Camera) { }

  ngOnInit() { }

  async capturePhoto() {
    const options: CameraOptions = {
      quality: environment.photoQuality,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.photoData = base64Image
    }, (err) => {
      // Handle error
    });
  }

}
