import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private isOnline$: BehaviorSubject<boolean>;

  constructor(
    private toastCtr: ToastController,
    private alertCtr: AlertController) {
    this.isOnline$ = new BehaviorSubject(true);
  }

  async showToast(msg, colorV = "dark", durationV = 3000, cssStyle = false) {
    const toast = await this.toastCtr.create({
      message: msg,
      color: colorV,
      animated: true,
      duration: durationV,
      //cssClass: (cssStyle?'connection-toast-class':'')
    });
    toast.present();
  }

  async showToastBtn(msg, colorV = "dark", durationV = 3000){
    const toast = await this.toastCtr.create({
      message: msg,
      color: colorV,
      animated: true,
      duration: durationV,
      cssClass: 'custom-toast',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            // Do nothing 
          }
        }
      ]
    });
    return toast;

  }

  async showAlertNoConnection() {
    const alert = await this.alertCtr.create({
      backdropDismiss: false, // disable alert dismiss when backdrop is clicked
      header: "No Internet Connection",
      //subHeader: 'Important message',
      message: "Please check your connection and try again.",
      buttons: [ /* 'OK' */
        {
          text: "OK",
          //cssClass: 'alert-button-update',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }


  getIsOnlineValue() {
    return this.isOnline$.getValue();
  }

  setIsOnlineValue(val) {
    return this.isOnline$.next(val);
  }
}


