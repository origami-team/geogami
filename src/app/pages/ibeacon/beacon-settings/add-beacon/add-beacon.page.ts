import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { IBeacon, IBeaconPluginResult, Beacon } from '@ionic-native/ibeacon/ngx';
import { BeaconInfo } from 'src/app/models/ibeacon/beaconInfo';
import { BeaconFullInfo } from 'src/app/models/ibeacon/beaconFullInfo';
import { Storage } from '@ionic/storage';
import { HelperService } from 'src/app/services/helper.service';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-add-beacon',
  templateUrl: './add-beacon.page.html',
  styleUrls: ['./add-beacon.page.scss'],
})
export class AddBeaconPage implements OnInit {

  slectedUUID = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
  //uuid = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
  beaconData = [];
  beaconUuid: String;
  scanStatus: boolean = false;
  private delegate: any = null;
  public beaconRegion: any = null;

  //public beaconinfoList: BeaconInfo[];
  public beaconsStoredList: BeaconInfo[] = [];

  public scanResultList: BeaconFullInfo[] = [];


  constructor(
    private helperService: HelperService,
    public storage: Storage,
    public navCtrl: NavController,
    private readonly ibeacon: IBeacon,
    private readonly platform: Platform,
    private changeRef: ChangeDetectorRef,
    private apiService: GamesService,
    public modalController: ModalController,
  ) {
    this.platform.ready().then(() => {
      this.requestLocPermissoin();
      this.enableDebugLogs();
    });
  }

  ngOnInit() {
    // get stored beaconinfo to be able to update selected beacon location
    this.storage.get('beacon_info_list')
      .then((data) => {
        if (data != null) {
          this.beaconsStoredList = data;
          console.log('(add-beacon), beacon info list retreived successfully', this.beaconsStoredList.length);
        } else {
          console.log('(add-beacon), storage is empty, no beacon info is stored yet', this.beaconsStoredList.length);
        }
      }).catch((error: any) => {
        console.error(`(add-beacon), error in retreiving beacon info list from storage`);
      });;
  }


  ionViewWillEnter() {
    console.log('home Resume Event');
    //this.updateBeaconStoredList();
  }

  ionViewWillLeave() {
    console.log(`: on ionViewWillLeave , region`, this.beaconRegion);
    if (this.beaconRegion) {
      this.stopScannning();
    }
  }

  requestLocPermissoin(): void {
    // Request permission to use location on iOS
    if (this.platform.is('ios')) {
      this.ibeacon.requestAlwaysAuthorization();
      console.log(`: request ios permisson`);
    }
  }

  enableDebugLogs(): void {
    this.ibeacon.enableDebugLogs();
    this.ibeacon.enableDebugNotifications();
  }

  public onScanClicked(): void {
    if (!this.scanStatus) {
      this.startScanning();
      this.scanStatus = true;
    } else {
      this.scanStatus = false;
      this.stopScannning();
    }
  }

