import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BeaconInfo } from 'src/app/models/ibeacon/beaconInfo';
import { NavController } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-stored-beacons',
  templateUrl: './stored-beacons.page.html',
  styleUrls: ['./stored-beacons.page.scss'],
})
export class StoredBeaconsPage implements OnInit {

  numTasks: number = 0;
  maxNumTasks: number = 0;
  beaconsStoredList: BeaconInfo[];
  beaconsStoredList_copy: BeaconInfo[];


  constructor(private changeRef: ChangeDetectorRef, public navCtrl: NavController, private gameServ: HelperService, public storage: Storage) { }

  ngOnInit() {
    // get stored beaconinfo to be update selected beacon location
    this.storage.get('beacon_info_list')
      .then((data) => {
        if (data != null) {
          this.beaconsStoredList = data;
          this.beaconsStoredList_copy = this.beaconsStoredList.slice();
          this.changeRef.detectChanges(); // Check for data change to update view Y.Q
          console.log('From (stored-beacon-list), beacon info list stored in the variable ', this.beaconsStoredList_copy);

          this.maxNumTasks = this.numTasks = this.beaconsStoredList.length;
          console.log('(stored-beacon-list), beacon info list retreived successfully: ', this.maxNumTasks);
        } else {
          this.maxNumTasks = this.numTasks = 0;
          this.beaconsStoredList_copy = [];
          console.log('(stored-beacon-list), storage is empty, no beacon info is stored yet');
        }
      }).catch((error: any) => {
        console.error(`(stored-beacon-list), error in retreiving beacon info list from storage`);
      });;
  }

  ionViewWillEnter() {
    console.log('(play-gme-select), Resume Event');

    this.changeRef.detectChanges(); // Check for data change to update view Y.Q

    // To update view when back to page
    this.ngOnInit();
  }

  openUpdateBeaconLoc(beaconMinor: number, beaconLng: number, beaconLat: number): void {
    console.log("Button: ", beaconMinor, "lng ", beaconLng, beaconLat);

    // Store info in service, zero to indicate that this is sent from create-game page , ToDo: improve this impl.
    this.gameServ.changebeaconData(new BeaconInfo(0, beaconMinor, beaconLng, beaconLat));

    // update MinorNo service to minor number 
    //this.gameServ.changeMinorNo(beaconMinor);

    // navigate to map-add-loc page
    this.navCtrl.navigateRoot('map-add-loc'); // Used navigateRoot to be able to update coords in tab
  }

  // No need for it at the moment
  /*   onDeleteBeacon(beaconMinor: number): void {
      for (var i = 0; i < this.beaconsStoredList_copy.length; i++) {
        if (this.beaconsStoredList_copy[i].minor == beaconMinor) {
          this.beaconsStoredList_copy.splice(i, 1);
          this.onUpdateTasksNum();
          console.log("Deleted successfully!");
        }
      }
    } */

  onUpdateTasksNum(): void {
    this.numTasks -= 1;
  }

  // Back button
  onBackButton() {
    this.navCtrl.back()
  }

}
