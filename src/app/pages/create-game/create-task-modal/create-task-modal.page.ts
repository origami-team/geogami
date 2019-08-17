import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import mapboxgl from 'mapbox-gl';

import navtasks from './../../../models/navtasks-new.json'
// import fragetypen from './../../../models/fragetypen.json'
// import antworttypen from './../../../models/antworttypen.json'


@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.page.html',
  styleUrls: ['./create-task-modal.page.scss'],
})
export class CreateTaskModalPage implements OnInit {

  @Input() gameName: string;

  // marker: any;

  selectedTask: any;
  elements: any[];

  navtasks: any = navtasks
  // fragetypen: any = fragetypen
  // antworttypen: any = antworttypen


  constructor(public modalController: ModalController, private camera: Camera) { }

  ngOnInit() {
  }

  onTaskSelected(newValue) {
    this.selectedTask = newValue
    console.log(this.selectedTask)

    this.elements = this.selectedTask.developer
    // const elements = this.selectedTask.questionTypes.map(qt => qt)
    // console.log(elements)
    // setTimeout(() => this.initMap(), 100)
  }



  takePhoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
    });
  }

  dismissModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true,
      data: {

      }
    });
  }
}