  public stopScannning(): void {
    this.scanStatus = false; // Change scan state Y.Q
    // stop ranging
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion)
      .then(async () => {
        console.log(`Stopped ranging beacon region:`, this.beaconRegion);
      })
      .catch((error: any) => {
        console.log(`Failed to stop ranging beacon region: `, this.beaconRegion);
      });
  }

  startScanning() {
    // create a new delegate and register it with the native layer
    this.delegate = this.ibeacon.Delegate();

    this.ibeacon.setDelegate(this.delegate);

    // Check bluetooth status Y.Q
    this.ibeacon.isBluetoothEnabled()
      .then(
        (data) => console.log('-------=== Enabled', data),
        (error: any) => console.error('-------=== Disabled', error)
      );

    // Subscribe to some of the delegate's event handlers
    this.delegate.didRangeBeaconsInRegion()
      .subscribe(
        async (pluginResult: IBeaconPluginResult) => {
          console.log('didRangeBeaconsInRegion: ', pluginResult)
          console.log('found beacons size: ' + pluginResult.beacons.length)
          if (pluginResult.beacons.length > 0) {
            this.beaconData = pluginResult.beacons;
            this.onScanResultUpdate(this.beaconData);
            //this.onBeaconFound(this.beaconData);  // check received beacons to trigger an event
            //this.changeRef.detectChanges(); // Check for data change to update view Y.Q
          } else {
            console.log('no beacons nearby')
          }
        },
        (error: any) => console.error(`Failure during ranging: `, error)
      );

    this.delegate.didStartMonitoringForRegion()
      .subscribe(
        (pluginResult: IBeaconPluginResult) =>
          console.log('didStartMonitoringForRegion: ', pluginResult)
        ,
        (error: any) => console.error(`Failure during starting of monitoring: `, error)
      );

    console.log(`Creating BeaconRegion with UUID of: `, this.slectedUUID);

    // uuid is required, identifier and range are optional.
    this.beaconRegion = this.ibeacon.BeaconRegion('EST3', this.slectedUUID);

    this.ibeacon.startMonitoringForRegion(this.beaconRegion).
      then(
        () => console.log('Native layer recieved the request to monitoring'),
        (error: any) => console.error('Native layer failed to begin monitoring: ', error)
      );

    this.ibeacon.startRangingBeaconsInRegion(this.beaconRegion)
      .then(() => {
        console.log(`Started ranging beacon region: `, this.beaconRegion);
      })
      .catch((error: any) => {
        console.error(`Failed to start ranging beacon region: `, this.beaconRegion);
      });
  }

  onScanResultUpdate(receivedData: Beacon[]): void {
    console.log(' on onScanResultUpdate: ', receivedData.length);
    console.log(' on onScanResultUpdate: ', this.scanResultList.length);

    if (this.scanResultList.length == 0) {
      for (let i = 0; i < receivedData.length; i++) {
        this.scanResultList.push(new BeaconFullInfo(receivedData[i].uuid, receivedData[i].major, receivedData[i].minor, receivedData[i].proximity, receivedData[i].tx, receivedData[i].rssi, receivedData[i].accuracy, true));
      }
    } else {
      for (let i = 0; i < receivedData.length; i++) {
        let answer = this.scanResultList.filter(t => t.minor == receivedData[i].minor); // Check if the task is already in the list
        console.log("answer is: ", answer, ", length: ", answer.length);
        if (answer.length == 0) {
          this.scanResultList.push(new BeaconFullInfo(receivedData[i].uuid, receivedData[i].major, receivedData[i].minor, receivedData[i].proximity, receivedData[i].tx, receivedData[i].rssi, receivedData[i].accuracy, true)); // add task
        }
      }
    }

    // Comapre found beacons with stored ones to add ability to insert new beacons
    if (this.beaconsStoredList.length > 0) {
      this.compareFoundWithStoredBeacons();
    }
  }


  // Comapre found beacons with stored ones to add ability to insert new beacons
  compareFoundWithStoredBeacons() {
    console.log('/', 'compareFoundWithStoredBeacons pressed');

    // check if stoerd list has been deleted, and assign true to add button
    if (this.beaconsStoredList.length == 0) {
      for (let i = 0; i < this.scanResultList.length; i++) {
        console.log('/\\', 'forr1');
        this.scanResultList[i].visibility = true;
        this.changeRef.detectChanges(); // Check for data change to update view Y.Q

      }

    } else {
      for (let i = 0; i < this.scanResultList.length; i++) {
        console.log('/\\', 'forr2');

        let answer = this.beaconsStoredList.filter(t => t.minor == this.scanResultList[i].minor); // Check if the task is already stored in local DB
        if (answer.length != 0) {
          this.scanResultList[i].visibility = false;
          this.changeRef.detectChanges(); // Check for data change to update view Y.Q
          console.log('/', this.scanResultList[i].minor, 'changed button status!!');

        }
      }
    }
  }

  updateBeaconStoredList() {
    // get a key/value pair from db
    this.storage.get('beacon_info_list').then((val) => {
      this.beaconsStoredList = val;
      //console.log(' From home, retreived list from db: ', this.beaconsStoredList);

    });
  }

  addBeaconInfo(beaconMinor: number) {
    console.log(' AddBeaconInfo pressed: ', beaconMinor);

    // Search for selected beacon using beacon minor no
    let selectedBeacon = this.findSelectedBeacon(beaconMinor);
    console.log("selectedBeacon", selectedBeacon.major);
    this.beaconsStoredList.push(selectedBeacon); // Add beaocn info to list to store it in local db

    // Check if there is a network connection to store in server as well as in local storage
    if (navigator.onLine) {
      console.log("onTestNodeServer", 'online');

      this.apiService.postBeaconInfo(selectedBeacon)
        .then(data => {
          console.log(data);

          this.storage.set('beacon_info_list', this.beaconsStoredList); // sotre in db /

          if (data.status == 200) {
            console.log('(postInfo), status 200');
            this.helperService.presentToast('Beacon info stored in server and local storage');
          }
        })
        .catch(e => {
          console.error('(postInfo), ', e);
          //console.error('(postInfo), ', e['error'].message); 
          this.helperService.presentToast('Due to existance in server or failure, beacon info only stored in local storage', "warning");
        });
    } else {
      console.log("onTestNodeServer", 'offline');
      this.storage.set('beacon_info_list', this.beaconsStoredList); // sotre in db /
      this.helperService.presentToast('Due to being offline, Beacon info only stored in local storage');
    }
    console.log(' After inster length: ', this.beaconsStoredList.length);

    // Refresh add button of inserted beacon
    this.compareFoundWithStoredBeacons();
  }

  findSelectedBeacon(bMinorNo: number): BeaconInfo {
    for (let i = 0; i < this.scanResultList.length; i++) {
      if (this.scanResultList[i].minor == bMinorNo) {
        //this.beaconsStoredList.push(new BeaconInfo(this.scanResultList[i].major, this.scanResultList[i].minor, 0, 0));
        return new BeaconInfo(this.scanResultList[i].uuid ,this.scanResultList[i].major, this.scanResultList[i].minor, 0, 0);
      }
    }
  }

  onclearClicked(): void {
    this.storage.remove('beacon_info_list');
    this.beaconsStoredList = []

    console.log(' Beacon info deleted successfully');

    // Refresh add button of inserted beacon
    this.compareFoundWithStoredBeacons();

    //this.changeRef.detectChanges(); // Check for data change to update view Y.Q


    // get stored beaconinfo to be update selected beacon location
    this.storage.get('beacon_info_list')
      .then((data) => {
      });

  }

  // Back button
  onBackButton() {
    this.navCtrl.navigateRoot('start');
  }

  dismissModal(dismissType: string = "null") {
    if (dismissType == "close") {
      this.modalController.dismiss();
      return;
    }
  }
}