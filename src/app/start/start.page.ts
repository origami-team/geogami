import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

import { Plugins } from '@capacitor/core';
import { AuthService } from '../services/auth-service.service';
import { IUser } from '../interfaces/iUser';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  playerMode: String;
  playerModeDescription: String;
  developerMode: String;
  developerModeDescription: String;
  evaluateMode: String;
  evaluateModeDescription: String;

  device: any;

  user = this.authService.getUser();

  // Vr world
  // to only allow admins to see pages related to VR games
  userRole: String;

  // (translation)
  languages = [];
  selected = '';


  constructor(
    public navCtrl: NavController,
    public toastController: ToastController,
    public _translate: TranslateService,
    private authService: AuthService,
    private languageService: LanguageService
  ) { }

  async ngOnInit() {
    // (translation) get languages
    this.languages = this.languageService.getLangauges();
    // (translation) set selected language
    this.selected = this.languageService.selected;

    // Get user role
    this.user.subscribe(
      event => {
        if (event != null) {
          this.userRole = (event['roles'])[0];
        }
      });

    Plugins.Device.getInfo().then((device) => (this.device = device));
  }

  handleCardClick(e) {
    console.log(e);
  }

  navigateGamesOverviewPage() {
    //this.navCtrl.navigateForward('play-game/play-game-list');

    // disable unregistered users from playing using the virtual world
    /* if (this.userRole != undefined && this.userRole == "admin") {
      this.navCtrl.navigateForward('play-game/play-game-menu');
    } else {
      this.navCtrl.navigateForward(`play-game/play-game-list/${"RealWorld"}`);
    } */

    // enable unregistered users to play using the virtual world
    this.navCtrl.navigateForward('play-game/play-game-menu');

  }

  navigateCreatePage() {
    this.navCtrl.navigateForward('create-game-menu');

    if (this.userRole != undefined && this.userRole == "admin") {
      this.navCtrl.navigateForward('create-game-menu');
    } else {
      this.navCtrl.navigateForward('create-game');
    }
  }

  navigateShowroomPage() {
    this.navCtrl.navigateForward('showroom');
  }

  navigateInfoPage() {
    this.navCtrl.navigateForward('info');
  }

  navigateAnalyzePage() {
    this.navCtrl.navigateForward('analyze');
  }

  login() {
    this.navCtrl.navigateForward('user/login');
  }

  navigateProfile() {
    this.navCtrl.navigateForward('user/profile');
  }

  changeLng(lng: string){
    this.languageService.setLanguage(lng);
  }
}
