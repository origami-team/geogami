import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { IBeacon, IBeaconPluginResult, Beacon } from '@ionic-native/ibeacon/ngx';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { HelperService } from 'src/app/services/helper.service';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-scan-nearby',
  templateUrl: './scan-nearby.page.html',
  styleUrls: ['./scan-nearby.page.scss'],
})
export class ScanNearbyPage implements OnInit {

  slectedUUID = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
  //uuid = 'b9407f30-f5f8-466e-aff9-25556b57fe6d';
  beaconData = [];
  beaconUuid: String;
  scanStatus: boolean = false;
  private delegate: any = null;
  public beaconRegion: any = null;
  public iosDevice: boolean = false;


  constructor(public storage: Storage, public navCtrl: NavController, private readonly ibeacon: IBeacon, private readonly platform: Platform, private changeRef: ChangeDetectorRef, private http: HttpClient, private apiService: GamesService) {
    this.platform.ready().then(() => {
      this.requestLocPermissoin();
      this.enableDebugLogs();
      console.log('platform is ready,,');
    });
  }

  ngOnInit() {
    // Check if device platform is iOS
    if (!this.platform.is('ios')) {
      this.iosDevice = true;
    }
  }

  ionViewWillEnter() {
    console.log('ScanNearbyPage Resume Event');
  }

  ionViewWillLeave() {
    console.log(': on ionViewWillLeave');
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
    console.log('ÒÒÒÒ stopScannning pressed update');
    this.scanStatus = false; // Change scan state Y.Q

    // stop ranging
    this.ibeacon.stopRangingBeaconsInRegion(this.beaconRegion)
      .then(async () => {
        console.log(`Stopped ranging beacon region:`, this.beaconRegion);

        // Reinitialize variables to null, to reduce delay in second time scan 
        this.delegate = null;
        this.beaconRegion = null;
      })
      .catch((error: any) => {
        console.log(`Failed to stop ranging beacon region: `, this.beaconRegion);
      });


  }

  startScanning() {
    // create a new delegate and register it with the native layer
    this.delegate = this.ibeacon.Delegate();

    this.ibeacon.setDelegate(this.delegate);

    //this.beaconUuid = this.slectedUUID;

    // Check bluetooth status Y.Q
    /*     this.ibeacon.isBluetoothEnabled()
          .then(
            (data) => console.log('-------=== Enabled', data),
            (error: any) => console.error('-------=== Disabled', error)
          ); */

    // Subscribe to some of the delegate's event handlers
    this.delegate.didRangeBeaconsInRegion()
      .subscribe(
        async (pluginResult: IBeaconPluginResult) => {
          //console.log('didRangeBeaconsInRegion: ', pluginResult);
          //console.log('found beacons size: ' + pluginResult.beacons.length);
          //console.log('selected UUID: ', this.slectedUUID);

          if (pluginResult.beacons.length > 0) {
            this.beaconData = pluginResult.beacons;
            //this.onBeaconFound(this.beaconData);  // check received beacons to trigger an event
            this.changeRef.detectChanges(); // Check for data change to update view Y.Q
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

    //console.log(`Creating BeaconRegion with UUID of: `, this.slectedUUID);

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

  stpoScan() {
    console.log('stpoScan');
    if (this.beaconRegion) {
      this.stopScannning();
    }
  }

  // Back button
  onBackButton() {
    this.navCtrl.back()
  }

  onTestNodeServer() { // just for test

    this.apiService.getGameResults()
      .then(data => {
        console.log(data);
      })


  }

}
