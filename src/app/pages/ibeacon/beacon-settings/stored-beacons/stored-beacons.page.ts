import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BeaconInfo } from 'src/app/models/ibeacon/beaconInfo';
import { NavController, ModalController } from '@ionic/angular';
import { HelperService } from 'src/app/services/helper.service';
import { Storage } from '@ionic/storage';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-stored-beacons',
  templateUrl: './stored-beacons.page.html',
  styleUrls: ['./stored-beacons.page.scss'],
})
export class StoredBeaconsPage implements OnInit {

  numTasks: number = 0;
  beaconsStoredList: BeaconInfo[];
  beaconsStoredList_copy: BeaconInfo[];


  constructor(private changeRef: ChangeDetectorRef, public navCtrl: NavController, private helperService: HelperService, public storage: Storage, private apiService: GamesService, public modalController: ModalController,
    ) { }

  ngOnInit() {

    if (navigator.onLine) {
      console.log('online');

      // Retrieve beacon info from server
      this.apiService.getBeaconInfo()
        .then(data => {
          console.log('data: length ', data.length)

          if (data != null && data.length > 0) {
            this.beaconsStoredList = data;
            this.beaconsStoredList_copy = this.beaconsStoredList.slice();
            console.log('beaconinfoList: ', this.beaconsStoredList.length)
            this.changeRef.detectChanges(); // Check for data change to update view Y.Q

            this.storage.set('beacon_info_list', this.beaconsStoredList); // store in db

            this.helperService.presentToast('Beacon info retrieved from server.');
          } else{
            this.getDateFromLocalStorage("Beacon info retrieved from local storage as server is empty.");

            console.error('(strored-beacons-page), online but server is empty');
          }
        }).catch(e => {
          console.error('(strored-beacons-page), ', e['error'].message);
        });
    } else { // get beacon info from local stoegae in case there is no internet connection
      console.log('offline');
      this.getDateFromLocalStorage('Due to offline mode, data retrieved from local storage.');
    }
  }

  ionViewWillEnter() {
    console.log('(play-gme-select), Resume Event');

    this.changeRef.detectChanges(); // Check for data change to update view Y.Q

    // To update view when back to page
    this.ngOnInit();
  }

  getDateFromLocalStorage(msg: string) {
    // get stored beaconinfo from local storage
    this.storage.get('beacon_info_list')
      .then((data) => {
        if (data != null) {
          console.log('From (stored-beacon-list), not null ');

          this.beaconsStoredList = data;
          this.beaconsStoredList_copy = this.beaconsStoredList.slice();
          this.changeRef.detectChanges(); // Check for data change to update view Y.Q
          console.log('From (stored-beacon-list), beacon info list stored in the variable ', this.beaconsStoredList_copy);

          this.helperService.presentToast(msg);

        } 
      }).catch((error: any) => {
        console.error(`(stored-beacon-list), error in retreiving beacon info list from storage`);
      });
  }

  openUpdateBeaconLoc(beaconMinor: number, beaconLng: number, beaconLat: number): void {
    console.log("Button: ", beaconMinor, "lng ", beaconLng, beaconLat);

    // Store info in service, zero to indicate that this is sent from create-game page , ToDo: improve this impl.
    this.helperService.changebeaconData(new BeaconInfo("0" , 0, beaconMinor, beaconLng, beaconLat));

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
    this.navCtrl.navigateBack("create-game");
  }

}
