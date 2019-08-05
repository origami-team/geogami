import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';



@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {

  constructor(public navCtrl: NavController, public toastController: ToastController) { }

  ngOnInit() {
  }

  handleCardClick(e) {
    console.log(e)
  }

  navigateCreatePage() {
    this.navCtrl.navigateForward('create-game');
  }

  async setLanguage(e) {
    const toast = await this.toastController.create({
      message: e.target.dataset.value == "de" ? "Hallo, mein Freund!" : "Hello, my Friend!",
      duration: 2000
    });
    toast.present();
  }

}
