import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BeaconInfo } from '../models/ibeacon/beaconInfo';
import { BeaconGame } from '../models/ibeacon/beaconGame';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private toastController: ToastController) { }

  getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in km
    return d; // distance in m
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Converts from radians to degrees.
  toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }

  bearing(startLat, startLng, destLat, destLng) {
    startLat = this.deg2rad(startLat);
    startLng = this.deg2rad(startLng);
    destLat = this.deg2rad(destLat);
    destLng = this.deg2rad(destLng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = Math.atan2(y, x);
    const brngDeg = this.toDegrees(brng);
    return (brngDeg + 360) % 360;
  }

  _toGeoJSONPoint = (lng, lat): GeoJSON.Feature<GeoJSON.Point> =>
    JSON.parse(`
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [${lng}, ${lat}]
    }
  }`);

  /**************************/
  /* ibeacon services start */
  // Pass minor to update beacon loaction
  private minorNoSource = new BehaviorSubject(undefined);

  serviceMinorNo = this.minorNoSource.asObservable();

  changeMinorNo(minorNo: number) {
    this.minorNoSource.next(minorNo);
  }

  // Pass beaconData to update beacon loaction
  private beaconData = new BehaviorSubject(undefined);

  serviceBeaconData = this.beaconData.asObservable();

  changebeaconData(beaconData: BeaconInfo) {
    this.beaconData.next(beaconData);
  }

  // Pass selected game
  private selectedGame = new BehaviorSubject(undefined);

  serviceSelectedGame = this.selectedGame.asObservable();

  ChangeGame(game: BeaconGame) {
    this.selectedGame.next(game);
  }

  // Dispaly toast
  async presentToast(msg: string, color = 'success') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: color
    });
    toast.present();
  }
  /* ibeacon services end */

}
