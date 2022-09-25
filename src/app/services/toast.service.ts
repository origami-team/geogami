import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(public toastController: ToastController) { }

  async showToast(msg, colorV = "dark", durationV=3000) {
    const toast = await this.toastController.create({
      message: msg,
      color: colorV,
      animated: true,
      duration: durationV,
    });
    toast.present();
  }

}