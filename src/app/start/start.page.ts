import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

import { Capacitor, Plugins } from '@capacitor/core';
import { AuthService } from '../services/auth-service.service';
import { IUser } from '../interfaces/iUser';
import { LanguageService } from '../services/language.service';
import { GamesService } from '../services/games.service';
import { platform } from 'process';
import { UtilService } from '../services/util.service';

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
  userRole: string;

  // (translation)
  languages = [];
  selected = '';

  // latest app version
  latestAppVersionInfo: any;


  constructor(
    public navCtrl: NavController,
    public toastController: ToastController,
    public _translate: TranslateService,
    private authService: AuthService,
    private languageService: LanguageService,
    private alertController: AlertController,
    private gamesService: GamesService,
    public utilService: UtilService
  ) { }

  async ngOnInit() {
    // if device is not connected to internet, show notification
    if (!this.utilService.getIsOnlineValue()) {
      return;
    }

    // get current app version
    Plugins.Device.getInfo().then((device) => (this.device = device));
    // get updated app version to notify user of app update
    this.gamesService.getAppVersion()
      .then(res => res.content)
      .then(latestVersionInfo => {
        this.latestAppVersionInfo = latestVersionInfo;
        if (this.latestAppVersionInfo.enabled && Capacitor.platform != "web") {
          if (Capacitor.platform == "ios" && this.latestAppVersionInfo.ios) {
            this.showUpdateAppAlert(this.versionToInt(this.latestAppVersionInfo.version), parseInt(this.latestAppVersionInfo.build), this.latestAppVersionInfo.major);
          } else if (Capacitor.platform == "android" && this.latestAppVersionInfo.android) {
            this.showUpdateAppAlert(this.versionToInt(this.latestAppVersionInfo.version), parseInt(this.latestAppVersionInfo.build), this.latestAppVersionInfo.major);
          }
        }
      });

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
  }

  handleCardClick(e) {
    // console.log(e);
  }

  navigateGamesOverviewPage() {
    // disable unregistered users from playing using the virtual world
    if (['admin', 'contentAdmin'].includes(this.userRole)) {
      this.navCtrl.navigateForward('play-game/play-game-menu');
    } else {
      this.navCtrl.navigateForward(`play-game/play-game-list/${"RealWorld"}`);
    }

    // enable unregistered users to play using the virtual world
    // this.navCtrl.navigateForward('play-game/play-game-menu');

  }

  navigateCreatePage() {
    this.navCtrl.navigateForward('create-game-menu');

    if (this.userRole != undefined && (this.userRole == "admin" || this.userRole == "scholar")) {
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

  navigateUserManagement() {
    this.navCtrl.navigateForward('user/user-management');
  }

  login() {
    this.navCtrl.navigateForward('user/login');
  }

  navigateProfile() {
    this.navCtrl.navigateForward('user/profile');
  }

  changeLng(lng: string) {
    this.languageService.setLanguage(lng);
  }

  async showUpdateAppAlert(latestVersion, latestBuild, isMajorUpdate) {
    let currentAppVersion = this.versionToInt(this.device.appVersion);
    //let currentAppBuild = parseInt(this.device.appBuild);

    // alert buttons objects
    let btnOption1 = {
      text: this._translate.instant("Start.notNow"),
      handler: () => {
        // Do nothing
      }
    };
    let btnOption2 = {
      text: this._translate.instant("Start.update"),
      cssClass: 'alert-button-update',
      handler: () => {
        if (Capacitor.platform == "ios") {
          window.open("https://apps.apple.com/app/geogami/id1614864078", "_system");
        } else if (Capacitor.platform == "android") {
          window.open("https://play.google.com/store/apps/details?id=com.ifgi.geogami", "_system");
        }
      },
    };

    if (currentAppVersion < latestVersion /* || ( currentAppVersion == latestVersion && currentAppBuild < latestBuild) */) {
      const alert = await this.alertController.create({
        backdropDismiss: false, // disable alert dismiss when backdrop is clicked
        header: this._translate.instant((isMajorUpdate ? "Start.majorAppUpdateHeader" : "Start.appUpdateHeader")),
        //subHeader: 'Important message',
        message: this._translate.instant((isMajorUpdate ? "Start.majorAppUpdateMsg" : "Start.appUpdateMsg")),
        buttons: (isMajorUpdate ? [btnOption2] : [btnOption1, btnOption2])
      });
      await alert.present();
    }

  }

  // convert version value to int
  versionToInt(VersionInString) {
    let v = VersionInString.split('.');
    // console.log("v: ", v[0] * 100 + v[1] * 10 + v[2] * 1);
    return (v[0] * 100 + v[1] * 10 + v[2] * 1)
  }
}
